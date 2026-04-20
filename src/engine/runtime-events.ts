export type RuntimeEventType =
  | 'LINE_ENTER'
  | 'SET_VAR'
  | 'READ_ARRAY'
  | 'WRITE_ARRAY'
  | 'COMPARE'
  | 'MOVE_POINTER'
  | 'SWAP'
  | 'PRINT'
  | 'FINISH'
  | 'ERROR';

export type RuntimeEvent =
  | { type: 'LINE_ENTER'; line: number }
  | { type: 'SET_VAR'; name: string; value: unknown }
  | { type: 'READ_ARRAY'; arrayName: string; index: number; value: unknown }
  | { type: 'WRITE_ARRAY'; arrayName: string; index: number; value: unknown }
  | { type: 'COMPARE'; left: unknown; operator: string; right: unknown; result: boolean }
  | { type: 'MOVE_POINTER'; name: string; index: number }
  | { type: 'SWAP'; arrayName: string; i: number; j: number }
  | { type: 'PRINT'; text: string }
  | { type: 'FINISH' }
  | { type: 'ERROR'; message: string };

export function isTerminalEvent(event: RuntimeEvent): boolean {
  return event.type === 'FINISH' || event.type === 'ERROR';
}