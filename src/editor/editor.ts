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
          '&': { fontSize: '14px' },
          '.cm-content': { padding: '16px 0' },
          '.cm-gutters': {
            backgroundColor: 'transparent',
            color: 'rgba(247, 244, 236, 0.42)',
            border: 'none',
          },
          '.cm-activeLineGutter': { backgroundColor: 'transparent' },
          '.cm-line': { paddingInline: '16px' },
          '.cm-cursor': { borderLeftColor: '#f7f4ec' },
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