export function handleEditorKeydown(
  event: KeyboardEvent,
  textarea: HTMLTextAreaElement,
  rememberDraft: () => void,
  indentUnit = '  ',
): void {
  if (event.key === 'Tab') {
    event.preventDefault();
    if (event.shiftKey) {
      outdentSelection(textarea, indentUnit);
    } else {
      indentSelection(textarea, indentUnit);
    }
    rememberDraft();
    return;
  }

  if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    insertIndentedNewline(textarea, indentUnit);
    rememberDraft();
  }
}

function insertIndentedNewline(textarea: HTMLTextAreaElement, indentUnit: string): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const beforeCursor = value.slice(lineStart, start);
  const afterCursor = value.slice(end);
  const baseIndent = beforeCursor.match(/^\s*/)?.[0] ?? '';
  const trimmedBefore = beforeCursor.trimEnd();
  const shouldIncreaseIndent = /[{[(]$/.test(trimmedBefore);
  const nextLinePrefix = afterCursor.match(/^\s*[}\])]/);
  const nextLineStartsWithClosing = Boolean(nextLinePrefix);
  const nextIndent = baseIndent + (shouldIncreaseIndent ? indentUnit : '');

  if (nextLineStartsWithClosing && start === end) {
    const inserted = `\n${nextIndent}\n${baseIndent}`;
    textarea.setRangeText(inserted, start, end, 'end');
    const caret = start + 1 + nextIndent.length;
    textarea.setSelectionRange(caret, caret);
    return;
  }

  const inserted = `\n${nextIndent}`;
  textarea.setRangeText(inserted, start, end, 'end');
  const caret = start + inserted.length;
  textarea.setSelectionRange(caret, caret);
}

function indentSelection(textarea: HTMLTextAreaElement, indentUnit: string): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  if (start === end) {
    textarea.setRangeText(indentUnit, start, end, 'end');
    return;
  }

  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = value.indexOf('\n', end);
  const sliceEnd = lineEnd === -1 ? value.length : lineEnd;
  const block = value.slice(lineStart, sliceEnd);
  const lines = block.split('\n');
  const indented = lines.map((line) => indentUnit + line).join('\n');

  textarea.setRangeText(indented, lineStart, sliceEnd, 'preserve');
  textarea.setSelectionRange(start + indentUnit.length, end + indentUnit.length * lines.length);
}

function outdentSelection(textarea: HTMLTextAreaElement, indentUnit: string): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  if (start === end) {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const beforeCursor = value.slice(lineStart, start);
    if (beforeCursor.endsWith(indentUnit)) {
      textarea.setRangeText('', start - indentUnit.length, start, 'end');
    } else if (beforeCursor.endsWith('\t')) {
      textarea.setRangeText('', start - 1, start, 'end');
    }
    return;
  }

  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = value.indexOf('\n', end);
  const sliceEnd = lineEnd === -1 ? value.length : lineEnd;
  const block = value.slice(lineStart, sliceEnd);
  const lines = block.split('\n');
  let removedCharacters = 0;
  const outdented = lines.map((line) => {
    if (line.startsWith(indentUnit)) {
      removedCharacters += indentUnit.length;
      return line.slice(indentUnit.length);
    }
    if (line.startsWith('\t')) {
      removedCharacters += 1;
      return line.slice(1);
    }
    return line;
  }).join('\n');

  const firstLine = lines[0] ?? '';
  const firstLineRemoved = firstLine.startsWith(indentUnit) ? indentUnit.length : firstLine.startsWith('\t') ? 1 : 0;
  textarea.setRangeText(outdented, lineStart, sliceEnd, 'preserve');
  textarea.setSelectionRange(Math.max(lineStart, start - firstLineRemoved), Math.max(lineStart, end - removedCharacters));
}
