# AlgoViz — Task Tracker

Status: in progress

---

## Phase 1 — Visualizer

### Project Setup
- [x] Initialize repository structure (Vite + TypeScript)
- [x] Configure TypeScript, ESLint, and formatting
- [x] Create base application shell (toolbar, editor, visualization, log panels)

### Editor
- [x] Integrate CodeMirror 6
- [x] Add current-line highlighting
- [x] Add editable / read-only mode toggle
- [x] Add syntax error display area

### State and Event Model
- [x] Define global app state types (runner, lesson, visualization)
- [x] Define runtime event types (LINE_ENTER, SET_VAR, READ_ARRAY, WRITE_ARRAY, COMPARE, MOVE_POINTER, SWAP, PRINT, FINISH, ERROR)
- [x] Implement event playback reducer

### Visualization UI
- [x] Array renderer (index, value, active read/write styling)
- [x] Pointer renderer (i, j, left, right, maxIndex — stacking support)
- [x] Swap animation
- [x] Variables panel (grouped by role: input, pointer, accumulator, result)
- [x] Operation log panel
- [x] Explanation panel
- [x] Toolbar controls (reset, next, run, pause, speed)

### Lesson System
- [x] Define `LessonDefinition` interface
- [x] Build lesson registry
- [x] Build lesson selector UI
- [x] Support watched variables and pointer variables per lesson
- [x] Support explanation mapping per lesson

### Execution Pipeline
- [x] Syntax subset validator
- [x] Normalizer (type removal + Java-to-JS rewrite)
- [x] Instrumenter (line hooks, array read/write, compare, pointer, swap)
- [x] JS-Interpreter integration (step, run, pause, reset, max-step guard)

### Visualizer Lessons (5 MVP)
- [x] indexOf(value)
- [x] find maximum value
- [x] count occurrences
- [x] reverse array
- [x] bubble sort

### Testing
- [x] Unit tests: validator, normalizer, instrumenter, reducer
- [x] Integration tests: lesson load, stepping, reset, run, pause
- [ ] Manual classroom tests: projector readability, keyboard-only, dark/light mode

### UX and Polish
- [x] Visual legend for colors and markers
- [x] Keyboard shortcuts (N, R, P, Esc)
- [x] Welcome lesson / intro screen
- [x] Local storage persistence
- [x] Copy / reset lesson code button

---

## Phase 2 — Practice Runner

### Setup
- [x] Create static browser app shell (HTML/CSS/JS modules)
- [x] Build page layout (heading, dropdown, editor, run button, results)

### Lesson Registry
- [x] Central lesson registry with `genTest + solution + checker`
- [x] Starter code per lesson

### Practice Lessons (34 total)
- [x] indexOf(value)
- [x] lastIndexOf(value)
- [x] contains(value)
- [x] find maximum / minimum value
- [x] find index of maximum / minimum value
- [x] sum / average of all elements
- [x] count occurrences of a value / of maximum value
- [x] count unique values
- [x] most frequent value
- [x] reverse array
- [x] sort ascending / descending
- [x] second largest/smallest
- [x] all indices of a value
- [x] sorted check
- [x] remove duplicates
- [x] pairs with target sum
- [x] rotate left/right by k
- [x] longest consecutive run
- [x] merge two sorted arrays
- [x] missing number in sequence
- [x] two sum (sorted array)
- [x] detect cycle length (fast-slow pointers)
- [x] intersection of two sorted arrays
- [x] max sum of subarray of size k
- [x] shortest subarray with sum ≥ target
- [x] build prefix sum array
- [x] range sum queries (prefix sum)
- [x] binary search
- [x] lower bound (first index ≥ target)

### Runner Pipeline
- [x] Load selected lesson into editor
- [x] Generate fresh tests on each run
- [x] Compute expected answer from `solution`
- [x] Execute student method in Web Worker with timeout
- [x] Compare with `checker` or default deep equality
- [x] Render per-test results with summary badge

### Testing & Scalability
- [x] Robust coverage constraints (O(n) and O(log n) tests up to 100K-200K elements)
- [x] Standardize test execution cases to `20` tests per run
- [x] Expose `auto_run_test()` on DOM console for automation suite execution

### UX
- [x] Reset code button
- [x] Show lesson description and method name
- [x] Summary badge: Accepted / Partial / Failed
- [x] Track passed/failed lessons in LocalStorage
- [x] Show global pass/fail statistics next to lesson header
- [x] Add green check (✅) and red cross (❌) emojis to dropdown options based on completion status

---

## Remaining Work

### High Priority
- [ ] One real classroom demo completed successfully
- [ ] Manual projector readability check
- [ ] Keyboard-only control check

### Nice-to-Have
- [ ] Replace practice runner textarea with CodeMirror
- [ ] Add syntax validation before run (practice mode)
- [ ] Add Ctrl+Enter keyboard shortcut to run (practice mode)
- [ ] Add sample visible test case above generated tests
- [ ] Add difficulty tags per lesson
- [ ] Add step-by-step tracing for a subset of practice lessons
- [ ] Student free-edit mode (visualizer)
- [ ] Auto-check expected output (visualizer)
- [ ] List visualization
- [ ] Dictionary visualization
- [ ] Predict-the-next-step quiz mode
- [ ] Shareable lesson links
- [ ] Export / import lesson definitions

---

## Documentation
- [x] Technical design document — `docs/architecture.md`
- [x] Developer setup guide — `README.md`
- [x] Lesson authoring guide — `docs/authoring-guide.md`
- [x] Changelog — `docs/changelog.md`