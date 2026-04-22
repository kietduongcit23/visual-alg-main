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

type JavaType = 'array' | 'string' | 'number' | 'boolean' | 'object' | 'unknown';

interface UserSymbol {
  name: string;
  type: JavaType;
}

const extractUserSymbols = (code: string): UserSymbol[] => {
  const symbols = new Map<string, JavaType>();
  let match;

  // 1. Standard Variables, Arrays & Objects (e.g. int x, String[] names, int arr[])
  const varRegex = /\b([A-Z][A-Za-z0-9_]*|int|double|float|long|boolean|char|String)(?:\[\])?\s+([A-Za-z_]\w*)(?:\[\])?\b/g;
  while ((match = varRegex.exec(code)) !== null) {
    const typeStr = match[1];
    const name = match[2];
    if (name && !JAVA_KEYWORDS.includes(name)) {
      let type: JavaType = 'unknown';
      if (match[0].includes('[]')) type = 'array';
      else if (typeStr === 'String') type = 'string';
      else if (['int', 'double', 'float', 'long', 'char'].includes(typeStr || '')) type = 'number';
      else if (typeStr === 'boolean') type = 'boolean';
      else if (typeStr && typeStr.length > 0 && typeStr.charAt(0) === typeStr.charAt(0).toUpperCase()) type = 'object';
      
      symbols.set(name, type);
    }
  }

  // 2. Loop Variables (e.g. for (int i = 0; ...))
  const loopRegex = /\bfor\s*\(\s*(?:int|long|var)\s+([A-Za-z_]\w*)\b/g;
  while ((match = loopRegex.exec(code)) !== null) {
    const name = match[1];
    if (name && !JAVA_KEYWORDS.includes(name)) {
      symbols.set(name, 'number');
    }
  }

  // 3. Method Parameters (e.g. public void test(int a, String b))
  const paramRegex = /\(([^)]*)\)/g;
  while ((match = paramRegex.exec(code)) !== null) {
    const content = match[1];
    if (content && content.includes(' ')) {
      const params = content.split(',');
      params.forEach(p => {
        const parts = p.trim().split(/\s+/);
        if (parts.length >= 2) {
          const typeStr = parts[0];
          const name = parts[parts.length - 1]?.replace(/\[\]$/, '');
          if (name && /^[A-Za-z_]\w*$/.test(name) && !JAVA_KEYWORDS.includes(name)) {
            let type: JavaType = 'unknown';
            if (p.includes('[]')) type = 'array';
            else if (typeStr === 'String') type = 'string';
            else if (['int', 'double', 'float', 'long', 'char'].includes(typeStr || '')) type = 'number';
            
            symbols.set(name, type);
          }
        }
      });
    }
  }

  return Array.from(symbols.entries()).map(([name, type]) => ({ name, type }));
};

const TYPE_METHODS: Record<string, { label: string; kind: monaco.languages.CompletionItemKind; insertText: string; detail?: string }[]> = {
  array: [
    { label: 'length', kind: monaco.languages.CompletionItemKind.Property, insertText: 'length', detail: 'Array length' },
    { label: 'clone()', kind: monaco.languages.CompletionItemKind.Method, insertText: 'clone()', detail: 'Clone array' },
    { label: 'toString()', kind: monaco.languages.CompletionItemKind.Method, insertText: 'toString()', detail: 'Convert to string' },
    { label: 'equals(Object obj)', kind: monaco.languages.CompletionItemKind.Method, insertText: 'equals(${1:obj})', detail: 'Compare arrays' },
  ],
  string: [
    { label: 'length()', kind: monaco.languages.CompletionItemKind.Method, insertText: 'length()', detail: 'String length' },
    { label: 'charAt(int index)', kind: monaco.languages.CompletionItemKind.Method, insertText: 'charAt(${1:0})', detail: 'Character at index' },
    { label: 'substring(int start)', kind: monaco.languages.CompletionItemKind.Method, insertText: 'substring(${1:0})', detail: 'Extract substring' },
    { label: 'toLowerCase()', kind: monaco.languages.CompletionItemKind.Method, insertText: 'toLowerCase()', detail: 'Convert to lower case' },
    { label: 'toUpperCase()', kind: monaco.languages.CompletionItemKind.Method, insertText: 'toUpperCase()', detail: 'Convert to upper case' },
  ]
};

