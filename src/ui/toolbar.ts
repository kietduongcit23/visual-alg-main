import type { LessonDefinition } from '../lessons/lesson-types';

interface ToolbarOptions {
  lessons: LessonDefinition[];
  onLessonChange: (lessonId: string) => void;
}

export interface ToolbarRefs {
  root: HTMLElement;
  lessonSelect: HTMLSelectElement;
}

export function createToolbar(options: ToolbarOptions): ToolbarRefs {
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar toolbar-minimal';

  const selector = document.createElement('label');
  selector.className = 'toolbar-group';

  const label = document.createElement('span');
  label.textContent = 'Lesson';

  const lessonSelect = document.createElement('select');
  lessonSelect.setAttribute('aria-label', 'Lesson selector');
  for (const lesson of options.lessons) {
    const option = document.createElement('option');
    option.value = lesson.id;
    option.textContent = lesson.title;
    lessonSelect.append(option);
  }
  lessonSelect.addEventListener('change', () => {
    options.onLessonChange(lessonSelect.value);
  });
  selector.append(label, lessonSelect);

  toolbar.append(selector);

  return {
    root: toolbar,
    lessonSelect,
  };
}