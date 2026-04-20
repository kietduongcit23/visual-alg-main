import { describe, expect, it } from 'vitest';

import { isTerminalEvent, type RuntimeEvent } from './runtime-events';

describe('runtime events', () => {
  it('treats finish and error as terminal events', () => {
    const finishEvent: RuntimeEvent = { type: 'FINISH' };
    const errorEvent: RuntimeEvent = { type: 'ERROR', message: 'boom' };
    const stepEvent: RuntimeEvent = { type: 'LINE_ENTER', line: 2 };

    expect(isTerminalEvent(finishEvent)).toBe(true);
    expect(isTerminalEvent(errorEvent)).toBe(true);
    expect(isTerminalEvent(stepEvent)).toBe(false);
  });
});