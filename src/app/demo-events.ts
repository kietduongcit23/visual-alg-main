import type { RuntimeEvent } from '../engine/runtime-events';

export const demoEventScripts: Record<string, RuntimeEvent[]> = {
  'array-index-of': [
    { type: 'LINE_ENTER', line: 6 },
    { type: 'MOVE_POINTER', name: 'i', index: 1 },
    { type: 'READ_ARRAY', arrayName: 'arr', index: 1, value: 2 },
    { type: 'COMPARE', left: 2, operator: '==', right: 2, result: true },
    { type: 'LINE_ENTER', line: 7 },
    { type: 'SET_VAR', name: 'answer', value: 1 },
    { type: 'FINISH' },
  ],
  'array-find-max': [
    { type: 'LINE_ENTER', line: 5 },
    { type: 'READ_ARRAY', arrayName: 'arr', index: 1, value: 8 },
    { type: 'COMPARE', left: 8, operator: '>', right: 3, result: true },
    { type: 'SET_VAR', name: 'max', value: 8 },
    { type: 'MOVE_POINTER', name: 'i', index: 2 },
    { type: 'FINISH' },
  ],
  'array-count-occurrences': [
    { type: 'LINE_ENTER', line: 6 },
    { type: 'READ_ARRAY', arrayName: 'arr', index: 0, value: 2 },
    { type: 'COMPARE', left: 2, operator: '==', right: 2, result: true },
    { type: 'SET_VAR', name: 'count', value: 1 },
    { type: 'MOVE_POINTER', name: 'i', index: 1 },
    { type: 'FINISH' },
  ],
  'array-reverse': [
    { type: 'LINE_ENTER', line: 6 },
    { type: 'SWAP', arrayName: 'arr', i: 0, j: 4 },
    { type: 'MOVE_POINTER', name: 'i', index: 1 },
    { type: 'MOVE_POINTER', name: 'j', index: 3 },
    { type: 'FINISH' },
  ],
  'array-bubble-sort': [
    { type: 'LINE_ENTER', line: 6 },
    { type: 'READ_ARRAY', arrayName: 'arr', index: 0, value: 5 },
    { type: 'READ_ARRAY', arrayName: 'arr', index: 1, value: 1 },
    { type: 'COMPARE', left: 5, operator: '>', right: 1, result: true },
    { type: 'SWAP', arrayName: 'arr', i: 0, j: 1 },
    { type: 'MOVE_POINTER', name: 'j', index: 1 },
    { type: 'FINISH' },
  ],
};