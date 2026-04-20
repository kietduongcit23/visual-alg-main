import { describe, expect, it } from 'vitest';

import { createLessons } from './lessons';

describe('createLessons', () => {
  it('returns the full lesson catalog in the intended order', () => {
    const lessons = createLessons();

    expect(lessons).toHaveLength(25);
    expect(lessons[0]?.id).toBe('index-of');
    expect(lessons[9]?.id).toBe('count-occurrences');
    expect(lessons[24]?.id).toBe('missing-number');
  });

  it('derives minimal starter code while keeping the full solution available', () => {
    const lessons = createLessons();
    const indexOfLesson = lessons.find((lesson) => lesson.id === 'index-of');

    expect(indexOfLesson?.starterCode).toBe(['indexOfValue(numbers, target) {', '  return -1;', '}'].join('\n'));
    expect(indexOfLesson?.solutionCode).toContain('for (let i = 0; i < numbers.length; i += 1) {');
  });
});
