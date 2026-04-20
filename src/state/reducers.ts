import type { RuntimeEvent } from '../engine/runtime-events';
import type { LessonDefinition } from '../lessons/lesson-types';
import type { AppState } from './app-state';
import type { RunnerState } from './runner-state';

const MAX_LOG_ENTRIES = 8;

export function createInitialState(lesson: LessonDefinition, speed: number): AppState {
  const arrayName = pickPrimaryArrayName(lesson.initialBindings);
  const arrayValues = Array.isArray(lesson.initialBindings[arrayName])
    ? [...(lesson.initialBindings[arrayName] as unknown[])]
    : [];

  const variables = { ...lesson.initialBindings };
  const pointers = Object.fromEntries(
    lesson.pointerVariables
      .filter((name) => typeof variables[name] === 'number')
      .map((name) => [name, Number(variables[name])]),
  );

  return {
    runnerState: 'ready',
    currentLine: 1,
    arrayName,
    arrayValues,
    activeIndices: [],
    activeCellMode: null,
    variables,
    pointers,
    logEntries: ['Ready to step through the lesson.'],
    explanation: lesson.description,
    eventCursor: 0,
    speed,
  };
}

export function createStateFromLesson(
  state: AppState,
  lesson: LessonDefinition,
  event: RuntimeEvent,
): AppState {
  const nextState: AppState = {
    ...state,
    runnerState: state.runnerState === 'ready' ? 'paused' : state.runnerState,
    eventCursor: state.eventCursor + 1,
    activeIndices: [],
    activeCellMode: null,
  };

  switch (event.type) {
    case 'LINE_ENTER':
      nextState.currentLine = event.line;
      break;
    case 'SET_VAR':
      nextState.variables = { ...nextState.variables, [event.name]: event.value };
      if (lesson.pointerVariables.includes(event.name) && typeof event.value === 'number') {
        nextState.pointers = { ...nextState.pointers, [event.name]: event.value };
      }
      break;
    case 'READ_ARRAY':
      nextState.activeIndices = [event.index];
      nextState.activeCellMode = 'read';
      break;
    case 'WRITE_ARRAY':
      nextState.arrayValues = nextState.arrayValues.map((value, index) =>
        index === event.index ? event.value : value,
      );
      nextState.activeIndices = [event.index];
      nextState.activeCellMode = 'write';
      break;
    case 'COMPARE':
      nextState.activeCellMode = 'compare';
      break;
    case 'MOVE_POINTER':
      nextState.pointers = { ...nextState.pointers, [event.name]: event.index };
      nextState.variables = { ...nextState.variables, [event.name]: event.index };
      nextState.activeIndices = [event.index];
      break;
    case 'SWAP': {
      const arrayValues = [...nextState.arrayValues];
      [arrayValues[event.i], arrayValues[event.j]] = [arrayValues[event.j], arrayValues[event.i]];
      nextState.arrayValues = arrayValues;
      nextState.activeIndices = [event.i, event.j];
      nextState.activeCellMode = 'swap';
      break;
    }
    case 'PRINT':
      break;
    case 'FINISH':
      nextState.runnerState = 'finished';
      break;
    case 'ERROR':
      nextState.runnerState = 'error';
      break;
  }

  nextState.logEntries = appendLog(nextState.logEntries, describeEvent(event));
  nextState.explanation = explainEvent(lesson, event);

  return nextState;
}

export function setRunnerState(state: AppState, runnerState: RunnerState): AppState {
  return { ...state, runnerState };
}

export function getPlaybackDelay(speed: number): number {
  const delays = [0, 1100, 800, 500, 280, 160];
  return delays[speed] ?? 500;
}

function appendLog(logEntries: string[], entry: string): string[] {
  return [entry, ...logEntries].slice(0, MAX_LOG_ENTRIES);
}

function explainEvent(lesson: LessonDefinition, event: RuntimeEvent): string {
  const mappedExplanation = lesson.explanationMap?.[event.type];
  if (typeof mappedExplanation === 'function') {
    return mappedExplanation(event);
  }

  if (typeof mappedExplanation === 'string') {
    return mappedExplanation;
  }

  return describeEvent(event);
}

function describeEvent(event: RuntimeEvent): string {
  switch (event.type) {
    case 'LINE_ENTER':
      return `Enter line ${event.line}.`;
    case 'SET_VAR':
      return `Set ${event.name} = ${String(event.value)}.`;
    case 'READ_ARRAY':
      return `Read ${event.arrayName}[${event.index}] = ${String(event.value)}.`;
    case 'WRITE_ARRAY':
      return `Write ${event.arrayName}[${event.index}] = ${String(event.value)}.`;
    case 'COMPARE':
      return `Compare ${String(event.left)} ${event.operator} ${String(event.right)} => ${String(event.result)}.`;
    case 'MOVE_POINTER':
      return `Move ${event.name} to index ${event.index}.`;
    case 'SWAP':
      return `Swap ${event.arrayName}[${event.i}] with ${event.arrayName}[${event.j}].`;
    case 'PRINT':
      return `Print ${event.text}.`;
    case 'FINISH':
      return 'Execution finished.';
    case 'ERROR':
      return `Execution error: ${event.message}`;
  }
}

function pickPrimaryArrayName(bindings: Record<string, unknown>): string {
  const match = Object.entries(bindings).find(([, value]) => Array.isArray(value));
  return match?.[0] ?? 'arr';
}