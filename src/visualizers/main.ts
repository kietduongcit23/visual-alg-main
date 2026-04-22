
import '../styles/app.css';
import '../styles/visualizer.css';

import { initSorting } from './sorting';
import { PathfindingVisualizer } from './pathfinding';
import { NQueensVisualizer } from './nqueens';
import { ConvexHullVisualizer } from './convexHull';

const app = document.getElementById('app')!;

function renderHub() {
  app.innerHTML = `
    <div class="visualizer-hub">
      <header class="app-header">
        <div class="app-heading">
          <h1>Algorithm Visualizer</h1>
          <a href="/visual-alg-main/" class="hub-link">Back to Lessons</a>
        </div>
        <div class="header-right">
          <button id="theme-toggle" class="btn">🌓</button>
        </div>
      </header>

      <section class="hero-section">
        <h1>Algorithm Visualizer Hub</h1>
        <p>Explore algorithms with step-by-step interactive visualizations, pseudocode synchronization, and detailed explanations.</p>
      </section>

      <div class="algo-grid">
        <div class="algo-card" data-algo="sorting">
          <div class="algo-preview">
            <div style="display:flex; align-items:flex-end; gap:4px; height:80px; width: 200px;">
              <div style="flex:1; height:30%; background:var(--accent); border-radius: 4px;"></div>
              <div style="flex:1; height:60%; background:var(--accent); border-radius: 4px;"></div>
              <div style="flex:1; height:45%; background:var(--accent); border-radius: 4px;"></div>
              <div style="flex:1; height:90%; background:var(--accent); border-radius: 4px;"></div>
              <div style="flex:1; height:70%; background:var(--accent); border-radius: 4px;"></div>
            </div>
          </div>
          <h3>Sorting Algorithms</h3>
          <p>Visualize how Quick Sort, Merge Sort, and Bubble Sort organize data step-by-step.</p>
          <button class="btn btn-primary open-visualizer">Explore Sorting</button>
        </div>

        <div class="algo-card" data-algo="pathfinding">
          <div class="algo-preview">
            <div style="display:grid; grid-template-columns:repeat(5, 16px); gap:4px">
              ${Array(25).fill(0).map((_, i) => `<div style="width:16px; height:16px; background:${[6,7,8,13,18].includes(i) ? 'var(--teal)' : 'var(--surface-strong)'}; border-radius:2px;"></div>`).join('')}
            </div>
          </div>
          <h3>Pathfinding</h3>
          <p>See BFS, DFS, and Dijkstra's algorithm navigate complex mazes to find the shortest path.</p>
          <button class="btn btn-primary open-visualizer">Explore Pathfinding</button>
        </div>

        <div class="algo-card" data-algo="nqueens">
          <div class="algo-preview">
            <div style="font-size:3rem; filter: drop-shadow(0 0 10px var(--accent-soft))">♛</div>
          </div>
          <h3>N-Queens</h3>
          <p>Visualize the recursive backtracking process used to solve the classic N-Queens puzzle.</p>
          <button class="btn btn-primary open-visualizer">Explore N-Queens</button>
        </div>

        <div class="algo-card" data-algo="convexhull">
          <div class="algo-preview">
            <svg width="120" height="80" viewBox="0 0 100 60">
              <polygon points="20,50 50,10 80,40" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2" />
              <circle cx="20" cy="50" r="3" fill="var(--teal)" />
              <circle cx="50" cy="10" r="3" fill="var(--teal)" />
              <circle cx="80" cy="40" r="3" fill="var(--teal)" />
              <circle cx="45" cy="35" r="2" fill="var(--muted)" />
            </svg>
          </div>
          <h3>Convex Hull</h3>
          <p>Watch the Graham Scan algorithm compute the smallest convex set containing all points.</p>
          <button class="btn btn-primary open-visualizer">Explore Convex Hull</button>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.open-visualizer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.algo-card') as HTMLElement;
      const algo = card.dataset.algo;
      if (algo) startVisualizer(algo);
    });
  });

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isLight = document.documentElement.dataset.theme === 'light';
    document.documentElement.dataset.theme = isLight ? 'dark' : 'light';
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
  });
}

function startVisualizer(algo: string) {
  app.innerHTML = `
    <div class="visualizer-page">
      <header class="app-header">
        <div class="app-heading">
          <a href="#" class="back-link" id="back-to-hub" style="margin: 0;">← Hub</a>
          <span style="color: var(--muted); margin: 0 12px;">/</span>
          <h1 id="visualizer-title" style="font-size: 1.1rem; margin: 0;">Loading...</h1>
        </div>
        <div class="header-right">
          <div id="extra-header-controls"></div>
        </div>
      </header>

      <main class="visualizer-main">
        <section class="visualizer-stage-container">
          <div class="stage-header">
            <div id="stage-info">
              <span id="algo-name" style="font-weight: 800; color: var(--accent);">ALGO</span>
              <span id="difficulty-badge" class="badge" style="margin-left: 12px;">Medium</span>
            </div>
            <div class="stage-actions" id="stage-actions">
              <!-- Custom inputs will go here -->
            </div>
          </div>
          <div class="stage-content" id="visualizer-mount">
            <!-- Animation happens here -->
          </div>
        </section>

        <aside class="visualizer-sidebar">
          <article class="panel explanation-panel" style="flex: 0 0 auto;">
            <div class="panel-header">Explanation</div>
            <div class="panel-body" id="explanation-mount">
              <p class="explanation-text">Select an action to begin.</p>
            </div>
          </article>

          <article class="panel pseudocode-panel" style="flex: 1; min-height: 0;">
            <div class="panel-header">Pseudocode</div>
            <div class="panel-body" id="pseudocode-mount">
              <ul class="pseudocode-list">
                <!-- Lines go here -->
              </ul>
            </div>
          </article>
        </aside>
      </main>

      <footer class="playback-bar">
        <div class="control-group">
          <button class="icon-btn" id="ctrl-prev" title="Previous Step">⏮</button>
          <button class="icon-btn primary" id="ctrl-play" title="Play">▶</button>
          <button class="icon-btn" id="ctrl-next" title="Next Step">⏭</button>
        </div>

        <div class="progress-slider-container">
          <span style="font-size: 0.75rem; color: var(--muted);" id="frame-counter">0 / 0</span>
          <input type="range" class="progress-slider" id="frame-slider" min="0" max="0" value="0">
        </div>

        <div class="control-group">
          <span style="font-size: 0.75rem; color: var(--muted);">Speed</span>
          <input type="range" id="speed-slider" min="1" max="100" value="50" style="width: 100px;">
        </div>
      </footer>
    </div>
  `;

  document.getElementById('back-to-hub')?.addEventListener('click', (e) => {
    e.preventDefault();
    renderHub();
  });

  const mount = document.getElementById('visualizer-mount')!;
  
  switch (algo) {
    case 'sorting':
      initSorting();
      break;
    case 'pathfinding':
      new PathfindingVisualizer(mount).render();
      break;
    case 'nqueens':
      new NQueensVisualizer(mount).render();
      break;
    case 'convexhull':
      new ConvexHullVisualizer(mount).render();
      break;
  }
}

// Initial Theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.dataset.theme = savedTheme;

renderHub();
