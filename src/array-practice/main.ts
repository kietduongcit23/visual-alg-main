import '../styles/reset.css';
import '../styles/array-practice.css';

import { 
  createMonacoEditor, 
  setMonacoValue, 
  getMonacoValue, 
  updateMonacoTheme,
  setMonacoReadOnly
} from './editor';
import { createLessons } from './lessons';
import { deepEqual } from './comparison';
import {
  buildTestSuite,
  cloneValue,
  errorMessage,
  executeStudentCode,
  formatExecutionError,
  formatValue,
} from './runner';
import { renderAppShell, getDomRefs } from './shell';
import { loadPersistedState, savePersistedState } from './storage';
import type { Lesson, ResultRow, SummaryState, TestSuite } from './types';

const STORAGE_KEY = 'visualalg-array-practice-v1';
const TEST_TIMEOUT_MS = 800;

const app = document.querySelector<HTMLElement>('#app');

if (!app) {
  throw new Error('App root "#app" was not found.');
}

renderAppShell(app);

const dom = getDomRefs(app);
const lessons = createLessons() as Lesson[];
const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const persisted = loadPersistedState(STORAGE_KEY);
const draftByLesson: Record<string, string> = persisted.draftByLesson || {};
const resultsByLesson: Record<string, 'accepted' | 'failed' | 'partial'> = persisted.resultsByLesson || {};
const completedLessons: string[] = persisted.completedLessons || [];
let selectedLessonId = lessonMap.has(persisted.lessonId || '') ? persisted.lessonId || lessons[0]!.id : lessons[0]!.id;
let isRunning = false;

// ─── Monaco setup ────────────────────────────────────────────────────────────

const initialLesson = lessonMap.get(selectedLessonId)!;
const initialCode = draftByLesson[selectedLessonId] || initialLesson.starterCode;

// Initialize Monaco asynchronously
void createMonacoEditor(
  dom.editorHost,
  initialCode,
  (newValue) => {
    draftByLesson[selectedLessonId] = newValue;
    persistState();
  },
).then(() => {
  // Any post-init logic if needed
  syncLessonView();
});

// ─── Theme Setup ─────────────────────────────────────────────────────────────
const updateTheme = (): void => {
  const isDark = document.documentElement.classList.contains('dark');
  const glyph = dom.themeToggle.querySelector('.icon-button-glyph');
  if (glyph) {
    glyph.textContent = isDark ? '🌙' : '☀️';
  }
  
  // Apply theme to scoped container
  dom.layout.classList.toggle('dark-theme', isDark);
  dom.layout.classList.toggle('light-theme', !isDark);
  
  // Update Monaco
  updateMonacoTheme(isDark);
};

// Initial theme apply
updateTheme();

// ─── Init ────────────────────────────────────────────────────────────────────

renderLessonOptions();
renderLessonStats();
syncLessonView();
renderIdleSummary();

// ─── Sidebar Toggle ─────────────────────────────────────────────────────────

dom.sidebarToggle.addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    dom.sidebar.classList.toggle('is-mobile-open');
  } else {
    dom.sidebar.classList.toggle('is-collapsed');
    const isCollapsed = dom.sidebar.classList.contains('is-collapsed');
    localStorage.setItem('sidebar-collapsed', isCollapsed ? 'true' : 'false');
  }
});

// Restore sidebar state
if (localStorage.getItem('sidebar-collapsed') === 'true') {
  dom.sidebar.classList.add('is-collapsed');
}

// ─── Event listeners ─────────────────────────────────────────────────────────

dom.themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateTheme();
});

dom.resetButton.addEventListener('click', () => {
  const lesson = getSelectedLesson();
  setMonacoValue(lesson.starterCode);
  draftByLesson[selectedLessonId] = lesson.starterCode;
  persistState();
});

dom.solutionButton.addEventListener('click', () => {
  const lesson = getSelectedLesson();
  setMonacoValue(lesson.solutionCode);
  draftByLesson[selectedLessonId] = lesson.solutionCode;
  persistState();
});

