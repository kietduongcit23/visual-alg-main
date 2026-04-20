import type { LessonDefinition } from './lesson-types';

export const reverseArrayLesson: LessonDefinition = {
  id: 'array-reverse',
  title: 'reverse array',
  description: 'Use two pointers and swap mirrored positions until they meet.',
  category: 'array',
  starterCode: `arr = [1, 2, 3, 4, 5];
i = 0;
j = arr.length - 1;

while (i < j) {
    swap(arr, i, j);
    i = i + 1;
    j = j - 1;
}`,
  initialBindings: {
    arr: [1, 2, 3, 4, 5],
    i: 0,
    j: 4,
  },
  watchedVariables: ['i', 'j'],
  pointerVariables: ['i', 'j'],
  primaryStructure: 'array',
  explanationMap: {
    SWAP: 'The values at the two pointer positions exchange places to mirror the array.',
    MOVE_POINTER: 'Both pointers move inward after each swap, shrinking the unsolved range.',
    FINISH: 'Reversal finishes when the left and right pointers meet or cross.',
  },
};