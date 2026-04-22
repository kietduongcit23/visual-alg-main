import { appConfig } from './config';
import { loadPersistedAppState, savePersistedAppState } from './persistence';
import { createEditorController, updateMonacoTheme } from '../editor/editor';
import { InterpreterRunner } from '../engine/interpreter-runner';
import { validateSource } from '../engine/validator';
import { getLessonById, lessons } from '../lessons/registry';
import type { LessonDefinition } from '../lessons/lesson-types';
import { createInitialState, createStateFromLesson, getPlaybackDelay, setRunnerState } from '../state/reducers';
import { getShortcutAction, shouldIgnoreShortcutTarget } from '../ui/keyboard-shortcuts';
import { createLayout } from '../ui/layout';
import { formatValidationIssues } from '../ui/validation-summary';
import { renderArrayPanel } from '../visual/array-renderer';
import { renderVariablesPanel } from '../visual/variable-renderer';
import { setActiveLessonId } from '../editor/suggestions';

const savedTheme = localStorage.getItem('theme');
const isDarkInit = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark', isDarkInit);

export function bootstrap(container: HTMLDivElement | null): void {
  if (!container) {
    throw new Error('Missing #app root container.');
  }

  const firstLesson = lessons[0];
  if (!firstLesson) {
    throw new Error('At least one lesson must be registered.');
  }

  const persistedState = loadPersistedAppState();
  const initialLesson = getLessonById(persistedState?.lessonId ?? '') ?? firstLesson;
  setActiveLessonId(initialLesson.id);

  let selectedLesson: LessonDefinition = initialLesson;
  let state = createInitialState(selectedLesson, persistedState?.speed ?? appConfig.initialSpeed);
  let sourceCode = persistedState?.sourceCode ?? selectedLesson.starterCode;
  let isEditable = persistedState?.isEditable ?? true;
  let isWelcomeVisible = !(persistedState?.welcomeDismissed ?? false);
  let validationMessages = formatValidationIssues(validateSource(sourceCode).errors);
  let runner: InterpreterRunner | null = null;
  let runTimer: number | null = null;

  const stopRunLoop = (): void => {
    if (runTimer !== null) {
      window.clearInterval(runTimer);
      runTimer = null;
    }
  };

  const layout = createLayout({
    title: appConfig.appName,
    lessons,
    onLessonChange: (lessonId) => {
      const nextLesson = getLessonById(lessonId);
      if (!nextLesson) {
        return;
      }

      stopRunLoop();
      selectedLesson = nextLesson;
      setActiveLessonId(selectedLesson.id);
      state = createInitialState(selectedLesson, state.speed);
      sourceCode = selectedLesson.starterCode;
      validationMessages = formatValidationIssues(validateSource(sourceCode).errors);
      runner = null;
      editor.setValue(sourceCode);
      persist();
      render();
    },
    onReset: () => {
      stopRunLoop();
      state = createInitialState(selectedLesson, state.speed);
      runner = null;
      persist();
      render();
    },
    onNext: () => {
      stepPlayback();
    },
    onRun: () => {
      if (state.runnerState === 'finished' || state.runnerState === 'error') {
        return;
      }

      stopRunLoop();
      state = setRunnerState(state, 'running');
      render();
      runTimer = window.setInterval(() => {
        const completed = stepPlayback();
        if (completed) {
          stopRunLoop();
        }
      }, getPlaybackDelay(state.speed));
    },
    onPause: () => {
      stopRunLoop();
      if (state.runnerState === 'running') {
        state = setRunnerState(state, 'paused');
        render();
      }
    },
    onSpeedChange: (speed) => {
      state = { ...state, speed };
      if (runTimer !== null) {
        stopRunLoop();
        state = setRunnerState(state, 'running');
        render();
        runTimer = window.setInterval(() => {
          const completed = stepPlayback();
          if (completed) {
            stopRunLoop();
          }
        }, getPlaybackDelay(state.speed));
      } else {
        persist();
        render();
      }
    },
    onThemeToggle: () => {
      render();
    }
  });

  const editor = createEditorController(layout.code.editorMount, (value) => {
    sourceCode = value;
    validationMessages = formatValidationIssues(validateSource(sourceCode).errors);
    runner = null;
    persist();
    render();
  });
  editor.setValue(sourceCode);
  editor.setEditable(isEditable);

  layout.code.modeButton.addEventListener('click', () => {
    isEditable = !isEditable;
    editor.setEditable(isEditable);
    persist();
    render();
  });

  layout.code.resetCodeButton.addEventListener('click', () => {
    sourceCode = selectedLesson.starterCode;
    validationMessages = formatValidationIssues(validateSource(sourceCode).errors);
    runner = null;
    editor.setValue(sourceCode);
    persist();
    render();
  });

  layout.code.runCodeButton.addEventListener('click', () => {
    const code = editor.getValue();
    const consoleBody = layout.code.console.querySelector('.console-body');
    if (!consoleBody) return;

    consoleBody.innerHTML = '';
    
    // Simple simulation of Java execution
    const lines = code.split('\n');
    let hasOutput = false;
    let hasError = false;
    
    lines.forEach((line, index) => {
      // Very basic syntax check (e.g., missing semicolon)
      if (line.trim() && !line.trim().endsWith('{') && !line.trim().endsWith('}') && !line.trim().endsWith(';') && !line.includes('class') && !line.includes('public static void main')) {
         const entry = document.createElement('div');
         entry.className = 'console-entry error';
         entry.textContent = `Line ${index + 1}: Syntax error: ';' expected`;
         consoleBody.appendChild(entry);
         hasError = true;
      }

      const match = line.match(/System\.out\.println\s*\((.*)\)\s*;/);
      if (match && match[1]) {
        let output = match[1].trim();
        // Simple string parsing
        if ((output.startsWith('"') && output.endsWith('"')) || (output.startsWith("'") && output.endsWith("'"))) {
          output = output.substring(1, output.length - 1);
        }
        
        const entry = document.createElement('div');
        entry.className = 'console-entry';
        entry.textContent = output;
        consoleBody.appendChild(entry);
        hasOutput = true;
      }
    });

    if (!hasOutput && !hasError) {
      const entry = document.createElement('div');
      entry.className = 'console-entry';
      entry.style.opacity = '0.5';
      entry.textContent = '> Program finished with no output.';
      consoleBody.appendChild(entry);
    }
    
    consoleBody.scrollTop = consoleBody.scrollHeight;
  });

  const clearButton = document.createElement('button');
  clearButton.className = 'mode-toggle';
  clearButton.style.fontSize = '0.7rem';
  clearButton.style.padding = '2px 8px';
  clearButton.style.marginLeft = 'auto';
  clearButton.textContent = 'Clear';
  layout.code.console.querySelector('.console-header')?.appendChild(clearButton);
  
  clearButton.onclick = () => {
    const body = layout.code.console.querySelector('.console-body');
    if (body) body.innerHTML = '';
  };

  layout.code.copyButton.addEventListener('click', async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sourceCode);
        setInfoMessage('Code copied to clipboard.');
      }
    } catch {
      setInfoMessage('Clipboard copy failed in this environment.');
    }
    render();
  });

  layout.welcome.dismissButton.addEventListener('click', () => {
    isWelcomeVisible = false;
    persist();
    render();
  });

  window.addEventListener('keydown', (event) => {
    if (shouldIgnoreShortcutTarget(event.target, isEditable)) {
      return;
    }

    const action = getShortcutAction(event.key);
    if (!action) {
      return;
    }

    event.preventDefault();
    switch (action) {
      case 'next':
        layout.array.nextButton.click();
        break;
      case 'run':
        layout.array.runButton.click();
        break;
      case 'pause':
        layout.array.pauseButton.click();
        break;
      case 'reset':
        layout.array.resetButton.click();
        break;
    }
  });

  function stepPlayback(): boolean {
    if (validationMessages.length > 0) {
      state = {
        ...state,
        runnerState: 'error',
        explanation: validationMessages[0] ?? 'Validation error.',
        logEntries: [`Validation error: ${validationMessages[0] ?? 'Unsupported syntax.'}`, ...state.logEntries].slice(0, appConfig.maxLogEntries),
      };
      render();
      return true;
    }

    try {
      if (!runner) {
        runner = new InterpreterRunner({
          source: sourceCode,
          pointerVariables: selectedLesson.pointerVariables,
        });
        runner.initialize();
      }
    } catch (error) {
      stopRunLoop();
      const message = error instanceof Error ? error.message : String(error);
      state = {
        ...state,
        runnerState: 'error',
        explanation: message,
        logEntries: [`Execution error: ${message}`, ...state.logEntries].slice(0, appConfig.maxLogEntries),
      };
      render();
      return true;
    }

    const nextEvent = runner.nextEvent();
    if (!nextEvent) {
      stopRunLoop();
      return true;
    }

    state = createStateFromLesson(state, selectedLesson, nextEvent);
    render();
    return state.runnerState === 'finished' || state.runnerState === 'error';
  }

  function render(): void {
    const hasValidationErrors = validationMessages.length > 0;

    layout.toolbar.setActiveLesson(selectedLesson.id);
    layout.welcome.root.hidden = !isWelcomeVisible;
    layout.array.speedInput.value = String(state.speed);
    layout.array.resetButton.disabled = false;
    layout.array.nextButton.disabled = hasValidationErrors || state.runnerState === 'running' || state.runnerState === 'finished';
    layout.array.runButton.disabled = hasValidationErrors || state.runnerState === 'running' || state.runnerState === 'finished';
    layout.array.pauseButton.disabled = state.runnerState !== 'running';
    layout.status.textContent = `${selectedLesson.title} · ${state.runnerState}`;
    layout.code.modeButton.textContent = isEditable ? 'Editable' : 'Read only';
    layout.code.modeButton.classList.toggle('is-readonly', !isEditable);

    editor.setEditable(isEditable);
    editor.highlightLine(state.currentLine);

    renderArrayPanel(layout.array.stage, state);
    renderVariablesPanel(layout.array.variables, state, selectedLesson);
    layout.log.body.replaceChildren(...state.logEntries.map((entry) => paragraph(entry)));
    layout.explanation.body.replaceChildren(paragraph(state.explanation));
    layout.code.errorList.replaceChildren(...validationMessages.map((message) => paragraph(message)));
    layout.code.errorList.classList.toggle('has-errors', hasValidationErrors);

    const isDark = document.documentElement.classList.contains('dark');
    
    // Sync Monaco
    updateMonacoTheme(isDark);
    
    // Refresh layout-specific theme elements (like icons)
    const themeGlyph = layout.root.querySelector('.icon-button-glyph');
    if (themeGlyph) {
      themeGlyph.textContent = isDark ? '🌙' : '☀️';
    }
  }

  function persist(): void {
    savePersistedAppState({
      lessonId: selectedLesson.id,
      sourceCode,
      speed: state.speed,
      isEditable,
      welcomeDismissed: !isWelcomeVisible,
    });
  }

  function setInfoMessage(message: string): void {
    state = {
      ...state,
      explanation: message,
      logEntries: [message, ...state.logEntries].slice(0, appConfig.maxLogEntries),
    };
  }

  function paragraph(text: string): HTMLParagraphElement {
    const element = document.createElement('p');
    element.textContent = text;
    return element;
  }

  container.innerHTML = '';
  container.append(layout.root);
  persist();
  render();
}