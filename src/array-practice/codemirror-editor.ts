import { ViewPlugin, Decoration } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { snippetCompletion } from "@codemirror/autocomplete";
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
} from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import {
  bracketMatching,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  foldGutter,
} from '@codemirror/language';
import {
  autocompletion,
  completionKeymap,
  type CompletionContext,
  type Completion,
} from '@codemirror/autocomplete';

// ─── Theme ──────────────────────────────────────────────────────────────────

const editorTheme = EditorView.theme({
  '&': {
    fontSize: '0.93rem',
    fontFamily: "'Consolas', 'Cascadia Code', 'Courier New', monospace",
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(52, 43, 30, 0.18)',
    background: 'rgba(255, 253, 247, 0.96)',
    minHeight: '380px',
  },
  '&.cm-focused': {
    outline: 'none',
    border: '1px solid rgba(28, 124, 84, 0.5)',
    boxShadow: '0 0 0 3px rgba(28, 124, 84, 0.1)',
  },
  '.cm-scroller': {
    lineHeight: '1.6',
    minHeight: '380px',
  },
  '.cm-gutters': {
    background: 'rgba(243, 239, 230, 0.8)',
    borderRight: '1px solid rgba(52, 43, 30, 0.1)',
    color: '#9f9080',
    borderRadius: '16px 0 0 16px',
  },
  '.cm-activeLineGutter': {
    background: 'rgba(28, 124, 84, 0.08)',
  },
  '.cm-activeLine': {
    background: 'rgba(28, 124, 84, 0.04)',
  },
  '.cm-cursor': {
    borderLeftColor: '#1c7c54',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    background: 'rgba(28, 124, 84, 0.15)',
  },
  '.cm-matchingBracket': {
    background: 'rgba(28, 124, 84, 0.2)',
    outline: '1px solid rgba(28, 124, 84, 0.4)',
  },
});

// ─── Formatter (F9) ─────────────────────────────────────────────────────────

/**
 * A best-effort JS formatter: re-indents code based on brace nesting.
 * Không cần thư viện ngoài – hoạt động tốt với code student ngắn.
 */
function simpleFormatCode(code: string): string {
  const lines = code.split('\n');
  let depth = 0;
  const INDENT = '  ';

  const formatted = lines.map((rawLine) => {
    const line = rawLine.trim();
    if (line === '') return '';

    // Giảm depth trước nếu dòng bắt đầu bằng }
    const opensCount = (line.match(/[{[(]/g) || []).length;
    const closesCount = (line.match(/[}\])]/g) || []).length;

    // Đếm closes ở đầu dòng để giảm indent trước khi in
    const leadingCloses = (line.match(/^[}\])]+/) || [''])[0].length;
    depth = Math.max(0, depth - leadingCloses);

    const indented = INDENT.repeat(depth) + line;

    // Tăng/giảm depth cho dòng tiếp theo
    depth += opensCount - closesCount + leadingCloses;
    depth = Math.max(0, depth);

    return indented;
  });

  return formatted.join('\n');
}

// ─── IntelliSense – custom completion source ────────────────────────────────

