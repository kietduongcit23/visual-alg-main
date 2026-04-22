export interface CodePanelRefs {
  root: HTMLElement;
  editorMount: HTMLDivElement;
  modeButton: HTMLButtonElement;
  copyButton: HTMLButtonElement;
  resetCodeButton: HTMLButtonElement;
  runCodeButton: HTMLButtonElement;
  errorList: HTMLDivElement;
  console: HTMLDivElement;
}

export function createCodePanel(): CodePanelRefs {
  const root = document.createElement('section');
  root.className = 'panel panel-code';

  const header = document.createElement('div');
  header.className = 'panel-header';
  const title = document.createElement('h2');
  title.textContent = 'Code Editor';

  const headerActions = document.createElement('div');
  headerActions.className = 'code-panel-actions';

  const runCodeButton = document.createElement('button');
  runCodeButton.type = 'button';
  runCodeButton.className = 'mode-toggle run-button';
  runCodeButton.innerHTML = '▶ Run Code';

  const modeButton = document.createElement('button');
  modeButton.type = 'button';
  modeButton.className = 'mode-toggle';
  modeButton.textContent = 'Editable';

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'mode-toggle';
  copyButton.textContent = 'Copy';

  const resetCodeButton = document.createElement('button');
  resetCodeButton.type = 'button';
  resetCodeButton.className = 'mode-toggle';
  resetCodeButton.textContent = 'Reset code';

  const tag = document.createElement('span');
  tag.className = 'panel-tag';
  tag.textContent = 'Monaco Editor';

  headerActions.append(runCodeButton, modeButton, copyButton, resetCodeButton, tag);
  header.append(title, headerActions);

  const editorMount = document.createElement('div');
  editorMount.className = 'panel-body editor-host';
  editorMount.style.height = '400px';

  const console = document.createElement('div');
  console.id = 'editor-console';
  console.className = 'editor-console';
  console.innerHTML = '<div class="console-header" style="display: flex; align-items: center;">Console Output</div><div class="console-body"></div>';

  const errorList = document.createElement('div');
  errorList.className = 'code-errors';

  root.append(header, editorMount, console, errorList);
  return { root, editorMount, modeButton, copyButton, resetCodeButton, runCodeButton, errorList, console };
}