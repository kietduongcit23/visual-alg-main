# AlgoViz — Changelog

---

## 2026-04-12

### Practice Runner (Phase 2 - Advanced Algorithms)
- Added 9 advanced array practice problems covering Two Pointers, Sliding Window, Prefix Sum, and Binary Search strategies.
- Scaled up robustness of Random hidden test generators to now use up to `100K-200K elements` to effectively stress-test $O(n)$ and $O(\log n)$ algorithms.
- Increased total test execution limits from 14 to 20 tests.
- Implemented `auto_run_test()` global console script for automated full-suite testing in the DOM.
- Fixed core Javascript `Math.floor` behavior to properly simulate Java integer division algorithm logic.
- Added LocalStorage tracking for lesson completion status, appending pass/fail counts to the UI header and status emojis (✅/❌) to the lesson selection dropdown.

---

## 2026-04-08

### Visualizer (Phase 1)

- Scaffolded Vite + TypeScript project structure
- Integrated CodeMirror 6 with current-line highlighting
- Implemented runtime events, app state, reducer, and visualization panels
- Added validator, normalizer, instrumenter, and JS-Interpreter runner
- Implemented 5 MVP lessons and end-to-end lesson execution tests
- Added visual legend for colors and markers
- Added keyboard shortcuts (N, R, P, Esc)
- Added local storage persistence
- Added copy / reset lesson code button
- Added README and developer setup instructions

### Practice Runner (Phase 2)

- Added practice runner design to technical design document
- Created static browser app (HTML/CSS/JS modules)
- Implemented all 25 array practice lessons with `genTest + solution + checker`
- Added worker-based test execution with timeout
- Added lesson selector, editor, run, reset, summary, and results table

### Known Issues

- `js-interpreter` increases the client bundle size significantly
- Browser automation was not available for deep visual inspection of the running page
