export interface PanelRefs {
  root: HTMLElement;
  body: HTMLDivElement;
}

export function createLogPanel(): PanelRefs {
  const root = document.createElement('section');
  root.className = 'panel';
  root.innerHTML = `
    <div class="panel-header">
      <h2>Operation Log</h2>
      <span class="panel-tag">Semantic events</span>
    </div>
  `;

  const body = document.createElement('div');
  body.className = 'panel-body log-list';
  root.append(body);
  return { root, body };
}