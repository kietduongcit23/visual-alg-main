export interface ValidationIssue {
  line: number;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationIssue[];
}

const unsupportedChecks: Array<{ pattern: RegExp; message: string }> = [
  // ĐÃ COMMENT ĐỂ CHO PHÉP SỬ DỤNG IMPORT (VD: import java.util.ArrayList;)
  // { pattern: /^\s*import\s+/u, message: 'Please use Java-like syntax without imports.' },
  
  { pattern: /\bclass\b/u, message: 'Classes are not supported in this mode.' },
  { pattern: /\binterface\b/u, message: 'Interfaces are not supported in this mode.' },
  
  // ĐÃ COMMENT LẠI ĐỂ CHO PHÉP KHAI BÁO HÀM (METHOD)
  // {
  //   pattern: /^\s*(?:public|private|protected)?\s*(?:static\s+)?(?:void|int|double|float|long|boolean|String|[A-Z]\w*)(?:\s*\[\])?\s+\w+\s*\([^;]*\)\s*\{/u,
  //   message: 'Method declarations are not supported yet.',
  // },

  { pattern: /\[\s*\]\s*\[/u, message: 'Only one-dimensional arrays are supported in this lesson.' },
  { pattern: /\[\s*\[/u, message: 'Only one-dimensional arrays are supported in this lesson.' },
  { pattern: /\.equals\s*\(/u, message: 'Use comparison operators like == instead of .equals(...) here.' },
  
  // ĐÃ COMMENT ĐỂ CHO PHÉP KHỞI TẠO ĐỐI TƯỢNG MỚI (VD: new ArrayList<>())
  // { pattern: /\bnew\s+[A-Z]\w*/u, message: 'Object construction is not supported in this mode.' },
  
  { pattern: /\bswitch\s*\(/u, message: 'Switch statements are not supported yet.' },
  { pattern: /\btry\s*\{/u, message: 'Exception handling is not supported yet.' },
];

export function validateSource(source: string): ValidationResult {
  const errors: ValidationIssue[] = [];
  const lines = source.split(/\r?\n/u);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    for (const check of unsupportedChecks) {
      if (check.pattern.test(line)) {
        errors.push({ line: lineNumber, message: check.message });
        return;
      }
    }
  });

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function assertValidSource(source: string): void {
  const result = validateSource(source);
  if (!result.ok) {
    const [firstError] = result.errors;
    throw new Error(firstError ? `Line ${firstError.line}: ${firstError.message}` : 'Unsupported syntax.');
  }
} 