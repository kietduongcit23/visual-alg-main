import type { PersistedState } from './types';

export function loadPersistedState(storageKey: string): PersistedState {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}') as PersistedState;
  } catch {
    return {};
  }
}

export function savePersistedState(storageKey: string, state: PersistedState): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    return;
  }
}
