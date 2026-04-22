/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONTEXT-AWARE SUGGESTION ENGINE
 * ─────────────────────────────────────────────────────────────────────────
 * A smart, lesson-aware autocomplete system for the Monaco Editor.
 *
 * Unlike the static Java IntelliSense provider, this module provides:
 *   1. Context-aware filtering — only relevant suggestions for what you're
 *      currently typing (not a dump of every keyword).
 *   2. Lesson-aware patterns — if the student is on "reverse array", it
 *      suggests two-pointer idioms; on "bubble sort", swap patterns, etc.
 *   3. Live variable detection — scans the document for user-declared vars
 *      and surfaces them (with `.length`, `[i]` member completions).
 *   4. Array-member dot completions — typing `arr.` suggests `.length`,
 *      `[i]`, etc.
 *
 * Exported API:
 *   registerSuggestions()        — call once to register the provider
 *   setActiveLessonId(id)        — call whenever the active lesson changes
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as monaco from 'monaco-editor';

// ── State: the currently active lesson (set by bootstrap) ───────────────
let activeLessonId = '';

/** Call this from bootstrap.ts whenever the lesson changes. */
export function setActiveLessonId(id: string): void {
  activeLessonId = id;
}

// ─────────────────────────────────────────────────────────────────────────
// SNIPPET CATALOG — grouped by category for context filtering
// ─────────────────────────────────────────────────────────────────────────

interface Snippet {
  label: string;
  detail: string;
  documentation: string;
  insertText: string;
  kind: monaco.languages.CompletionItemKind;
  /** Optional: only show when these keywords appear in the current line */
  lineContexts?: string[];
  /** Optional: only show for these lesson IDs */
  lessonIds?: string[];
  /** Sorting priority — lower = higher in list. Default 10. */
  sortPriority?: number;
}

