import { RangeSetBuilder } from '@codemirror/state';
import { Decoration, ViewPlugin } from '@codemirror/view';
import type { EditorView, ViewUpdate } from '@codemirror/view';

const lineHighlightDecoration = Decoration.line({ class: 'cm-runtime-line' });

export function createRuntimeHighlightExtension(getLine: () => number | null) {
  return ViewPlugin.fromClass(
    class {
      decorations = buildDecorations(this.view, getLine());

      constructor(private readonly view: EditorView) {}

      update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged || update.selectionSet) {
          this.decorations = buildDecorations(update.view, getLine());
          return;
        }

        this.decorations = buildDecorations(update.view, getLine());
      }
    },
    {
      decorations: (plugin) => plugin.decorations,
    },
  );
}

function buildDecorations(view: EditorView, lineNumber: number | null) {
  const builder = new RangeSetBuilder<Decoration>();
  if (lineNumber !== null && lineNumber > 0 && lineNumber <= view.state.doc.lines) {
    const line = view.state.doc.line(lineNumber);
    builder.add(line.from, line.from, lineHighlightDecoration);
  }

  return builder.finish();
}