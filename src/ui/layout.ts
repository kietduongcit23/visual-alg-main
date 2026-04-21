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

  header.append(heading, toolbar.root, status);

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

  const mainLayout = document.createElement('div');
  mainLayout.className = 'main-layout';

  const leftCol = document.createElement('div');
  leftCol.className = 'left-col';
  // leftCol.append(code.root, array.footer); // Wait, array.footer is not exported yet.

  const rightCol = document.createElement('div');
  rightCol.className = 'right-col';
  // rightCol.append(explanation.root, array.root, log.root);

  // We will append properly once we export array.footer in the next step.
  code.root.append(array.footer);
  leftCol.append(code.root);
  rightCol.append(explanation.root, array.root, log.root);
  mainLayout.append(leftCol, rightCol);

  shell.append(header, welcome.root, mainLayout);
  return { root: shell, toolbar, welcome, code, array, log, explanation, status };
}