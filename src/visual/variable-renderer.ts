import type { LessonDefinition } from '../lessons/lesson-types';
import type { AppState } from '../state/app-state';

export function renderVariablesPanel(
  container: HTMLDivElement,
  state: AppState,
  lesson: LessonDefinition,
): void {
  container.innerHTML = '';

  const names = lesson.watchedVariables.filter((name) => !lesson.pointerVariables.includes(name));

  if (names.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'variables-empty';
    emptyState.textContent = 'No extra variables for this lesson.';
    container.append(emptyState);
    return;
  }

  for (const name of names) {
    const card = document.createElement('div');
    card.className = 'variable-card variable-card-inline';

    const key = document.createElement('strong');
    key.textContent = name;

    const value = document.createElement('span');
    value.textContent = String(state.variables[name] ?? 'undefined');

    card.append(key, value);
    container.append(card);
  }
}