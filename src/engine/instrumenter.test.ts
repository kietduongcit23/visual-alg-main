import { describe, expect, it } from 'vitest';

import { instrumentSource } from './instrumenter';

describe('instrumenter', () => {
  it('adds line hooks and semantic helpers to assignments and reads', () => {
    const { instrumentedSource } = instrumentSource(`answer = arr[i];
if (arr[i] == target) {
    i = i + 1;
}`, { pointerVariables: ['i'] });

    expect(instrumentedSource).toContain("__emitLine(1); answer = __assignVar('answer', __readArray('arr', i, arr[i]));");
    expect(instrumentedSource).toContain("__emitLine(2); if (__compare(__readArray('arr', i, arr[i]), '==', target)) {");
    expect(instrumentedSource).toContain("__emitLine(3); i = __assignPointer('i', i + 1);");
  });

  it('rewrites swap helper calls with runtime instrumentation', () => {
    const { instrumentedSource } = instrumentSource('swap(arr, i, j);', { pointerVariables: ['i', 'j'] });

    expect(instrumentedSource).toBe("__emitLine(1); __swap(arr, 'arr', i, j);");
  });
});