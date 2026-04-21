import type { LessonDefinition } from '../lessons/lesson-types';
import { createToolbar, type ToolbarRefs } from './toolbar';
import { createArrayPanel, type PanelRefs as ArrayPanelRefs } from './panels/array-panel';
import { createCodePanel, type CodePanelRefs } from './panels/code-panel';
import { createExplanationPanel, type PanelRefs } from './panels/explanation-panel';
import { createLogPanel } from './panels/log-panel';
import { createWelcomePanel, type WelcomePanelRefs } from './panels/welcome-panel';

interface LayoutOptions {
  title: string;
  lessons: LessonDefinition[];
  onLessonChange: (lessonId: string) => void;
  onReset: () => void;
  onNext: () => void;
  onRun: () => void;
  onPause: () => void;
  onSpeedChange: (speed: number) => void;
}

export interface LayoutRefs {
  root: HTMLElement;
  toolbar: ToolbarRefs;
  welcome: WelcomePanelRefs;
  code: CodePanelRefs;
  array: ArrayPanelRefs;
  log: PanelRefs;
  explanation: PanelRefs;
  status: HTMLElement;
}

export function createLayout(options: LayoutOptions): LayoutRefs {
  const shell = document.createElement('main');
  shell.className = 'app-shell';

  const header = document.createElement('header');
  header.className = 'app-header';

  const heading = document.createElement('div');
  heading.className = 'app-heading';
  heading.innerHTML = `
    <p class="eyebrow">Browser-only classroom tool</p>
    <h1>${options.title}</h1>
    <p class="subtitle">Step through array algorithms using a semantic event stream that updates each panel in sync.</p>
  `;

  const status = document.createElement('p');
  status.className = 'status-banner';

  const toolbar = createToolbar({
    lessons: options.lessons,
    onLessonChange: options.onLessonChange,
  });
  const welcome = createWelcomePanel();

  const code = createCodePanel();
  const array = createArrayPanel({
    onReset: options.onReset,
    onNext: options.onNext,
    onRun: options.onRun,
    onPause: options.onPause,
    onSpeedChange: options.onSpeedChange,
  });
  const log = createLogPanel();
  const explanation = createExplanationPanel();

  const themeToggle = document.createElement('button');
  themeToggle.className = 'icon-button theme-toggle';
  themeToggle.innerHTML = `<span class="icon-button-glyph">🌓</span>`;
  themeToggle.title = 'Toggle Theme';
  themeToggle.onclick = () => {
    const isLight = document.documentElement.dataset.theme === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
  };

  const headerRight = document.createElement('div');
  headerRight.className = 'header-right';
  headerRight.append(themeToggle, array.footer);

  header.append(heading, status, headerRight);

  const appBody = document.createElement('div');
  appBody.className = 'app-body';

  const mainContent = document.createElement('section');
  mainContent.className = 'main-content';

  const leftCol = document.createElement('div');
  leftCol.className = 'left-col';
  leftCol.style.flex = '6';

  const resizer = document.createElement('div');
  resizer.className = 'resizer';

  let isResizing = false;
  resizer.addEventListener('mousedown', () => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerWidth = mainContent.getBoundingClientRect().width;
    const leftWidth = e.clientX - mainContent.getBoundingClientRect().left - 24; // account for padding
    const ratio = leftWidth / containerWidth;
    if (ratio > 0.2 && ratio < 0.8) {
      leftCol.style.flex = `${ratio * 10}`;
      rightCol.style.flex = `${(1 - ratio) * 10}`;
    }
  });
  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
    }
  });

  const rightCol = document.createElement('div');
  rightCol.className = 'right-col';
  rightCol.style.flex = '4';

  leftCol.append(explanation.root, code.root);
  rightCol.append(array.root, log.root);
  mainContent.append(leftCol, resizer, rightCol);

  appBody.append(toolbar.root, mainContent);

  shell.append(header, welcome.root, appBody);
  return { root: shell, toolbar, welcome, code, array, log, explanation, status };
}