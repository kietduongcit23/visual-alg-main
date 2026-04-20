import { createNumberArray, pickOne } from './lesson-helpers';
import type { LessonConfig } from './types';

export function createExtremaLessonConfigs(): LessonConfig[] {
  return [
    {
      id: 'find-max',
      title: '4. find maximum value',
      methodName: 'findMaxValue',
      description: 'Return the maximum number in a non-empty array.',
      starterCode: [
        'public int findMaxValue(int[] numbers) {',
        '  // Giả sử phần tử đầu tiên là lớn nhất',
        '  int max = numbers[0];',
        '',
        '  // Duyệt từ phần tử thứ 2 trở đi',
        '  for (int i = 1; i < numbers.length; i++) {',
        '    // Nếu tìm thấy phần tử lớn hơn',
        '    if (numbers[i] > max) {',
        '      // Cập nhật lại max',
        '      max = numbers[i];',
        '    }',
        '  }',
        '',
        '  // Trả về giá trị lớn nhất',
        '  return max;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 3, lengthMax: 8, valueMin: -12, valueMax: 18 })] }),
      hints: [
        'Giả sử phần tử đầu tiên là lớn nhất: int max = numbers[0];',
        'So sánh với các phần tử khác: if (numbers[i] > max) { max = numbers[i]; }'
      ],
      solution: (numbers) => Math.max(...(numbers as number[])),
    },

    {
      id: 'find-min',
      title: '5. find minimum value',
      methodName: 'findMinValue',
      description: 'Return the minimum number in a non-empty array.',
      starterCode: [
        'public int findMinValue(int[] numbers) {',
        '  // Giả sử phần tử đầu tiên là nhỏ nhất',
        '  int min = numbers[0];',
        '',
        '  // Duyệt từ phần tử thứ 2',
        '  for (int i = 1; i < numbers.length; i++) {',
        '    // Nếu tìm thấy phần tử nhỏ hơn',
        '    if (numbers[i] < min) {',
        '      // Cập nhật lại min',
        '      min = numbers[i];',
        '    }',
        '  }',
        '',
        '  // Trả về giá trị nhỏ nhất',
        '  return min;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 3, lengthMax: 8, valueMin: -12, valueMax: 18 })] }),
      hints: [
        'Giả sử phần tử đầu tiên là nhỏ nhất: int min = numbers[0];',
        'So sánh: if (numbers[i] < min) { min = numbers[i]; }'
      ],
      solution: (numbers) => Math.min(...(numbers as number[])),
    },

    {
      id: 'index-of-max',
      title: '6. find index of maximum value',
      methodName: 'indexOfMaxValue',
      description: 'Return the index of the first maximum value.',
      starterCode: [
        'public int indexOfMaxValue(int[] numbers) {',
        '  // Giả sử vị trí 0 là vị trí của max',
        '  int bestIndex = 0;',
        '',
        '  // Duyệt từ phần tử thứ 2',
        '  for (int i = 1; i < numbers.length; i++) {',
        '    // So sánh với giá trị tại bestIndex',
        '    if (numbers[i] > numbers[bestIndex]) {',
        '      // Cập nhật vị trí mới',
        '      bestIndex = i;',
        '    }',
        '  }',
        '',
        '  // Trả về vị trí của max',
        '  return bestIndex;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8 })], note: 'If the max repeats, return the first index.' }),
      hints: [
        'Theo dõi vị trí lớn nhất: int bestIndex = 0;',
        'So sánh giá trị tại bestIndex với giá trị tại i: if (numbers[i] > numbers[bestIndex]) { bestIndex = i; }'
      ],
      solution: (numbers) => {
        const values = numbers as number[];
        let bestIndex = 0;
        for (let i = 1; i < values.length; i += 1) {
          if (values[i]! > values[bestIndex]!) {
            bestIndex = i;
          }
        }
        return bestIndex;
      },
    },

    {
      id: 'index-of-min',
      title: '7. find index of minimum value',
      methodName: 'indexOfMinValue',
      description: 'Return the index of the first minimum value.',
      starterCode: [
        'public int indexOfMinValue(int[] numbers) {',
        '  // Giả sử vị trí 0 là vị trí của min',
        '  int bestIndex = 0;',
        '',
        '  // Duyệt từ phần tử thứ 2',
        '  for (int i = 1; i < numbers.length; i++) {',
        '    // So sánh với giá trị tại bestIndex',
        '    if (numbers[i] < numbers[bestIndex]) {',
        '      // Cập nhật vị trí mới',
        '      bestIndex = i;',
        '    }',
        '  }',
        '',
        '  // Trả về vị trí của min',
        '  return bestIndex;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 8 })], note: 'If the min repeats, return the first index.' }),
      hints: [
        'Theo dõi vị trí nhỏ nhất: int bestIndex = 0;',
        'So sánh: if (numbers[i] < numbers[bestIndex]) { bestIndex = i; }'
      ],
      solution: (numbers) => {
        const values = numbers as number[];
        let bestIndex = 0;
        for (let i = 1; i < values.length; i += 1) {
          if (values[i]! < values[bestIndex]!) {
            bestIndex = i;
          }
        }
        return bestIndex;
      },
    },

    {
      id: 'count-max-occurrences',
      title: '11. count occurrences of the maximum value',
      methodName: 'countMaxOccurrences',
      description: 'Find the maximum value first, then count how often it appears.',
      starterCode: [
        'public int countMaxOccurrences(int[] numbers) {',
        '  // Tìm giá trị lớn nhất trước',
        '  int max = numbers[0];',
        '  for (int i = 1; i < numbers.length; i++) {',
        '    if (numbers[i] > max) {',
        '      max = numbers[i];',
        '    }',
        '  }',
        '',
        '  // Đếm số lần max xuất hiện',
        '  int count = 0;',
        '  for (int i = 0; i < numbers.length; i++) {',
        '    if (numbers[i] == max) {',
        '      count += 1;',
        '    }',
        '  }',
        '',
        '  return count;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9, valueMin: -4, valueMax: 7 })] }),
      hints: [
        'Cách đơn giản nhất là dùng 2 vòng lặp.',
        'Vòng lặp 1: Tìm giá trị lớn nhất (max).',
        'Vòng lặp 2: Đếm số lần giá trị max xuất hiện.'
      ],
      solution: (numbers) => {
        const values = numbers as number[];
        const max = Math.max(...values);
        return values.filter((value: number) => value === max).length;
      },
    },

    {
      id: 'most-frequent',
      title: '13. find value with most occurrences',
      methodName: 'mostFrequentValue',
      description: 'Return the value with the highest frequency. If frequencies tie, return the smaller value.',
      starterCode: [
        'import java.util.HashMap;',
        'import java.util.Map;',
        '',
        'public int mostFrequentValue(int[] numbers) {',
        '  // Tạo Map để đếm số lần xuất hiện',
        '  Map<Integer, Integer> counts = new HashMap<>();',
        '  // Giá trị xuất hiện nhiều nhất',
        '  int bestValue = numbers[0];',
        '  // Số lần xuất hiện lớn nhất',
        '  int bestCount = 0;',
        '',
        '  // Duyệt qua mảng',
        '  for (int i = 0; i < numbers.length; i++) {',
        '    int value = numbers[i];',
        '',
        '    // Lấy số đếm hiện tại (nếu chưa có thì là 0) và cộng thêm 1',
        '    int currentCount = counts.getOrDefault(value, 0) + 1;',
        '    counts.put(value, currentCount);',
        '',
        '    // Cập nhật giá trị xuất hiện nhiều nhất',
        '    if (currentCount > bestCount || (currentCount == bestCount && value < bestValue)) {',
        '      bestCount = currentCount;',
        '      bestValue = value;',
        '    }',
        '  }',
        '',
        '  return bestValue;',
        '}',
      ].join('\n'),
      genTest: (rng) => ({ args: [createNumberArray(rng, { lengthMin: 5, lengthMax: 10, valueMin: -2, valueMax: 5 })], note: 'Tie-breaker: smaller value wins.' }),
      hints: [
        'Tạo Map để đếm: Map<Integer, Integer> counts = new HashMap<>();',
        'Cập nhật đếm bằng getOrDefault: counts.put(value, counts.getOrDefault(value, 0) + 1);',
        'Lưu lại giá trị xuất hiện nhiều nhất trong lúc duyệt.'
      ],
      solution: (numbers) => {
        const values = numbers as number[];
        const counts = new Map<number, number>();
        let bestValue = values[0]!;
        let bestCount = 0;
        for (const value of values) {
          const nextCount = (counts.get(value) || 0) + 1;
          counts.set(value, nextCount);
          if (nextCount > bestCount || (nextCount === bestCount && value < bestValue)) {
            bestCount = nextCount;
            bestValue = value;
          }
        }
        return bestValue;
      },
    },

    {
      id: 'second-extreme',
      title: '17. second largest/smallest',
      methodName: 'secondExtreme',
      description: 'Return the second distinct largest or smallest value.',
      starterCode: [
        'public int secondExtreme(int[] numbers, String mode) {',
        '  int[] unique = [];',
        '',
        '  // lọc phần tử không trùng',
        '  for (int i = 0; i < numbers.length; i++) {',
        '    if (!unique.includes(numbers[i])) {',
        '      unique.push(numbers[i]);',
        '    }',
        '  }',
        '',
        '  // sắp xếp',
        '  unique.sort((a, b) => a - b);',
        '',
        '  if (unique.length < 2) {',
        '    return null;',
        '  }',
        '',
        '  if (mode == "largest") {',
        '    return unique[unique.length - 2];',
        '  } else {',
        '    return unique[1];',
        '  }',
        '}',
      ].join('\n'),
      genTest: (rng) => ({
        args: [createNumberArray(rng, { lengthMin: 4, lengthMax: 9, valueMin: -4, valueMax: 8 }), pickOne(rng, ['largest', 'smallest'])],
        note: 'Second means second distinct value.',
      }),
      hints: [
        'Dùng ArrayList để lưu các giá trị không trùng lặp: unique.add(numbers[i]);',
        'Sắp xếp lại list vừa tìm được: Collections.sort(unique);',
        'Lấy vị trí tương ứng từ cuối List hoặc đầu List tùy theo yêu cầu. Chú ý trong Java so sánh chuỗi bằng mode.equals("largest").'
      ],
      solution: (numbers, mode) => {
        const unique = Array.from(new Set(numbers as number[])).sort((left: number, right: number) => left - right);
        if (unique.length < 2) {
          return null;
        }
        return mode === 'largest' ? unique[unique.length - 2] : unique[1];
      },
    },
  ];
}