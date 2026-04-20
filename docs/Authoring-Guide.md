# AlgoViz — Lesson Authoring Guide

This guide explains how to add a new lesson to AlgoViz without changing the whole application.

---

## 1. Create a Lesson Module

Add a new file under `src/lessons/`, for example:

```text
src/lessons/array-sum.ts
```

Export a `LessonDefinition` object:

```ts
import type { LessonDefinition } from './lesson-types';

export const sumLesson: LessonDefinition = {
  id: 'array-sum',
  title: 'sum of all elements',
  description: 'Accumulate the total while scanning the array once.',
  category: 'array',
  starterCode: `arr = [2, 4, 6];
sum = 0;
i = 0;

while (i < arr.length) {
    sum = sum + arr[i];
    i = i + 1;
}`,
  initialBindings: {
    arr: [2, 4, 6],
    sum: 0,
    i: 0,
  },
  watchedVariables: ['sum', 'i'],
  pointerVariables: ['i'],
  primaryStructure: 'array',
};
```

---

## 2. Choose Lesson Metadata Carefully

Key fields:

| Field | Description |
|-------|-------------|
| `id` | Unique stable identifier used by the registry and UI |
| `title` | Short label shown in the lesson selector |
| `description` | Initial explanation shown before stepping |
| `starterCode` | Java-like source shown in the editor |
| `initialBindings` | Initial runtime values used by the reducer before execution starts |

Keep `starterCode` and `initialBindings` consistent. If the code starts with `target = 2;`, the initial bindings should reflect that same value.

---

## 3. Mark Pointer Variables

Use `pointerVariables` for loop indices or cursor-like variables such as:

- `i`, `j`
- `left`, `right`
- `maxIndex`

Pointer variables emit `MOVE_POINTER` events and are rendered above the array. Do not include ordinary accumulators like `sum`, `count`, or `answer` unless they really represent an index.

---

## 4. Choose Watched Variables

Use `watchedVariables` for variables you want visible in the compact variable row.

Current UI behavior:

- pointer variables → shown by pointer markers above the array
- non-pointer watched variables → shown in the variable row inside the array panel

Avoid duplicating pointer variables unless you intentionally want them tracked for reducer state only.

---

## 5. Add Explanation Text

Use `explanationMap` to provide lesson-specific teaching copy for important runtime events:

```ts
explanationMap: {
  READ_ARRAY: 'The algorithm inspects the current value before deciding what to do next.',
  SET_VAR: 'The accumulator is updated with the new running total.',
  FINISH: 'The final total is ready after the scan reaches the end.',
}
```

You can map either:

- a static string
- a function `(event) => string` when the explanation depends on the event payload

---

## 6. Prefer Supported Syntax Only

Current supported subset is intentionally narrow.

**Supported:**

- assignments
- `if`, `while`, `for`, `break`, `continue`
- one-dimensional arrays and `.length`
- primitive declarations: `int i = 0;`
- `System.out.println(...)`
- `swap(arr, i, j)` helper for array swaps

**Avoid:** classes, imports, user-defined methods, multi-dimensional arrays.

---

## 7. Register the Lesson

Import the new lesson into `src/lessons/registry.ts` and add it to the `lessons` array.

---

## 8. Test the Lesson

Minimum recommended checks:

1. Add or extend a lesson execution test in `src/engine/lesson-execution.test.ts`.
2. Verify the final variables or array state.
3. If the lesson uses pointers or swaps, verify those behaviors explicitly.
4. Run the full test suite with `npm test`.

If the lesson introduces a new supported pattern for the language subset, also add tests for:

- validator behavior
- normalizer behavior
- instrumenter behavior

---

## 9. Practical Tips

- Keep lesson code small enough for students to read in one glance
- Prefer one main idea per lesson
- Use clear variable names that match the explanation text
- If a swap is needed, prefer `swap(arr, i, j)` instead of manual temp-variable swaps
