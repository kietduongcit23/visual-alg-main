import { describe, expect, it } from 'vitest';

import {
  createLessonDefaults,
  createLookupArray,
  createMinimalStarterCode,
  createMissingNumberCase,
  createSortedFromPattern,
  repeatPattern,
} from './lesson-helpers';

describe('lesson helpers', () => {
  it('creates minimal starter code from a full solution body', () => {
    const starter = createMinimalStarterCode(
      ['indexOfValue(numbers, target) {', '  return numbers.indexOf(target);', '}'].join('\n'),
      '-1',
    );

    expect(starter).toBe(['indexOfValue(numbers, target) {', '  return -1;', '}'].join('\n'));
  });

  it('returns lesson defaults for representative lesson kinds', () => {
    expect(createLessonDefaults('index-of').defaultReturn).toBe('-1');
    expect(createLessonDefaults('contains-value').defaultReturn).toBe('false');
    expect(createLessonDefaults('pairs-with-sum').defaultReturn).toBe('[]');
  });

  it('builds deterministic helper arrays', () => {
    expect(repeatPattern([1, 2, 3], 7)).toEqual([1, 2, 3, 1, 2, 3, 1]);
    expect(createSortedFromPattern([3, 1], 6)).toEqual([1, 1, 1, 3, 3, 3]);
    expect(createLookupArray(6, 9, [1, 4])).toEqual([-9, 9, -5, -3, 9, 1]);
  });

  it('creates a missing-number case with the target omitted', () => {
    const testCase = createMissingNumberCase(5, 3);
    const values = testCase.args[0] as number[];

    expect(values).toHaveLength(5);
    expect(values.includes(3)).toBe(false);
    expect(values.slice().sort((left, right) => left - right)).toEqual([0, 1, 2, 4, 5]);
  });
});
