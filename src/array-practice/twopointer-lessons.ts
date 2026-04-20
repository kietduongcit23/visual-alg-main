import { deepEqual } from './comparison';
import {
  createFunctionalGraphArray,
  createSortedArray,
  randomInt,
} from './lesson-helpers';
import type { LessonConfig } from './types';

export function createTwoPointerLessonConfigs(): LessonConfig[] {
  return [
    // ─── Start–End: Two Sum on sorted array ──────────────────────────────────
    {
      id: 'two-sum-sorted',
      title: '26. two sum (sorted array)',
      methodName: 'twoSumSorted',
      description:
        'Given a sorted array and a target sum, find two indices [i, j] such that arr[i] + arr[j] == target (i < j). Return [-1, -1] if no such pair exists.',
      starterCode: [
        'public int[] twoSumSorted(int[] numbers, int target) {',
        '  int left = 0;',
        '  int right = numbers.size() - 1;',
        '',
        '  while (left < right) {',
        '    int sum = numbers.get(left) + numbers.get(right);',
        '',
        '    if (sum == target) {',
        '      List result = new ArrayList();',
        '      result.add(left);',
        '      result.add(right);',
        '      return result;',
        '    } else if (sum < target) {',
        '      left += 1;',
        '    } else {',
        '      right -= 1;',
        '    }',
        '  }',
        '',
        '  List result = new ArrayList();',
        '  result.add(-1);',
        '  result.add(-1);',
        '  return result;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const len = context.preferSmall
          ? randomInt(rng, 5, 10)
          : randomInt(rng, 1000, 100000);
        const numbers = createSortedArray(rng, {
          lengthMin: len, lengthMax: len,
          valueMin: -100, valueMax: 200,
        });
        // sometimes pick a valid target, sometimes a miss
        if (rng() > 0.3 && numbers.length >= 2) {
          const i = randomInt(rng, 0, numbers.length - 2);
          const j = randomInt(rng, i + 1, numbers.length - 1);
          return { args: [numbers, numbers[i]! + numbers[j]!] };
        }
        return { args: [numbers, randomInt(rng, -500, 500)] };
      },
      hints: [
        'Đặt 2 con trỏ: int left = 0, right = numbers.length - 1.',
        'Tính tổng: int sum = numbers[left] + numbers[right];',
        'Nếu sum == target → trả về new int[]{left, right};',
        'Nếu sum < target → tăng left; ngược lại → giảm right.',
      ],
      solution: (numbers, target) => {
        const arr = numbers as number[];
        const t = target as number;
        let left = 0;
        let right = arr.length - 1;
        while (left < right) {
          const sum = arr[left]! + arr[right]!;
          if (sum === t) {
            return [left, right];
          } else if (sum < t) {
            left += 1;
          } else {
            right -= 1;
          }
        }
        return [-1, -1];
      },
      checker: ({ actual, expected }) => {
        const pass = deepEqual(actual, expected);
        return {
          pass,
          message: 'Return [i, j] with i < j, or [-1, -1] if no pair exists.',
        };
      },
    },

    // ─── Fast–Slow: Cycle length detection ───────────────────────────────────
    {
      id: 'find-cycle-length',
      title: '27. detect cycle length (fast-slow pointers)',
      methodName: 'findCycleLength',
      description:
        'Array "arr" is a functional graph: arr[i] points to the next index. Starting from index 0, use fast-slow pointers (Floyd\'s) to find the length of the cycle. The array always contains a cycle.',
      starterCode: [
        'public int findCycleLength(int[] arr) {',
        '  int slow = arr[0];',
        '  int fast = arr[arr[0]];',
        '',
        '  // Bước 1: Tìm điểm gặp nhau',
        '  while (slow != fast) {',
        '    slow = arr[slow];',
        '    fast = arr[arr[fast]];',
        '  }',
        '',
        '  // Bước 2: Đếm độ dài chu kỳ',
        '  int length = 1;',
        '  int current = arr[slow];',
        '',
        '  while (current != slow) {',
        '    current = arr[current];',
        '    length++;',
        '  }',
        '',
        '  return length;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const n = context.preferSmall
          ? randomInt(rng, 5, 12)
          : randomInt(rng, 1000, 100000);
        const cycleLen = randomInt(rng, 2, Math.max(2, n - 1));
        const arr = createFunctionalGraphArray(rng, n, cycleLen);
        return { args: [arr], note: `Cycle length: ${cycleLen}` };
      },
      hints: [
        'Bước 1: Dùng slow (1 bước) và fast (2 bước) để tìm điểm gặp nhau trong chu kỳ.',
        'Cập nhật: slow = arr[slow]; fast = arr[arr[fast]];',
        'Bước 2: Từ điểm gặp, đếm bao nhiêu bước để quay lại điểm đó → đó là độ dài chu kỳ.',
      ],
      solution: (arr) => {
        const a = arr as number[];
        let slow = a[0]!;
        let fast = a[a[0]!]!;
        while (slow !== fast) {
          slow = a[slow]!;
          fast = a[a[fast]!]!;
        }
        let length = 1;
        let current = a[slow]!;
        while (current !== slow) {
          current = a[current]!;
          length += 1;
        }
        return length;
      },
    },

    // ─── Two Arrays: Intersection of sorted arrays ───────────────────────────
    {
      id: 'intersect-sorted',
      title: '28. intersection of two sorted arrays',
      methodName: 'intersectSorted',
      description:
        'Given two sorted arrays, return a sorted array of their intersection (common elements). Keep duplicates — each element appears min(countA, countB) times.',
      starterCode: [
        'import java.util.ArrayList;',
        'import java.util.List;',
        '',
        'public List<Integer> intersectSorted(int[] left, int[] right) {',
        '  List<Integer> result = new ArrayList<>();',
        '  int i = 0;',
        '  int j = 0;',
        '',
        '  while (i < left.length && j < right.length) {',
        '    if (left[i] == right[j]) {',
        '      result.add(left[i]);',
        '      i++;',
        '      j++;',
        '    } else if (left[i] < right[j]) {',
        '      i++;',
        '    } else {',
        '      j++;',
        '    }',
        '  }',
        '',
        '  return result;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const len = context.preferSmall
          ? randomInt(rng, 4, 8)
          : randomInt(rng, 1000, 50000);
        return {
          args: [
            createSortedArray(rng, { lengthMin: len, lengthMax: len, valueMin: -100, valueMax: 200 }),
            createSortedArray(rng, { lengthMin: len, lengthMax: len, valueMin: -100, valueMax: 200 }),
          ],
        };
      },
      hints: [
        'Sử dụng List<Integer> cho kết quả vì không rõ kích thước giao nhau từ đầu.',
        'Chạy 2 con trỏ i, j trên hai mảng sorted.',
        'Nếu left[i] == right[j] → thêm vào result bằng result.add(left[i]), tăng cả i và j.',
        'Nếu left[i] < right[j] → tăng i; ngược lại → tăng j.',
      ],
      solution: (left, right) => {
        const a = left as number[];
        const b = right as number[];
        const result: number[] = [];
        let i = 0;
        let j = 0;
        while (i < a.length && j < b.length) {
          if (a[i]! === b[j]!) {
            result.push(a[i]!);
            i += 1;
            j += 1;
          } else if (a[i]! < b[j]!) {
            i += 1;
          } else {
            j += 1;
          }
        }
        return result;
      },
    },
  ];
}