/** Method completions that appear after a `.` (dot trigger). */
const DOT_COMPLETIONS: Completion[] = [
  // ── Array-like (List) ───────────────────────────────────────────────────
  {
    label: 'size()', type: 'method',
    detail: 'Array → int',
    info: 'Trả về số phần tử của mảng (giống List.size() trong Java).',
    apply: 'size()',
  },
  {
    label: 'add(e)', type: 'method',
    detail: 'Array → boolean',
    info: 'Thêm phần tử vào cuối mảng (giống List.add()).',
    apply: 'add()',
  },
  {
    label: 'get(i)', type: 'method',
    detail: 'Array → element',
    info: 'Lấy phần tử tại chỉ số i (giống List.get(i)).',
    apply: 'get()',
  },
  {
    label: 'set(i, e)', type: 'method',
    detail: 'Array → oldValue',
    info: 'Gán giá trị mới tại chỉ số i, trả về giá trị cũ (giống List.set()).',
    apply: 'set()',
  },
  {
    label: 'remove(i)', type: 'method',
    detail: 'Array → element',
    info: 'Xóa phần tử tại chỉ số i và trả về nó (giống List.remove()).',
    apply: 'remove()',
  },
  {
    label: 'isEmpty()', type: 'method',
    detail: 'Array → boolean',
    info: 'Trả về true nếu mảng rỗng (giống List.isEmpty()).',
    apply: 'isEmpty()',
  },
  // ── Object-like (HashMap) ────────────────────────────────────────────────
  {
    label: 'put(k, v)', type: 'method',
    detail: 'Object → null',
    info: 'Gán counts[k] = v (giống HashMap.put()).',
    apply: 'put()',
  },
  {
    label: 'get(k)', type: 'method',
    detail: 'Object → value | null',
    info: 'Lấy giá trị theo key, trả về null nếu không tồn tại (giống HashMap.get()).',
    apply: 'get()',
  },
  {
    label: 'getOrDefault(k, d)', type: 'method',
    detail: 'Object → value',
    info: 'Lấy value theo key; nếu chưa có thì trả về d (giống HashMap.getOrDefault()).',
    apply: 'getOrDefault()',
  },
  {
    label: 'containsKey(k)', type: 'method',
    detail: 'Object → boolean',
    info: 'Kiểm tra key có tồn tại không (giống HashMap.containsKey()).',
    apply: 'containsKey()',
  },
  {
    label: 'keySet()', type: 'method',
    detail: 'Object → string[]',
    info: 'Trả về mảng các key (giống HashMap.keySet()).',
    apply: 'keySet()',
  },
  // ── Native JS array helpers ──────────────────────────────────────────────
  {
    label: 'length', type: 'property',
    detail: 'Array → number',
    info: 'Số phần tử của mảng (JS native).',
    apply: 'length',
  },
  {
    label: 'push(e)', type: 'method',
    detail: 'Array → number',
    info: 'Thêm phần tử vào cuối mảng và trả về độ dài mới.',
    apply: 'push()',
  },
  {
    label: 'pop()', type: 'method',
    detail: 'Array → element',
    info: 'Xóa và trả về phần tử cuối cùng.',
    apply: 'pop()',
  },
  {
    label: 'includes(e)', type: 'method',
    detail: 'Array → boolean',
    info: 'Kiểm tra mảng có chứa phần tử e không.',
    apply: 'includes()',
  },
  {
    label: 'indexOf(e)', type: 'method',
    detail: 'Array → number',
    info: 'Trả về chỉ số đầu tiên của e, hoặc -1.',
    apply: 'indexOf()',
  },
  {
    label: 'slice(start, end)', type: 'method',
    detail: 'Array → Array',
    info: 'Cắt mảng từ chỉ số start đến end (không bao gồm end).',
    apply: 'slice()',
  },
  {
    label: 'sort((a, b) => a - b)', type: 'method',
    detail: 'Array → Array',
    info: 'Sắp xếp mảng tại chỗ. Dùng (a, b) => a - b để sắp xếp tăng dần.',
    apply: 'sort((a, b) => a - b)',
  },
  {
    label: 'concat(arr)', type: 'method',
    detail: 'Array → Array',
    info: 'Nối hai mảng lại thành mảng mới.',
    apply: 'concat()',
  },
];

