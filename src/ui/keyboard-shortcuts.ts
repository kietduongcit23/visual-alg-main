export type ShortcutAction = 'next' | 'run' | 'pause' | 'reset' | null;

export function getShortcutAction(key: string): ShortcutAction {
  switch (key.toLowerCase()) {
    case 'n':
      return 'next';
    case 'r':
      return 'run';
    case 'p':
      return 'pause';
    case 'escape':
      return 'reset';
    default:
      return null;
  }
}

export function shouldIgnoreShortcutTarget(target: EventTarget | null, isEditable: boolean): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
    return true;
  }

  if (isEditable && Boolean(target.closest('.cm-editor'))) {
    return true;
  }

  return false;
}