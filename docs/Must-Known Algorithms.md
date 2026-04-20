
## 3. Must-Known Algorithms

This section covers essential algorithms and patterns that every programmer should master. These are fundamental building blocks used across different domains and problem types.

![15 Must-Know Algorithms](images/algorithms.webp){style="max-width: 90%;"}


### 3.1 Binary Search

Binary Search is one of the most important algorithms in computer science. It works by repeatedly dividing the search space in half, achieving logarithmic time complexity.

#### 3.1.1 Binary Search on Sorted Array

**Problem:** Find if a target value exists in a sorted array

**Iterative Implementation:**

```java
public static boolean binarySearch(int[] sortedNumbers, int target) {
    int leftIndex = 0;
    int rightIndexExclusive = sortedNumbers.length;
    
    while (leftIndex < rightIndexExclusive) {
        int middleIndex = leftIndex + (rightIndexExclusive - leftIndex) / 2;
        
        if (sortedNumbers[middleIndex] == target) {
            return true;
        } else if (sortedNumbers[middleIndex] < target) {
            leftIndex = middleIndex + 1;
        } else {
            rightIndexExclusive = middleIndex;
        }
    }
    return false;
}
// Time: O(log n), Space: O(1)
```

**Recursive Implementation:**

```java
public static int binarySearch(int[] sortedNumbers, int target, int leftIndex, int rightIndexExclusive) {
    if (leftIndex >= rightIndexExclusive) return -1;
    
    int middleIndex = leftIndex + (rightIndexExclusive - leftIndex) / 2;
    
    if (sortedNumbers[middleIndex] == target) return middleIndex;
    if (sortedNumbers[middleIndex] < target) {
        return binarySearch(sortedNumbers, target, middleIndex + 1, rightIndexExclusive);
    }
    return binarySearch(sortedNumbers, target, leftIndex, middleIndex);
}
// Time: O(log n), Space: O(log n) for recursion stack
```

#### 3.1.2 Binary Search on Value Domain

**Concept:** Binary search can find an answer in a continuous or discrete value range, not just in arrays. If we can check whether a value is "too small" or "too large", we can binary search for the answer.

**Real-World Problem:** Calculate electricity consumption (kWh) from total bill amount

**Vietnam uses tiered electricity pricing (2026):** Higher consumption → higher rate per kWh

**Challenge:** Given total bill = 500,000 VND, find kWh consumed?
- Direct calculation is complex (multiple tiers with different rates)
- **Solution:** Binary search on kWh values!

```java
public class ElectricityBilling {
    // Vietnam electricity pricing tiers (2026)
    private static final double[] LEVELS = {0, 50, 100, 200, 300, 400};
    private static final double[] PRICES = {1893, 1956, 2271, 2860, 3197, 3302};
    
    // Calculate bill from kWh using tiered pricing
    public static double calculateBill(double kwh) {
        if (kwh <= 0) return 0;
        
        double bill = 0;
        double previousLevel = 0;
        
        for (int i = 0; i < LEVELS.length; i++) {
            if (kwh <= LEVELS[i]) {
                bill += (kwh - previousLevel) * PRICES[i];
                return bill;
            }
            bill += (LEVELS[i] - previousLevel) * PRICES[i];
            previousLevel = LEVELS[i];
        }
        
        // Above highest tier
        bill += (kwh - previousLevel) * PRICES[PRICES.length - 1];
        return bill;
    }
    
    // Binary search to find kWh from bill amount
    public static double findKwhFromBill(double targetBill) {
        double left = 0;
        double right = 1000; // Reasonable upper bound
        double epsilon = 0.01; // Precision: 0.01 kWh
        
        while (right - left > epsilon) {
            double mid = (left + right) / 2;
            double calculatedBill = calculateBill(mid);
            
            if (Math.abs(calculatedBill - targetBill) < 100) {
                return mid; // Found within 100 VND tolerance
            } else if (calculatedBill < targetBill) {
                left = mid; // Need more kWh
            } else {
                right = mid; // Need less kWh
            }
        }
        return (left + right) / 2;
    }
}
// Example: findKwhFromBill(500000) ≈ 206.5 kWh
// Time: O(log(range/epsilon)) = O(log(1000/0.01)) ≈ O(17) iterations
```

**Key Insight:** Binary search works on any monotonic function (always increasing or always decreasing). Here, bill increases as kWh increases, so we can binary search the kWh value!

**Other Applications:**
- Find square root of a number
- Minimize maximum distance in allocation problems
- Find minimum time to complete tasks
- Optimize resource allocation

