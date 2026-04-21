import loader from '@monaco-editor/loader';
import type * as monaco from 'monaco-editor';

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let monacoApi: typeof monaco | null = null;

function getMonaco(): typeof monaco {
  if (!monacoApi) {
    throw new Error('Monaco API not initialized');
  }
  return monacoApi;
}

export async function createMonacoEditor(
  mountElement: HTMLElement,
  initialValue: string,
  onChange: (value: string) => void,
): Promise<monaco.editor.IStandaloneCodeEditor> {
  monacoApi = await loader.init();
  const m = getMonaco();

  // Define VS Code Dark+ Theme
  m.editor.defineTheme('vscode-dark-plus', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'c586c0' },
      { token: 'type', foreground: '4ec9b0' },
      { token: 'identifier', foreground: '9cdcfe' },
      { token: 'function', foreground: 'dcdcaa' },
      { token: 'number', foreground: 'b5cea8' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editorLineNumber.foreground': '#858585',
      'editorCursor.foreground': '#ffffff',
      'editor.lineHighlightBackground': '#2a2d2e',
      'editor.selectionBackground': '#264f78',
    }
  });

  // Define VS Code Light+ Theme
  m.editor.defineTheme('vscode-light-plus', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0000ff' },
      { token: 'type', foreground: '267f99' },
      { token: 'identifier', foreground: '001080' },
      { token: 'function', foreground: '795e26' },
      { token: 'number', foreground: '098658' },
      { token: 'string', foreground: 'a31515' },
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#000000',
      'editorLineNumber.foreground': '#237893',
      'editorCursor.foreground': '#000000',
      'editor.lineHighlightBackground': '#0000000a',
      'editor.selectionBackground': '#add6ff',
    }
  });

  const isDark = document.documentElement.dataset.theme !== 'light';

  editorInstance = m.editor.create(mountElement, {
    value: initialValue,
    language: 'java',
    theme: isDark ? 'vscode-dark-plus' : 'vscode-light-plus',
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 22,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    cursorSmoothCaretAnimation: 'on',
    cursorBlinking: 'smooth',
    renderLineHighlight: 'all',
    bracketPairColorization: { enabled: true },
    autoIndent: 'full',
    padding: { top: 16, bottom: 16 },
    fixedOverflowWidgets: true,
    fontLigatures: true,
    smoothScrolling: true,
    renderWhitespace: 'none',
    guides: { indentation: true },
  });

  editorInstance.onDidChangeModelContent(() => {
    onChange(editorInstance?.getValue() || '');
  });

  // Listen for theme changes globally if needed, or handle in main.ts
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') {
      const newTheme = e.newValue === 'light' ? 'vscode-light-plus' : 'vscode-dark-plus';
      getMonaco().editor.setTheme(newTheme);
    }
  });

  return editorInstance;
}

export function updateMonacoTheme(theme: 'light' | 'dark'): void {
  const monacoTheme = theme === 'light' ? 'vscode-light-plus' : 'vscode-dark-plus';
  getMonaco().editor.setTheme(monacoTheme);
}

export function setMonacoValue(value: string): void {
  if (editorInstance && editorInstance.getValue() !== value) {
    editorInstance.setValue(value);
  }
}

export function getMonacoValue(): string {
  return editorInstance?.getValue() || '';
}

export function setMonacoReadOnly(isReadOnly: boolean): void {
  editorInstance?.updateOptions({ readOnly: isReadOnly });
}

export function disposeMonaco(): void {
  editorInstance?.dispose();
  editorInstance = null;
}
