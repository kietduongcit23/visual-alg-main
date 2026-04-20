import type { RunnerState } from './runner-state';

export type ActiveCellMode = 'read' | 'write' | 'compare' | 'swap' | null;

export interface AppState {
  runnerState: RunnerState;
  currentLine: number | null;
  arrayName: string;
  arrayValues: unknown[];
  activeIndices: number[];
  activeCellMode: ActiveCellMode;
  variables: Record<string, unknown>;
  pointers: Record<string, number>;
  logEntries: string[];
  explanation: string;
  eventCursor: number;
  speed: number;
}