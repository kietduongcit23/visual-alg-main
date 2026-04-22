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

// Initialize both suggestion systems (they complement each other):
// - javaIntelliSense: static Java API completions (System.out, Math, etc.)
// - suggestions: context-aware, lesson-aware smart completions
setupJavaIntelliSense();
registerSuggestions();

export function createEditorController(
  parent: HTMLElement,
  onChange?: (value: string) => void,
): EditorController {
  let activeDecorations: string[] = [];

  const editor = monaco.editor.create(parent, {
    value: '',
    language: 'java',
    theme: (document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'vs-dark' : 'vs',
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