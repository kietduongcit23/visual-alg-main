import { appConfig } from './config';
import { loadPersistedAppState, savePersistedAppState } from './persistence';
import { createEditorController } from '../editor/editor';
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

    layout.toolbar.lessonSelect.value = selectedLesson.id;
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