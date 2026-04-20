declare module 'js-interpreter' {
  export default class Interpreter {
    constructor(code: string, initFunc?: (interpreter: Interpreter, globalObject: unknown) => void);
    globalObject: unknown;
    value: unknown;
    step(): boolean;
    createNativeFunction(fn: (...args: unknown[]) => unknown, isConstructor?: boolean): unknown;
    setProperty(obj: unknown, name: string | number, value: unknown, descriptor?: unknown): void;
    getProperty(obj: unknown, name: string | number): unknown;
    pseudoToNative(value: unknown): unknown;
  }
}