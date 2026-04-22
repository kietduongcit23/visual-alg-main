import type { RuntimeEvent } from '../engine/runtime-events';

export interface LessonDefinition {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'array' | 'list' | 'dictionary';
  starterCode: string;
  initialBindings: Record<string, unknown>;
  watchedVariables: string[];
  pointerVariables: string[];
  primaryStructure: 'basics' | 'array' | 'list' | 'dictionary';
  explanationMap?: Partial<
    Record<RuntimeEvent['type'], string | ((event: RuntimeEvent) => string)>
  >;
  expectedOutputDescription?: string;
}