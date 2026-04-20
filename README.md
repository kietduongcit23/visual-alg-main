# AlgoViz — Array Algorithm Learning Tool

Browser-only educational tool for learning basic array algorithms through step-by-step visualization and hands-on coding practice.

## Two Modes

| Mode | Description |
|------|-------------|
| **Visualizer** | Step through Java-like code line by line, observing array reads/writes, pointer movements, and variable changes |
| **Practice Runner** | Write JavaScript solutions to array problems with randomized test cases and instant feedback |

The workspace exposes two Vite HTML entries:

- `/` — Visualizer app
- `/array-algorithms.html` — Practice Runner page

## Stack

- TypeScript + Vite
- CodeMirror 6 (code editor)
- JS-Interpreter (sandboxed step-by-step execution)
- Web Worker (isolated practice code execution)
- Plain DOM and CSS

## Development

```bash
npm install       # install dependencies
npm run dev       # start dev server
npm run build     # build for production
npm run lint      # run lint checks
npm test          # run tests
```

Vite writes both pages to `dist/`:

- `dist/index.html`
- `dist/array-algorithms.html`

## Project Structure

```text
src/
  app/              # application bootstrap and config
  editor/           # CodeMirror editor integration
  engine/           # validator, normalizer, instrumenter, runner
  lessons/          # lesson definitions and registry
  array-practice/   # practice runner browser app
  state/            # app state and reducers
  ui/               # toolbar, layout, panels
  visual/           # array, pointer, variable renderers
  styles/           # CSS stylesheets
  types/            # shared TypeScript types
```

## Documentation

Detailed documentation is in `docs/`:

- [architecture.md](docs/architecture.md) — technical design for both Visualizer and Practice Runner
- [authoring-guide.md](docs/authoring-guide.md) — how to add new lessons
- [tasks.md](docs/tasks.md) — active task tracker (Phase 1 + Phase 2)
- [changelog.md](docs/changelog.md) — development progress history

## Visualizer — Supported Syntax

This app supports a narrow Java-like subset:

- simple assignments
- `if`, `while`, `for`, `break`, `continue`
- one-dimensional arrays and `.length`
- primitive declarations (`int i = 0;`)
- `System.out.println(...)` mapped to `print(...)`
- `swap(arr, i, j)` helper for array swaps

Unsupported constructs are rejected with friendly validation messages.

## Visualizer — Execution Pipeline

1. Validate the Java-like source against the supported subset
2. Normalize declarations and print helpers into a JS-compatible subset
3. Instrument the code with semantic runtime hooks
4. Execute the instrumented code in JS-Interpreter
5. Reduce runtime events into UI state

## Practice Runner — How It Works

1. Select a lesson from 34 array problems
2. Write a JavaScript method in the browser editor
3. Click Run — fresh test cases are generated
4. Expected answers computed from trusted reference solutions
5. Student code executed safely in a Web Worker
6. Results shown as Accepted / Partial / Failed with per-test details

## Test Coverage

- runtime event utilities
- validator, normalizer, instrumenter
- interpreter runner
- reducer behavior
- end-to-end execution of all 5 MVP visualizer lessons

## Known Limits

- This is not a full Java parser or runtime
- Syntax support is intentionally narrow
- Swap visualization uses a lightweight pulse rather than complex motion paths
- The bundled `js-interpreter` chunk is large; code-splitting would be a sensible optimization