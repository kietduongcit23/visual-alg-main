# AlgoViz — Technical Architecture

Version: 2.0
Audience: product owner, technical lead, frontend developer
Primary goal: help students understand basic array algorithms through step-by-step visualization and hands-on coding practice

---

## 1. Overview

**AlgoViz** is a browser-only teaching tool for basic algorithms and simple data structures, optimized for classroom use.

The tool has two complementary modes:

### Phase 1 — Visualizer

- step through code one operation at a time
- highlight the current line of code
- show how variables change over time
- show reads and writes on arrays
- show pointer/index movement such as `i` and `j`
- make it easy for the instructor to add or customize new algorithms

The visualizer uses **Java-like syntax**, converting it into a JavaScript subset and executing it with a sandboxed interpreter (JS-Interpreter).

### Phase 2 — Practice Runner

- students select one lesson from the problem list
- students write a small JavaScript method in the browser
- the browser generates fresh test cases
- the browser computes expected answers using a trusted reference solution
- the browser compares the student answer with the expected answer
- the browser displays accepted / partial / failed with per-test details

### Design priorities

- simplicity over completeness
- teaching clarity over language fidelity
- customization over general-purpose debugging
- browser-only delivery with no backend

---

## 2. Product Goals

### 2.1 Teaching goals

Students should be able to:

- see which line is running now
- observe how `i`, `j`, `max`, `sum`, `count`, `answer` change
- understand reads, writes, comparisons, swaps, and pointer movement
- solve warm-up array exercises repeatedly with randomized test cases
- connect algorithm ideas with code implementation quickly

### 2.2 Instructor goals

The instructor should be able to:

- add a new algorithm without changing the whole application
- customize starter code and sample input
- define which variables should be displayed in visualizer mode
- define `genTest`, `solution`, and `checker` for practice mode
- use predefined demos in class quickly
- extend the lesson list with minimal code changes

---

## 3. Scope

### 3.1 In scope — MVP

- browser-only app, no backend required
- static hosting friendly
- lesson selector
- both visualizer and practice modes

### 3.2 In scope — future

- List visualization
- Dictionary / map visualization
- hidden/public test case split
- local persistence with browser storage
- syntax validation before run
- CodeMirror upgrade for practice runner editor

### 3.3 Out of scope

- full Java parser or runtime
- user authentication
- server-side grading
- advanced algorithms already well covered by VisuAlgo
- object-oriented execution model
- general-purpose debugger for arbitrary programs

---

## 4. Design Principles

1. **Browser-first** — runs fully in the browser, easy deployment to static hosting
2. **Teaching-first** — UI must emphasize understanding, not just execution
3. **Deterministic stepping** — each user action corresponds to a meaningful, visible state transition
4. **Practice-first for warm-up mode** — a lesson should be solvable in one small function with immediate feedback
5. **Deterministic official answers** — each lesson must have a trusted reference solution; tie cases must be explicitly defined
6. **Simple extension model** — adding new exercises should be cheap
7. **Safe execution** — user code runs in an isolated interpreter (visualizer) or Web Worker (practice runner)
8. **Minimal framework burden** — avoid React; prefer small modules + DOM/CSS

---

## 5. Technology Stack

### 5.1 Visualizer stack

| Technology | Purpose |
|------------|---------|
| TypeScript | type-safe codebase |
| Vite | build tool and dev server |
| CodeMirror 6 | code editor with line highlighting |
| JS-Interpreter | sandboxed step-by-step execution |
| HTML/CSS/SVG | UI rendering without framework |

### 5.2 Practice Runner stack

| Technology | Purpose |
|------------|---------|
| HTML/CSS/JavaScript modules | zero-build browser-only app |
| Web Worker | isolated student-code execution |
| `<textarea>` (upgradeable to CodeMirror) | code editor |

### 5.3 Why this stack

- **TypeScript** — keeps the codebase maintainable as modules grow; helps define execution events and visualization state clearly
- **Vite** — lightweight modern build tool with simple developer experience
- **CodeMirror 6** — modern web editor supporting line decorations and extensions; ideal for highlighting the currently running line
- **JS-Interpreter** — executes JavaScript in a sandbox with stepping support; isolates execution from the main browser environment
- **Web Worker** — student code runs off the main UI thread; prevents page freeze from infinite loops; allows timeout-based cancellation
- **Plain DOM/SVG** — sufficient for arrays, variables, and educational visualization; simpler than a component framework

---

## 6. Two-Mode Architecture

```text
Shared Lesson Registry
  ├─ Visualizer Mode (Phase 1)
  │    ├─ CodeMirror editor
  │    ├─ Validator
  │    ├─ Normalizer
  │    ├─ Instrumenter
  │    ├─ JS-Interpreter Runner
  │    ├─ Event stream
  │    └─ Array / variable / pointer panels
  │
  └─ Practice Runner Mode (Phase 2)
       ├─ Lesson selector
       ├─ Starter code editor
       ├─ genTest
       ├─ solution
       ├─ checker
       ├─ Web Worker execution
       └─ Result table
```