### 3.2 Recursion

Recursion is a technique where a function calls itself to solve smaller instances of the same problem.

#### 3.2.1 Anatomy of Recursion

Every recursive function needs:

1. **Base Case:** Condition to stop recursion
2. **Recursive Case:** Function calls itself with smaller input
3. **Progress Toward Base Case:** Each call moves closer to base case

#### 3.2.2 Examples

**Example 1: Power with Modulo (Optimization)**

```java
public static long powerMod(long base, long exp, long mod) {
    if (exp == 0) return 1;
    long half = powerMod(base, exp / 2, mod);
    half = (half * half) % mod;
    if (exp % 2 == 1) half = (half * base) % mod;
    return half;
}
// Time: O(log n), Space: O(log n)
// Example: powerMod(2, 10, 1000) = 24
```

**Example 2: Merge Sort (Divide and Conquer)**

```java
public static void mergeSort(int[] values, int leftIndex, int rightIndexExclusive) {
    if (rightIndexExclusive - leftIndex <= 1) return;
    int middleIndex = leftIndex + (rightIndexExclusive - leftIndex) / 2;
    mergeSort(values, leftIndex, middleIndex);
    mergeSort(values, middleIndex, rightIndexExclusive);
    merge(values, leftIndex, middleIndex, rightIndexExclusive);
}

private static void merge(int[] values, int leftIndex, int middleIndex, int rightIndexExclusive) {
    // ... merging logic here ...
}
// Time: O(n log n), Space: O(n)
```

#### 3.2.3 Tail Recursion

**Tail recursion** occurs when the recursive call is the last operation in the function. This is important because some compilers can optimize tail recursion into iteration, avoiding stack overflow for deep recursion.

**Binary Search (section 3.1.1) is tail recursive:**
- The function either returns a value directly OR makes a recursive call
- Nothing happens after the recursive call returns
- Can be easily converted to iteration

### 3.3 Backtracking

**Backtracking** is a recursive technique for solving problems by trying to build a solution incrementally and abandoning a solution ("backtracking") as soon as it's determined that the solution cannot be completed.

**Pattern:**
1. Make a choice
2. Recursively explore that choice
3. If it leads to a solution, done!
4. If not, **backtrack** (undo the choice) and try another option

**Example: Subset Sum - Can we select elements that sum to target?**

```java
public static boolean subsetSum(int[] values, int target, int currentIndex) {
    // Base case: found exact sum
    if (target == 0) return true;
    // Base case: no more elements to try
    if (currentIndex >= values.length) return false;
    // Optimization: if target negative and all elements positive, no solution
    if (target < 0) return false;
    
    // Choice 1: Include current element
    if (subsetSum(values, target - values[currentIndex], currentIndex + 1)) {
        return true;  // Solution found!
    }
    
    // Choice 2: Backtrack and try NOT including current element
    return subsetSum(values, target, currentIndex + 1);
}
// Example: subsetSum([3, 5, 2, 8], 10, 0) = true (3+5+2=10 or 2+8=10)
// Example: subsetSum([3, 5, 2, 8], 4, 0) = false (no subset sums to 4)
// Example: subsetSum([1, 2, 5], 7, 0) = true (2+5=7)
// Time: O(2ⁿ), Space: O(n) for recursion stack
// Note: Assumes array contains positive integers
```

**Key Insight:** Backtracking tries a path (include element), and if it fails, **backtracks** to try alternative (exclude element). This demonstrates the "abandoning a solution" concept.

**Common Backtracking Problems:**
- Generate all permutations/combinations
- N-Queens problem (place queens on chessboard)
- Sudoku solver
- Maze solving
- Word search in grid

**Note:** More advanced backtracking techniques and optimization strategies will be covered in **CSE 202: Discrete Mathematics II** and **CSE 310: Analysis and Design of Algorithms**, where you'll learn about combinatorics, graph theory, and advanced recursive problem-solving.

### 3.4 Two Pointers

The Two Pointers technique uses two pointers to traverse data structure, often from different ends or at different speeds.

#### 3.4.1 Pattern 1: Opposite Direction

**Problem: Two Sum (sorted array)**

```java
public static int[] twoSum(int[] sortedNumbers, int target) {
    int leftIndex = 0;
    int rightIndex = sortedNumbers.length - 1;
    
    while (leftIndex < rightIndex) {
        int currentSum = sortedNumbers[leftIndex] + sortedNumbers[rightIndex];
        
        if (currentSum == target) {
            return new int[]{leftIndex, rightIndex};
        } else if (currentSum < target) {
            leftIndex++;
        } else {
            rightIndex--;
        }
    }
    return new int[]{-1, -1};
}
// Time: O(n), Space: O(1)
// Note: Array must be sorted!
```

