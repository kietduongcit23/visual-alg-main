import type { LessonDefinition } from './lesson-types';

export const bubbleSortLesson: LessonDefinition = {
  id: 'array-bubble-sort',
  title: 'bubble sort',
  description: 'Bubble the largest remaining value toward the end through repeated compares and swaps.',
  category: 'array',
  starterCode: `arr = [5, 1, 4, 2];
i = 0;

while (i < arr.length - 1) {
    j = 0;
    while (j < arr.length - 1 - i) {
        if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
        }
        j = j + 1;
    }
    i = i + 1;
}`,
  initialBindings: {
    arr: [5, 1, 4, 2],
    i: 0,
    j: 0,
  },
  watchedVariables: ['i', 'j'],
  pointerVariables: ['i', 'j'],
  primaryStructure: 'array',
  explanationMap: {
    COMPARE: 'Bubble sort compares adjacent values and keeps the larger one moving rightward.',
    SWAP: 'A swap corrects one out-of-order adjacent pair.',
    MOVE_POINTER: 'The inner pointer advances through the current unsorted prefix.',
  },
};