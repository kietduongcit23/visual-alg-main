import type { LessonDefinition } from '../lessons/lesson-types';

interface ToolbarOptions {
  lessons: LessonDefinition[];
  onLessonChange: (lessonId: string) => void;
}

export interface ToolbarRefs {
  root: HTMLElement;
  setActiveLesson: (id: string) => void;
}

export function createToolbar(options: ToolbarOptions): ToolbarRefs {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  const title = document.createElement('div');
  title.className = 'sidebar-title';
  title.textContent = 'Lessons';

  const list = document.createElement('ul');
  list.className = 'lesson-list';
  list.setAttribute('aria-label', 'Lesson selector');

  const buttons: Record<string, HTMLButtonElement> = {};

  for (let i = 0; i < options.lessons.length; i++) {
    const lesson = options.lessons[i]!;
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'lesson-item';
    button.setAttribute('data-id', lesson.id);

    const num = document.createElement('span');
    num.className = 'lesson-num';
    num.textContent = String(i + 1).padStart(2, '0');

    const label = document.createElement('span');
    label.textContent = lesson.title;

    button.append(num, label);

    button.addEventListener('click', () => {
      options.onLessonChange(lesson.id);
    });

    li.append(button);
    list.append(li);
    buttons[lesson.id] = button;
  }

  sidebar.append(title, list);

  const setActiveLesson = (id: string) => {
    Object.values(buttons).forEach(btn => btn.classList.remove('is-active'));
    if (buttons[id]) {
      buttons[id].classList.add('is-active');
      buttons[id].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return {
    root: sidebar,
    setActiveLesson,
  };
}