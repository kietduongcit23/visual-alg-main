import { createAggregateLessonConfigs } from './aggregate-lessons';
import { createBinarySearchLessonConfigs } from './binarysearch-lessons';
import { createExtremaLessonConfigs } from './extrema-lessons';
import { createArrayLesson } from './lesson-factory';
import { createLookupLessonConfigs } from './lookup-lessons';
import { createPrefixSumLessonConfigs } from './prefixsum-lessons';
import { createSlidingWindowLessonConfigs } from './slidingwindow-lessons';
import { createTransformLessonConfigs } from './transform-lessons';
import { createTwoPointerLessonConfigs } from './twopointer-lessons';
import type { Lesson } from './types';

const LESSON_ORDER = [
  'index-of',
  'last-index-of',
  'contains-value',
  'find-max',
  'find-min',
  'index-of-max',
  'index-of-min',
  'sum-all',
  'average',
  'count-occurrences',
  'count-max-occurrences',
  'count-unique',
  'most-frequent',
  'reverse-array',
  'sort-ascending',
  'sort-descending',
  'second-extreme',
  'all-indices',
  'is-sorted',
  'remove-duplicates',
  'pairs-with-sum',
  'rotate',
  'longest-run',
  'merge-sorted',
  'missing-number',
  // Two Pointers
  'two-sum-sorted',
  'find-cycle-length',
  'intersect-sorted',
  // Sliding Window
  'max-sum-subarray-k',
  'shortest-subarray-sum',
  // Prefix Sum
  'build-prefix-sum',
  'range-sum-queries',
  // Binary Search
  'binary-search',
  'first-occurrence',
] as const;

export function createLessons(): Lesson[] {
  const lessons = [
    ...createLookupLessonConfigs(),
    ...createExtremaLessonConfigs(),
    ...createAggregateLessonConfigs(),
    ...createTransformLessonConfigs(),
    ...createTwoPointerLessonConfigs(),
    ...createSlidingWindowLessonConfigs(),
    ...createPrefixSumLessonConfigs(),
    ...createBinarySearchLessonConfigs(),
  ].map(createArrayLesson);

  const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));

  return LESSON_ORDER.map((id) => {
    const lesson = lessonMap.get(id);
    if (!lesson) {
      throw new Error(`Missing lesson config for ${id}`);
    }
    
    // Remove leading numbers from title (e.g. "1. indexOf" -> "indexOf")
    const cleanTitle = lesson.title.replace(/^\d+\.\s*/, '');
    
    return {
      ...lesson,
      title: cleanTitle
    };
  });
}
