import type { DomRefs } from './types';

export function renderAppShell(container: HTMLElement): void {
  container.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside id="sidebar" class="sidebar">
        <div class="sidebar-header">
          <span class="sidebar-logo">Algorithms</span>
        </div>
        <div class="sidebar-content">
          <div class="sidebar-section-title">Arrays Practice</div>
          <ul id="lessonList" class="sidebar-lesson-list"></ul>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="app-header">
          <div class="header-left">
            <button id="sidebarToggle" class="sidebar-toggle" title="Toggle Sidebar">
              <span class="icon">≡</span>
            </button>
            <div class="header-main-group">
              <div class="header-title-row">
                <h1 class="premium-title">Basic Algorithms on Arrays</h1>
                <div id="badgeGroup" class="stats-badge-group"></div>
              </div>
              <div id="progressBarContainer" class="stats-progress-wrapper"></div>
            </div>
          </div>
          <div class="header-right">
            <button id="themeToggle" class="icon-button theme-toggle" title="Toggle Theme">
              <span class="icon-button-glyph" aria-hidden="true">☀</span>
            </button>
          </div>
        </header>

        <div class="content-body">
          <div class="layout-grid">
            <!-- Left Column: Focus on Editor -->
            <div class="column-left">
              <article class="panel editor-panel">
                <div class="panel-header">
                  <div class="panel-header-main">
                    <h2 class="panel-title">Starter Code</h2>
                    <span id="activeLessonLabel" class="active-lesson-label"></span>
                  </div>
                  <div class="header-hint">Ctrl + Enter to Run</div>
                </div>
                <div class="panel-body">
                  <div class="field">
                    <p id="lessonDescription" class="lesson-description"></p>
                  </div>
                  <div class="field">
                    <div id="editor" class="monaco-editor-host"></div>
                  </div>
                  <div class="actions">
                    <button id="runButton" class="primary" type="button">Run</button>
                    <button id="solutionButton" class="secondary" type="button">Solution</button>
                    <button id="resetButton" class="secondary" type="button">Reset</button>
                  </div>
                  <pre id="javaOutput" class="terminal-output" style="display: none;"></pre>
                </div>
              </article>

              <article class="panel results-panel">
                <div class="panel-header">
                  <h2 class="panel-title">Test Results</h2>
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
                        <td colspan="7" class="empty">No tests executed yet.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </article>
            </div>

            <!-- Right Column: Meta & Info -->
            <div class="column-right">
              <article class="panel summary-panel">
                <div class="panel-header">
                  <h2 class="panel-title">Run Summary</h2>
                </div>
                <div class="panel-body">
                  <div class="summary-top">
                    <span id="summaryBadge" class="badge idle">Idle</span>
                  </div>
                  <div class="summary-status-msg">
                    <p id="summaryMessage">Ready to run tests.</p>
                  </div>
                  <div class="summary-mini-grid">
                    <div class="mini-card">
                      <label>Total</label>
                      <strong id="summaryTotal">0</strong>
                    </div>
                    <div class="mini-card">
                      <label>Passed</label>
                      <strong id="summaryPassed" class="status-pass">0</strong>
                    </div>
                    <div class="mini-card">
                      <label>Failed</label>
                      <strong id="summaryFailed" class="status-fail">0</strong>
                    </div>
                    <div class="mini-card">
                      <label>Seed</label>
                      <strong id="summarySeed">-</strong>
                    </div>
                  </div>
                  <div id="sampleCase" class="callout sample-box">Select a lesson to see samples.</div>
                </div>
              </article>

              <article class="panel meta-panel">
                <div class="panel-header">
                  <h2 class="panel-title">Lesson Details</h2>
                </div>
                <div class="panel-body">
                  <dl class="info-list">
                    <div class="info-item">
                      <dt>Method</dt>
                      <dd id="methodName">-</dd>
                    </div>
                    <div class="info-item">
                      <dt>Tests</dt>
                      <dd id="testCount">-</dd>
                    </div>
                  </dl>
                </div>
              </article>

              <article class="panel hint-panel" id="hintPanel" style="display: none;">
                <div class="panel-header">
                  <h2 class="panel-title">Hints</h2>
                </div>
                <div class="panel-body" id="hintBody"></div>
              </article>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

export function getDomRefs(root: ParentNode = document): DomRefs {
  return {
    sidebar: mustElement<HTMLElement>(root, '#sidebar'),
    sidebarToggle: mustElement<HTMLButtonElement>(root, '#sidebarToggle'),
    lessonList: mustElement<HTMLElement>(root, '#lessonList'),
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
    activeLessonLabel: mustElement<HTMLSpanElement>(root, '#activeLessonLabel'),
    badgeGroup: mustElement<HTMLDivElement>(root, '#badgeGroup'),
    progressBarContainer: mustElement<HTMLDivElement>(root, '#progressBarContainer'),
  };
}

function mustElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }
  return element;
}
