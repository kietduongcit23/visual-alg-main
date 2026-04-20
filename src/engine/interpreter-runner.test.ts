import { describe, expect, it } from 'vitest';

import { InterpreterRunner } from './interpreter-runner';

describe('interpreter runner', () => {
  it('emits semantic events from instrumented execution', () => {
    const runner = new InterpreterRunner({
      source: `arr = [5, 2, 9, 2];
target = 2;
answer = -1;
i = 0;

while (i < arr.length) {
    if (arr[i] == target) {
        answer = i;
        break;
    }
    i = i + 1;
}`,
      pointerVariables: ['i'],
    });

    const eventTypes: string[] = [];
    for (let index = 0; index < 40; index += 1) {
      const event = runner.nextEvent();
      if (!event) {
        break;
      }
      eventTypes.push(event.type);
      if (event.type === 'FINISH' || event.type === 'ERROR') {
        break;
      }
    }

    expect(eventTypes).toContain('READ_ARRAY');
    expect(eventTypes).toContain('COMPARE');
    expect(eventTypes).toContain('SET_VAR');
    expect(eventTypes[eventTypes.length - 1]).toBe('FINISH');
  });
});