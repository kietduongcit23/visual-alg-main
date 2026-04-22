import * as monaco from 'monaco-editor';

console.log("EDITOR ACTIVE");

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

const getLabel = (label: string | monaco.languages.CompletionItemLabel): string => {
  return typeof label === 'string' ? label : label.label;
};

const JAVA_KEYWORDS = [
  'public', 'private', 'protected', 'static', 'final', 'void', 'class', 'interface', 'enum',
  'int', 'double', 'float', 'long', 'boolean', 'char', 'byte', 'short', 'String',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return',
  'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'throws', 'instanceof', 'synchronized'
];

const JAVA_SNIPPETS = [
  {
    label: "fori",
    detail: "for loop",
    documentation: "Standard index-based for loop",
    insertText: "for (int i = 0; i < ${1:n}; i++) {\n\t$0\n}",
  },
  {
    label: "foreach",
    detail: "enhanced for loop",
    documentation: "Iterate over an array or collection",
    insertText: "for (${1:int} ${2:item} : ${3:array}) {\n\t$0\n}",
  },
  {
    label: "if",
    detail: "if statement",
    documentation: "Simple conditional block",
    insertText: "if (${1:condition}) {\n\t$0\n}",
  },
  {
    label: "ifelse",
    detail: "if-else statement",
    documentation: "Conditional block with fallback",
    insertText: "if (${1:condition}) {\n\t$0\n} else {\n\t$2\n}",
  },
  {
    label: "while",
    detail: "while loop",
    documentation: "Condition-based loop",
    insertText: "while (${1:condition}) {\n\t$0\n}",
  },
  {
    label: "dowhile",
    detail: "do-while loop",
    documentation: "Post-condition loop",
    insertText: "do {\n\t$0\n} while (${1:condition});",
  },
  {
    label: "switch",
    detail: "switch block",
    documentation: "Multi-way branch statement",
    insertText: "switch (${1:var}) {\n\tcase ${2:value}:\n\t\t$0\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}",
  },
  {
    label: "main",
    detail: "main method",
    documentation: "Standard Java entry point",
    insertText: "public static void main(String[] args) {\n\t$0\n}",
  },
  {
    label: "class",
    detail: "class template",
    documentation: "Declare a new Java class",
    insertText: "public class ${1:ClassName} {\n\t$0\n}",
  },
  {
    label: "sout",
    detail: "println",
    documentation: "System.out.println()",
    insertText: "System.out.println(${1});",
  },
  {
    label: "try",
    detail: "try-catch",
    documentation: "Exception handling block",
    insertText: "try {\n\t$0\n} catch (${1:Exception} e) {\n\te.printStackTrace();\n}",
  }
];