// Register Java IntelliSense
monaco.languages.registerCompletionItemProvider('java', {
  triggerCharacters: ['.'],
  provideCompletionItems: (model, position) => {
    const lineContent = model.getLineContent(position.lineNumber);
    const textUntilCursor = lineContent.substring(0, position.column);
    
    const word = model.getWordUntilPosition(position);
    const prefix = (word.word || "").toLowerCase();
    
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    };

    // ─── DOT COMPLETION ENGINE ──────────────────────────────────────────
    const textUntilPosition = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    });

    const dotMatch = textUntilPosition.match(/(\w+(?:\[\d+\])?)\.(\w*)$/);
    if (dotMatch) {
      const varName = dotMatch[1]?.replace(/\[\d+\]$/, '');
      const currentDotPrefix = (dotMatch[2] || "").toLowerCase();
      const userSymbols = extractUserSymbols(model.getValue());
      const symbol = userSymbols.find(s => s.name === varName);
      const dotSuggestions: monaco.languages.CompletionItem[] = [];

      // 1. Context: System.out.
      if (textUntilCursor.includes('System.out.')) {
        SYSTEM_OUT_METHODS.forEach(m => dotSuggestions.push({ ...m, range, sortText: "0_" + getLabel(m.label) }));
      }
      // 2. Context: System.
      else if (textUntilCursor.includes('System.')) {
        SYSTEM_PROPERTIES.forEach(p => dotSuggestions.push({ ...p, range, sortText: "0_" + getLabel(p.label) }));
      }
      // 3. Context: Math.
      else if (textUntilCursor.match(/Math\.\w*$/)) {
        MATH_METHODS.forEach(m => dotSuggestions.push({ ...m, range, sortText: "0_" + getLabel(m.label) }));
      }
      // 4. Context: Type-aware methods
      else if (symbol && TYPE_METHODS[symbol.type]) {
        TYPE_METHODS[symbol.type]?.forEach(m => dotSuggestions.push({
          ...m,
          range,
          insertTextRules: m.insertText.includes('$') ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
          sortText: "0_" + m.label
        }));
      }

      // Fuzzy matching for dot context
      const scoredDot = dotSuggestions.map(item => {
        const labelStr = getLabel(item.label).toLowerCase();
        let score = 0;
        if (!currentDotPrefix) score = 1;
        else if (labelStr === currentDotPrefix) score = 5;
        else if (labelStr.startsWith(currentDotPrefix)) score = 4;
        else if (labelStr.includes(currentDotPrefix)) score = 3;
        else {
          // Fuzzy match
          let i = 0;
          for (const char of labelStr) {
            if (char === currentDotPrefix[i]) i++;
            if (i === currentDotPrefix.length) { score = 2; break; }
          }
        }
        return { item, score };
      }).filter(e => e.score > 0);

      // Fallback: If no matches, show all available for this context
      const finalDot = scoredDot.length > 0 ? scoredDot : dotSuggestions.map(item => ({ item, score: 1 }));

      const sortedDot = finalDot.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return getLabel(a.item.label).localeCompare(getLabel(b.item.label));
      });
      
      return { suggestions: sortedDot.slice(0, 5).map((e, i) => ({ ...e.item, preselect: i === 0 })) };
    }

    // ─── GLOBAL SUGGESTIONS ──────────────────────────────────────────────
    const userSymbols = extractUserSymbols(model.getValue());
    
    const suggestions: monaco.languages.CompletionItem[] = [
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
      ...userSymbols.map(s => ({
        label: s.name,
        kind: s.type === 'array' ? monaco.languages.CompletionItemKind.Field : monaco.languages.CompletionItemKind.Variable,
        detail: s.type,
        insertText: s.name,
        range,
        sortText: "1_" + s.name // Variables second
      })),
      ...JAVA_KEYWORDS.map(kw => ({
        label: kw,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: kw,
        range,
        sortText: "3_" + kw // Keywords last
      })),
      { label: 'Math', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Math', range, sortText: "2_Math" },
      { label: 'System', kind: monaco.languages.CompletionItemKind.Class, insertText: 'System', range, sortText: "2_System" },
      { label: 'String', kind: monaco.languages.CompletionItemKind.Class, insertText: 'String', range, sortText: "2_String" },
      { label: 'Integer', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Integer', range, sortText: "2_Integer" },
      { label: 'Double', kind: monaco.languages.CompletionItemKind.Class, insertText: 'Double', range, sortText: "2_Double" },
    ];

    // Scoring and Filtering
    const scored = suggestions
      .map(item => {
        const labelStr = getLabel(item.label).toLowerCase();
        let score = 0;
        if (!prefix) score = 1;
        else if (labelStr === prefix) score = 5;
        else if (labelStr.startsWith(prefix)) score = 4;
        else if (labelStr.includes(prefix)) score = 3;
        else {
          // Fuzzy match
          let i = 0;
          for (const char of labelStr) {
            if (char === prefix[i]) i++;
            if (i === prefix.length) { score = 2; break; }
          }
        }
        return { item, score };
      })
      .filter(entry => entry.score > 0);

    // Fallback: If no matches, show default set instead of empty
    const finalSet = scored.length > 0 ? scored : suggestions.map(item => ({ item, score: 1 }));

    const sorted = finalSet.sort((a, b) => {
      // 1. By match score (fuzzy/exact match)
      if (b.score !== a.score) return b.score - a.score;
      
      // 2. By sortText (Snippets > Variables > Classes > Keywords)
      if (a.item.sortText && b.item.sortText) {
        if (a.item.sortText !== b.item.sortText) {
          return a.item.sortText.localeCompare(b.item.sortText);
        }
      }

      // 3. By label length (shorter first)
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
  const savedTheme = localStorage.getItem('theme');
  const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

  editorInstance = monaco.editor.create(mountElement, {
    value: initialValue,
    language: 'java',
    theme: isDark ? 'vs-dark' : 'vs',
    fontSize: 14,
    fontFamily: "Consolas, 'Courier New', monospace",
    fontLigatures: false,
    lineHeight: 20,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    
    // Auto-suggestion settings (VS Code standard)
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
    suggestSelection: 'first',
    
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

  // Force layout to fix cursor misalignment
  setTimeout(() => {
    editorInstance?.layout();
  }, 0);

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

export function updateMonacoTheme(isDark: boolean): void {
  if (editorInstance) {
    monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
  }
}

export function setMonacoReadOnly(isReadOnly: boolean): void {
  editorInstance?.updateOptions({ readOnly: isReadOnly });
}

export function disposeMonaco(): void {
  editorInstance?.dispose();
  editorInstance = null;
}
