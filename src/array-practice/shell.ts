import type { DomRefs } from './types';

export function renderAppShell(container: HTMLElement): void {
  container.innerHTML = `
    <main class="page">
      <section class="hero header-flex">
        <h1>Basic Algorithms on Arrays</h1>
        <button id="themeToggle" class="icon-button theme-toggle" title="Toggle Theme">
          <span class="icon-button-glyph" aria-hidden="true">☀</span>
        </button>
      </section>

      <section class="grid">
        <div class="stack">
          <article class="panel">
            <div class="panel-header">
              <h2 class="panel-title">Lesson <span id="lessonStats" style="font-size: 0.85em; font-weight: normal; margin-left: 8px; color: var(--muted);"></span></h2>
            </div>
            <div class="panel-body">
              <div class="field">
                <select id="lessonSelect" aria-label="Choose a lesson"></select>
              </div>
              <div class="field">
                <span class="field-label">Description</span>
                <p id="lessonDescription" class="lesson-description"></p>
              </div>
              <dl class="meta-list">
                <div class="meta-card">
                  <dt>Method</dt>
                  <dd id="methodName">-</dd>
                </div>
                <div class="meta-card">
                  <dt>Tests per run</dt>
                  <dd id="testCount">-</dd>
                </div>
              </dl>
            </div>
          </article>

          <article class="panel">
            <div class="panel-body">
              <div class="field">
                <label for="editor">Starter code</label>
                <div id="editor" class="cm-editor-host"></div>
              </div>
              <div class="actions">
                <button id="runButton" class="primary" type="button">Run</button>
                <button id="solutionButton" class="secondary" type="button">Solution</button>
                <button id="resetButton" class="secondary" type="button">Reset Code</button>
              </div>
              <pre id="javaOutput" style="background:#0b1120;color:#94a3b8;padding:14px;border-radius:10px;border:1px solid rgba(148,163,184,0.12);font-family:'Fira Code',monospace;font-size:13px;line-height:1.6;min-height:40px;margin-top:12px;"></pre>
              <p class="hint editor-shortcuts">
                <kbd>Ctrl+Enter</kbd> Chạy nhanh &nbsp;·&nbsp;
                <kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> Thêm / bớt indent &nbsp;·&nbsp;
                <kbd>F9</kbd> Format code &nbsp;·&nbsp;
                <kbd>}</kbd> Tự động căn lề
              </p>
            </div>
          </article>
        </div>

        <div class="stack">
          <article class="panel">
            <div class="panel-header">
              <h2 class="panel-title">Run Summary</h2>
            </div>
            <div class="panel-body">
              <div class="summary-top">
                <span id="summaryBadge" class="badge idle">Idle</span>
                <span id="summaryMessage" class="lesson-description">Ready to run generated tests.</span>
              </div>
              <div class="summary-grid">
                <div class="summary-card">
                  <span>Total tests</span>
                  <strong id="summaryTotal">0</strong>
                </div>
                <div class="summary-card">
                  <span>Passed</span>
                  <strong id="summaryPassed">0</strong>
                </div>
                <div class="summary-card">
                  <span>Failed</span>
                  <strong id="summaryFailed">0</strong>
                </div>
                <div class="summary-card">
                  <span>Run seed</span>
                  <strong id="summarySeed">-</strong>
                </div>
              </div>
              <div id="sampleCase" class="callout">A visible sample test will appear here for the selected lesson.</div>
            </div>
          </article>

          <article class="panel" id="hintPanel" style="display: none;">
            <div class="panel-header">
              <h2 class="panel-title">Gợi ý (Hints)</h2>
            </div>
            <div class="panel-body" id="hintBody">
            </div>
          </article>
        </div>
      </section>

      <section class="panel results-panel">
        <div class="panel-header">
          <h2 class="panel-title">Generated Test Results</h2>
        </div>
        <div class="panel-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Status</th>
                <th>Args</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Note</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody id="resultsBody">
              <tr>
                <td colspan="7" class="empty">No tests have been executed yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `;
}

export function getDomRefs(root: ParentNode = document): DomRefs {
  return {
    lessonSelect: mustElement<HTMLSelectElement>(root, '#lessonSelect'),
    lessonStats: mustElement<HTMLSpanElement>(root, '#lessonStats'),
    lessonDescription: mustElement<HTMLParagraphElement>(root, '#lessonDescription'),
    methodName: mustElement<HTMLElement>(root, '#methodName'),
    testCount: mustElement<HTMLElement>(root, '#testCount'),
    editorHost: mustElement<HTMLDivElement>(root, '#editor'),
    runButton: mustElement<HTMLButtonElement>(root, '#runButton'),
    solutionButton: mustElement<HTMLButtonElement>(root, '#solutionButton'),
    resetButton: mustElement<HTMLButtonElement>(root, '#resetButton'),
    summaryBadge: mustElement<HTMLSpanElement>(root, '#summaryBadge'),
    summaryMessage: mustElement<HTMLSpanElement>(root, '#summaryMessage'),
    summaryTotal: mustElement<HTMLElement>(root, '#summaryTotal'),
    summaryPassed: mustElement<HTMLElement>(root, '#summaryPassed'),
    summaryFailed: mustElement<HTMLElement>(root, '#summaryFailed'),
    summarySeed: mustElement<HTMLElement>(root, '#summarySeed'),
    resultsBody: mustElement<HTMLTableSectionElement>(root, '#resultsBody'),
    sampleCase: mustElement<HTMLDivElement>(root, '#sampleCase'),
    hintPanel: mustElement<HTMLElement>(root, '#hintPanel'),
    hintBody: mustElement<HTMLElement>(root, '#hintBody'),
    themeToggle: mustElement<HTMLButtonElement>(root, '#themeToggle'),
  };
}

function mustElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}
