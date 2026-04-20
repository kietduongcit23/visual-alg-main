import { describe, expect, it } from 'vitest';

import { indexOfLesson } from '../lessons/array-index-of';
import { createInitialState, createStateFromLesson } from './reducers';

describe('state reducer', () => {
  it('hydrates lesson bindings into the initial state', () => {
    const state = createInitialState(indexOfLesson, 2);

    expect(state.arrayValues).toEqual([5, 2, 9, 2]);
    expect(state.pointers).toEqual({ i: 0 });
    expect(state.variables.answer).toBe(-1);
    expect(state.runnerState).toBe('ready');
  });

  it('applies semantic events to the UI state', () => {
    const initialState = createInitialState(indexOfLesson, 1);
    const afterRead = createStateFromLesson(initialState, indexOfLesson, {
      type: 'READ_ARRAY',
      arrayName: 'arr',
      index: 1,
      value: 2,
    });
    const afterSet = createStateFromLesson(afterRead, indexOfLesson, {
      type: 'SET_VAR',
      name: 'answer',
      value: 1,
    });

    expect(afterRead.activeIndices).toEqual([1]);
    expect(afterRead.activeCellMode).toBe('read');
    expect(afterSet.variables.answer).toBe(1);
    expect(afterSet.logEntries[0]).toContain('Set answer = 1');
  });
});