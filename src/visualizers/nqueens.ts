
import { VisualizerEngine, Frame } from './engine';

const PSEUDO_NQUEENS = [
  "func solve(row)",
  "  if row == N return true",
  "  for col = 0 to N-1",
  "    if isSafe(row, col)",
  "      place queen at (row, col)",
  "      if solve(row + 1) return true",
  "      remove queen (backtrack)",
  "  return false"
];

export class NQueensVisualizer {
  private container: HTMLElement;
  private engine: VisualizerEngine;
  private n = 8;

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

    title.textContent = "N-Queens Visualizer";
    algoName.textContent = "N-QUEENS BACKTRACKING";
    difficulty.textContent = "Hard";
    difficulty.className = "badge status-fail";

    pseudoMount.innerHTML = PSEUDO_NQUEENS.map((line, i) => `
      <li class="pseudocode-line" data-line="${i}">${line}</li>
    `).join('');

    actionsMount.innerHTML = `
      <div class="control-group">
        <label style="font-size: 0.8rem;">Size:</label>
        <input type="number" id="n-size" value="${this.n}" min="4" max="10" class="input" style="width: 60px;">
        <button id="btn-restart" class="btn">Restart</button>
      </div>
    `;

    this.setupControlListeners();
    this.generateFrames();
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
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      const size = parseInt((document.getElementById('n-size') as HTMLInputElement).value);
      this.n = isNaN(size) ? 8 : size;
      this.generateFrames();
    });
  }

  private generateFrames() {
    const frames: Frame[] = [];
    const board = Array(this.n).fill(-1);

    const isSafe = (row: number, col: number, currentBoard: number[]) => {
      for (let i = 0; i < row; i++) {
        const boardVal = currentBoard[i];
        if (boardVal === undefined) continue;
        if (boardVal === col) return false;
        if (Math.abs(boardVal - col) === Math.abs(i - row)) return false;
      }
      return true;
    };

    const solve = (row: number) => {
      frames.push({
        data: [...board],
        highlights: new Map(),
        line: 1,
        explanation: `Checking row <b>${row}</b>.`
      });

      if (row === this.n) {
        frames.push({
          data: [...board],
          highlights: new Map(),
          line: 1,
          explanation: "<b>Success!</b> All queens placed."
        });
        return true;
      }

      for (let col = 0; col < this.n; col++) {
        frames.push({
          data: [...board],
          highlights: new Map([[row * this.n + col, 'trying']]),
          line: 2,
          explanation: `Trying to place queen at <b>(${row}, ${col})</b>.`
        });

        if (isSafe(row, col, board)) {
          board[row] = col;
          frames.push({
            data: [...board],
            highlights: new Map([[row * this.n + col, 'queen']]),
            line: 4,
            explanation: `Safe! Placing queen at <b>(${row}, ${col})</b>.`
          });

          if (solve(row + 1)) return true;

          // Backtrack
          board[row] = -1;
          frames.push({
            data: [...board],
            highlights: new Map([[row * this.n + col, 'backtrack']]),
            line: 6,
            explanation: `Failed at row ${row+1}. <b>Backtracking</b> from (${row}, ${col}).`
          });
        } else {
          frames.push({
            data: [...board],
            highlights: new Map([[row * this.n + col, 'conflict']]),
            line: 3,
            explanation: `Conflict! Cannot place queen at (${row}, ${col}).`
          });
        }
      }
      return false;
    };

    solve(0);
    this.engine.setFrames(frames);
    const slider = document.getElementById('frame-slider') as HTMLInputElement;
    if (slider) {
      slider.max = (frames.length - 1).toString();
      slider.value = "0";
    }
  }

  private renderFrame(frame: Frame) {
    const board = frame.data as number[];
    this.container.innerHTML = `<div id="nqueens-board" class="chess-board" style="grid-template-columns: repeat(${this.n}, 1fr); width: ${Math.min(400, this.n * 50)}px; height: ${Math.min(400, this.n * 50)}px;"></div>`;
    const boardEl = document.getElementById('nqueens-board')!;

    for (let r = 0; r < this.n; r++) {
      for (let c = 0; c < this.n; c++) {
        const cell = document.createElement('div');
        cell.className = `chess-cell ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
        
        if (board[r] === c) {
          cell.classList.add('queen');
          cell.innerHTML = '♛';
        }

        const highlight = frame.highlights.get(r * this.n + c);
        if (highlight) {
          cell.classList.add(highlight);
          if (highlight === 'trying') cell.innerHTML = '?';
        }

        boardEl.appendChild(cell);
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
