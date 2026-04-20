export interface CodePanelRefs {
  root: HTMLElement;
  editorMount: HTMLDivElement;
  modeButton: HTMLButtonElement;
  copyButton: HTMLButtonElement;
  resetCodeButton: HTMLButtonElement;
  errorList: HTMLDivElement;
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
  tag.textContent = 'CodeMirror 6';

  headerActions.append(modeButton, copyButton, resetCodeButton, tag);
  header.append(title, headerActions);

  const editorMount = document.createElement('div');
  editorMount.className = 'panel-body editor-host';

  const errorList = document.createElement('div');
  errorList.className = 'code-errors';

  root.append(header, editorMount, errorList);
  return { root, editorMount, modeButton, copyButton, resetCodeButton, errorList };
}