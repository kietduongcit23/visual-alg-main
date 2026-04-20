public int indexOfValue(int[] numbers, int target) {
  // Duyệt từ đầu mảng
  for (int i = 0; i < numbers.length; i++) {
    // Nếu tìm thấy target
    if (numbers[i] == target) {
      // Trả về vị trí đầu tiên
      return i;
    }
  }

  // Không tìm thấy
  return -1;
}