#### 3.4.2 Pattern 2: Same Direction (Fast & Slow)

**Problem: Remove duplicates from sorted array (in-place)**

```java
public static int removeDuplicates(int[] sortedNumbers) {
    if (sortedNumbers.length == 0) return 0;
    int slow = 0;
    for (int fast = 1; fast < sortedNumbers.length; fast++) {
        if (sortedNumbers[fast] != sortedNumbers[slow]) {
            slow++;
            sortedNumbers[slow] = sortedNumbers[fast];
        }
    }
    return slow + 1;
}
// Time: O(n), Space: O(1)
// Example: [1,1,2,2,3] → [1,2,3,2,3], returns 3
```

### 3.5 Sliding Window

Sliding Window technique maintains a window (subarray) that slides through the array to solve problems involving subarrays.

#### 3.5.1 Fixed Size Window

**Problem:** Maximum sum of k consecutive elements**

```java
public static int maxSumFixedWindow(int[] values, int windowSize) {
    if (values.length < windowSize) return -1;
    
    // Calculate sum of first window
    int windowSum = 0;
    for (int index = 0; index < windowSize; index++) {
        windowSum += values[index];
    }
    
    int maxSum = windowSum;
    
    // Slide window: remove left, add right
    for (int index = windowSize; index < values.length; index++) {
        windowSum = windowSum - values[index - windowSize] + values[index];
        maxSum = Math.max(maxSum, windowSum);
    }
    
    return maxSum;
}
// Time: O(n), Space: O(1)
// Without sliding window would be O(n×k)
```

#### 3.5.2 Variable Size Window

**Problem: Smallest subarray with sum ≥ target**

```java
public static int minSubArrayLen(int target, int[] values) {
    int minLength = Integer.MAX_VALUE;
    int windowSum = 0;
    int windowStart = 0;
    
    for (int windowEnd = 0; windowEnd < values.length; windowEnd++) {
        windowSum += values[windowEnd];
        while (windowSum >= target) {
            minLength = Math.min(minLength, windowEnd - windowStart + 1);
            windowSum -= values[windowStart];
            windowStart++;
        }
    }
    return minLength == Integer.MAX_VALUE ? 0 : minLength;
}
// Time: O(n), Space: O(1)
```

### 3.6 Prefix Sum

Prefix Sum (Cumulative Sum) technique preprocesses an array to answer range sum queries efficiently.

#### 3.6.1 Basic Prefix Sum

**Problem:** Multiple range sum queries on static array**

```java
public class PrefixSum {
    private int[] prefix;
    
    // Preprocessing: O(n)
    public PrefixSum(int[] values) {
        prefix = new int[values.length + 1];
        
        for (int index = 0; index < values.length; index++) {
            prefix[index + 1] = prefix[index] + values[index];
        }
    }
    
    // Query sum of range [left, right]: O(1)
    public int rangeSum(int leftIndex, int rightIndex) {
        return prefix[rightIndex + 1] - prefix[leftIndex];
    }
}

// Example:
// values = [3, 5, 2, 8, 1, 4]
// prefix = [0, 3, 8, 10, 18, 19, 23]
// rangeSum(1, 4) = prefix[5] - prefix[1] = 19 - 3 = 16
// (5 + 2 + 8 + 1 = 16) ✓
```

**Without Prefix Sum:**
- Multiple queries: O(q × n) where q = number of queries
- With prefix sum: O(n + q) - much better for many queries!

#### 3.6.2 2D Prefix Sum

**Problem:** Range sum in 2D matrix**

```java
public class PrefixSum2D {
    private int[][] prefix;
    
    // Preprocessing: O(m × n)
    public PrefixSum2D(int[][] matrix) {
        int m = matrix.length;
        int n = matrix[0].length;
        prefix = new int[m + 1][n + 1];
        
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                prefix[i][j] = matrix[i-1][j-1]
                             + prefix[i-1][j]
                             + prefix[i][j-1]
                             - prefix[i-1][j-1];
            }
        }
    }
    
    // Query sum of rectangle [r1,c1] to [r2,c2]: O(1)
    public int rangeSum(int r1, int c1, int r2, int c2) {
        return prefix[r2+1][c2+1]
             - prefix[r1][c2+1]
             - prefix[r2+1][c1]
             + prefix[r1][c1];
    }
}
```

