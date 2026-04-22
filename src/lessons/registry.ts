import { javaBasicsLesson } from './java-basics';
import { bubbleSortLesson } from './array-bubble-sort';
import { countOccurrencesLesson } from './array-count-occurrences';
import { findMaxLesson } from './array-find-max';
import { indexOfLesson } from './array-index-of';
import { reverseArrayLesson } from './array-reverse';
import type { LessonDefinition } from './lesson-types';

export const lessons: LessonDefinition[] = [
  javaBasicsLesson,
  indexOfLesson,
  findMaxLesson,
  countOccurrencesLesson,
  reverseArrayLesson,
  bubbleSortLesson,
];

export function getLessonById(id: string): LessonDefinition | undefined {
  return lessons.find((lesson) => lesson.id === id);
}