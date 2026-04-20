import type { DecoratedTestCase, Lesson, PlannedTestCaseFactory, RawTestCase, TestSuite } from './types';

const CANDIDATE_MULTIPLIER = 8;

type ExecutionResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

type ExpectedResult = {
  expected: unknown;
  error: string;
};

export function buildTestSuite(lesson: Lesson): TestSuite {
  const seed = stableHash(`suite:${lesson.id}`);
  const visibleCount = Math.min(lesson.visibleTestCount, lesson.testCount);
  const hiddenCount = Math.max(0, lesson.testCount - visibleCount);
  const plannedVisible = materializePlannedTests(lesson, lesson.visibleCases || [], 'visible');
  const visibleCandidates = createCandidatePool(lesson, stableHash(`visible:${lesson.id}`), Math.max(visibleCount * CANDIDATE_MULTIPLIER, 24), true);
  const visibleTests = selectPlannedAndDiverseTests(plannedVisible, visibleCandidates, visibleCount, new Set()).map((candidate) => ({ ...candidate, isVisible: true }));
  const usedSignatures = new Set(visibleTests.map((test) => test.signature));
  const plannedHidden = materializePlannedTests(lesson, lesson.hiddenCases || [], 'hidden');
  const hiddenCandidates = createCandidatePool(lesson, stableHash(`hidden:${lesson.id}`), Math.max(hiddenCount * CANDIDATE_MULTIPLIER, 40), false);
  const hiddenTests = selectPlannedAndDiverseTests(plannedHidden, hiddenCandidates, hiddenCount, usedSignatures).map((candidate) => ({ ...candidate, isVisible: false }));

  return {
    seed,
    tests: visibleTests.concat(hiddenTests),
  };
}

export function executeStudentCode({
  source,
  methodName,
  args,
  timeoutMs,
}: {
  source: string;
  methodName: string;
  args: unknown[];
  timeoutMs: number;
}): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const workerSource = `
Object.defineProperty(Array.prototype, 'size', { value: function() { return this.length; }, enumerable: false, writable: true });
Object.defineProperty(Array.prototype, 'add', { value: function(e) { this.push(e); return true; }, enumerable: false, writable: true });
Object.defineProperty(Array.prototype, 'set', { value: function(i, e) { const o = this[i]; this[i] = e; return o; }, enumerable: false, writable: true });
Object.defineProperty(Array.prototype, 'remove', { value: function(i) { return this.splice(i, 1)[0]; }, enumerable: false, writable: true });
Object.defineProperty(Array.prototype, 'isEmpty', { value: function() { return this.length === 0; }, enumerable: false, writable: true });
Object.defineProperty(Object.prototype, 'put', { value: function(k, v) { this[k] = v; return null; }, enumerable: false, writable: true });
Object.defineProperty(Object.prototype, 'getOrDefault', { value: function(k, d) { return Object.prototype.hasOwnProperty.call(this, k) ? this[k] : d; }, enumerable: false, writable: true });
Object.defineProperty(Object.prototype, 'containsKey', { value: function(k) { return Object.prototype.hasOwnProperty.call(this, k); }, enumerable: false, writable: true });
Object.defineProperty(Object.prototype, 'keySet', { value: function() { return Object.keys(this); }, enumerable: false, writable: true });
Object.defineProperty(Array.prototype, 'get', { value: function(i) { return this[i]; }, enumerable: false, writable: true });
Object.defineProperty(Array.prototype, 'contains', { value: function(e) { return this.includes(e); }, enumerable: false, writable: true });
Object.defineProperty(Array.prototype, 'clone', { value: function() { return this.slice(); }, enumerable: false, writable: true });
Object.defineProperty(Object.prototype, 'get', { value: function(k) { return this[k] === undefined ? null : this[k]; }, enumerable: false, writable: true });

self.onmessage = async (event) => {
  const { source, methodName, args } = event.data;
  try {
    const student = Function('"use strict"; return ({' + source + '});')();
    const method = student[methodName];
    if (typeof method !== 'function') {
      throw new Error('Method "' + methodName + '" was not defined.');
    }
    const result = await method.apply(student, args);
    self.postMessage({ ok: true, value: result });
  } catch (error) {
    self.postMessage({ ok: false, error: error && error.message ? error.message : String(error) });
  }
};`;
    const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
    const worker = new Worker(workerUrl);

    const timer = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({ ok: false, error: 'Time limit exceeded.' });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<ExecutionResult>) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve(event.data);
    };

    worker.onerror = (event: ErrorEvent) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({ ok: false, error: event.message || 'Worker execution failed.' });
    };

    worker.postMessage({ source, methodName, args });
  });
}

export function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

export function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === undefined) {
    return 'undefined';
  }
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

