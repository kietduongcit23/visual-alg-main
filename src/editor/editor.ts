import { defaultKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';

import { createRuntimeHighlightExtension } from './highlighting';

export interface EditorController {
  setValue: (value: string) => void;
  getValue: () => string;
  setEditable: (isEditable: boolean) => void;
  highlightLine: (lineNumber: number | null) => void;
}

export function createEditorController(
  parent: HTMLElement,
  onChange?: (value: string) => void,
): EditorController {
  let activeLine: number | null = null;
  const highlightExtension = createRuntimeHighlightExtension(() => activeLine);
  const editableCompartment = new Compartment();
  let currentValue = '';

  const view = new EditorView({
    state: EditorState.create({
      doc: '',
      extensions: [
        lineNumbers(),
        keymap.of(defaultKeymap),
        javascript(),
        editableCompartment.of(EditorView.editable.of(true)),
        EditorView.lineWrapping,
        highlightExtension,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            currentValue = update.state.doc.toString();
            onChange?.(currentValue);
          }
        }),
        EditorView.theme({
          '&': {
            fontSize: '14px',
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          },
          '.cm-content': {
            padding: '16px 0',
            color: 'var(--code-text)',
            caretColor: 'var(--code-caret)',
          },
          '.cm-gutters': {
            backgroundColor: 'var(--code-gutter)',
            color: 'var(--muted)',
            border: 'none',
            borderRight: '1px solid var(--border)',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'var(--code-active-line)',
            color: 'var(--accent)',
          },
          '.cm-activeLine': {
            backgroundColor: 'var(--code-active-line)',
          },
          '.cm-line': { paddingInline: '16px' },
          '.cm-cursor': { borderLeftColor: 'var(--code-caret)', borderLeftWidth: '2px' },
          '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
            background: 'var(--code-selection) !important',
          },
          '.cm-matchingBracket': {
            background: 'var(--accent-soft)',
            outline: '1px solid var(--accent)',
          },
        }),
      ],
    }),
    parent,
  });

  return {
    setValue(value: string) {
      if (value === currentValue) {
        return;
      }

      currentValue = value;
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
    },
    getValue() {
      return currentValue;
    },
    setEditable(isEditable) {
      view.dispatch({
        effects: editableCompartment.reconfigure(EditorView.editable.of(isEditable)),
      });
      view.contentDOM.toggleAttribute('aria-readonly', !isEditable);
    },
    highlightLine(lineNumber: number | null) {
      activeLine = lineNumber;
      view.dispatch({ effects: [] });
    },
  };
}