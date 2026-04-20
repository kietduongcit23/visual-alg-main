import type { AppState } from '../state/app-state';

import { renderPointers } from './pointer-renderer';

export function renderArrayPanel(container: HTMLDivElement, state: AppState): void {
  container.innerHTML = '';
  const content = document.createElement('div');
  content.className = 'array-stage-content';

  renderPointers(content, state.pointers, state.arrayValues.length);

  const grid = document.createElement('div');
  grid.className = 'array-grid';
  grid.style.gridTemplateColumns = `repeat(${Math.max(state.arrayValues.length, 1)}, minmax(72px, 1fr))`;

  for (const [index, value] of state.arrayValues.entries()) {
    const cell = document.createElement('div');
    cell.className = 'array-cell';
    if (state.activeIndices.includes(index) && state.activeCellMode) {
      cell.classList.add(`is-${state.activeCellMode}`);
      if (state.activeCellMode === 'swap') {
        const swapPosition = state.activeIndices.indexOf(index);
        cell.classList.add(swapPosition === 0 ? 'is-swap-left' : 'is-swap-right');
      }
    }

    const indexText = document.createElement('span');
    indexText.className = 'array-index';
    indexText.textContent = String(index);

    const valueText = document.createElement('span');
    valueText.className = 'array-value';
    valueText.textContent = String(value);

    cell.append(indexText, valueText);
    grid.append(cell);
  }

  content.append(grid);
  container.append(content);
}