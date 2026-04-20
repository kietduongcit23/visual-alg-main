import type { RuntimeEvent } from '../engine/runtime-events';

export interface LessonDefinition {
  id: string;
  title: string;
  description: string;
  category: 'array' | 'list' | 'dictionary';
  starterCode: string;
  initialBindings: Record<string, unknown>;
  watchedVariables: string[];
  pointerVariables: string[];
  primaryStructure: 'array' | 'list' | 'dictionary';
  explanationMap?: Partial<
    Record<RuntimeEvent['type'], string | ((event: RuntimeEvent) => string)>
  >;
  expectedOutputDescription?: string;
}