The two modes can share lesson metadata and utility code, but should not be forced into one runtime model.

---

## 7. Phase 1 — Visualizer

### 7.1 High-level execution pipeline

```text
User code (Java-like syntax)
        |
        v
  Validator
    - reject unsupported syntax early
    - return friendly messages
        |
        v
  Normalizer
    - remove type declarations (int, boolean, etc.)
    - rewrite supported syntax to JS subset
    - map print helpers to internal API
        |
        v
  Instrumenter
    - inject LINE_ENTER hooks
    - inject array read/write hooks
    - inject compare hooks
    - inject pointer movement hooks
    - inject swap detection
        |
        v
  Runner (JS-Interpreter)
    - execute instrumented code step-by-step
    - step, run, pause, reset
        |
        v
  Event Stream → Reducer → UI State → Views
```

### 7.2 Supported Java-like syntax

Supported safely:

- assignments
- `if`, `else`, `while`, `for`, `break`, `continue`
- one-dimensional arrays and `.length`
- primitive declarations: `int i = 0;`, `boolean found = false;`, `int[] arr = [1,2,3];`
- `System.out.println(...)` and `print(...)`
- `swap(arr, i, j)` helper for array swaps

Not supported:

- classes, methods, generics, objects
- imports
- multi-dimensional arrays
- recursion beyond controlled demos

Unsupported constructs are rejected with friendly messages such as:

- `Classes are not supported in this mode.`
- `Only one-dimensional arrays are supported in this lesson.`

### 7.3 Runtime event model

```ts
type RuntimeEvent =
  | { type: 'LINE_ENTER'; line: number }
  | { type: 'SET_VAR'; name: string; value: unknown }
  | { type: 'READ_ARRAY'; arrayName: string; index: number; value: unknown }
  | { type: 'WRITE_ARRAY'; arrayName: string; index: number; value: unknown }
  | { type: 'COMPARE'; left: unknown; operator: string; right: unknown; result: boolean }
  | { type: 'MOVE_POINTER'; name: string; index: number }
  | { type: 'SWAP'; arrayName: string; i: number; j: number }
  | { type: 'PRINT'; text: string }
  | { type: 'FINISH' }
  | { type: 'ERROR'; message: string };
```

The UI updates from events rather than from direct execution state.

### 7.4 Visualizer lesson definition

```ts
export interface VisualizerLessonDefinition {
  id: string;
  title: string;
  description: string;
  category: 'array' | 'list' | 'dictionary';
  starterCode: string;
  initialBindings: Record<string, unknown>;
  watchedVariables: string[];
  pointerVariables: string[];
  primaryStructure: 'array' | 'list' | 'dictionary';
  explanationMap?: Partial<Record<RuntimeEvent['type'], string | ((event: RuntimeEvent) => string)>>;
  expectedOutputDescription?: string;
}
```

### 7.5 Visualizer UI layout

```text
+--------------------------------------------------------------+
| Toolbar: lesson selector | reset | next | run | pause | speed|
+--------------------------+-----------------------------------+
| Code Editor              | Data Visualization                |
|                          | - Array view                      |
| highlighted current line | - Pointer markers                 |
|                          | - Variables panel                  |
+--------------------------+-----------------------------------+
| Operation Log            | Explanation Panel                 |
+--------------------------------------------------------------+
```

Controls: Reset, Next, Run, Pause, speed slider
Keyboard shortcuts: `N` (Next), `R` (Run), `P` (Pause), `Esc` (Reset)

### 7.6 Visualization rules

**Array cell states:** normal, active-read, active-write, compared, swapped

**Animation durations:**
- pointer move: 150–250 ms
- read flash: 120–180 ms
- write flash: 180–250 ms
- swap animation: 250–400 ms

Animations must never block stepping precision.

### 7.7 Visualizer lesson set (5 MVP lessons)

1. `indexOf(value)` — linear scan, early exit
2. `find maximum value` — current best, conditional update
3. `count occurrences` — counting pattern
4. `reverse array` — two pointers, symmetric swap
5. `bubble sort` — nested loops, comparison + swap

---

## 8. Phase 2 — Practice Runner

### 8.1 Practice lesson contract

```ts
type PracticeLessonDefinition = {
  id: string;
  title: string;
  methodName: string;
  description: string;
  starterCode: string;
  testCount: number;
  genTest: (rng: RandomFn) => GeneratedTest;
  solution: (...args: unknown[]) => unknown;
  checker?: (ctx: CheckerContext) => CheckerResult;
}

type GeneratedTest = {
  args: unknown[];
  note?: string;
}

type CheckerContext = {
  actual: unknown;
  expected: unknown;
  test: GeneratedTest;
}

type CheckerResult = {
  pass: boolean;
  message?: string;
}
```

**`genTest`** — builds one random input case
**`solution`** — trusted official implementation (source of truth)
**`checker`** — optional custom validation (for floating-point tolerance, unordered output, etc.)

### 8.2 Practice Runner execution flow

