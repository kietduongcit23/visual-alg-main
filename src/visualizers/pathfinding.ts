
import { VisualizerEngine, Frame } from './engine';

const PSEUDO_BFS = [
  "initialize queue with startNode",
  "while queue is not empty",
  "  u = queue.dequeue()",
  "  if u is endNode, return path",
  "  for each neighbor v of u",
  "    if v is not visited and not wall",
  "      v.visited = true, v.parent = u",
  "      queue.enqueue(v)"
];

export class PathfindingVisualizer {
  private container: HTMLElement;
  private engine: VisualizerEngine;
  private rows = 15;
  private cols = 20;
  private startNode = { r: 5, c: 5 };
  private endNode = { r: 10, c: 15 };
  private walls: Set<string> = new Set();
  private isMouseDown = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.engine = new VisualizerEngine(
      (frame) => this.renderFrame(frame),
      (isPlaying) => this.updatePlayButton(isPlaying)
    );
  }

  render() {
    const title = document.getElementById('visualizer-title')!;
    const algoName = document.getElementById('algo-name')!;
    const difficulty = document.getElementById('difficulty-badge')!;
    const pseudoMount = document.querySelector('.pseudocode-list')!;
    const actionsMount = document.getElementById('stage-actions')!;

    title.textContent = "Pathfinding Visualizer";
    algoName.textContent = "BFS (BREADTH FIRST SEARCH)";
    difficulty.textContent = "Medium";
    difficulty.className = "badge status-warn";

    pseudoMount.innerHTML = PSEUDO_BFS.map((line, i) => `
      <li class="pseudocode-line" data-line="${i}">${line}</li>
    `).join('');

    actionsMount.innerHTML = `
      <button id="btn-clear-walls" class="btn">Clear Walls</button>
      <button id="btn-reset-path" class="btn">Reset Path</button>
    `;

    this.setupGridListeners();
    this.setupControlListeners();
    this.generateFrames();
  }

  private setupGridListeners() {
    this.container.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).classList.contains('grid-cell')) {
        this.isMouseDown = true;
      }
    });
    window.addEventListener('mouseup', () => this.isMouseDown = false);
  }

  private setupControlListeners() {
    document.getElementById('ctrl-play')?.addEventListener('click', () => {
      if (this.engine.getIsPlaying()) this.engine.pause();
      else this.engine.play();
    });
    document.getElementById('ctrl-next')?.addEventListener('click', () => this.engine.next());
    document.getElementById('ctrl-prev')?.addEventListener('click', () => this.engine.prev());
    document.getElementById('frame-slider')?.addEventListener('input', (e) => {
      this.engine.jumpTo(parseInt((e.target as HTMLInputElement).value));
    });
    document.getElementById('speed-slider')?.addEventListener('input', (e) => {
      this.engine.setSpeed(parseInt((e.target as HTMLInputElement).value));
    });
    document.getElementById('btn-clear-walls')?.addEventListener('click', () => {
      this.walls.clear();
      this.generateFrames();
    });
    document.getElementById('btn-reset-path')?.addEventListener('click', () => {
      this.generateFrames();
    });
  }

  private generateFrames() {
    const frames: Frame[] = [];
    const visited = new Set<string>();
    const parents = new Map<string, string>();
    const queue: {r: number, c: number}[] = [this.startNode];
    visited.add(`${this.startNode.r}-${this.startNode.c}`);

    frames.push({
      data: { visited: new Set(), path: [] },
      highlights: new Map(),
      line: 0,
      explanation: "Initialize queue with start node at (" + this.startNode.r + ", " + this.startNode.c + ")."
    });

    let found = false;
    while (queue.length > 0) {
      const u = queue.shift()!;
      const uKey = `${u.r}-${u.c}`;

      frames.push({
        data: { visited: new Set(visited), path: [] },
        highlights: new Map([[u.r * this.cols + u.c, 'active']]),
        line: 2,
        explanation: `Dequeuing node at <b>(${u.r}, ${u.c})</b>.`
      });

      if (u.r === this.endNode.r && u.c === this.endNode.c) {
        found = true;
        break;
      }

      const neighbors = this.getNeighbors(u.r, u.c);
      for (const v of neighbors) {
        const vKey = `${v.r}-${v.c}`;
        if (!visited.has(vKey) && !this.walls.has(vKey)) {
          visited.add(vKey);
          parents.set(vKey, uKey);
          queue.push(v);

          frames.push({
            data: { visited: new Set(visited), path: [] },
            highlights: new Map([[v.r * this.cols + v.c, 'compare']]),
            line: 7,
            explanation: `Found neighbor at <b>(${v.r}, ${v.c})</b>. Adding to queue.`
          });
        }
      }
    }

    if (found) {
      const path = [];
      let curr = `${this.endNode.r}-${this.endNode.c}`;
      while (curr) {
        const [r, c] = curr.split('-').map(Number);
        path.push({r, c});
        curr = parents.get(curr)!;
        if (curr === `${this.startNode.r}-${this.startNode.c}`) {
          path.push(this.startNode);
          break;
        }
      }
      frames.push({
        data: { visited: new Set(visited), path: path.reverse() },
        highlights: new Map(),
        line: 3,
        explanation: "<b>Target found!</b> Reconstructing shortest path."
      });
    } else {
       frames.push({
        data: { visited: new Set(visited), path: [] },
        highlights: new Map(),
        line: 1,
        explanation: "Queue is empty. <b>No path exists</b>."
      });
    }

    this.engine.setFrames(frames);
    const slider = document.getElementById('frame-slider') as HTMLInputElement;
    slider.max = (frames.length - 1).toString();
    slider.value = "0";
  }

  private getNeighbors(r: number, c: number) {
    const n = [];
    if (r > 0) n.push({r: r - 1, c});
    if (r < this.rows - 1) n.push({r: r + 1, c});
    if (c > 0) n.push({r, c: c - 1});
    if (c < this.cols - 1) n.push({r, c: c + 1});
    return n;
  }

  private renderFrame(frame: Frame) {
    const { visited, path } = frame.data;
    this.container.innerHTML = `<div class="path-grid" id="path-grid" style="grid-template-columns: repeat(${this.cols}, 1fr)"></div>`;
    const gridEl = document.getElementById('path-grid')!;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        const key = `${r}-${c}`;
        
        if (r === this.startNode.r && c === this.startNode.c) cell.classList.add('start');
        else if (r === this.endNode.r && c === this.endNode.c) cell.classList.add('end');
        else if (this.walls.has(key)) cell.classList.add('wall');
        else if (path.some((p: any) => p.r === r && p.c === c)) cell.classList.add('path');
        else if (visited.has(key)) cell.classList.add('visited');

        const highlight = frame.highlights.get(r * this.cols + c);
        if (highlight) cell.classList.add(highlight);

        cell.addEventListener('mouseenter', () => {
          if (this.isMouseDown) {
            if (this.walls.has(key)) this.walls.delete(key);
            else this.walls.add(key);
            this.generateFrames();
          }
        });

        gridEl.appendChild(cell);
      }
    }

    // Update UI
    document.querySelectorAll('.pseudocode-line').forEach(el => el.classList.remove('active'));
    document.querySelector(`.pseudocode-line[data-line="${frame.line}"]`)?.classList.add('active');
    document.getElementById('explanation-mount')!.innerHTML = `<p class="explanation-text">${frame.explanation}</p>`;
    const counter = document.getElementById('frame-counter');
    if (counter) counter.textContent = `${this.engine.getCurrentIndex() + 1} / ${this.engine.getTotalFrames()}`;
  }

  private updatePlayButton(isPlaying: boolean) {
    const playBtn = document.getElementById('ctrl-play')!;
    if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';
  }
}