const MATH_METHODS = [
  { 
    label: 'round', 
    detail: 'Math.round(double a)',
    kind: monaco.languages.CompletionItemKind.Method, 
    insertText: 'round(${1:x})', 
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet 
  },
  { label: 'sqrt', kind: monaco.languages.CompletionItemKind.Method, insertText: 'sqrt(${1:x})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
  { label: 'pow', kind: monaco.languages.CompletionItemKind.Method, insertText: 'pow(${1:a}, ${2:b})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
  { label: 'abs', kind: monaco.languages.CompletionItemKind.Method, insertText: 'abs(${1:x})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
  { label: 'max', kind: monaco.languages.CompletionItemKind.Method, insertText: 'max(${1:a}, ${2:b})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
  { label: 'min', kind: monaco.languages.CompletionItemKind.Method, insertText: 'min(${1:a}, ${2:b})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
  { label: 'random', kind: monaco.languages.CompletionItemKind.Method, insertText: 'random()' },
  { label: 'floor', kind: monaco.languages.CompletionItemKind.Method, insertText: 'floor(${1:x})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
  { label: 'ceil', kind: monaco.languages.CompletionItemKind.Method, insertText: 'ceil(${1:x})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet }
];

const SYSTEM_OUT_METHODS = [
  { label: 'println', kind: monaco.languages.CompletionItemKind.Method, insertText: 'println(${1});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Print with newline' },
  { label: 'print', kind: monaco.languages.CompletionItemKind.Method, insertText: 'print(${1});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Print without newline' },
];

const SYSTEM_PROPERTIES = [
  { label: 'out', kind: monaco.languages.CompletionItemKind.Property, insertText: 'out', documentation: 'Standard output stream' },
  { label: 'err', kind: monaco.languages.CompletionItemKind.Property, insertText: 'err', documentation: 'Standard error stream' },
];

// Register Java IntelliSense
monaco.languages.registerCompletionItemProvider('java', {
  triggerCharacters: ['.'],
  provideCompletionItems: (model, position) => {
    const lineContent = model.getLineContent(position.lineNumber);
    const textUntilCursor = lineContent.substring(0, position.column);
    
    const word = model.getWordUntilPosition(position);
    const prefix = word.word.toLowerCase();
    
    // Rule: Empty prefix = no suggestions (unless it's a trigger character like dot)
    if (!prefix && !textUntilCursor.endsWith('.')) {
      return { suggestions: [] };
    }

    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    };

    // ─── CONTEXT: System.out. ───────────────────────────────────────────
    if (textUntilCursor.includes('System.out.')) {
      const filtered = SYSTEM_OUT_METHODS
        .filter(m => getLabel(m.label).toLowerCase().includes(prefix))
        .map(m => ({
          ...m,
          range,
          sortText: "0_" + getLabel(m.label),
          preselect: getLabel(m.label).toLowerCase() === prefix
        }));
      return { suggestions: filtered };
    }

    // ─── CONTEXT: System. ───────────────────────────────────────────────
    if (textUntilCursor.includes('System.')) {
      const filtered = SYSTEM_PROPERTIES
        .filter(p => getLabel(p.label).toLowerCase().includes(prefix))
        .map(p => ({
          ...p,
          range,
          sortText: "0_" + getLabel(p.label),
          preselect: getLabel(p.label).toLowerCase() === prefix
        }));
      return { suggestions: filtered };
    }

    // ─── CONTEXT: Math. ─────────────────────────────────────────────────
    const mathMatch = textUntilCursor.match(/Math\.\w*$/);
    if (mathMatch) {
      const filtered = MATH_METHODS
        .filter(m => getLabel(m.label).toLowerCase().includes(prefix))
        .map(m => ({
          ...m,
          range,
          sortText: "0_" + getLabel(m.label),
          preselect: getLabel(m.label).toLowerCase() === prefix
        }));
      return { suggestions: filtered.slice(0, 5) };
    }

    // ─── GLOBAL SUGGESTIONS ──────────────────────────────────────────────
    const suggestions: monaco.languages.CompletionItem[] = [
      ...JAVA_KEYWORDS.map(kw => ({
        label: kw,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: kw,
        range,
        sortText: "2_" + kw
      })),
      ...JAVA_SNIPPETS.map(s => ({
        label: s.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: s.detail,
        documentation: s.documentation,
        insertText: s.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        sortText: "0_" + s.label // Snippets first
      })),
      { label: 'Math', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Math', range, sortText: "1_Math" },
      { label: 'System', kind: monaco.languages.CompletionItemKind.Class, insertText: 'System', range, sortText: "1_System" },
      { label: 'String', kind: monaco.languages.CompletionItemKind.Class, insertText: 'String', range, sortText: "1_String" },
      { label: 'Integer', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Integer', range, sortText: "1_Integer" },
      { label: 'Double', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Double', range, sortText: "1_Double" },
    ];

    // Smart filtering & Scoring
    const scored = suggestions
      .map(item => {
        const labelStr = getLabel(item.label).toLowerCase();
        let score = 0;
        if (labelStr === prefix) score = 4;
        else if (labelStr.startsWith(prefix)) score = 3;
        else if (labelStr.includes(prefix)) score = 2;
        
        return { item, score };
      })
      .filter(entry => entry.score > 0);

    // Sorting like VS Code
    const sorted = scored.sort((a, b) => {
      // 1. By match score (exact match first)
      if (b.score !== a.score) return b.score - a.score;
      
      // 2. By sortText (0_ for snippets, 1_ for classes, 2_ for keywords)
      if (a.item.sortText && b.item.sortText) {
        if (a.item.sortText !== b.item.sortText) {
          return a.item.sortText.localeCompare(b.item.sortText);
        }
      }

      // 3. By length
      return getLabel(a.item.label).length - getLabel(b.item.label).length;
    });

    // Final mapping and preselection
    const finalSuggestions = sorted.slice(0, 5).map((entry, index) => ({
      ...entry.item,
      preselect: index === 0 // Preselect the best match
    }));

    return { suggestions: finalSuggestions };
  }
});

export async function createMonacoEditor(
  mountElement: HTMLElement,
  initialValue: string,
  onChange: (value: string) => void,
): Promise<monaco.editor.IStandaloneCodeEditor> {
  const isDark = document.documentElement.dataset.theme !== 'light';

  editorInstance = monaco.editor.create(mountElement, {
    value: initialValue,
    language: 'java',
    theme: isDark ? 'vs-dark' : 'vs',
    fontSize: 14,
    fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    
    // Auto-suggestion settings
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true
    },
    suggestOnTriggerCharacters: true,
    tabCompletion: "on",
    acceptSuggestionOnEnter: "on",
    wordBasedSuggestions: "allDocuments",
    snippetSuggestions: 'top',
    
    // Smoothness
    cursorSmoothCaretAnimation: 'on',
    cursorBlinking: 'smooth',
    smoothScrolling: true,
  });

  editorInstance.onDidChangeModelContent(() => {
    onChange(editorInstance?.getValue() || '');
  });

  // Smart auto-trigger: only on letters and dots
  editorInstance.onKeyUp((e) => {
    if (/^[a-zA-Z.]$/.test(e.browserEvent.key)) {
      editorInstance?.trigger('keyboard', 'editor.action.triggerSuggest', {});
    }
  });

  return editorInstance;
}

export function setMonacoValue(value: string): void {
  if (editorInstance && editorInstance.getValue() !== value) {
    editorInstance.setValue(value);
  }
}

export function getMonacoValue(): string {
  return editorInstance?.getValue() || '';
}

export function updateMonacoTheme(theme: 'light' | 'dark'): void {
  const monacoTheme = theme === 'light' ? 'vs' : 'vs-dark';
  monaco.editor.setTheme(monacoTheme);
}

export function setMonacoReadOnly(isReadOnly: boolean): void {
  editorInstance?.updateOptions({ readOnly: isReadOnly });
}

export function disposeMonaco(): void {
  editorInstance?.dispose();
  editorInstance = null;
}