```text
Select lesson
  -> load starter code
  -> user edits code
  -> click Run
  -> generate N tests via genTest
  -> compute expected outputs via solution
  -> execute student method per test (in Web Worker)
  -> validate using checker or default equality
  -> render summary and per-test result rows
```

### 8.3 Safety model

Student code runs in a Web Worker with a timeout per test case:

1. create a Web Worker
2. send the student source code, method name, and test args
3. compile the method wrapper inside the worker
4. execute the selected method
5. return actual output or runtime error
6. terminate the worker after completion
7. terminate early if timeout is exceeded

Benefits: page remains responsive, infinite loops don't lock UI, runtime errors are isolated.

Limitation: not a secure sandbox for hostile code. Acceptable for classroom use.

### 8.4 Practice Runner UI

1. Heading: `AlgoViz — Array Practice`
2. Lesson selector dropdown
3. Editor section with starter method code
4. Run button
5. Result summary: status badge, total/passed/failed tests
6. Result table: test index, status, args, expected, actual, message

### 8.5 Language format for Practice Mode

The editor accepts JavaScript method shorthand:

```js
indexOf(numbers, target) {
  for (let i = 0; i < numbers.length; i += 1) {
    if (numbers[i] === target) return i;
  }
  return -1;
}
```

### 8.6 Practice lesson set (25 lessons)

1. indexOf(value)
2. lastIndexOf(value)
3. contains(value)
4. find maximum value
5. find minimum value
6. find index of maximum value
7. find index of minimum value
8. sum of all elements
9. average of all elements
10. count occurrences of a specific value
11. count occurrences of maximum value
12. count unique values
13. find value with most occurrences
14. reverse array
15. sort ascending
16. sort descending
17. second largest/smallest
18. find all indices where a value appears
19. check if array is sorted
20. remove duplicates
21. find pairs that sum to target
22. rotate left or right by k
23. find the longest consecutive identical run
24. merge two sorted arrays
25. find the missing number in a sequence

---

## 9. File and Module Structure

```text
src/
  app/
    bootstrap.ts
    config.ts

  editor/
    editor.ts
    highlighting.ts

  engine/
    normalizer.ts
    validator.ts
    instrumenter.ts
    interpreter-runner.ts
    runtime-events.ts

  lessons/
    lesson-types.ts
    array-index-of.ts
    array-find-max.ts
    array-count-occurrences.ts
    array-reverse.ts
    array-bubble-sort.ts
    registry.ts

  array-practice/
    (Practice Runner browser app)

  state/
    app-state.ts
    runner-state.ts
    reducers.ts

  ui/
    toolbar.ts
    layout.ts
    panels/
      code-panel.ts
      array-panel.ts
      variables-panel.ts
      log-panel.ts
      explanation-panel.ts

  visual/
    array-renderer.ts
    pointer-renderer.ts
    variable-renderer.ts
    animation.ts

  styles/
    reset.css
    app.css
    editor.css
    visual.css

  main.ts
```

Vite builds two HTML entry points:

- `/` — Visualizer app
- `/array-algorithms.html` — Practice Runner page

---

## 10. Error Handling

### 10.1 Syntax and validation errors

Shown in the editor area. Execution controls are disabled until the source is valid.

### 10.2 Runtime errors

Stop execution, highlight offending line if possible, display a friendly explanation.

### 10.3 Practice mode errors

Reported per test case as runtime error or time limit exceeded.

---

## 11. Security

- do not run user code via `eval` (visualizer mode)
- execute via JS-Interpreter only (visualizer)
- execute via Web Worker with timeout (practice)
- do not expose browser globals
- bound execution steps (max 10,000 steps in student mode)

---

## 12. Testing Strategy

### Unit tests

- validator (supported and unsupported syntax)
- normalizer (rewrite cases)
- instrumenter (output correctness)
- event reducer logic
- runtime event utilities

### Integration tests

- load lesson and render initial state
- step through lessons
- reset, run to completion, pause

### Acceptance tests

- end-to-end execution of all 5 visualizer lessons
- practice runner: run generates correct pass/fail feedback

---

## 13. Existing Tools — References

| Tool | Relationship |
|------|-------------|
| Python Tutor | UX reference for step-by-step execution |
| JSAV / OpenDSA | Inspiration for algorithm visualization patterns |
| VisuAlgo | Complement — used for advanced algorithms |

---

## 14. Future Extensions

- student free-edit mode
- auto-check expected output
- List visualization
- Dictionary visualization
- predict-the-next-step quiz mode
- shareable lesson links
- export / import lesson definitions
- sample visible test case above generated tests
- local storage persistence
- difficulty tags per lesson

---

## 15. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Normalizer too weak | Keep syntax subset intentionally small; validate early; reject unsupported syntax clearly |
| Instrumentation becomes brittle | Start with lesson-specific patterns; keep test coverage on transformed snippets |
| UI becomes too generic | Prioritize array-specific visualization in MVP |
| Infinite loops in user code | Max step guard (visualizer); Web Worker timeout (practice) |
