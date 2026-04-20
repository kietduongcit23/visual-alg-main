import Interpreter from 'js-interpreter';

import { instrumentSource } from './instrumenter';
import { normalizeJavaLikeSource } from './normalizer';
import type { RuntimeEvent } from './runtime-events';
import { validateSource } from './validator';

interface RunnerOptions {
  source: string;
  pointerVariables: string[];
  maxInterpreterSteps?: number;
}

export interface RunnerPreparation {
  normalizedSource: string;
  instrumentedSource: string;
}

export class InterpreterRunner {
  private readonly eventQueue: RuntimeEvent[] = [];
  private readonly pointerVariables: Set<string>;
  private readonly maxInterpreterSteps: number;
  private interpreter: Interpreter | null = null;
  private hasEmittedFinish = false;
  private preparation: RunnerPreparation | null = null;

  constructor(private readonly options: RunnerOptions) {
    this.pointerVariables = new Set(options.pointerVariables);
    this.maxInterpreterSteps = options.maxInterpreterSteps ?? 10_000;
  }

  public prepare(): RunnerPreparation {
    const validation = validateSource(this.options.source);
    if (!validation.ok) {
      const [error] = validation.errors;
      throw new Error(error ? `Line ${error.line}: ${error.message}` : 'Unsupported syntax.');
    }

    const normalizedSource = normalizeJavaLikeSource(this.options.source);
    const { instrumentedSource } = instrumentSource(normalizedSource, {
      pointerVariables: [...this.pointerVariables],
    });

    this.preparation = { normalizedSource, instrumentedSource };
    return this.preparation;
  }

  public initialize(): RunnerPreparation {
    const preparation = this.prepare();
    this.eventQueue.length = 0;
    this.hasEmittedFinish = false;
    this.interpreter = new Interpreter(preparation.instrumentedSource, (interpreter, globalObject) => {
      this.installRuntime(interpreter, globalObject);
    });
    return preparation;
  }

  public nextEvent(): RuntimeEvent | null {
    if (!this.interpreter) {
      this.initialize();
    }

    const queuedEvent = this.eventQueue.shift();
    if (queuedEvent) {
      return queuedEvent;
    }

    if (!this.interpreter) {
      return null;
    }

    let stepCount = 0;
    while (stepCount < this.maxInterpreterSteps) {
      stepCount += 1;
      let hasMore = false;
      try {
        hasMore = this.interpreter.step();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { type: 'ERROR', message };
      }

      const event = this.eventQueue.shift();
      if (event) {
        return event;
      }

      if (!hasMore) {
        if (!this.hasEmittedFinish) {
          this.hasEmittedFinish = true;
          return { type: 'FINISH' };
        }
        return null;
      }
    }

    return { type: 'ERROR', message: 'Maximum interpreter steps exceeded.' };
  }

  private installRuntime(interpreter: Interpreter, globalObject: unknown): void {
    const bind = (name: string, fn: (...args: unknown[]) => unknown) => {
      interpreter.setProperty(globalObject, name, interpreter.createNativeFunction(fn));
    };

    bind('__emitLine', (lineNumber) => {
      this.eventQueue.push({ type: 'LINE_ENTER', line: asNumber(lineNumber) });
      return lineNumber;
    });

    bind('__assignVar', (name, value) => {
      const nativeName = String(interpreter.pseudoToNative(name));
      const nativeValue = interpreter.pseudoToNative(value);
      this.eventQueue.push({ type: 'SET_VAR', name: nativeName, value: nativeValue });
      return value;
    });

    bind('__assignPointer', (name, value) => {
      const nativeName = String(interpreter.pseudoToNative(name));
      const nativeValue = interpreter.pseudoToNative(value);
      this.eventQueue.push({ type: 'SET_VAR', name: nativeName, value: nativeValue });
      if (typeof nativeValue === 'number') {
        this.eventQueue.push({ type: 'MOVE_POINTER', name: nativeName, index: nativeValue });
      }
      return value;
    });

    bind('__readArray', (arrayName, index, value) => {
      this.eventQueue.push({
        type: 'READ_ARRAY',
        arrayName: String(interpreter.pseudoToNative(arrayName)),
        index: asNumber(index),
        value: interpreter.pseudoToNative(value),
      });
      return value;
    });

    bind('__writeArray', (arrayName, index, value) => {
      this.eventQueue.push({
        type: 'WRITE_ARRAY',
        arrayName: String(interpreter.pseudoToNative(arrayName)),
        index: asNumber(index),
        value: interpreter.pseudoToNative(value),
      });
      return value;
    });

    bind('__compare', (left, operator, right) => {
      const nativeLeft = interpreter.pseudoToNative(left);
      const nativeRight = interpreter.pseudoToNative(right);
      const nativeOperator = String(interpreter.pseudoToNative(operator));
      const result = compare(nativeLeft, nativeOperator, nativeRight);
      this.eventQueue.push({
        type: 'COMPARE',
        left: nativeLeft,
        operator: nativeOperator,
        right: nativeRight,
        result,
      });
      return result;
    });

    bind('__swap', (arrayRef, arrayName, leftIndex, rightIndex) => {
      const i = asNumber(leftIndex);
      const j = asNumber(rightIndex);
      const leftValue = interpreter.getProperty(arrayRef, i);
      const rightValue = interpreter.getProperty(arrayRef, j);
      interpreter.setProperty(arrayRef, i, rightValue);
      interpreter.setProperty(arrayRef, j, leftValue);
      this.eventQueue.push({
        type: 'SWAP',
        arrayName: String(interpreter.pseudoToNative(arrayName)),
        i,
        j,
      });
      return undefined;
    });

    bind('print', (text) => {
      this.eventQueue.push({
        type: 'PRINT',
        text: String(interpreter.pseudoToNative(text)),
      });
      return undefined;
    });
  }
}

function compare(left: unknown, operator: string, right: unknown): boolean {
  switch (operator) {
    case '==':
      return left == right;
    case '!=':
      return left != right;
    case '<':
      return Number(left) < Number(right);
    case '<=':
      return Number(left) <= Number(right);
    case '>':
      return Number(left) > Number(right);
    case '>=':
      return Number(left) >= Number(right);
    default:
      throw new Error(`Unsupported comparison operator: ${operator}`);
  }
}

function asNumber(value: unknown): number {
  const native = typeof value === 'number' ? value : Number(value);
  return native;
}