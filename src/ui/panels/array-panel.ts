interface ArrayPanelOptions {
  onReset: () => void;
  onNext: () => void;
  onRun: () => void;
  onPause: () => void;
  onSpeedChange: (speed: number) => void;
}

export interface PanelRefs {
  root: HTMLElement;
  stage: HTMLDivElement;
  variables: HTMLDivElement;
  legend: HTMLDivElement;
  resetButton: HTMLButtonElement;
  nextButton: HTMLButtonElement;
  runButton: HTMLButtonElement;
  pauseButton: HTMLButtonElement;
  speedInput: HTMLInputElement;
  footer: HTMLDivElement;
}

export function createArrayPanel(options: ArrayPanelOptions): PanelRefs {
  const root = document.createElement('section');
  root.className = 'panel panel-array panel-array-wide';

  const header = document.createElement('div');
  header.className = 'panel-header';
  header.innerHTML = `
    <h2>Array Visualization</h2>
    <span class="panel-tag">Reads, writes, pointers</span>
  `;

  const body = document.createElement('div');
  body.className = 'panel-body panel-body-array';

  const stage = document.createElement('div');
  stage.className = 'array-stage';

  const variables = document.createElement('div');
  variables.className = 'array-variables';

  const legend = document.createElement('div');
  legend.className = 'array-legend';
  legend.innerHTML = `
    <span class="legend-item"><i class="legend-swatch is-read"></i>Read</span>
    <span class="legend-item"><i class="legend-swatch is-write"></i>Write</span>
    <span class="legend-item"><i class="legend-swatch is-compare"></i>Compare</span>
    <span class="legend-item"><i class="legend-swatch is-swap"></i>Swap</span>
    <span class="legend-item"><i class="legend-pointer"></i>Pointer</span>
  `;

  const footer = document.createElement('div');
  footer.className = 'array-footer';

  const speedGroup = document.createElement('label');
  speedGroup.className = 'speed-group';
  speedGroup.innerHTML = '<span>Speed</span>';

  const speedInput = document.createElement('input');
  speedInput.type = 'range';
  speedInput.min = '1';
  speedInput.max = '5';
  speedInput.value = '1';
  speedInput.setAttribute('aria-label', 'Playback speed');
  speedInput.addEventListener('input', () => {
    options.onSpeedChange(Number(speedInput.value));
  });
  speedGroup.append(speedInput);

  const controls = document.createElement('div');
  controls.className = 'array-controls';

  const resetButton = createIconButton('Reset', '↺', options.onReset);
  const nextButton = createIconButton('Next', '⟶', options.onNext);
  const runButton = createIconButton('Run', '▶', options.onRun);
  const pauseButton = createIconButton('Pause', '⏸', options.onPause);
  controls.append(resetButton, nextButton, runButton, pauseButton);

  footer.append(speedGroup, controls);
  body.append(stage, variables, legend); // removed footer

  root.append(header, body);
  return { root, stage, variables, legend, resetButton, nextButton, runButton, pauseButton, speedInput, footer };
}

function createIconButton(label: string, icon: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon-button';
  button.setAttribute('aria-label', label);
  button.title = label;
  button.innerHTML = `
    <span class="icon-button-glyph" aria-hidden="true">${icon}</span>
    <span class="sr-only">${label}</span>
  `;
  button.style.setProperty('--mx', '50%');
  button.style.setProperty('--my', '50%');
  button.addEventListener('mousemove', (event) => {
    const bounds = button.getBoundingClientRect();
    button.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
    button.style.setProperty('--my', `${event.clientY - bounds.top}px`);
  });
  button.addEventListener('mouseleave', () => {
    button.style.setProperty('--mx', '50%');
    button.style.setProperty('--my', '50%');
  });
  button.addEventListener('click', onClick);
  return button;
}