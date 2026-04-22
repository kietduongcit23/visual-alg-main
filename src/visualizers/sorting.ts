
import { VisualizerEngine, Frame } from './engine';

const PSEUDO_BUBBLE = [
  "do",
  "  swapped = false",
  "  for i from 0 to n-2",
  "    if arr[i] > arr[i+1]",
  "      swap(arr[i], arr[i+1])",
  "      swapped = true",
  "while swapped"
];

const PSEUDO_SELECTION = [
  "for i from 0 to n-1",
  "  minIdx = i",
  "  for j from i+1 to n-1",
  "    if arr[j] < arr[minIdx]",
  "      minIdx = j",
  "  swap(arr[i], arr[minIdx])"
];

export function initSorting() {
  const mount = document.getElementById('visualizer-mount')!;
  const title = document.getElementById('visualizer-title')!;
  const algoName = document.getElementById('algo-name')!;
  const difficulty = document.getElementById('difficulty-badge')!;
  const pseudoMount = document.querySelector('.pseudocode-list')!;
  const explanationMount = document.getElementById('explanation-mount')!;
  const actionsMount = document.getElementById('stage-actions')!;

  title.textContent = "Sorting Visualizer";
  algoName.textContent = "BUBBLE SORT";
  difficulty.textContent = "Easy";
  difficulty.className = "badge status-pass";

  // Add Custom Input to Actions
  actionsMount.innerHTML = `
    <div class="control-group">
      <select id="algorithm-select" class="select">
        <option value="bubble">Bubble Sort</option>
        <option value="selection">Selection Sort</option>
      </select>
      <input type="text" id="custom-array" class="input" placeholder="e.g. 5,2,9,1" style="width: 120px;">
      <button id="btn-custom" class="btn">Set Array</button>
      <button id="btn-random" class="btn">Random</button>
    </div>
  `;

  let array: number[] = [29, 10, 14, 37, 13];
  
  const engine = new VisualizerEngine(
    (frame) => renderFrame(frame),
    (isPlaying) => updatePlayButton(isPlaying)
  );

  function renderFrame(frame: Frame) {
    const data = frame.data as number[];
    mount.innerHTML = `<div class="sorting-stage" id="sorting-stage"></div>`;
    const stageInner = document.getElementById('sorting-stage')!;
    
    data.forEach((val, i) => {
      const bar = document.createElement('div');
      bar.className = 'sort-bar';
      bar.style.height = `${(val / Math.max(...data, 40)) * 100}%`;
      const highlightClass = frame.highlights.get(i);
      if (highlightClass) bar.classList.add(highlightClass);
      
      const label = document.createElement('span');
      label.textContent = val.toString();
      label.style.position = 'absolute';
      label.style.bottom = '-24px';
      label.style.width = '100%';
      label.style.textAlign = 'center';
      label.style.fontSize = '0.7rem';
      label.style.color = 'var(--muted)';
      bar.appendChild(label);

      stageInner.appendChild(bar);
    });

    document.querySelectorAll('.pseudocode-line').forEach(el => el.classList.remove('active'));
    document.querySelector(`.pseudocode-line[data-line="${frame.line}"]`)?.classList.add('active');
    explanationMount.innerHTML = `<p class="explanation-text">${frame.explanation}</p>`;
    
    const slider = document.getElementById('frame-slider') as HTMLInputElement;
    const counter = document.getElementById('frame-counter');
    if (slider) slider.value = engine.getCurrentIndex().toString();
    if (counter) counter.textContent = `${engine.getCurrentIndex() + 1} / ${engine.getTotalFrames()}`;
  }

  function updatePlayButton(isPlaying: boolean) {
    const playBtn = document.getElementById('ctrl-play')!;
    if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';
  }

  function generateBubbleFrames(input: number[]): Frame[] {
    const frames: Frame[] = [];
    const arr = [...input];
    const n = arr.length;
    frames.push({ data: [...arr], highlights: new Map(), line: 0, explanation: "Starting Bubble Sort." });

    let swapped;
    do {
      swapped = false;
      frames.push({ data: [...arr], highlights: new Map(), line: 1, explanation: "Reset <b>swapped</b> to false." });
      for (let i = 0; i < n - 1; i++) {
        const val1 = arr[i];
        const val2 = arr[i + 1];
        if (val1 === undefined || val2 === undefined) continue;

        frames.push({ data: [...arr], highlights: new Map([[i, 'compare'], [i + 1, 'compare']]), line: 2, explanation: `Checking <b>${val1}</b> and <b>${val2}</b>.` });
        if (val1 > val2) {
          arr[i] = val2;
          arr[i + 1] = val1;
          swapped = true;
          frames.push({ data: [...arr], highlights: new Map([[i, 'swap'], [i + 1, 'swap']]), line: 4, explanation: `Swap <b>${val2}</b> and <b>${val1}</b>.` });
        }
      }
    } while (swapped);
    frames.push({ data: [...arr], highlights: new Map(arr.map((_, i) => [i, 'sorted'])), line: 0, explanation: "Array is <b>sorted</b>!" });
    return frames;
  }

  function generateSelectionFrames(input: number[]): Frame[] {
    const frames: Frame[] = [];
    const arr = [...input];
    const n = arr.length;

    for (let i = 0; i < n; i++) {
      let minIdx = i;
      frames.push({ data: [...arr], highlights: new Map([[i, 'active']]), line: 1, explanation: `Pass ${i}. Setting <b>minIdx</b> to ${i}.` });
      for (let j = i + 1; j < n; j++) {
        frames.push({ data: [...arr], highlights: new Map([[i, 'active'], [j, 'compare'], [minIdx, 'active']]), line: 3, explanation: `Comparing with current minimum.` });
        const valJ = arr[j];
        const valMin = arr[minIdx];
        if (valJ !== undefined && valMin !== undefined && valJ < valMin) {
          minIdx = j;
          frames.push({ data: [...arr], highlights: new Map([[i, 'active'], [j, 'active']]), line: 5, explanation: `New minimum found: <b>${valJ}</b>.` });
        }
      }
      if (minIdx !== i) {
        const valI = arr[i];
        const valMin = arr[minIdx];
        if (valI !== undefined && valMin !== undefined) {
          arr[i] = valMin;
          arr[minIdx] = valI;
          frames.push({ data: [...arr], highlights: new Map([[i, 'swap'], [minIdx, 'swap']]), line: 6, explanation: `Swapping <b>${valI}</b> with minimum.` });
        }
      }
      const sortedMap = new Map();
      for(let k=0; k<=i; k++) sortedMap.set(k, 'sorted');
      frames.push({ data: [...arr], highlights: sortedMap, line: 0, explanation: `Position <b>${i}</b> is sorted.` });
    }
    return frames;
  }

  function start(newArray: number[]) {
    array = newArray;
    const algo = (document.getElementById('algorithm-select') as HTMLSelectElement).value;
    
    // Update Pseudocode display
    if (algo === 'bubble') {
      algoName.textContent = "BUBBLE SORT";
      pseudoMount.innerHTML = PSEUDO_BUBBLE.map((line, i) => `<li class="pseudocode-line" data-line="${i}">${line}</li>`).join('');
    } else {
      algoName.textContent = "SELECTION SORT";
      pseudoMount.innerHTML = PSEUDO_SELECTION.map((line, i) => `<li class="pseudocode-line" data-line="${i}">${line}</li>`).join('');
    }

    const frames = algo === 'bubble' ? generateBubbleFrames(array) : generateSelectionFrames(array);
    engine.setFrames(frames);
    const slider = document.getElementById('frame-slider') as HTMLInputElement;
    if (slider) {
      slider.max = (frames.length - 1).toString();
      slider.value = "0";
    }
  }

  // Event Bindings
  document.getElementById('ctrl-play')?.addEventListener('click', () => {
    if (engine.getIsPlaying()) engine.pause();
    else engine.play();
  });
  document.getElementById('ctrl-next')?.addEventListener('click', () => engine.next());
  document.getElementById('ctrl-prev')?.addEventListener('click', () => engine.prev());
  document.getElementById('frame-slider')?.addEventListener('input', (e) => engine.jumpTo(parseInt((e.target as HTMLInputElement).value)));
  document.getElementById('speed-slider')?.addEventListener('input', (e) => engine.setSpeed(parseInt((e.target as HTMLInputElement).value)));
  document.getElementById('btn-random')?.addEventListener('click', () => start(Array.from({length: 6}, () => Math.floor(Math.random() * 45) + 5)));
  document.getElementById('btn-custom')?.addEventListener('click', () => {
    const val = (document.getElementById('custom-array') as HTMLInputElement).value;
    const custom = val.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (custom.length > 0) start(custom);
  });
  document.getElementById('algorithm-select')?.addEventListener('change', () => start(array));

  // Init
  start(array);
}
