export interface PersistedAppState {
  lessonId: string;
  sourceCode: string;
  speed: number;
  isEditable: boolean;
  welcomeDismissed: boolean;
}

const STORAGE_KEY = 'visualalg:app-state';

export function loadPersistedAppState(): Partial<PersistedAppState> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as Partial<PersistedAppState>;
  } catch {
    return null;
  }
}

export function savePersistedAppState(state: PersistedAppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures and keep the app functional.
  }
}