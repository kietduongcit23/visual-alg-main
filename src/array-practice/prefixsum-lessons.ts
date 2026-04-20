import {
  createNumberArray,
  randomInt,
} from './lesson-helpers';
import type { LessonConfig } from './types';

export function createPrefixSumLessonConfigs(): LessonConfig[] {
  return [
    // ─── Basic: Build prefix sum array ───────────────────────────────────────
    {
      id: 'build-prefix-sum',
      title: '31. build prefix sum array',
      methodName: 'buildPrefixSum',
      description:
        'Given an array of n numbers, return a prefix sum array of length n+1 where prefix[0] = 0 and prefix[i] = sum of elements from index 0 to i-1.',
      starterCode: [
        'public int[] buildPrefixSum(int[] numbers) {',
        '  // Khởi tạo mảng prefix có kích thước n + 1 (mặc định các phần tử là 0)',
        '  int[] prefix = new int[numbers.length + 1];',
        '  prefix[0] = 0;',
        '',
        '  // Duyệt qua từng phần tử của mảng numbers',
        '  for (int i = 0; i < numbers.length; i++) {',
        '    // prefix[i + 1] = prefix[i] + numbers[i]',
        '    prefix[i + 1] = prefix[i] + numbers[i];',
        '  }',
        '',
        '  // Trả về mảng prefix',
        '  return prefix;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const len = context.preferSmall
          ? randomInt(rng, 4, 10)
          : randomInt(rng, 1000, 100000);
        return {
          args: [createNumberArray(rng, { lengthMin: len, lengthMax: len, valueMin: -100, valueMax: 200 })],
        };
      },
      hints: [
        'Khởi tạo: int[] prefix = new int[numbers.length + 1]; (trong Java, mảng int mặc định chứa toàn số 0).',
        'Duyệt qua mảng numbers và tính dồn: prefix[i + 1] = prefix[i] + numbers[i];',
      ],
      solution: (numbers) => {
        const arr = numbers as number[];
        const prefix: number[] = [0];
        for (let i = 0; i < arr.length; i += 1) {
          prefix.push(prefix[i]! + arr[i]!);
        }
        return prefix;
      },
    },

    // ─── Applied: Range sum queries ──────────────────────────────────────────
    {
      id: 'range-sum-queries',
      title: '32. range sum queries (prefix sum)',
      methodName: 'rangeSumQueries',
      description:
        'Given an array and a list of queries [l, r], return an array of answers where each answer is the sum of elements from index l to r (inclusive). Use prefix sum for efficiency.',
      starterCode: [
        'public int[] rangeSumQueries(int[] numbers, int[][] queries) {',
        '  // Bước 1: Tạo mảng prefix sum',
        '  int[] prefix = new int[numbers.length + 1];',
        '  prefix[0] = 0;',
        '',
        '  // Xây dựng prefix sum giống bài trước',
        '  for (int i = 0; i < numbers.length; i++) {',
        '    prefix[i + 1] = prefix[i] + numbers[i];',
        '  }',
        '',
        '  // Mảng lưu kết quả các query (kích thước bằng số lượng query)',
        '  int[] results = new int[queries.length];',
        '',
        '  // Duyệt qua từng query',
        '  for (int q = 0; q < queries.length; q++) {',
        '    // Lấy l và r từ query',
        '    int l = queries[q][0];',
        '    int r = queries[q][1];',
        '',
        '    // Tính tổng đoạn [l, r] bằng prefix sum',
        '    // Công thức: prefix[r + 1] - prefix[l]',
        '    results[q] = prefix[r + 1] - prefix[l];',
        '  }',
        '',
        '  // Trả về kết quả',
        '  return results;',
        '}',
      ].join('\n'),
      genTest: (rng, context) => {
        const arrLen = context.preferSmall
          ? randomInt(rng, 5, 10)
          : randomInt(rng, 10000, 100000);
        const numbers = createNumberArray(rng, {
          lengthMin: arrLen, lengthMax: arrLen,
          valueMin: -100, valueMax: 200,
        });
        const queryCount = context.preferSmall
          ? randomInt(rng, 2, 5)
          : randomInt(rng, 100, 10000);
        const queries: number[][] = [];
        for (let q = 0; q < queryCount; q += 1) {
          const l = randomInt(rng, 0, numbers.length - 2);
          const r = randomInt(rng, l, numbers.length - 1);
          queries.push([l, r]);
        }
        return { args: [numbers, queries] };
      },
      hints: [
        'Bước 1: Xây dựng mảng prefix sum: int[] prefix = new int[numbers.length + 1];',
        'Bước 2: Tạo mảng kết quả: int[] results = new int[queries.length];',
        'Bước 3: Với mỗi query tính: results[q] = prefix[r + 1] - prefix[l];',
      ],
      solution: (numbers, queries) => {
        const arr = numbers as number[];
        const qs = queries as number[][];
        const prefix: number[] = [0];
        for (let i = 0; i < arr.length; i += 1) {
          prefix.push(prefix[i]! + arr[i]!);
        }
        return qs.map(([l, r]) => prefix[r! + 1]! - prefix[l!]!);
      },
    },
  ];
}