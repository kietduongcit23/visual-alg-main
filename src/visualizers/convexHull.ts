
import { VisualizerEngine, Frame } from './engine';

interface Point { x: number; y: number; }

const PSEUDO_HULL = [
  "find point with lowest Y (startPoint)",
  "sort other points by polar angle",
  "initialize stack with first 3 points",
  "for each remaining point p",
  "  while crossProduct(p1, p2, p) <= 0",
  "    pop from stack",
  "  push p to stack",
  "return stack as convex hull"
];

export class ConvexHullVisualizer {
  private container: HTMLElement;
  private engine: VisualizerEngine;
  private points: Point[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

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

    title.textContent = "Geometric Visualizer";
    algoName.textContent = "GRAHAM SCAN (CONVEX HULL)";
    difficulty.textContent = "Hard";
    difficulty.className = "badge status-fail";

    pseudoMount.innerHTML = PSEUDO_HULL.map((line, i) => `
      <li class="pseudocode-line" data-line="${i}">${line}</li>
    `).join('');

    actionsMount.innerHTML = `<button id="btn-gen-hull" class="btn">New Points</button>`;

    this.container.innerHTML = `
      <div class="canvas-container" style="width: 100%; height: 100%;">
        <canvas id="hull-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
      </div>
    `;

    this.canvas = document.getElementById('hull-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    this.setupControlListeners();
    this.generatePoints();

    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.engine.jumpTo(this.engine.getCurrentIndex());
    });
  }

  private resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement!;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
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
    document.getElementById('btn-gen-hull')?.addEventListener('click', () => this.generatePoints());
  }

  private generatePoints() {
    const count = 25;
    const padding = 50;
    this.points = Array.from({length: count}, () => ({
      x: Math.random() * (this.canvas!.width - padding * 2) + padding,
      y: Math.random() * (this.canvas!.height - padding * 2) + padding
    }));
    this.generateFrames();
  }

  private generateFrames() {
    const frames: Frame[] = [];
    const pts = [...this.points];
    if (pts.length < 3) return;

    // 1. Find start point
    const firstPoint = pts[0];
    if (!firstPoint) return;
    let startPoint: Point = firstPoint;
    for (const p of pts) {
      if (p.y > startPoint.y || (p.y === startPoint.y && p.x < startPoint.x)) {
        startPoint = p;
      }
    }

    frames.push({
      data: { hull: [], active: [startPoint] },
      highlights: new Map(),
      line: 0,
      explanation: "Find the point with the lowest Y coordinate."
    });

    // 2. Sort by angle
    const sorted = pts.filter(p => p !== startPoint).sort((a, b) => {
      const angleA = Math.atan2(a.y - startPoint.y, a.x - startPoint.x);
      const angleB = Math.atan2(b.y - startPoint.y, b.x - startPoint.x);
      return angleA - angleB;
    });

    frames.push({
      data: { hull: [], active: [startPoint, ...sorted] },
      highlights: new Map(),
      line: 1,
      explanation: "Sort all other points by their polar angle relative to the start point."
    });

    const p0 = sorted[0];
    const p1_sorted = sorted[1];
    if (!p0 || !p1_sorted) return;

    const stack: Point[] = [startPoint, p0, p1_sorted];
    frames.push({
      data: { hull: [...stack], active: [] },
      highlights: new Map(),
      line: 2,
      explanation: "Initialize stack with the first three points."
    });

    for (let i = 2; i < sorted.length; i++) {
      const p = sorted[i];
      if (!p) continue;
      frames.push({
        data: { hull: [...stack], active: [p] },
        highlights: new Map(),
        line: 3,
        explanation: `Considering point at (${Math.round(p.x)}, ${Math.round(p.y)}).`
      });

      while (stack.length >= 2) {
        const p1 = stack[stack.length - 2];
        const p2 = stack[stack.length - 1];
        if (!p1 || !p2 || !p) break;
        const cp = (p2.x - p1.x) * (p.y - p1.y) - (p2.y - p1.y) * (p.x - p1.x);

        frames.push({
          data: { hull: [...stack], active: [p] },
          highlights: new Map(),
          line: 4,
          explanation: `Checking cross product: <b>${cp > 0 ? "Left" : "Right/Straight"}</b> turn.`
        });

        if (cp <= 0) {
          stack.pop();
          frames.push({
            data: { hull: [...stack], active: [p] },
            highlights: new Map(),
            line: 5,
            explanation: "Non-left turn detected. <b>Popping</b> from stack."
          });
        } else {
          break;
        }
      }
      stack.push(p);
      frames.push({
        data: { hull: [...stack], active: [] },
        highlights: new Map(),
        line: 6,
        explanation: "Valid left turn. <b>Pushing</b> point to stack."
      });
    }

    frames.push({
      data: { hull: [...stack], active: [] },
      highlights: new Map(),
      line: 7,
      explanation: "Scan complete. The <b>convex hull</b> is formed!"
    });

    this.engine.setFrames(frames);
    const slider = document.getElementById('frame-slider') as HTMLInputElement;
    if (slider) {
      slider.max = (frames.length - 1).toString();
      slider.value = "0";
    }
  }

  private renderFrame(frame: Frame) {
    if (!this.ctx || !this.canvas) return;
    const { hull, active } = frame.data;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Points
    this.points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--muted)';
      ctx.fill();
    });

    // Active
    active.forEach((p: Point) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--accent)';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.stroke();
    });

    // Hull
    if (hull.length > 0) {
      ctx.beginPath();
      ctx.moveTo(hull[0].x, hull[0].y);
      for (let i = 1; i < hull.length; i++) ctx.lineTo(hull[i].x, hull[i].y);
      if (this.engine.getCurrentIndex() === this.engine.getTotalFrames() - 1) ctx.closePath();
      ctx.strokeStyle = 'var(--teal)';
      ctx.lineWidth = 3;
      ctx.stroke();

      hull.forEach((p: Point) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'var(--teal)';
        ctx.fill();
      });
    }

    // UI Updates
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
