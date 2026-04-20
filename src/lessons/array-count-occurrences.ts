import type { LessonDefinition } from './lesson-types';

export const countOccurrencesLesson: LessonDefinition = {
  id: 'array-count-occurrences',
  title: 'count occurrences of a value',
  description: 'Count how many times the target appears while scanning once.',
  category: 'array',
  starterCode: `arr = [2, 5, 2, 7, 2];
target = 2;
count = 0;
i = 0;

while (i < arr.length) {
    if (arr[i] == target) {
        count = count + 1;
    }
    i = i + 1;
}`,
  initialBindings: {
    arr: [2, 5, 2, 7, 2],
    target: 2,
    count: 0,
    i: 0,
  },
  watchedVariables: ['target', 'count', 'i'],
  pointerVariables: ['i'],
  primaryStructure: 'array',
  explanationMap: {
    COMPARE: 'Each comparison checks whether the current array value matches the requested target.',
    SET_VAR: 'The count increases only when a matching value is found.',
    FINISH: 'After the scan reaches the end, count stores the total number of matches.',
  },
};