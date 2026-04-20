export function normalizePairs(value: unknown): number[][] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  if (!value.every((entry) => Array.isArray(entry) && entry.length === 2 && entry.every((item) => typeof item === 'number'))) {
    return null;
  }

  const pairs = value as Array<[number, number]>;

  return pairs
    .map((entry): [number, number] => [Math.min(entry[0], entry[1]), Math.max(entry[0], entry[1])])
    .sort((left, right) => (left[0] - right[0]) || (left[1] - right[1]));
}

export function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }
    for (let index = 0; index < left.length; index += 1) {
      if (!deepEqual(left[index], right[index])) {
        return false;
      }
    }
    return true;
  }
  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }
    for (const key of leftKeys) {
      if (!deepEqual((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key])) {
        return false;
      }
    }
    return true;
  }
  return false;
}