const SNIPPETS: Snippet[] = [
  // ── Loops ─────────────────────────────────────────────────────────────
  {
    label: 'for',
    detail: 'for loop',
    documentation: 'Standard counted for loop',
    insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    lineContexts: ['for'],
  },
  {
    label: 'fori',
    detail: 'for (int i …)',
    documentation: 'Index-based for loop over an array',
    insertText: 'for (int i = 0; i < ${1:arr}.length; i++) {\n\t$0\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    lineContexts: ['for'],
  },
  {
    label: 'foreach',
    detail: 'enhanced for-each',
    documentation: 'Iterate over a collection with for-each',
    insertText: 'for (${1:int} ${2:item} : ${3:array}) {\n\t$0\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    label: 'while',
    detail: 'while loop',
    documentation: 'While loop with condition',
    insertText: 'while (${1:condition}) {\n\t$0\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    label: 'dowhile',
    detail: 'do-while loop',
    documentation: 'Post-condition loop',
    insertText: 'do {\n\t$0\n} while (${1:condition});',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },

  // ── Conditionals ──────────────────────────────────────────────────────
  {
    label: 'if',
    detail: 'if statement',
    documentation: 'Basic conditional branch',
    insertText: 'if (${1:condition}) {\n\t$0\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    lineContexts: ['if'],
  },
  {
    label: 'ifelse',
    detail: 'if-else',
    documentation: 'Conditional with else branch',
    insertText: 'if (${1:condition}) {\n\t$0\n} else {\n\t$2\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    lineContexts: ['if', 'else'],
  },
  {
    label: 'switch',
    detail: 'switch block',
    documentation: 'Multi-way branch statement',
    insertText: 'switch (${1:variable}) {\n\tcase ${2:value}:\n\t\t$0\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },

  // ── OOP & structure ───────────────────────────────────────────────────
  {
    label: 'sout',
    detail: 'System.out.println()',
    documentation: 'Print to standard output',
    insertText: 'System.out.println(${1});',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    label: 'main',
    detail: 'main method',
    documentation: 'Java main entry point',
    insertText: 'public static void main(String[] args) {\n\t$0\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    label: 'class',
    detail: 'class definition',
    documentation: 'Declare a new class',
    insertText: 'public class ${1:ClassName} {\n\t$0\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    label: 'method',
    detail: 'method definition',
    documentation: 'Declare a method',
    insertText: 'public ${1:void} ${2:methodName}(${3}) {\n\t$0\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    label: 'trycatch',
    detail: 'try-catch block',
    documentation: 'Exception handling boilerplate',
    insertText: 'try {\n\t$0\n} catch (${1:Exception} e) {\n\te.printStackTrace();\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },

  // ── Algorithm patterns ────────────────────────────────────────────────
  {
    label: 'binarySearch',
    detail: 'binary search template',
    documentation: 'Classic O(log n) search on a sorted array',
    insertText:
      'int left = 0;\nint right = ${1:arr}.length - 1;\n\nwhile (left <= right) {\n\tint mid = left + (right - left) / 2;\n\tif (${1:arr}[mid] == ${2:target}) {\n\t\treturn mid;\n\t}\n\tif (${1:arr}[mid] < ${2:target}) {\n\t\tleft = mid + 1;\n\t} else {\n\t\tright = mid - 1;\n\t}\n}\nreturn -1;',
    kind: monaco.languages.CompletionItemKind.Snippet,
    sortPriority: 2,
  },
  {
    label: 'traverse',
    detail: 'array traversal',
    documentation: 'Walk through an array with index i',
    insertText: 'i = 0;\nwhile (i < ${1:arr}.length) {\n\t$0\n\ti = i + 1;\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    sortPriority: 2,
  },
  {
    label: 'swap',
    detail: 'swap two elements',
    documentation: 'Swap arr[i] and arr[j]',
    insertText: 'swap(${1:arr}, ${2:i}, ${3:j});',
    kind: monaco.languages.CompletionItemKind.Snippet,
    sortPriority: 3,
  },

  // ── Lesson-specific suggestions ───────────────────────────────────────
  // Two-pointer patterns (reverse, palindrome, etc.)
  {
    label: 'twoPointers',
    detail: '← i … j → two-pointer pattern',
    documentation: 'Initialize two pointers converging from both ends',
    insertText: 'i = 0;\nj = ${1:arr}.length - 1;\n\nwhile (i < j) {\n\t$0\n\ti = i + 1;\n\tj = j - 1;\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    lessonIds: ['array-reverse'],
    sortPriority: 1,
  },
  {
    label: 'bubblePass',
    detail: 'bubble sort inner loop',
    documentation: 'One full pass of bubble sort',
    insertText: 'j = 0;\nwhile (j < ${1:arr}.length - 1 - i) {\n\tif (${1:arr}[j] > ${1:arr}[j + 1]) {\n\t\tswap(${1:arr}, j, j + 1);\n\t}\n\tj = j + 1;\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    lessonIds: ['array-bubble-sort'],
    sortPriority: 1,
  },
  {
    label: 'findMax',
    detail: 'track maximum value',
    documentation: 'Scan and remember the largest element',
    insertText: 'max = ${1:arr}[0];\ni = 1;\nwhile (i < ${1:arr}.length) {\n\tif (${1:arr}[i] > max) {\n\t\tmax = ${1:arr}[i];\n\t}\n\ti = i + 1;\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    lessonIds: ['array-find-max'],
    sortPriority: 1,
  },
  {
    label: 'linearSearch',
    detail: 'indexOf / linear search',
    documentation: 'Find the first occurrence of a target',
    insertText: 'answer = -1;\ni = 0;\nwhile (i < ${1:arr}.length) {\n\tif (${1:arr}[i] == ${2:target}) {\n\t\tanswer = i;\n\t\tbreak;\n\t}\n\ti = i + 1;\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    lessonIds: ['array-index-of'],
    sortPriority: 1,
  },
  {
    label: 'counter',
    detail: 'count occurrences',
    documentation: 'Count how many times a value appears',
    insertText: 'count = 0;\ni = 0;\nwhile (i < ${1:arr}.length) {\n\tif (${1:arr}[i] == ${2:target}) {\n\t\tcount = count + 1;\n\t}\n\ti = i + 1;\n}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    lessonIds: ['array-count-occurrences'],
    sortPriority: 1,
  },
];

// ── Common Java keywords ────────────────────────────────────────────────
const KEYWORDS = [
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'if', 'implements', 'import',
  'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package',
  'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
  'try', 'void', 'volatile', 'while', 'true', 'false', 'null',
];

// ── Dot-completions for known objects ───────────────────────────────────
const DOT_MEMBERS: Record<string, { label: string; insert: string; kind: monaco.languages.CompletionItemKind; doc: string }[]> = {
  'System': [
    { label: 'out', insert: 'out', kind: monaco.languages.CompletionItemKind.Property, doc: 'Standard output stream' },
    { label: 'err', insert: 'err', kind: monaco.languages.CompletionItemKind.Property, doc: 'Standard error stream' },
    { label: 'in', insert: 'in', kind: monaco.languages.CompletionItemKind.Property, doc: 'Standard input stream' },
  ],
  'System.out': [
    { label: 'println', insert: 'println(${1});', kind: monaco.languages.CompletionItemKind.Method, doc: 'Print with newline' },
    { label: 'print', insert: 'print(${1});', kind: monaco.languages.CompletionItemKind.Method, doc: 'Print without newline' },
  ],
  'Math': [
    { label: 'max', insert: 'max(${1}, ${2})', kind: monaco.languages.CompletionItemKind.Method, doc: 'Returns the greater of two values' },
    { label: 'min', insert: 'min(${1}, ${2})', kind: monaco.languages.CompletionItemKind.Method, doc: 'Returns the lesser of two values' },
    { label: 'abs', insert: 'abs(${1})', kind: monaco.languages.CompletionItemKind.Method, doc: 'Absolute value' },
    { label: 'sqrt', insert: 'sqrt(${1})', kind: monaco.languages.CompletionItemKind.Method, doc: 'Square root' },
    { label: 'random', insert: 'random()', kind: monaco.languages.CompletionItemKind.Method, doc: 'Random number in [0, 1)' },
    { label: 'pow', insert: 'pow(${1}, ${2})', kind: monaco.languages.CompletionItemKind.Method, doc: 'Raise base to exponent' },
    { label: 'PI', insert: 'PI', kind: monaco.languages.CompletionItemKind.Constant, doc: '3.14159…' },
    { label: 'E', insert: 'E', kind: monaco.languages.CompletionItemKind.Constant, doc: "Euler's number" },
  ],
};

// ── Array-member dot-completions (for any detected array variable) ─────
const ARRAY_DOT_MEMBERS = [
  { label: 'length', insert: 'length', kind: monaco.languages.CompletionItemKind.Property, doc: 'Number of elements in the array' },
];

const ARRAY_GLOBAL_PATTERNS = [
  { label: '[i]', insert: '[${1:i}]', kind: monaco.languages.CompletionItemKind.Operator, doc: 'Access element at index i' },
  { label: '.length', insert: '.length', kind: monaco.languages.CompletionItemKind.Property, doc: 'Array length' },
];

// ─────────────────────────────────────────────────────────────────────────
// VARIABLE & METHOD EXTRACTION
// ─────────────────────────────────────────────────────────────────────────

function extractSymbols(text: string) {
  const vars = new Set<string>();
  const arrays = new Set<string>();
  const methods = new Set<string>();

  // Typed declarations: int x = …; String s = …;
  const typedVarRe = /\b(?:int|double|float|long|boolean|String|char|var)\b(?:\s*\[\])?\s+([A-Za-z_]\w*)/g;
  let m;
  while ((m = typedVarRe.exec(text)) !== null) {
    if (m[1] && !KEYWORDS.includes(m[1])) vars.add(m[1]);
  }

  // Untyped assignments (pseudocode style): name = value;
  const untypedRe = /^[ \t]*([A-Za-z_]\w*)\s*=\s*/gm;
  while ((m = untypedRe.exec(text)) !== null) {
    if (m[1] && !KEYWORDS.includes(m[1])) vars.add(m[1]);
  }

  // Detect which variables hold arrays (assigned to [...] or used with [])
  const arrayLiteralRe = /([A-Za-z_]\w*)\s*=\s*\[/g;
  while ((m = arrayLiteralRe.exec(text)) !== null) {
    if (m[1]) arrays.add(m[1]);
  }
  const arrayAccessRe = /([A-Za-z_]\w*)\[/g;
  while ((m = arrayAccessRe.exec(text)) !== null) {
    if (m[1] && m[1] !== 'if' && m[1] !== 'while' && m[1] !== 'for') arrays.add(m[1]);
  }

  // Method definitions
  const methodRe = /\b(?:public|private|protected)?\s*(?:static\s+)?(?:\w+)\s+([A-Za-z_]\w*)\s*\(/g;
  while ((m = methodRe.exec(text)) !== null) {
    if (m[1] && !KEYWORDS.includes(m[1]) && m[1] !== 'main') methods.add(m[1]);
  }

  return { vars: Array.from(vars), arrays: Array.from(arrays), methods: Array.from(methods) };
}

// ─────────────────────────────────────────────────────────────────────────
// THE PROVIDER
// ─────────────────────────────────────────────────────────────────────────

export function registerSuggestions(): void {
  monaco.languages.registerCompletionItemProvider('java', {
    triggerCharacters: [
      '.', ' ', '(',
      'a','b','c','d','e','f','g','h','i','j','k','l','m',
      'n','o','p','q','r','s','t','u','v','w','x','y','z',
    ],

    provideCompletionItems(model, position) {
      const textBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const word = model.getWordUntilPosition(position);
      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const fullText = model.getValue();
      const suggestions: monaco.languages.CompletionItem[] = [];

      // ── 1. DOT COMPLETIONS ──────────────────────────────────────────
      // If the character immediately before the cursor word is '.', parse
      // the expression before the dot and return targeted suggestions.
      if (textBeforeCursor.trimEnd().endsWith('.') || /\.\w*$/.test(textBeforeCursor)) {
        const dotMatch = textBeforeCursor.match(/(\w+(?:\.\w+)*)\.\w*$/);
        if (dotMatch && dotMatch[1]) {
          const expr = dotMatch[1];

          // Known library object?
          const members = DOT_MEMBERS[expr];
          if (members) {
            members.forEach((member) => {
              suggestions.push({
                label: member.label,
                kind: member.kind,
                documentation: member.doc,
                insertText: member.insert,
                insertTextRules: member.insert.includes('$')
                  ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                  : undefined,
                range,
                sortText: '0' + member.label,
              });
            });
            return { suggestions };
          }

          // Is it a user-declared array? → suggest .length
          const { arrays } = extractSymbols(fullText);
          if (arrays.includes(expr)) {
            ARRAY_DOT_MEMBERS.forEach(member => {
              suggestions.push({
                label: member.label,
                kind: member.kind,
                documentation: member.doc,
                insertText: member.insert,
                range,
                sortText: '0' + member.label,
              });
            });
            return { suggestions };
          }
        }
      }

      // ── 2. "new " CONTEXT ──────────────────────────────────────────
      if (/\bnew\s+\w*$/.test(textBeforeCursor)) {
        ['ArrayList', 'HashMap', 'Scanner', 'StringBuilder'].forEach(cls => {
          suggestions.push({
            label: cls,
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: `Create a new ${cls}`,
            insertText: cls + '(${1})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            sortText: '0' + cls,
          });
        });
        return { suggestions };
      }

      // ── 3. CONTEXT-AWARE SNIPPETS ───────────────────────────────────
      // Score each snippet for relevance. Show lesson-specific ones first,
      // then contextually relevant ones, then the rest.
      const lineLower = textBeforeCursor.toLowerCase().trim();

      SNIPPETS.forEach(snip => {
        // If this snippet is lesson-locked, skip it unless the lesson matches
        if (snip.lessonIds && snip.lessonIds.length > 0) {
          if (!snip.lessonIds.includes(activeLessonId)) return;
        }

        // If line-context filters are set, only show if line text matches
        if (snip.lineContexts && snip.lineContexts.length > 0) {
          if (!snip.lineContexts.some(ctx => lineLower.includes(ctx))) return;
        }

        const priority = snip.sortPriority ?? 10;
        suggestions.push({
          label: snip.label,
          kind: snip.kind,
          detail: snip.detail,
          documentation: snip.documentation,
          insertText: snip.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          sortText: String(priority).padStart(2, '0') + snip.label,
        });
      });

      // ── 4. DETECTED VARIABLES ────────────────────────────────────────
      const { vars, arrays, methods } = extractSymbols(fullText);

      // ── 4.1 ARRAY-SPECIFIC GLOBAL SUGGESTIONS ───────────────────────
      // If the user just typed an array name, suggest common access patterns
      arrays.forEach(arrName => {
        if (textBeforeCursor.trim().endsWith(arrName)) {
           ARRAY_GLOBAL_PATTERNS.forEach(pattern => {
             suggestions.push({
               label: arrName + pattern.label,
               kind: pattern.kind,
               documentation: pattern.doc,
               insertText: pattern.insert,
               insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
               range,
               sortText: '00' + arrName + pattern.label,
             });
           });
        }
      });

      vars.forEach(v => {
        suggestions.push({
          label: v,
          kind: monaco.languages.CompletionItemKind.Variable,
          detail: 'local variable',
          insertText: v,
          range,
          sortText: '05' + v,
        });
      });

      methods.forEach(fn => {
        suggestions.push({
          label: fn,
          kind: monaco.languages.CompletionItemKind.Function,
          detail: 'user function',
          insertText: fn + '(${1})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          sortText: '06' + fn,
        });
      });

      // ── 5. KEYWORDS (lowest priority) ────────────────────────────────
      KEYWORDS.forEach(kw => {
        suggestions.push({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
          sortText: '99' + kw,
        });
      });

      // ── 6. COMMON CLASSES ────────────────────────────────────────────
      ['System', 'String', 'Math', 'Integer', 'Double', 'ArrayList', 'HashMap', 'Scanner'].forEach(cls => {
        suggestions.push({
          label: cls,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: cls,
          range,
          sortText: '50' + cls,
        });
      });

      return { suggestions };
    },
  });
}
