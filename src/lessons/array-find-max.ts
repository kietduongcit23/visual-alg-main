import type { LessonDefinition } from './lesson-types';

export const findMaxLesson: LessonDefinition = {
  id: 'array-find-max',
  title: 'find maximum value',
  description: 'Track the current best value while scanning the array once.',
  category: 'array',
  starterCode: `arr = [3, 8, 1, 6];
max = arr[0];
i = 1;

while (i < arr.length) {
    if (arr[i] > max) {
        max = arr[i];
    }
    i = i + 1;
}`,
  initialBindings: {
    arr: [3, 8, 1, 6],
    max: 3,
    i: 1,
  },
  watchedVariables: ['max', 'i'],
  pointerVariables: ['i'],
  primaryStructure: 'array',
  explanationMap: {
    COMPARE: 'Each comparison checks whether the current cell beats the best value seen so far.',
    SET_VAR: 'A larger value replaces the current maximum.',
  },
};