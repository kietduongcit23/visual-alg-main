export interface InstrumentationOptions {
  pointerVariables: string[];
}

export interface InstrumentationResult {
  instrumentedSource: string;
}

export function instrumentSource(
  normalizedSource: string,
  options: InstrumentationOptions,
): InstrumentationResult {
  const pointerNames = new Set(options.pointerVariables);
  const lines = normalizedSource.split(/\r?\n/u);

  const instrumentedSource = lines
    .map((line, index) => instrumentLine(line, index + 1, pointerNames))
    .join('\n');

  return { instrumentedSource };
}

function instrumentLine(line: string, lineNumber: number, pointerNames: Set<string>): string {
  const trimmed = line.trim();
  if (!trimmed || trimmed === '{' || trimmed === '}' || trimmed.startsWith('//')) {
    return line;
  }

  const swapMatch = line.match(/^(\s*)swap\s*\(\s*([A-Za-z_]\w*)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;\s*$/u);
  if (swapMatch) {
    const indent = swapMatch[1] ?? '';
    const arrayName = swapMatch[2];
    const leftIndex = swapMatch[3];
    const rightIndex = swapMatch[4];
    if (!arrayName || !leftIndex || !rightIndex) {
      return line;
    }
    return `${indent}__emitLine(${lineNumber}); __swap(${arrayName}, '${arrayName}', ${leftIndex}, ${rightIndex});`;
  }

  const arrayWriteMatch = line.match(/^(\s*)([A-Za-z_]\w*)\s*\[(.+?)\]\s*=\s*(.+);\s*$/u);
  if (arrayWriteMatch) {
    const indent = arrayWriteMatch[1] ?? '';
    const arrayName = arrayWriteMatch[2];
    const indexExpression = arrayWriteMatch[3];
    const valueExpression = arrayWriteMatch[4];
    if (!arrayName || !indexExpression || !valueExpression) {
      return line;
    }
    const index = indexExpression.trim();
    const value = instrumentExpression(valueExpression.trim());
    return `${indent}__emitLine(${lineNumber}); ${arrayName}[${index}] = __writeArray('${arrayName}', ${index}, ${value});`;
  }

  const assignmentMatch = line.match(/^(\s*)([A-Za-z_]\w*)\s*=\s*(.+);\s*$/u);
  if (assignmentMatch && !trimmed.startsWith('for ')) {
    const indent = assignmentMatch[1] ?? '';
    const variableName = assignmentMatch[2];
    const valueExpression = assignmentMatch[3];
    if (!variableName || !valueExpression) {
      return line;
    }
    const instrumentedExpression = instrumentExpression(valueExpression.trim());
    const helperName = pointerNames.has(variableName) ? '__assignPointer' : '__assignVar';
    return `${indent}__emitLine(${lineNumber}); ${variableName} = ${helperName}('${variableName}', ${instrumentedExpression});`;
  }

  const conditionalMatch = line.match(/^(\s*)(if|while)\s*\((.*)\)(\s*\{?\s*)$/u);
  if (conditionalMatch) {
    const indent = conditionalMatch[1] ?? '';
    const keyword = conditionalMatch[2];
    const condition = conditionalMatch[3];
    const suffix = conditionalMatch[4] ?? '';
    if (!keyword || condition === undefined) {
      return line;
    }
    return `${indent}__emitLine(${lineNumber}); ${keyword} (${instrumentExpression(condition)})${suffix}`;
  }

  if (/^(?:\s*)for\s*\(/u.test(line)) {
    return `${leadingIndent(line)}__emitLine(${lineNumber}); ${line.trimStart()}`;
  }

  if (/^(?:\s*)break\s*;/u.test(line) || /^(?:\s*)continue\s*;/u.test(line)) {
    return `${leadingIndent(line)}__emitLine(${lineNumber}); ${trimmed}`;
  }

  if (/^(?:\s*)print\s*\(/u.test(line)) {
    return `${leadingIndent(line)}__emitLine(${lineNumber}); ${instrumentExpression(trimmed)}`;
  }

  return `${leadingIndent(line)}__emitLine(${lineNumber}); ${instrumentExpression(trimmed)}`;
}

function instrumentExpression(expression: string): string {
  const comparison = findComparison(expression);
  if (comparison) {
    const left = instrumentReads(comparison.left.trim());
    const right = instrumentReads(comparison.right.trim());
    return `__compare(${left}, '${comparison.operator}', ${right})`;
  }

  return instrumentReads(expression);
}

function instrumentReads(expression: string): string {
  return expression.replace(/([A-Za-z_]\w*)\s*\[(.+?)\]/gu, (_match, arrayName: string, indexExpression: string) => {
    const index = indexExpression.trim();
    return `__readArray('${arrayName}', ${index}, ${arrayName}[${index}])`;
  });
}

function findComparison(expression: string):
  | { left: string; operator: string; right: string }
  | null {
  const operators = ['==', '!=', '<=', '>=', '<', '>'];
  let depth = 0;

  for (let index = 0; index < expression.length; index += 1) {
    const current = expression[index];
    if (current === '(' || current === '[') {
      depth += 1;
      continue;
    }
    if (current === ')' || current === ']') {
      depth -= 1;
      continue;
    }
    if (depth !== 0) {
      continue;
    }

    for (const operator of operators) {
      if (expression.startsWith(operator, index)) {
        return {
          left: expression.slice(0, index),
          operator,
          right: expression.slice(index + operator.length),
        };
      }
    }
  }

  return null;
}

function leadingIndent(line: string): string {
  return line.match(/^\s*/u)?.[0] ?? '';
}