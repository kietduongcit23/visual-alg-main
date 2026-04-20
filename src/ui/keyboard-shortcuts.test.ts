import { describe, expect, it } from 'vitest';

import { getShortcutAction } from './keyboard-shortcuts';

describe('getShortcutAction', () => {
  it('maps supported keys to runner actions', () => {
    expect(getShortcutAction('n')).toBe('next');
    expect(getShortcutAction('R')).toBe('run');
    expect(getShortcutAction('p')).toBe('pause');
    expect(getShortcutAction('Escape')).toBe('reset');
  });

  it('returns null for unsupported keys', () => {
    expect(getShortcutAction('x')).toBeNull();
  });
});