/** Global keyword completions (no dot trigger). */
const GLOBAL_COMPLETIONS: Completion[] = [
  { label: 'Math.max(a, b)', type: 'function', detail: 'number', info: 'Trả về số lớn hơn trong hai số.', apply: 'Math.max()' },
  { label: 'Math.min(a, b)', type: 'function', detail: 'number', info: 'Trả về số nhỏ hơn trong hai số.', apply: 'Math.min()' },
  { label: 'Math.abs(n)', type: 'function', detail: 'number', info: 'Giá trị tuyệt đối của n.', apply: 'Math.abs()' },
  { label: 'Math.floor(n)', type: 'function', detail: 'number', info: 'Làm tròn xuống.', apply: 'Math.floor()' },
  { label: 'Math.ceil(n)', type: 'function', detail: 'number', info: 'Làm tròn lên.', apply: 'Math.ceil()' },
];
const SNIPPETS = [
  snippetCompletion("Arrays.sort(${arr});", {
    label: "Arrays.sort",
    type: "function",
  }),
  // 🔥 KIỂU DỮ LIỆU
  snippetCompletion("int ${name} = ${value};", {
    label: "int",
    type: "keyword",
  }),

  snippetCompletion("long ${name} = ${value};", {
    label: "long",
    type: "keyword",
  }),

  snippetCompletion("double ${name} = ${value};", {
    label: "double",
    type: "keyword",
  }),

  snippetCompletion("boolean ${name} = ${value};", {
    label: "boolean",
    type: "keyword",
  }),

  snippetCompletion("String ${name} = \"${value}\";", {
    label: "String",
    type: "keyword",
  }),

  // 🔥 MẢNG
  snippetCompletion("int[] ${arr} = new int[${size}];", {
    label: "int[]",
    type: "keyword",
  }),

  snippetCompletion("String[] ${arr} = new String[${size}];", {
    label: "String[]",
    type: "keyword",
  }),

  // 🔥 IF / ELSE
  snippetCompletion("if (${condition}) {\n  ${}\n}", {
    label: "if",
    type: "keyword",
  }),

  snippetCompletion("if (${condition}) {\n  ${}\n} else {\n  ${}\n}", {
    label: "ifelse",
    type: "keyword",
  }),

  // 🔥 LOOP
  snippetCompletion("for (int i = 0; i < ${n}; i++) {\n  ${}\n}", {
    label: "fori",
    type: "keyword",
  }),

  snippetCompletion("while (${condition}) {\n  ${}\n}", {
    label: "while",
    type: "keyword",
  }),

  // 🔥 RETURN
  snippetCompletion("return ${value};", {
    label: "return",
    type: "keyword",
  }),

  snippetCompletion("break;", {
    label: "break",
    type: "keyword",
  }),

  snippetCompletion("true", {
    label: "true",
    type: "keyword",
  }),

  snippetCompletion("false", {
    label: "false",
    type: "keyword",
  }),

  // 🔥 PRINT
  snippetCompletion("System.out.println(${value});", {
    label: "sout",
    type: "function",
  }),
];
function extractVariables(code: string) {
  const vars = new Set<string>();

  // 🔥 1. bắt biến kiểu Java
  const varRegex = /\b(int|long|double|boolean|String)\s+([a-zA-Z_]\w*)/g;

  let match;
  while ((match = varRegex.exec(code))) {
    if (match && match[2]) {
      vars.add(match[2]);
    }
  }

  // 🔥 2. bắt biến trong function parameter
  const paramRegex = /\(([^)]*)\)/g;
  let paramMatch;

  while ((paramMatch = paramRegex.exec(code))) {
    const params = paramMatch && paramMatch[1] ? paramMatch[1].split(",") : [];

    params.forEach(p => {
      const name = p.trim().split(" ").pop(); // lấy từ cuối cùng
      if (name && /^[a-zA-Z_]\w*$/.test(name)) {
        vars.add(name);
      }
    });
  }

  return Array.from(vars).map(v => ({
    label: v,
    type: "variable",
  }));
}
function customCompletionSource(context: CompletionContext) {
  // ===== DOT AUTOCOMPLETE =====
  const dotMatch = context.matchBefore(/\.\w*/);

  if (dotMatch) {
    const word = dotMatch.text.slice(1);

    return {
      from: dotMatch.from + 1,
      options: DOT_COMPLETIONS.filter(item =>
        item.label.toLowerCase().startsWith(word.toLowerCase())
      ),
      validFor: /^\w*$/,
    };
  }
  const wordMatch = context.matchBefore(/\w*/);
  const code = context.state.doc.toString();
  const variableCompletions = extractVariables(code);


  // 👉 KHÔNG có chữ → chỉ hiện khi Ctrl + Space
  if (!wordMatch) {
    if (!context.explicit) return null;

    return {
      from: context.pos,
      options: [
        ...SNIPPETS,
        ...GLOBAL_COMPLETIONS,
      ],
    };
  }

  const word = wordMatch.text.toLowerCase();

  const allOptions = [
    ...variableCompletions,
    ...SNIPPETS,
    ...GLOBAL_COMPLETIONS,
  ];

  const filtered = allOptions.filter(item =>
    item.label.toLowerCase().startsWith(word)
  );

  // ❗ không match → không hiện
  if (filtered.length === 0) return null;

  return {
    from: wordMatch.from,
    options: filtered,
    validFor: /^\w*$/,
  };
}
// ─── Editor Factory ──────────────────────────────────────────────────────────

