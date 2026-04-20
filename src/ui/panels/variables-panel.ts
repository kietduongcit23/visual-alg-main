export interface PanelRefs {
  root: HTMLElement;
  body: HTMLDivElement;
}

export function createVariablesPanel(): PanelRefs {
  const root = document.createElement('section');
  root.className = 'panel panel-variables';
  root.innerHTML = `
    <div class="panel-header">
      <h2>Variables</h2>
      <span class="panel-tag">Inputs and outputs</span>
    </div>
  `;

  const body = document.createElement('div');
  body.className = 'panel-body variable-list';
  root.append(body);
  return { root, body };
}