import { describe, expect, it } from 'vitest';

import { assertValidSource, validateSource } from './validator';

describe('validator', () => {
  it('accepts the supported subset', () => {
    const result = validateSource(`int i = 0;
while (i < arr.length) {
    i = i + 1;
}`);

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects unsupported classes and imports with friendly messages', () => {
    const result = validateSource(`import java.util.*;
class Demo {
}`);

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      { line: 1, message: 'Please use Java-like syntax without imports.' },
      { line: 2, message: 'Classes are not supported in this mode.' },
    ]);
  });

  it('throws using the first validation error', () => {
    expect(() => assertValidSource('class Demo {}')).toThrow('Line 1: Classes are not supported in this mode.');
  });
});