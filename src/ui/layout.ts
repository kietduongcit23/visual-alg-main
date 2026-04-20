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

  header.append(heading, status, toolbar.root, welcome.root);

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

  const topGrid = document.createElement('section');
  topGrid.className = 'top-grid';
  topGrid.append(code.root, array.root);

  const bottomGrid = document.createElement('section');
  bottomGrid.className = 'bottom-grid';
  bottomGrid.append(log.root, explanation.root);

  shell.append(header, topGrid, bottomGrid);
  return { root: shell, toolbar, welcome, code, array, log, explanation, status };
}