dom.runButton.addEventListener('click', () => {
  void runSelectedLesson();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault();
    if (!isRunning) {
      void runSelectedLesson();
    }
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSelectedLesson(): Lesson {
  const lesson = lessonMap.get(selectedLessonId);
  if (!lesson) {
    throw new Error(`Unknown lesson id: ${selectedLessonId}`);
  }
  return lesson;
}

function persistCurrentDraft(): void {
  draftByLesson[selectedLessonId] = getMonacoValue();
}

function persistState(): void {
  savePersistedState(STORAGE_KEY, {
    lessonId: selectedLessonId,
    draftByLesson,
    resultsByLesson,
    completedLessons,
  });
}

function renderLessonOptions(): void {
  dom.lessonList.replaceChildren(
    ...lessons.map((lesson, index) => {
      const button = document.createElement('button');
      button.className = 'sidebar-lesson-item';
      if (lesson.id === selectedLessonId) {
        button.classList.add('is-active');
      }
      if (completedLessons.includes(lesson.id)) {
        button.classList.add('completed');
      }

      const displayIndex = String(index + 1).padStart(2, '0');
      const formattedTitle = formatTitle(lesson.title);
      const isCompleted = completedLessons.includes(lesson.id);

      button.innerHTML = `
        <span class="index">${displayIndex}</span>
        <span class="title">${isCompleted ? '<i class="check-icon">✔</i> ' : ''}${formattedTitle}</span>
      `;

      button.addEventListener('click', () => {
        if (selectedLessonId === lesson.id) {
          if (window.innerWidth <= 768) {
            dom.sidebar.classList.remove('is-mobile-open');
          }
          return;
        }
        persistCurrentDraft();
        selectedLessonId = lesson.id;
        syncLessonView();
        persistState();
        clearResults();
        renderLessonOptions(); // Refresh active state

        if (window.innerWidth <= 768) {
          dom.sidebar.classList.remove('is-mobile-open');
        }
      });

      return button;
    }),
  );
}

function renderLessonStats(): void {
  let passedCount = 0;
  let failedCount = 0;
  for (const status of Object.values(resultsByLesson)) {
    if (status === 'accepted') passedCount += 1;
    if (status === 'failed' || status === 'partial') failedCount += 1;
  }

  if (passedCount === 0 && failedCount === 0) {
    dom.badgeGroup.innerHTML = '';
    dom.progressBarContainer.innerHTML = '';
    return;
  }

  const total = lessons.length;
  const percentage = (passedCount / total) * 100;
  const isAllPassed = passedCount === total;

  // Render Badges
  dom.badgeGroup.innerHTML = isAllPassed 
    ? `<div class="stats-badge passed all-passed"><i>✔</i> All Lessons Passed</div>`
    : `
      <div class="stats-badge passed"><i>✔</i> ${passedCount} Passed</div>
      ${failedCount > 0 ? `<div class="stats-badge failed"><i>✖</i> ${failedCount} Failed</div>` : ''}
    `;

  // Render Progress Bar
  dom.progressBarContainer.innerHTML = `
    <div class="stats-progress-container">
      <div class="stats-progress-bar" style="width: ${percentage}%"></div>
    </div>
    <span class="stats-progress-text">${passedCount} / ${total}</span>
  `;
}

function syncLessonView(): void {
  const lesson = getSelectedLesson();
  const formattedTitle = formatTitle(lesson.title);
  
  dom.lessonDescription.textContent = lesson.description;
  dom.methodName.textContent = lesson.methodName;
  dom.testCount.textContent = `${lesson.testCount} total / ${lesson.visibleTestCount} shown`;
  dom.activeLessonLabel.textContent = `👉 ${formattedTitle}`;

  setMonacoValue(draftByLesson[lesson.id] || lesson.starterCode);

  if (lesson.hints && lesson.hints.length > 0) {
    dom.hintPanel.style.display = 'block';
    dom.hintBody.innerHTML = `
      <div class="callout hint-box">
        <ul class="hint-list">
          ${lesson.hints.map((hint) => `<li class="hint-item mono">${hint}</li>`).join('')}
        </ul>
      </div>
    `;
  } else {
    dom.hintPanel.style.display = 'none';
  }

  renderSampleCase(lesson);
}

function formatTitle(title: string): string {
  return title
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .map(word => word.replace(/^(\(?)(\w)/, (_, p1, p2) => p1 + p2.toUpperCase()))
    .join(' ');
}

function renderSampleCase(lesson: Lesson): void {
  const suite = buildTestSuite(lesson) as TestSuite;
  const sample = suite.tests.find((test) => test.isVisible) || suite.tests[0];
  if (!sample) {
    dom.sampleCase.textContent = 'No deterministic sample is available for this lesson.';
    return;
  }
  dom.sampleCase.textContent = `Deterministic sample args: ${formatValue(sample.args)}${sample.note ? ` | Note: ${sample.note}` : ''} | Seed: ${suite.seed}`;
}

function clearResults(): void {
  dom.resultsBody.innerHTML = '<tr><td colspan="7" class="empty">No tests have been executed yet.</td></tr>';
  renderIdleSummary();
}

function renderIdleSummary(): void {
  dom.summaryBadge.className = 'badge idle';
  dom.summaryBadge.textContent = 'Idle';
  dom.summaryMessage.textContent = 'Ready to run generated tests.';
  dom.summaryTotal.textContent = '0';
  dom.summaryPassed.textContent = '0';
  dom.summaryFailed.textContent = '0';
  dom.summarySeed.textContent = '-';
}

async function runSelectedLesson(): Promise<void> {
  const lesson = getSelectedLesson();
  const rawSource = getMonacoValue().trim();

  const source = convertJavaToJS(rawSource);

  if (!source) {
    renderSummary({ badge: 'failed', message: 'Editor is empty.', total: 0, passed: 0, failed: 0, seed: '-' });
    renderRows([
      {
        index: 1,
        status: 'failed',
        args: '-',
        expected: '-',
        actual: '-',
        note: '',
        message: 'Enter a method body before running.',
      },
    ]);
    return;
  }

  persistCurrentDraft();
  persistState();
  setRunning(true);

  try {
    const suite = buildTestSuite(lesson) as TestSuite;
    const rows: ResultRow[] = [];
    let passed = 0;

    for (const [index, test] of suite.tests.entries()) {
      const argsForStudent = cloneValue(test.args);
      const expected = test.expected;

      if (test.expectedError) {
        rows.push({
          index: index + 1,
          status: 'failed',
          args: test.isVisible ? formatValue(test.args) : 'Hidden validation test',
          expected: test.isVisible ? '[solution error]' : 'Hidden',
          actual: '-',
          note: test.isVisible ? (test.note || '') : 'Hidden large validation',
          message: `Reference solution failed: ${test.expectedError}`,
          isVisible: test.isVisible,
        });
        continue;
      }

      const execution = await executeStudentCode({
        source,
        methodName: lesson.methodName,
        args: argsForStudent,
        timeoutMs: TEST_TIMEOUT_MS,
      }) as { ok: boolean; error?: string; value?: unknown };

      let actualDisplay = test.isVisible ? '-' : 'Hidden';
      let pass = false;
      let message = '';

      if (!execution.ok) {
        message = formatExecutionError(execution.error);
      } else {
        actualDisplay = test.isVisible ? formatValue(execution.value) : 'Hidden';
        const checkerResult = lesson.checker
          ? lesson.checker({ actual: execution.value, expected, test })
          : { pass: deepEqual(execution.value, expected), message: 'Output must match the reference result.' };
        pass = Boolean(checkerResult.pass);
        message = pass
          ? (test.isVisible ? 'Accepted.' : 'Hidden validation passed.')
          : checkerResult.message || 'Output did not match expected value.';
      }

      if (pass) {
        passed += 1;
      }

      rows.push({
        index: index + 1,
        status: pass ? 'passed' : 'failed',
        args: test.isVisible ? formatValue(test.args) : 'Hidden validation test',
        expected: test.isVisible ? formatValue(expected) : 'Hidden',
        actual: actualDisplay,
        note: test.isVisible ? (test.note || '') : 'Hidden large validation',
        message,
        isVisible: test.isVisible,
      });
    }

    const newBadge = passed === rows.length ? 'accepted' : passed === 0 ? 'failed' : 'partial';

    renderRows(rows);
    renderSummary({
      badge: newBadge,
      message:
        passed === rows.length
          ? 'All generated tests passed.'
          : passed === 0
            ? 'No generated test passed.'
            : 'Some generated tests passed, but there are still mismatches.',
      total: rows.length,
      passed,
      failed: rows.length - passed,
      seed: suite.seed,
    });

    resultsByLesson[lesson.id] = newBadge;
    if (newBadge === 'accepted' && !completedLessons.includes(lesson.id)) {
      completedLessons.push(lesson.id);
    }
    persistState();
    renderLessonOptions();
    renderLessonStats();
  } catch (error) {
    renderSummary({ badge: 'failed', message: 'Run aborted because of an unexpected error.', total: 0, passed: 0, failed: 0, seed: '-' });
    renderRows([
      {
        index: 1,
        status: 'failed',
        args: '-',
        expected: '-',
        actual: '-',
        note: '',
        message: String(errorMessage(error)),
      },
    ]);
  } finally {
    setRunning(false);
  }
}

function setRunning(nextRunning: boolean): void {
  isRunning = nextRunning;
  dom.runButton.disabled = nextRunning;
  dom.solutionButton.disabled = nextRunning;
  dom.resetButton.disabled = nextRunning;
  setMonacoReadOnly(nextRunning);
  
  if (nextRunning) {
    dom.summaryBadge.className = 'badge idle';
    dom.summaryBadge.textContent = 'Running';
    dom.summaryMessage.textContent = 'Executing generated tests in Web Workers...';
  }
}

function renderSummary(summary: SummaryState): void {
  dom.summaryBadge.className = `badge ${summary.badge}`;
  dom.summaryBadge.textContent = summary.badge.charAt(0).toUpperCase() + summary.badge.slice(1);
  
  // Highlight the pass ratio in the message
  const ratioText = `${summary.passed} / ${summary.total} tests passed`;
  dom.summaryMessage.innerHTML = `<strong>${ratioText}</strong> — ${summary.message}`;
  
  dom.summaryTotal.textContent = String(summary.total);
  dom.summaryPassed.textContent = String(summary.passed);
  dom.summaryFailed.textContent = String(summary.failed);
  dom.summarySeed.textContent = String(summary.seed);
}

function renderRows(rows: ResultRow[]): void {
  dom.resultsBody.replaceChildren(
    ...rows.map((row) => {
      const tr = document.createElement('tr');
      if (row.isVisible === false) {
        tr.classList.add('hidden-test');
      }

      // Status Badge Cell
      const statusTd = document.createElement('td');
      const isPass = row.status === 'passed';
      const badge = document.createElement('span');
      badge.className = `status-badge ${isPass ? 'pass' : 'fail'}`;
      badge.innerHTML = `<i>${isPass ? '✔' : '✖'}</i> ${isPass ? 'PASS' : 'FAIL'}`;
      statusTd.appendChild(badge);

      tr.append(
        createCell(String(row.index)),
        statusTd,
        createCell(row.args, 'mono-cell'),
        createCell(row.expected, 'expected-cell'),
        createCell(row.actual, 'actual-cell'),
        createCell(row.isVisible === false ? `🔒 ${row.note}` : row.note, 'note-cell'),
        createCell(row.message, 'message-cell'),
      );
      return tr;
    }),
  );
}

function createCell(text: string, className?: string): HTMLTableCellElement {
  const td = document.createElement('td');
  td.textContent = text;
  if (className) {
    td.className = className;
  }
  return td;
}

// ─── Automated Testing ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
; (window as any).auto_run_test = async function () {
  console.log('Starting auto_run_test for all lessons...');
  const report: { id: string; title: string; status: string }[] = [];

  for (const lesson of lessons) {
    console.log(`Testing lesson: ${lesson.title}`);

    selectedLessonId = lesson.id;
    syncLessonView();
    clearResults();
    renderLessonOptions();

    await new Promise((r) => setTimeout(r, 500));

    dom.solutionButton.click();
    await new Promise((r) => setTimeout(r, 500));

    dom.runButton.click();

    while (isRunning) {
      await new Promise((r) => setTimeout(r, 200));
    }

    await new Promise((r) => setTimeout(r, 200));

    const badgeText = dom.summaryBadge.textContent || 'Unknown';
    console.log(`  Result: ${badgeText}`);
    report.push({ id: lesson.id, title: lesson.title, status: badgeText });
  }

  console.log('--- AUTO RUN REPORT ---');
  console.table(report);

  const allPassed = report.every(r => r.status.toLowerCase() === 'accepted');
  if (allPassed) {
    console.log('%c All tests passed automatically!', 'color: green; font-weight: bold; font-size: 14px');
  } else {
    console.log('%c Some tests did not pass.', 'color: red; font-weight: bold; font-size: 14px');
  }
};

function convertJavaToJS(code: string): string {
  if (!code) return "";

  // 1. Xoa import va Generics
  let jsCode = code.replace(/^\s*import\s+.*$/gm, '');
  jsCode = jsCode.replace(/\b(List|ArrayList|Map|HashMap|Set|HashSet)\s*<[^>]*>/g, '$1');

  // 2. Chuyen ArrayList, HashMap thanh mang va object thuan JS
  jsCode = jsCode.replace(/\bnew\s+ArrayList\s*\(\s*\)/g, '[]');
  jsCode = jsCode.replace(/\bnew\s+HashMap\s*\(\s*\)/g, '{}');

  // 3. Chuyen Collections.sort -> unique.sort
  jsCode = jsCode.replace(/\bCollections\.sort\s*\(\s*([A-Za-z_]\w*)\s*\)/g, '$1.sort((a,b) => a - b)');

  // 4. Convert chu ky phuong thuc Java -> JS method shorthand
  //    Chi khop dong co access modifier HOAC kieu tra ve la tu khoa Java ro rang
  //    Ten phuong thuc KHONG phai tu khoa dieu khien (for, if, while, ...)
  const CONTROL = new Set(['for', 'if', 'while', 'else', 'switch', 'do', 'try', 'catch', 'finally', 'return', 'new', 'throw']);
  // Pattern: [access] [static] javaType[[] methodName(params) {
  const METHOD_RE = /^(\s*)(?:(?:public|private|protected)\s+)?(?:static\s+)?(?:(?:int|long|double|float|boolean|void|String|var|List|Map|Set|ArrayList|HashMap)(?:\s*\[\])?)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{/gmu;

  jsCode = jsCode.replace(METHOD_RE, (_match: string, indent: string, name: string, params: string) => {
    if (CONTROL.has(name)) return _match;
    let cleanParams = '';
    if (params && params.trim() !== '') {
      cleanParams = params.split(',').map((p: string) => {
        const m = p.trim().match(/([A-Za-z_]\w*)\s*$/);
        return m ? m[1] : p.trim();
      }).join(', ');
    }
    return `${indent}${name}(${cleanParams}) {\n`;
  });

  // 5. Chuyen the than ham: kieu Java -> JS
  jsCode = jsCode
    // Khai bao bien mang: "int[] result" -> "let result"
    .replace(/\b(?:int|long|double|float|boolean|String|var|List|Map|Set|ArrayList|HashMap)\s*\[\]\s+([A-Za-z_]\w*)/g, 'let $1')
    // Khai bao bien o dau cau lenh: "int count = 0" -> "let count = 0"
    .replace(/(?<=^\s*)(?:int|long|double|float|boolean|String|var|List|Map|Set|ArrayList|HashMap)\s+([A-Za-z_]\w*)\s*(?=[=;])/gm, 'let $1 ')
    // For-loop init: "for (int i =" -> "for (let i ="
    .replace(/\bfor\s*\(\s*(?:int|long|double|float|boolean|String)\s+([A-Za-z_]\w*)/g, 'for (let $1')
    // System.out.println -> console.log
    .replace(/System\.out\.println/g, 'console.log')
    // new int[n] -> Array(n).fill(0)
    .replace(/new\s+(?:int|long|double|float|boolean)\s*\[([^\]]*)\]/g, 'Array($1).fill(0)')
    // Bo cast: (int) -> (empty)
    .replace(/\(\s*(?:int|double|long|float|String)\s*\)/g, '')
    // Chia nguyen: (x) / 2 -> Math.floor((x) / 2)
    .replace(/\(([^)]+)\)\s*\/\s*2/g, 'Math.floor(($1) / 2)');
  // 🔥 FIX equals (QUAN TRỌNG NHẤT)
  jsCode = jsCode.replace(/([a-zA-Z_]\w*)\.equals\(([^)]+)\)/g, '$1 === $2');
  return jsCode;
}
