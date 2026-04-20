import type { ValidationIssue } from '../engine/validator';

export function formatValidationIssues(issues: ValidationIssue[]): string[] {
  return issues.map((issue) => `Line ${issue.line}: ${issue.message}`);
}