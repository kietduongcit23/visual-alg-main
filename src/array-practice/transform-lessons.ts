import { deepEqual, normalizePairs } from './comparison';
import {
  createNumberArray,
  createSortedArray,
  pickOne,
  randomInt,
  shuffleInPlace,
} from './lesson-helpers';
import type { LessonConfig } from './types';

export function createTransformLessonConfigs(): LessonConfig[] {
  return [
    {
      id: 'reverse-array',
      title: '14. reverse array',
      methodName: 'reverseArray',
      description: 'Return a new array with the elements in reverse order.',
      starterCode: [
        'public int[] reverseArray(int[] numbers) {',
        '  // B1: Tạo mảng kết quả với kích thước bằng mảng gốc',
        '  int[] reversed = new int[numbers.length];',
        '  int j = 0; // Biến đếm cho mảng reversed',
        '',
        '  // B2: Duyệt từ cuối về đầu',
        '  for (int i = numbers.length - 1; i >= 0; i--) {',
        '    reversed[j] = numbers[i]; // thêm phần tử',
        '    j++;',
        '  }',
        '',
        '  // B3: Trả kết quả',
        '  return reversed;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9 })] }),
      hints: [
        'Tạo mảng kết quả cố định: int[] reversed = new int[numbers.length];',
        'Duyệt ngược mảng gốc và gán vào mảng mới thông qua một biến đếm index thứ hai: reversed[j] = numbers[i];'
      ],
      solution: (numbers) => (numbers as number[]).slice().reverse(),
    },
    {
      id: 'sort-ascending',
      title: '15. sort ascending',
      methodName: 'sortAscending',
      description: 'Return a new array sorted from smallest to largest.',
      starterCode: [
        'public int[] sortAscending(int[] numbers) {',
        '  // B1: Sao chép mảng (Java dùng .clone() thay vì .slice())',
        '  int[] sorted = numbers.clone();',
        '',
        '  // B2: Bubble Sort',
        '  for (int i = 0; i < sorted.length - 1; i++) {',
        '    for (int j = 0; j < sorted.length - 1 - i; j++) {',
        '',
        '      // Nếu sai thứ tự thì đổi chỗ',
        '      if (sorted[j] > sorted[j + 1]) {',
        '        int temp = sorted[j];',
        '        sorted[j] = sorted[j + 1];',
        '        sorted[j + 1] = temp;',
        '      }',
        '    }',
        '  }',
        '',
        '  // B3: Trả kết quả',
        '  return sorted;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8, valueMin: -9, valueMax: 12 })] }),
      hints: [
        'Tạo bản sao mảng bằng cách dùng: int[] sorted = numbers.clone();',
        'Có thể dùng thuật toán nổi bọt (Bubble Sort) với 2 vòng lặp lồng nhau.',
        'Đổi chỗ hai phần tử cần dùng một biến tạm (temp).'
      ],
      solution: (numbers) => (numbers as number[]).slice().sort((left: number, right: number) => left - right),
    },
    {
      id: 'sort-descending',
      title: '16. sort descending',
      methodName: 'sortDescending',
      description: 'Return a new array sorted from largest to smallest.',
      starterCode: [
        'public int[] sortDescending(int[] numbers) {',
        '  // B1: Sao chép mảng',
        '  int[] sorted = numbers.clone();',
        '',
        '  // B2: Bubble Sort ngược',
        '  for (int i = 0; i < sorted.length - 1; i++) {',
        '    for (int j = 0; j < sorted.length - 1 - i; j++) {',
        '',
        '      // Nếu phần tử trước nhỏ hơn thì đổi chỗ',
        '      if (sorted[j] < sorted[j + 1]) {',
        '        int temp = sorted[j];',
        '        sorted[j] = sorted[j + 1];',
        '        sorted[j + 1] = temp;',
        '      }',
        '    }',
        '  }',
        '',
        '  return sorted;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8, valueMin: -9, valueMax: 12 })] }),
      hints: [
        'Tương tự sắp xếp tăng dần, nhưng đổi chiều so sánh thành: if (sorted[j] < sorted[j + 1])'
      ],
      solution: (numbers) => (numbers as number[]).slice().sort((left: number, right: number) => right - left),
    },
    {
      id: 'remove-duplicates',
      title: '20. remove duplicates',
      methodName: 'removeDuplicates',
      description: 'Return a new array keeping only the first occurrence of each value.',
      starterCode: [
        'public List<Integer> removeDuplicates(int[] numbers) {',
        '  // Khởi tạo mảng động (List)',
        '  List<Integer> result = new ArrayList<>();',
        '',
        '  for (int i = 0; i < numbers.length; i++) {',
        '    // Nếu chưa có trong danh sách thì mới thêm vào',
        '    if (!result.contains(numbers[i])) {',
        '      result.add(numbers[i]);',
        '    }',
        '  }',
        '',
        '  return result;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 6, lengthMax: 10, valueMin: -3, valueMax: 4 })] }),
      hints: [
        'Vì không biết trước kích thước mảng kết quả, hãy dùng: List<Integer> result = new ArrayList<>();',
        'Chỉ thêm vào result nếu giá trị đó chưa có: if (!result.contains(numbers[i]))'
      ],
      solution: (numbers) => Array.from(new Set(numbers as number[])),
    },
    {
      id: 'pairs-with-sum',
      title: '21. find pairs that sum to target',
      methodName: 'pairsWithTargetSum',
      description: 'Return unique value pairs [a, b] such that a + b equals target, with a <= b. Order of pairs in the output does not matter.',
      starterCode: [
        'public void pairsWithTargetSum(int[] numbers, int target) {',
        '  List pairs = new ArrayList();',
        '',
        '  for (int i = 0; i < numbers.size(); i++) {',
        '    for (int j = i + 1; j < numbers.size(); j++) {',
        '',
        '      if (numbers.get(i) + numbers.get(j) == target) {',
        '',
        '        int a = numbers.get(i);',
        '        int b = numbers.get(j);',
        '',
        '        int x = a <= b ? a : b;',
        '        int y = a <= b ? b : a;',
        '',
        '        boolean seen = false;',
        '',
        '        for (int k = 0; k < pairs.size(); k++) {',
        '          if (pairs.get(k).get(0) == x && pairs.get(k).get(1) == y) {',
        '            seen = true;',
        '            break;',
        '          }',
        '        }',
        '',
        '        if (!seen) {',
        '          List pair = new ArrayList();',
        '          pair.add(x);',
        '          pair.add(y);',
        '          pairs.add(pair);',
        '        }',
        '      }',
        '    }',
        '  }',
        '',
        '  return pairs;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 9, valueMin: -3, valueMax: 9 }), randomInt(rng, 0, 10)],
        note: 'Pairs are unique by value, not by index order.',
      }),
      hints: [
        'Dùng 2 vòng lặp lồng nhau để xét từng cặp: cho i từ 0.., j từ i + 1..',
        'Sắp xếp cặp [a, b] để dễ dàng so sánh trùng lặp.',
        'Vì mảng trả về là danh sách các mảng con, hãy dùng: List<int[]> pairs = new ArrayList<>();'
      ],
      solution: (numbers, target) => {
        const values = numbers as number[];
        const desired = target as number;
        const pairSet = new Set<string>();
        for (let i = 0; i < values.length; i += 1) {
          for (let j = i + 1; j < values.length; j += 1) {
            if (values[i]! + values[j]! === desired) {
              const left = Math.min(values[i]!, values[j]!);
              const right = Math.max(values[i]!, values[j]!);
              pairSet.add(JSON.stringify([left, right]));
            }
          }
        }
        return Array.from(pairSet, (entry: string) => JSON.parse(entry) as [number, number]);
      },
      checker: ({ actual, expected }) => {
        const normalizedActual = normalizePairs(actual);
        const normalizedExpected = normalizePairs(expected);
        const pass = deepEqual(normalizedActual, normalizedExpected);
        return {
          pass,
          message: 'Return unique value pairs [a, b] with a <= b. Pair order is ignored.',
        };
      },
    },
    {
      id: 'rotate',
      title: '22. rotate left or right by k',
      methodName: 'rotateArray',
      description: 'Return a new array rotated left or right by k positions.',
      starterCode: [
        'public int[] rotateArray(int[] numbers, int k, String direction) {',
        '  int length = numbers.length;',
        '  if (length == 0) return numbers.clone();',
        '',
        '  int shift = ((k % length) + length) % length;',
        '  if (shift == 0) return numbers.clone();',
        '',
        '  int[] result = new int[length];',
        '  int idx = 0;',
        '',
        '  // Nhớ dùng .equals() để so sánh chuỗi trong Java',
        '  if (direction.equals("left")) {',
        '    for (int i = shift; i < length; i++) result[idx++] = numbers[i];',
        '    for (int i = 0; i < shift; i++) result[idx++] = numbers[i];',
        '  } else {',
        '    for (int i = length - shift; i < length; i++) result[idx++] = numbers[i];',
        '    for (int i = 0; i < length - shift; i++) result[idx++] = numbers[i];',
        '  }',
        '',
        '  return result;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8 }), randomInt(rng, 0, 12), pickOne(rng, ['left', 'right'])],
      }),
      hints: [
        'Xử lý số lần dịch k có thể lớn hơn độ dài mảng: int shift = ((k % length) + length) % length;',
        'Nhớ so sánh biến direction bằng: direction.equals("left").',
        'Tạo mảng kết quả mới (new int[length]) và copy từng phần tử thay vì dùng concat.'
      ],
      solution: (numbers, k, direction) => {
        const values = numbers as number[];
        const shiftBase = k as number;
        const directionValue = direction as 'left' | 'right';
        const length = values.length;
        const shift = ((shiftBase % length) + length) % length;
        if (shift === 0) {
          return values.slice();
        }
        if (directionValue === 'left') {
          return values.slice(shift).concat(values.slice(0, shift));
        }
        return values.slice(length - shift).concat(values.slice(0, length - shift));
      },
    },
    {
      id: 'longest-run',
      title: '23. find the longest consecutive identical run',
      methodName: 'longestConsecutiveRun',
      description: 'Return the length of the longest streak of equal neighboring values.',
      starterCode: [
        'public int longestConsecutiveRun(int[] numbers) {',
        '  if (numbers.length == 0) return 0;',
        '',
        '  int best = 1;',
        '  int current = 1;',
        '',
        '  for (int i = 1; i < numbers.length; i++) {',
        '    if (numbers[i] == numbers[i - 1]) {',
        '      current += 1;',
        '      if (current > best) {',
        '        best = current;',
        '      }',
        '    } else {',
        '      current = 1;',
        '    }',
        '  }',
        '',
        '  return best;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: 0, valueMax: 4 })] }),
      hints: [
        'Giữ một chuỗi hiện tại và chuỗi dài nhất: int best = 1; int current = 1;',
        'Cộng dồn current nếu numbers[i] == numbers[i-1], ngược lại reset current về 1.'
      ],
      solution: (numbers) => {
        const values = numbers as number[];
        let best = 1;
        let current = 1;
        for (let i = 1; i < values.length; i += 1) {
          if (values[i] === values[i - 1]) {
            current += 1;
            best = Math.max(best, current);
          } else {
            current = 1;
          }
        }
        return best;
      },
    },
    {
      id: 'merge-sorted',
      title: '24. merge two sorted arrays',
      methodName: 'mergeSortedArrays',
      description: 'Merge two already sorted arrays into one sorted result.',
      starterCode: [
        'public int[] mergeSortedArrays(int[] left, int[] right) {',
        '  // Tạo mảng kết quả có tổng độ dài',
        '  int[] merged = new int[left.length + right.length];',
        '  int i = 0;',
        '  int j = 0;',
        '  int k = 0; // index cho mảng merged',
        '',
        '  while (i < left.length && j < right.length) {',
        '    if (left[i] <= right[j]) {',
        '      merged[k++] = left[i++];',
        '    } else {',
        '      merged[k++] = right[j++];',
        '    }',
        '  }',
        '',
        '  // Copy các phần tử còn thừa',
        '  while (i < left.length) {',
        '    merged[k++] = left[i++];',
        '  }',
        '  while (j < right.length) {',
        '    merged[k++] = right[j++];',
        '  }',
        '',
        '  return merged;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createSortedArray(rng, { lengthMin: 3, lengthMax: 6, valueMin: -6, valueMax: 8 }), createSortedArray(rng, { lengthMin: 3, lengthMax: 6, valueMin: -6, valueMax: 8 })],
      }),
      hints: [
        'Chạy 2 con trỏ i và j song song trên hai mảng left và right.',
        'So sánh left[i] và right[j], lấy số nhỏ hơn thêm vào mảng merged.',
        'Khởi tạo mảng tĩnh: int[] merged = new int[left.length + right.length];',
        'Sau vòng lặp đầu tiên, dùng thêm vòng lặp while để vét nốt các phần tử còn thừa.'
      ],
      solution: (left, right) => (left as number[]).concat(right as number[]).sort((a: number, b: number) => a - b),
    },
    {
      id: 'missing-number',
      title: '25. find the missing number in a sequence',
      methodName: 'missingNumber',
      description: 'The array contains every number from 0 to n except one. Return the missing number.',
      starterCode: [
        'public int missingNumber(int[] numbers) {',
        '  int n = numbers.length;',
        '  int expected = (n * (n + 1)) / 2;',
        '  int actual = 0;',
        '',
        '  for (int i = 0; i < numbers.length; i++) {',
        '    actual += numbers[i];',
        '  }',
        '',
        '  return expected - actual;',
        '}',
      ].join('\n'),
      genTest: (rng) => {
        const n = randomInt(rng, 4, 9);
        const missing = randomInt(rng, 0, n);
        const numbers: number[] = [];
        for (let value = 0; value <= n; value += 1) {
          if (value !== missing) {
            numbers.push(value);
          }
        }
        shuffleInPlace(numbers, rng);
        return { args: [numbers], note: 'Input order is not guaranteed.' };
      },
      hints: [
        'Cách hiệu quả là tính tổng dãy đầy đủ bằng công thức: (n * (n + 1)) / 2',
        'Tính tổng thực tế mảng truyền vào, hiệu hai tổng sẽ ra số bị thiếu.'
      ],
      solution: (numbers) => {
        const values = numbers as number[];
        const n = values.length;
        const expected = (n * (n + 1)) / 2;
        const actual = values.reduce((sum: number, value: number) => sum + value, 0);
        return expected - actual;
      },
    },
  ];
}