let editorView: EditorView | null = null;
let onChangeCb: ((value: string) => void) | null = null;
const rainbowBrackets = ViewPlugin.fromClass(class {
  decorations;

  constructor(view: EditorView) {
    this.decorations = this.build(view);
  }

  update(update: any) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.build(update.view);
    }
  }

  build(view: EditorView) {
    const builder = new RangeSetBuilder<Decoration>();

    const colors = [
      "cm-bracket-1",
      "cm-bracket-2",
      "cm-bracket-3",
      "cm-bracket-4",
    ];

    const stack: string[] = [];

    for (let { from, to } of view.visibleRanges) {
      const text = view.state.doc.sliceString(from, to);

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const pos = from + i;

        if (char && "({[".includes(char)) {
          stack.push(char);
          const level = stack.length % colors.length;

          builder.add(pos, pos + 1, Decoration.mark({ class: colors[level] }));
        }

        else if (char && ")}]".includes(char)) {
          const level = stack.length % colors.length;

          builder.add(pos, pos + 1, Decoration.mark({ class: colors[level] }));

          stack.pop();
        }
      }
    }

    return builder.finish();
  }
}, {
  decorations: v => v.decorations
});
const javaSyntaxHighlight = ViewPlugin.fromClass(class {
  decorations;

  constructor(view: EditorView) {
    this.decorations = this.build(view);
  }

  update(update: any) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.build(update.view);
    }
  }

  build(view: EditorView) {
    const builder = new RangeSetBuilder<Decoration>();

    const regex = /\b(int|long|double|boolean|String|return|if|else|for|while|true|false)\b/g;

    for (let { from, to } of view.visibleRanges) {
      const text = view.state.doc.sliceString(from, to);

      let match;
      while ((match = regex.exec(text))) {
        const start = from + match.index;
        const end = start + match[0].length;

        let className = "cm-java-keyword";

        if (/^(int|long|double|boolean|String)$/.test(match[0])) {
          className = "cm-java-type";
        }

        builder.add(
          start,
          end,
          Decoration.mark({ class: className })
        );
      }
    }

    return builder.finish();
  }
}, {
  decorations: v => v.decorations
});
export function createCodeMirrorEditor(
  mountElement: HTMLElement,
  initialValue: string,
  onChange: (value: string) => void,
): EditorView {
  onChangeCb = onChange;

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged && onChangeCb) {
      onChangeCb(update.state.doc.toString());
    }
  });

  // F9 → format code
  const formatKeymap = keymap.of([
    {
      key: 'F9',
      run(view) {
        const raw = view.state.doc.toString();
        const formatted = simpleFormatCode(raw);
        if (formatted !== raw) {
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: formatted },
          });
        }
        return true;
      },
    },
  ]);

  // Auto de-indent khi gõ }
  const closingBraceKeymap = keymap.of([
    {
      key: '}',
      run(view) {
        const { state } = view;
        const { from } = state.selection.main;
        const line = state.doc.lineAt(from);
        const lineText = line.text;
        const beforeCursor = lineText.slice(0, from - line.from);

        // Nếu chỉ có whitespace trước cursor → de-indent rồi chèn }
        if (/^\s+$/.test(beforeCursor) && beforeCursor.length >= 2) {
          const newIndent = beforeCursor.slice(0, beforeCursor.length - 2);
          view.dispatch({
            changes: [
              { from: line.from, to: from, insert: newIndent + '}' },
            ],
            selection: { anchor: line.from + newIndent.length + 1 },
          });
          return true;
        }
        return false;
      },
    },
  ]);

  const state = EditorState.create({
    doc: initialValue,
    extensions: [
      rainbowBrackets,
      javaSyntaxHighlight,
      lineNumbers(),
      highlightActiveLineGutter(),
      foldGutter(),
      history(),
      drawSelection(),
      dropCursor(),
      indentOnInput(),
      bracketMatching(),
      highlightActiveLine(),
      syntaxHighlighting(defaultHighlightStyle),
      javascript(),
      autocompletion({
        override: [customCompletionSource],
        activateOnTyping: true,        // gợi ý ngay sau khi gõ "."
        closeOnBlur: true,
        maxRenderedOptions: 12,
      }),
      editorTheme,
      formatKeymap,
      closingBraceKeymap,
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...completionKeymap,            // Ctrl+Space để gợi ý thủ công
        indentWithTab,
      ]),
      updateListener,
      EditorView.lineWrapping,
    ],
  });

  if (editorView) {
    editorView.destroy();
  }

  editorView = new EditorView({ state, parent: mountElement });
  return editorView;
}

export function setEditorValue(view: EditorView, value: string): void {
  const current = view.state.doc.toString();
  if (current === value) return;
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: value },
  });
}

export function getEditorValue(view: EditorView): string {
  return view.state.doc.toString();
}
