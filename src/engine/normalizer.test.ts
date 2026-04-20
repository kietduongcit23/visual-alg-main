import { describe, expect, it } from 'vitest';

import { normalizeJavaLikeSource } from './normalizer';

describe('normalizer', () => {
  it('removes simple type declarations while preserving lines', () => {
    const source = `int i = 0;
boolean found = false;
int[] arr = [1, 2, 3];`;

    expect(normalizeJavaLikeSource(source)).toBe(`i = 0;
found = false;
arr = [1, 2, 3];`);
  });

  it('rewrites supported print helpers and for-loop declarations', () => {
    const source = `for (int i = 0; i < arr.length; i = i + 1) {
    System.out.println(arr[i]);
}`;

    expect(normalizeJavaLikeSource(source)).toBe(`for (i = 0; i < arr.length; i = i + 1) {
    print(arr[i]);
}`);
  });
});