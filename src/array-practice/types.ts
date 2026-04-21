export interface DomRefs {
  sidebar: HTMLElement;
  sidebarToggle: HTMLButtonElement;
  lessonList: HTMLElement;
  lessonDescription: HTMLParagraphElement;
  methodName: HTMLElement;
  testCount: HTMLElement;
  editorHost: HTMLDivElement;
  runButton: HTMLButtonElement;
  solutionButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  summaryBadge: HTMLSpanElement;
  summaryMessage: HTMLSpanElement;
  summaryTotal: HTMLElement;
  summaryPassed: HTMLElement;
  summaryFailed: HTMLElement;
  summarySeed: HTMLElement;
  resultsBody: HTMLTableSectionElement;
  sampleCase: HTMLDivElement;
  hintPanel: HTMLElement;
  hintBody: HTMLElement;
  themeToggle: HTMLButtonElement;
  activeLessonLabel: HTMLSpanElement;
  badgeGroup: HTMLDivElement;
  progressBarContainer: HTMLDivElement;
}

export interface PersistedState {
  lessonId?: string;
  draftByLesson?: Record<string, string>;
  resultsByLesson?: Record<string, 'accepted' | 'failed' | 'partial'>;
  completedLessons?: string[];
}

export interface RawTestCase {
  args: unknown[];
  note?: string;
}

export type PlannedTestCaseFactory = (
  rng: () => number,
  context: { lessonId: string; index: number; phase: 'visible' | 'hidden' },
) => RawTestCase;

export interface DecoratedTestCase extends RawTestCase {
  expected: unknown;
  expectedError: string;
  category: string;
  signature: string;
  sizeScore: number;
  isVisible?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  methodName: string;
  description: string;
  starterCode: string;
  solutionCode: string;
  testCount: number;
  visibleTestCount: number;
  genTest: (rng: () => number, context: { preferSmall: boolean; index: number; seed: number }) => RawTestCase;
  solution: (...args: any[]) => unknown;
  checker?: (input: { actual: unknown; expected: unknown; test: DecoratedTestCase }) => { pass: boolean; message: string };
  visibleCases?: Array<RawTestCase | PlannedTestCaseFactory>;
  hiddenCases?: Array<RawTestCase | PlannedTestCaseFactory>;
  hints?: string[];
}

export type LessonConfig = Omit<Lesson, 'solutionCode' | 'testCount' | 'visibleTestCount' | 'visibleCases' | 'hiddenCases'> & {
  solutionCode?: string;
  testCount?: number;
  visibleTestCount?: number;
  visibleCases?: Array<RawTestCase | PlannedTestCaseFactory>;
  hiddenCases?: Array<RawTestCase | PlannedTestCaseFactory>;
};

export interface TestSuite {
  seed: number;
  tests: DecoratedTestCase[];
}

export interface ResultRow {
  index: number;
  status: 'passed' | 'failed';
  args: string;
  expected: string;
  actual: string;
  note: string;
  message: string;
  isVisible?: boolean;
}

export interface SummaryState {
  badge: 'accepted' | 'partial' | 'failed';
  message: string;
  total: number;
  passed: number;
  failed: number;
  seed: string | number;
}
