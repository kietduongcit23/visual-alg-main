import * as monaco from 'monaco-editor';
import { setupJavaIntelliSense } from './javaIntelliSense';
import { registerSuggestions } from './suggestions';

export interface EditorController {
  setValue: (value: string) => void;
  getValue: () => string;
  setEditable: (isEditable: boolean) => void;
  highlightLine: (lineNumber: number | null) => void;
  dispose: () => void;
}

setupJavaIntelliSense();
registerSuggestions();

// ─── Theme Definitions (MUST run before editor init) ──────────────────────

monaco.editor.defineTheme('custom-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#0f172a',
    'editor.foreground': '#e2e8f0',
    'editorSuggestWidget.background': '#1e293b',
    'editorSuggestWidget.foreground': '#e2e8f0',
    'editorSuggestWidget.selectedBackground': '#334155',
    'editorSuggestWidget.border': '#475569',
    'editorHoverWidget.background': '#1e293b',
    'editorHoverWidget.foreground': '#e2e8f0',
    'scrollbarSlider.background': '#47556980',
    'scrollbarSlider.hoverBackground': '#475569',
    'scrollbarSlider.activeBackground': '#64748b',
  }
});

monaco.editor.defineTheme('custom-light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#111827',
    'editorSuggestWidget.background': '#ffffff',
    'editorSuggestWidget.foreground': '#111827',
    'editorSuggestWidget.selectedBackground': '#e5e7eb',
    'editorSuggestWidget.border': '#e5e7eb',
    'editorHoverWidget.background': '#ffffff',
    'editorHoverWidget.foreground': '#111827',
    'scrollbarSlider.background': '#00000010',
    'scrollbarSlider.hoverBackground': '#00000020',
    'scrollbarSlider.activeBackground': '#00000030',
  }
});

export function createEditorController(
  parent: HTMLElement,
  onChange?: (value: string) => void,
): EditorController {
  let activeDecorations: string[] = [];

  const editor = monaco.editor.create(parent, {
    value: '',
    language: 'java',
    theme: document.documentElement.classList.contains('dark') ? 'custom-dark' : 'custom-light',
    fontSize: 14,
    fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    lineNumbers: 'on',
    renderLineHighlight: 'all',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 4,
    wordWrap: 'on',
    minimap: { enabled: false },
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    bracketPairColorization: { enabled: true },
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    formatOnType: true,
    padding: { top: 16, bottom: 16 },
    
    // VS Code-style Suggestion Options
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true
    },
    suggestOnTriggerCharacters: true,
    tabCompletion: "on",
    acceptSuggestionOnEnter: "on",
    wordBasedSuggestions: "allDocuments",
    suggestSelection: 'first',
    snippetSuggestions: 'top',
    
    
    // Smooth navigation
    smoothScrolling: true,
    mouseWheelZoom: true,

    // Parameter hints (show signature info when inside function calls)
    parameterHints: { enabled: true },
  });

  editor.onDidChangeModelContent(() => {
    onChange?.(editor.getValue());
    // Aggressively trigger suggestions while typing
    editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
  });

  return {
    setValue(value: string) {
      if (value !== editor.getValue()) {
        editor.setValue(value);
      }
    },
    getValue() {
      return editor.getValue();
    },
    setEditable(isEditable: boolean) {
      editor.updateOptions({ readOnly: !isEditable });
    },
    highlightLine(lineNumber: number | null) {
      if (lineNumber === null) {
        activeDecorations = editor.deltaDecorations(activeDecorations, []);
        return;
      }

      activeDecorations = editor.deltaDecorations(activeDecorations, [
        {
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
            isWholeLine: true,
            className: 'monaco-active-line-highlight',
            glyphMarginClassName: 'monaco-active-line-glyph'
          }
        }
      ]);
      
      editor.revealLineInCenterIfOutsideViewport(lineNumber);
    },
    dispose() {
      editor.dispose();
    }
  };
}

export function updateMonacoTheme(isDark: boolean): void {
  monaco.editor.setTheme(isDark ? 'custom-dark' : 'custom-light');
}