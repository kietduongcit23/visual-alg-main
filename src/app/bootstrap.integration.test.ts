// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bootstrap } from './bootstrap';

describe('bootstrap integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.useFakeTimers();
    installDomPolyfills();
    window.localStorage.clear();
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('loads the default lesson and renders the initial state', () => {
    bootstrap(document.querySelector<HTMLDivElement>('#app'));

    expect(document.querySelector('.welcome-panel')?.hasAttribute('hidden')).toBe(false);
    expect(document.querySelector('.status-banner')?.textContent).toContain('indexOf(value)');
    expect(arrayValues()).toEqual(['5', '2', '9', '2']);
    expect(document.querySelector('.variable-card-inline strong')?.textContent).toBe('target');
  });

  it('dismisses the welcome panel and restores the saved state on re-bootstrap', () => {
    bootstrap(document.querySelector<HTMLDivElement>('#app'));

    clickTextButton('Start exploring');
    changeLesson('array-reverse');

    document.body.innerHTML = '<div id="app"></div>';
    bootstrap(document.querySelector<HTMLDivElement>('#app'));

    expect(document.querySelector('.welcome-panel')?.hasAttribute('hidden')).toBe(true);
    expect(document.querySelector('.status-banner')?.textContent).toContain('reverse array');
  });

  it('steps through indexOf and updates variables', () => {
    bootstrap(document.querySelector<HTMLDivElement>('#app'));

    stepUntil(() => variableValue('answer') === '1', 40);

    expect(document.querySelector('.status-banner')?.textContent).toContain('paused');
    expect(variableValue('answer')).toBe('1');
  });

  it('steps through reverse and updates the array state', () => {
    bootstrap(document.querySelector<HTMLDivElement>('#app'));
    changeLesson('array-reverse');

    stepUntil(() => arrayValues().join(',') === '5,4,3,2,1', 40);

    expect(arrayValues()).toEqual(['5', '4', '3', '2', '1']);
  });

  it('resets after partial execution', () => {
    bootstrap(document.querySelector<HTMLDivElement>('#app'));

    clickButton('Next', 2);
    clickButton('Reset');

    expect(document.querySelector('.status-banner')?.textContent).toContain('ready');
    expect(variableValue('answer')).toBe('-1');
  });

  it('runs to completion', () => {
    bootstrap(document.querySelector<HTMLDivElement>('#app'));

    clickButton('Run');
    advanceRunUntil(() => variableValue('answer') === '1', 80);
    advanceRunUntil(() => document.querySelector('.status-banner')?.textContent?.includes('finished') ?? false, 20);

    expect(document.querySelector('.status-banner')?.textContent).toContain('finished');
    expect(variableValue('answer')).toBe('1');
  });

  it('pauses while running', () => {
    bootstrap(document.querySelector<HTMLDivElement>('#app'));

    clickButton('Run');
    vi.advanceTimersByTime(1_100);
    clickButton('Pause');

    expect(document.querySelector('.status-banner')?.textContent).toContain('paused');
  });

  it('copies and resets lesson code from the code panel actions', async () => {
    bootstrap(document.querySelector<HTMLDivElement>('#app'));

    const resetButton = queryTextButton('Reset code');
    const copyButton = queryTextButton('Copy');
    const modeButton = queryTextButton('Editable');
    modeButton.click();

    expect(modeButton.textContent).toContain('Read only');

    copyButton.click();
    await Promise.resolve();

    const clipboard = navigator.clipboard as unknown as { writeText: ReturnType<typeof vi.fn> };
    expect(clipboard.writeText).toHaveBeenCalled();

    changeLesson('array-reverse');
    resetButton.click();

    expect(document.querySelector('.cm-content')?.textContent).toContain('swap(arr, i, j);');
  });
});

function installDomPolyfills(): void {
  if (!('ResizeObserver' in globalThis)) {
    class ResizeObserver {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }

    vi.stubGlobal('ResizeObserver', ResizeObserver);
  }

  if (!('requestAnimationFrame' in globalThis)) {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0));
    vi.stubGlobal('cancelAnimationFrame', (handle: number) => clearTimeout(handle));
  }
}

function clickButton(title: string, times = 1): void {
  const button = document.querySelector<HTMLButtonElement>(`button[title="${title}"]`);
  if (!button) {
    throw new Error(`Missing button ${title}`);
  }

  for (let index = 0; index < times; index += 1) {
    button.click();
  }
}

function clickTextButton(text: string): void {
  queryTextButton(text).click();
}

function queryTextButton(text: string): HTMLButtonElement {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
  const match = buttons.find((button) => button.textContent?.includes(text));
  if (!match) {
    throw new Error(`Missing text button ${text}`);
  }

  return match;
}

function changeLesson(lessonId: string): void {
  const select = document.querySelector<HTMLSelectElement>('select[aria-label="Lesson selector"]');
  if (!select) {
    throw new Error('Missing lesson selector');
  }

  select.value = lessonId;
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

function stepUntil(condition: () => boolean, maxSteps = 20): void {
  for (let index = 0; index < maxSteps; index += 1) {
    if (condition()) {
      return;
    }
    clickButton('Next');
  }
}

function advanceRunUntil(condition: () => boolean, maxTicks = 20): void {
  for (let index = 0; index < maxTicks; index += 1) {
    if (condition()) {
      return;
    }
    vi.advanceTimersByTime(1_100);
  }
}

function arrayValues(): string[] {
  return Array.from(document.querySelectorAll('.array-value')).map((node) => node.textContent ?? '');
}

function variableValue(name: string): string | undefined {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.variable-card-inline'));
  for (const card of cards) {
    const label = card.querySelector('strong')?.textContent;
    if (label === name) {
      return card.querySelector('span')?.textContent ?? undefined;
    }
  }

  return undefined;
}