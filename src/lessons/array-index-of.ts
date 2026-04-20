import type { LessonDefinition } from './lesson-types';

export const indexOfLesson: LessonDefinition = {
  id: 'array-index-of',
  title: 'indexOf(value)',
  description: 'Find the first index where the target appears in the array.',
  category: 'array',
  starterCode: `arr = [5, 2, 9, 2];
target = 2;
answer = -1;
i = 0;

while (i < arr.length) {
    if (arr[i] == target) {
        answer = i;
        break;
    }
    i = i + 1;
}`,
  initialBindings: {
    arr: [5, 2, 9, 2],
    target: 2,
    answer: -1,
    i: 0,
  },
  watchedVariables: ['target', 'answer', 'i'],
  pointerVariables: ['i'],
  primaryStructure: 'array',
  explanationMap: {
    READ_ARRAY: 'The algorithm inspects the current cell before deciding whether to continue scanning.',
    SET_VAR: 'When the target is found, the answer variable stores the matching index.',
    FINISH: 'The lesson ends as soon as the first match is found.',
  },
};