export function formatExecutionError(message: unknown): string {
  const text = String(message || 'Unknown execution error.');
  const notDefinedMatch = text.match(/^([A-Za-z_$][\w$]*) is not defined$/);
  if (notDefinedMatch) {
    const variableName = notDefinedMatch[1];
    return `Variable "${variableName}" chua duoc khai bao. Hay them let hoac const, vi du: let ${variableName} = ...;`;
  }
  return text;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function materializePlannedTests(
  lesson: Lesson,
  entries: Array<RawTestCase | PlannedTestCaseFactory>,
  phase: 'visible' | 'hidden',
): DecoratedTestCase[] {
  const rng = createRng(stableHash(`planned:${phase}:${lesson.id}`));
  return entries.map((entry, index) => {
    const rawTest = typeof entry === 'function'
      ? entry(rng, { lessonId: lesson.id, index, phase })
      : entry;
    return decorateTestCase(lesson, rawTest);
  });
}

function createCandidatePool(lesson: Lesson, seed: number, count: number, preferSmall: boolean): DecoratedTestCase[] {
  const rng = createRng(seed);
  const candidates: DecoratedTestCase[] = [];
  for (let index = 0; index < count; index += 1) {
    const rawTest = lesson.genTest(rng, { preferSmall, index, seed });
    candidates.push(decorateTestCase(lesson, rawTest));
  }
  candidates.sort((left, right) => {
    if (preferSmall && left.sizeScore !== right.sizeScore) {
      return left.sizeScore - right.sizeScore;
    }
    if (!preferSmall && left.sizeScore !== right.sizeScore) {
      return right.sizeScore - left.sizeScore;
    }
    return left.signature.localeCompare(right.signature);
  });
  return candidates;
}

function decorateTestCase(lesson: Lesson, rawTest: RawTestCase): DecoratedTestCase {
  const expectedResult = getExpectedResult(lesson, rawTest);
  return {
    ...rawTest,
    expected: expectedResult.expected,
    expectedError: expectedResult.error,
    category: classifyTestOutcome(expectedResult.expected, rawTest),
    signature: createTestSignature(rawTest),
    sizeScore: estimateTestSize(rawTest),
  };
}

function getExpectedResult(lesson: Lesson, test: RawTestCase): ExpectedResult {
  try {
    return {
      expected: lesson.solution(...cloneValue(test.args)),
      error: '',
    };
  } catch (error) {
    return {
      expected: '[solution error]',
      error: errorMessage(error),
    };
  }
}

function selectDiverseTests(candidates: DecoratedTestCase[], count: number, excludedSignatures: Set<string>): DecoratedTestCase[] {
  const selected: DecoratedTestCase[] = [];
  const usedCategories = new Set<string>();
  const blocked = excludedSignatures;

  for (const candidate of candidates) {
    if (selected.length >= count) {
      break;
    }
    if (blocked.has(candidate.signature) || usedCategories.has(candidate.category)) {
      continue;
    }
    selected.push(candidate);
    usedCategories.add(candidate.category);
    blocked.add(candidate.signature);
  }

  for (const candidate of candidates) {
    if (selected.length >= count) {
      break;
    }
    if (blocked.has(candidate.signature)) {
      continue;
    }
    selected.push(candidate);
    blocked.add(candidate.signature);
  }

  return selected;
}

function selectPlannedAndDiverseTests(
  planned: DecoratedTestCase[],
  candidates: DecoratedTestCase[],
  count: number,
  excludedSignatures: Set<string>,
): DecoratedTestCase[] {
  const selected: DecoratedTestCase[] = [];
  const blocked = excludedSignatures;

  for (const candidate of planned) {
    if (selected.length >= count) {
      break;
    }
    if (blocked.has(candidate.signature)) {
      continue;
    }
    selected.push(candidate);
    blocked.add(candidate.signature);
  }

  if (selected.length >= count) {
    return selected;
  }

  return selected.concat(selectDiverseTests(candidates, count - selected.length, blocked));
}

function classifyTestOutcome(expected: unknown, test: RawTestCase): string {
  if (typeof expected === 'number') {
    if (expected === -1) {
      return 'number:-1';
    }
    if (expected === 0) {
      return 'number:0';
    }
    if (expected > 0) {
      return 'number:positive';
    }
    return 'number:negative';
  }
  if (typeof expected === 'boolean') {
    return `boolean:${expected}`;
  }
  if (expected === null) {
    return 'null';
  }
  if (Array.isArray(expected)) {
    return `array:length:${expected.length}:args:${bucketSize(estimateTestSize(test))}`;
  }
  return `${typeof expected}:${String(expected).slice(0, 20)}`;
}

function createTestSignature(test: RawTestCase): string {
  return JSON.stringify(test.args);
}

function estimateTestSize(test: RawTestCase): number {
  return measureValueSize(test.args) + (test.note ? test.note.length : 0);
}

function measureValueSize(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + measureValueSize(item), value.length);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).reduce((sum, item) => sum + measureValueSize(item), Object.keys(value).length);
  }
  if (typeof value === 'string') {
    return value.length;
  }
  return 1;
}

function bucketSize(size: number): string {
  if (size <= 8) {
    return 'small';
  }
  if (size <= 18) {
    return 'medium';
  }
  return 'large';
}

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function stableHash(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
