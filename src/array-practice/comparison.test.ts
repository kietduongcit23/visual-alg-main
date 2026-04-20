import { describe, expect, it } from 'vitest';

import { deepEqual, normalizePairs } from './comparison';

describe('comparison helpers', () => {
  it('normalizes pair values and sorts them deterministically', () => {
    expect(normalizePairs([[4, 1], [3, 3], [2, 5]])).toEqual([[1, 4], [2, 5], [3, 3]]);
  });

  it('rejects invalid pair outputs', () => {
    expect(normalizePairs('nope')).toBeNull();
    expect(normalizePairs([[1, 2, 3]])).toBeNull();
  });

  it('compares nested structures deeply', () => {
    expect(deepEqual({ a: [1, 2], b: { c: true } }, { a: [1, 2], b: { c: true } })).toBe(true);
    expect(deepEqual({ a: [1, 2] }, { a: [2, 1] })).toBe(false);
  });
});
