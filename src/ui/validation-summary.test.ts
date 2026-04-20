import { describe, expect, it } from 'vitest';

import { formatValidationIssues } from './validation-summary';

describe('formatValidationIssues', () => {
  it('formats validation issues for display in the editor panel', () => {
    expect(
      formatValidationIssues([
        { line: 2, message: 'Classes are not supported in this mode.' },
        { line: 4, message: 'Please use Java-like syntax without imports.' },
      ]),
    ).toEqual([
      'Line 2: Classes are not supported in this mode.',
      'Line 4: Please use Java-like syntax without imports.',
    ]);
  });
});