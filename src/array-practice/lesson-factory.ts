import { createCoveragePlan } from './lesson-coverage';
import { createLessonDefaults, createMinimalStarterCode } from './lesson-helpers';
import type { Lesson, LessonConfig } from './types';

const DEFAULT_TOTAL_TESTS = 20;
const DEFAULT_VISIBLE_TESTS = 5;

export function createArrayLesson(config: LessonConfig): Lesson {
  const lessonDefaults = createLessonDefaults(config.id);
  const solutionCode = config.solutionCode || config.starterCode;

  return {
    ...createCoveragePlan(config.id),
    ...config,
    starterCode: createMinimalStarterCode(solutionCode, lessonDefaults.defaultReturn),
    solutionCode,
    testCount: config.testCount || DEFAULT_TOTAL_TESTS,
    visibleTestCount: config.visibleTestCount || DEFAULT_VISIBLE_TESTS,
  };
}
