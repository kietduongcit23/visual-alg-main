import {
  createPositiveArray,
  createNumberArray,
  randomInt,
} from './lesson-helpers';
import type { LessonConfig } from './types';

export function createSlidingWindowLessonConfigs(): LessonConfig[] {
  return [
    // ─── Fixed Size: Max sum of subarray of size k ───────────────────────────
    {
      id: 'max-sum-subarray-k',
      title: '29. max sum of subarray of size k',
      methodName: 'maxSumSubarrayK',
      description:
        'Given an array and integer k, return the maximum sum of any contiguous subarray of exactly k elements.',
      starterCode: [
        'public int maxSumSubarrayK(int[] numbers, int k) {',
        '  // B1: Tính tổng của cửa sổ đầu tiên (k phần tử đầu)',
        '  int windowSum = 0;',
        '  for (int i = 0; i < k; i++) {',
        '    windowSum += numbers[i]; // cộng từng phần tử vào tổng',
        '  }',
        '',
        '  // B2: Gán maxSum ban đầu chính là windowSum đầu tiên',
        '  int maxSum = windowSum;',
        '',
        '  // B3: Trượt cửa sổ sang phải từng bước',
        '  for (int i = k; i < numbers.length; i++) {',
        '    // Cộng phần tử mới vào cửa sổ và trừ phần tử bị loại',
        '    windowSum += numbers[i] - numbers[i - k];',
        '',
        '    // B4: Cập nhật maxSum nếu tìm được tổng lớn hơn',
        '    if (windowSum > maxSum) {',
        '      maxSum = windowSum;',
        '    }',
        '  }',
        '',
        '  // B5: Trả về kết quả',
        '  return maxSum;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const len = context.preferSmall
          ? randomInt(rng, 5, 12)
          : randomInt(rng, 1000, 100000);
        const numbers = createNumberArray(rng, {
          lengthMin: len, lengthMax: len,
          valueMin: -100, valueMax: 200,
        });
        const k = context.preferSmall
          ? randomInt(rng, 2, Math.min(numbers.length, 5))
          : randomInt(rng, 2, Math.min(numbers.length, 1000));
        return { args: [numbers, k] };
      },
      hints: [
        'Tính tổng k phần tử đầu tiên: windowSum = sum(0..k-1).',
        'Trượt cửa sổ sang phải 1 bước: cộng phần tử mới, trừ phần tử bị loại.',
        'windowSum += numbers[i] - numbers[i - k];',
        'Cập nhật maxSum nếu windowSum lớn hơn.',
      ],
      solution: (numbers, k) => {
        const arr = numbers as number[];
        const size = k as number;
        let windowSum = 0;
        for (let i = 0; i < size; i += 1) {
          windowSum += arr[i]!;
        }
        let maxSum = windowSum;
        for (let i = size; i < arr.length; i += 1) {
          windowSum += arr[i]! - arr[i - size]!;
          if (windowSum > maxSum) {
            maxSum = windowSum;
          }
        }
        return maxSum;
      },
    },

    // ─── Variable Size: Shortest subarray with sum ≥ target ──────────────────
    {
      id: 'shortest-subarray-sum',
      title: '30. shortest subarray with sum ≥ target',
      methodName: 'shortestSubarraySum',
      description:
        'Given an array of positive integers and a target, return the length of the shortest contiguous subarray whose sum is ≥ target. Return 0 if no such subarray exists.',
      starterCode: [
        'public int shortestSubarraySum(int[] numbers, int target) {',
        '  // B1: Khởi tạo 2 con trỏ và biến tổng',
        '  int left = 0; // đầu cửa sổ',
        '  int currentSum = 0; // tổng hiện tại của cửa sổ',
        '  int minLen = numbers.length + 1; // lưu độ dài nhỏ nhất',
        '',
        '  // B2: Duyệt con trỏ right để mở rộng cửa sổ',
        '  for (int right = 0; right < numbers.length; right++) {',
        '    currentSum += numbers[right]; // thêm phần tử vào cửa sổ',
        '',
        '    // B3: Khi tổng >= target thì thu hẹp cửa sổ',
        '    while (currentSum >= target) {',
        '      int windowLen = right - left + 1; // tính độ dài cửa sổ',
        '',
        '      // Cập nhật độ dài nhỏ nhất nếu tốt hơn',
        '      if (windowLen < minLen) {',
        '        minLen = windowLen;',
        '      }',
        '',
        '      // Loại phần tử bên trái ra khỏi cửa sổ',
        '      currentSum -= numbers[left];',
        '      left += 1; // dịch trái sang phải',
        '    }',
        '  }',
        '',
        '  // B4: Nếu không tìm được thì trả 0',
        '  if (minLen > numbers.length) {',
        '    return 0;',
        '  }',
        '',
        '  // B5: Trả về độ dài nhỏ nhất',
        '  return minLen;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const len = context.preferSmall
          ? randomInt(rng, 5, 12)
          : randomInt(rng, 1000, 100000);
        const numbers = createPositiveArray(rng, {
          lengthMin: len, lengthMax: len,
          valueMin: 1, valueMax: 100,
        });
        const totalSum = numbers.reduce((s, v) => s + v, 0);
        const target = rng() > 0.2
          ? randomInt(rng, 3, Math.min(totalSum, context.preferSmall ? 30 : 5000))
          : totalSum + randomInt(rng, 1, 5);
        return { args: [numbers, target] };
      },
      hints: [
        'Dùng cửa sổ trượt kích thước thay đổi: mở rộng bên phải, thu hẹp bên trái.',
        'Mở rộng: cộng numbers[right] vào currentSum.',
        'Thu hẹp: khi currentSum >= target, cập nhật minLen rồi trừ numbers[left], tăng left.',
        'Trả 0 nếu minLen không bao giờ được cập nhật.',
      ],
      solution: (numbers, target) => {
        const arr = numbers as number[];
        const t = target as number;
        let left = 0;
        let currentSum = 0;
        let minLen = arr.length + 1;
        for (let right = 0; right < arr.length; right += 1) {
          currentSum += arr[right]!;
          while (currentSum >= t) {
            const windowLen = right - left + 1;
            if (windowLen < minLen) {
              minLen = windowLen;
            }
            currentSum -= arr[left]!;
            left += 1;
          }
        }
        return minLen > arr.length ? 0 : minLen;
      },
    },
  ];
}