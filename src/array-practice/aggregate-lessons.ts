import { createNumberArray } from './lesson-helpers';
import type { LessonConfig } from './types';

export function createAggregateLessonConfigs(): LessonConfig[] {
  return [
    {
      id: 'sum-all',
      title: '8. calculate sum of all elements',
      methodName: 'sumAllElements',
      description: 'Return the sum of all array elements.',
      starterCode: [
        'public int sumAllElements(int[] numbers) {',
        '  // Khởi tạo biến sum để lưu tổng',
        '  int sum = 0;',
        '',
        '  // Duyệt qua từng phần tử trong mảng',
        '  for (int i = 0; i < numbers.length; i++) {',
        '    // Cộng dồn từng phần tử vào sum',
        '    sum += numbers[i];',
        '  }',
        '',
        '  // Trả về tổng sau khi đã cộng hết',
        '  return sum;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9, valueMin: -8, valueMax: 12 })] }),
      hints: [
        'Khởi tạo biến tổng: int sum = 0;',
        'Cộng dồn trong vòng lặp: sum += numbers[i];'
      ],
      solution: (numbers) => (numbers as number[]).reduce((sum: number, value: number) => sum + value, 0),
    },

    {
      id: 'average',
      title: '9. calculate average of all elements',
      methodName: 'averageOfElements',
      description: 'Return the arithmetic mean of a non-empty array.',
      starterCode: [
        'public double averageOfElements(int[] numbers) {',
        '  // Khởi tạo biến sum kiểu double để chia lấy phần thập phân',
        '  double sum = 0;',
        '',
        '  // Duyệt qua mảng và cộng dồn',
        '  for (int i = 0; i < numbers.length; i++) {',
        '    sum += numbers[i];',
        '  }',
        '',
        '  // Lấy trung bình = tổng / số phần tử',
        '  return sum / numbers.length;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 3, lengthMax: 7, valueMin: -10, valueMax: 14 })], note: 'Use the exact average, not rounded.' }),
      hints: [
        'Tính tổng giống bài sum-all. Đảm bảo dùng kiểu số thực (double) cho tổng.',
        'Chia cho độ dài mảng: return sum / numbers.length;'
      ],
      solution: (numbers) => (numbers as number[]).reduce((sum: number, value: number) => sum + value, 0) / (numbers as number[]).length,
      checker: ({ actual, expected }) => ({
        pass: typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-9,
        message: 'Average must match the exact arithmetic mean.',
      }),
    },

    {
      id: 'count-unique',
      title: '12. count unique values in array',
      methodName: 'countUniqueValues',
      description: 'Return how many distinct values appear in the array.',
      starterCode: [
        'import java.util.ArrayList;',
        'import java.util.List;',
        '',
        'public int countUniqueValues(int[] numbers) {',
        '  // Tạo List để lưu các giá trị đã xuất hiện',
        '  List<Integer> seen = new ArrayList<>();',
        '',
        '  // Duyệt qua từng phần tử trong mảng',
        '  for (int i = 0; i < numbers.length; i++) {',
        '    // Nếu phần tử chưa có trong danh sách seen',
        '    if (!seen.contains(numbers[i])) {',
        '      // Thêm phần tử mới vào seen',
        '      seen.add(numbers[i]);',
        '    }',
        '  }',
        '',
        '  // Số lượng phần tử khác nhau = độ dài danh sách seen',
        '  return seen.size();',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: -3, valueMax: 5 })] }),
      hints: [
        'Khởi tạo danh sách lưu các giá trị đã thấy: List<Integer> seen = new ArrayList<>();',
        'Nếu chưa thấy thì thêm vào: if (!seen.contains(numbers[i])) { seen.add(numbers[i]); }',
        'Trả về seen.size();'
      ],
      solution: (numbers) => new Set(numbers as number[]).size,
    },
  ];
}