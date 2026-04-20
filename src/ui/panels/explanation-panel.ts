export interface PanelRefs {
  root: HTMLElement;
  body: HTMLDivElement;
}

export function createExplanationPanel(): PanelRefs {
  const root = document.createElement('section');
  root.className = 'panel';
  root.innerHTML = `
    <div class="panel-header">
      <h2>Explanation</h2>
      <span class="panel-tag">Teaching guidance</span>
    </div>
  `;

  const body = document.createElement('div');
  body.className = 'panel-body explanation-copy';
  root.append(body);
  return { root, body };
}