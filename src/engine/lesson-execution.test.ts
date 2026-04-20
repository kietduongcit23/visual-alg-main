import { describe, expect, it } from 'vitest';

import { bubbleSortLesson } from '../lessons/array-bubble-sort';
import { countOccurrencesLesson } from '../lessons/array-count-occurrences';
import { findMaxLesson } from '../lessons/array-find-max';
import { indexOfLesson } from '../lessons/array-index-of';
import { reverseArrayLesson } from '../lessons/array-reverse';
import type { LessonDefinition } from '../lessons/lesson-types';
import { createInitialState, createStateFromLesson } from '../state/reducers';

import { InterpreterRunner } from './interpreter-runner';

describe('lesson execution', () => {
  it('solves the indexOf lesson', () => {
    const state = executeLesson(indexOfLesson);
    expect(state.variables.answer).toBe(1);
  });

  it('handles the indexOf lesson when the value is not found', () => {
    const state = executeLesson({
      ...indexOfLesson,
      starterCode: `arr = [5, 2, 9, 2];
target = 7;
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
        target: 7,
        answer: -1,
        i: 0,
      },
    });

    expect(state.variables.answer).toBe(-1);
  });

  it('solves the find maximum lesson', () => {
    const state = executeLesson(findMaxLesson);
    expect(state.variables.max).toBe(8);
  });

  it('solves the count occurrences lesson', () => {
    const state = executeLesson(countOccurrencesLesson);
    expect(state.variables.count).toBe(3);
  });

  it('solves the reverse array lesson', () => {
    const state = executeLesson(reverseArrayLesson);
    expect(state.arrayValues).toEqual([5, 4, 3, 2, 1]);
  });

  it('solves the bubble sort lesson', () => {
    const state = executeLesson(bubbleSortLesson);
    expect(state.arrayValues).toEqual([1, 2, 4, 5]);
  });
});

function executeLesson(lesson: LessonDefinition) {
  const runner = new InterpreterRunner({
    source: lesson.starterCode,
    pointerVariables: lesson.pointerVariables,
  });
  let state = createInitialState(lesson, 1);

  for (let index = 0; index < 200; index += 1) {
    const event = runner.nextEvent();
    if (!event) {
      break;
    }

    state = createStateFromLesson(state, lesson, event);
    if (event.type === 'FINISH' || event.type === 'ERROR') {
      break;
    }
  }

  return state;
}