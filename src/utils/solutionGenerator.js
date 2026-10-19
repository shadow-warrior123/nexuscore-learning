/**
 * Intelligent Multi-Approach Pedagogical Solution Engine
 * Generates:
 * 1. Inspiration & Core Mental Model
 * 2. Approach 1: Brute Force (Naive)
 * 3. Approach 2: Better (Sorting / Two Pointers / Intermediate)
 * 4. Approach 3: Optimal (Hash Map / Monotonic Stack / DP / In-Place)
 * 5. Multi-Language Code (Python 3, C++, Java, JavaScript)
 * 6. Iteration Dry Run Walkthrough
 * 7. Edge Cases & Interview Traps
 */

export function generateNeetCodeSolution(problem) {
  const title = problem.title || 'Algorithmic Problem';
  const category = problem.category || problem.trackType || 'General';
  const catLower = category.toLowerCase();
  const titleLower = title.toLowerCase();

  // Pattern detection
  const isTwoSum = titleLower.includes('two sum') || titleLower.includes('two integer');
  const isAnagram = titleLower.includes('anagram');
  const isDuplicate = titleLower.includes('duplicate');
  const isPalindrome = titleLower.includes('palindrome');
  const isBinarySearch = catLower.includes('binary search') || titleLower.includes('binary search');
  const isSlidingWindow = catLower.includes('sliding window');
  const isStack = catLower.includes('stack');
  const isLinkedList = catLower.includes('linked list');
  const isTree = catLower.includes('tree');
  const isGraph = catLower.includes('graph');
  const isDP = catLower.includes('dynamic programming') || catLower.includes('dp');
  const isML = problem.trackType === 'ml' || catLower.includes('loss') || catLower.includes('regression') || catLower.includes('attention') || catLower.includes('neural');
  const isDataEng = problem.trackType === 'data' || catLower.includes('pandas') || catLower.includes('sql') || catLower.includes('numpy') || catLower.includes('pyspark');

  // 1. INSPIRATION & MENTAL MODEL
  let inspiration = {
    coreDilemma: `The naive instinct for "${title}" is to test all combinations or traverse repeatedly, which causes time complexity to explode as input size grows.`,
    mentalModel: `To find the optimal solution, identify the invariant or redundant check: can we trade space for time, or can ordering/sorting turn an exhaustive search into an efficient single-pass lookup?`,
    patternInsight: `This problem fundamentally belongs to the **${category}** paradigm. Recognizing this pattern tells us immediately which data structure or pointer strategy eliminates the inner loop.`
  };

  // 2. APPROACHES
  let approaches = [];

  if (isTwoSum) {
    approaches = [
      {
        id: 'brute',
        name: 'Approach 1: Brute Force (Nested Loops)',
        tier: 'Naive Baseline',
        badgeColor: 'text-rose-400 bg-rose-950/70 border-rose-800',
        intuition: 'Examine every possible pair of elements in the array to see if their sum matches the target.',
        algorithm: [
          'Run an outer loop index i from 0 to N - 1.',
          'Run an inner loop index j from i + 1 to N.',
          'Check if nums[i] + nums[j] == target.',
          'If found, return [i, j].'
        ],
        timeComplexity: 'O(N²)',
        timeRationale: 'Checking all N * (N - 1) / 2 pairs requires quadratic time.',
        spaceComplexity: 'O(1)',
        spaceRationale: 'No auxiliary data structures allocated; only two index pointers.',
        code: {
          python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        n = len(nums)\n        for i in range(n):\n            for j in range(i + 1, n):\n                if nums[i] + nums[j] == target:\n                    return [i, j]\n        return []`,
          cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        int n = nums.size();\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j < n; j++) {\n                if (nums[i] + nums[j] == target) return {i, j};\n            }\n        }\n        return {};\n    }\n};`,
          java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) return new int[]{i, j};\n            }\n        }\n        return new int[0];\n    }\n}`,
          javascript: `function twoSum(nums, target) {\n    for (let i = 0; i < nums.length; i++) {\n        for (let j = i + 1; j < nums.length; j++) {\n            if (nums[i] + nums[j] === target) return [i, j];\n        }\n    }\n    return [];\n}`
        }
      },
      {
        id: 'better',
        name: 'Approach 2: Sort + Two Pointers',
        tier: 'Better Intermediate',
        badgeColor: 'text-amber-400 bg-amber-950/70 border-amber-800',
        intuition: 'Sort the elements along with their original indices. Use a left and right converging pointer. If the sum is too small, advance left; if too large, decrement right.',
        algorithm: [
          'Pair each number with its original index and sort by value: O(N log N).',
          'Set left pointer at 0 and right pointer at N - 1.',
          'While left < right:',
          '  Compute current_sum = nums[left] + nums[right].',
          '  If current_sum == target, return original indices.',
          '  Else if current_sum < target, increment left.',
          '  Else, decrement right.'
        ],
        timeComplexity: 'O(N log N)',
        timeRationale: 'Sorting dominates the time complexity. The two-pointer scan takes O(N).',
        spaceComplexity: 'O(N)',
        spaceRationale: 'Required to store the paired values with original indices.',
        code: {
          python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        indexed = sorted([(val, i) for i, val in enumerate(nums)])\n        l, r = 0, len(nums) - 1\n        while l < r:\n            s = indexed[l][0] + indexed[r][0]\n            if s == target:\n                return [indexed[l][1], indexed[r][1]]\n            elif s < target:\n                l += 1\n            else:\n                r -= 1\n        return []`,
          cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        vector<pair<int, int>> indexed;\n        for (int i = 0; i < nums.size(); i++) indexed.push_back({nums[i], i});\n        sort(indexed.begin(), indexed.end());\n        int l = 0, r = nums.size() - 1;\n        while (l < r) {\n            int sum = indexed[l].first + indexed[r].first;\n            if (sum == target) return {indexed[l].second, indexed[r].second};\n            if (sum < target) l++; else r--;\n        }\n        return {};\n    }\n};`,
          java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        int[][] indexed = new int[nums.length][2];\n        for (int i = 0; i < nums.length; i++) indexed[i] = new int[]{nums[i], i};\n        Arrays.sort(indexed, (a, b) -> Integer.compare(a[0], b[0]));\n        int l = 0, r = nums.length - 1;\n        while (l < r) {\n            int sum = indexed[l][0] + indexed[r][0];\n            if (sum == target) return new int[]{indexed[l][1], indexed[r][1]};\n            if (sum < target) l++; else r--;\n        }\n        return new int[0];\n    }\n}`,
          javascript: `function twoSum(nums, target) {\n    const indexed = nums.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);\n    let l = 0, r = nums.length - 1;\n    while (l < r) {\n        const sum = indexed[l][0] + indexed[r][0];\n        if (sum === target) return [indexed[l][1], indexed[r][1]];\n        if (sum < target) l++; else r--;\n    }\n    return [];\n}`
        }
      },
      {
        id: 'optimal',
        name: 'Approach 3: One-Pass Hash Map (Optimal)',
        tier: 'Industry Gold Standard',
        badgeColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-800',
        intuition: 'As we iterate through the list, the number we need to complete the pair is complement = target - nums[i]. By storing previously seen values in a Hash Map with O(1) average lookup, we solve the problem in a single pass.',
        algorithm: [
          'Initialize an empty hash map `prevMap = {}` mapping `value -> index`.',
          'Loop through index `i` and number `num` in nums:',
          '  Calculate `diff = target - num`.',
          '  If `diff` exists in `prevMap`: return `[prevMap[diff], i]`.',
          '  Otherwise: store `prevMap[num] = i`.',
          'Return empty list if no pair is found.'
        ],
        timeComplexity: 'O(N)',
        timeRationale: 'We traverse the array containing N elements exactly once. Hash table lookup and insertion are O(1) on average.',
        spaceComplexity: 'O(N)',
        spaceRationale: 'In the worst case, we store up to N elements in the hash map.',
        code: {
          python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        prev_map = {}  # val -> index\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in prev_map:\n                return [prev_map[diff], i]\n            prev_map[n] = i\n        return []`,
          cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> prevMap; // val -> index\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (prevMap.count(diff)) {\n                return {prevMap[diff], i};\n            }\n            prevMap[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
          java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> prevMap = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (prevMap.containsKey(diff)) {\n                return new int[]{prevMap.get(diff), i};\n            }\n            prevMap.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
          javascript: `function twoSum(nums, target) {\n    const prevMap = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (prevMap.has(diff)) {\n            return [prevMap.get(diff), i];\n        }\n        prevMap.set(nums[i], i);\n    }\n    return [];\n}`
        }
      }
    ];
  } else if (isML) {
    approaches = [
      {
        id: 'brute',
        name: 'Approach 1: Numerical Finite Differences (Naive)',
        tier: 'Empirical Baseline',
        badgeColor: 'text-rose-400 bg-rose-950/70 border-rose-800',
        intuition: 'Compute gradients empirically by perturbing each parameter by a tiny epsilon: df/dx ≈ (f(x + ε) - f(x - ε)) / (2ε). Requires re-evaluating the full model for every parameter.',
        algorithm: [
          'Choose small epsilon ε = 1e-5.',
          'For each parameter weight w_i:',
          '  Perturb w_i + ε and compute loss_plus.',
          '  Perturb w_i - ε and compute loss_minus.',
          '  Estimate grad_i = (loss_plus - loss_minus) / (2 * ε).',
          'Update weights w = w - lr * grad.'
        ],
        timeComplexity: 'O(P × Forward)',
        timeRationale: 'Where P is the number of parameters. For deep networks with millions of parameters, this is prohibitively expensive.',
        spaceComplexity: 'O(P)',
        spaceRationale: 'Stores parameter gradients.',
        code: {
          python: `def numerical_gradient(f, x, eps=1e-5):\n    grad = np.zeros_like(x)\n    for i in range(len(x)):\n        orig = x[i]\n        x[i] = orig + eps\n        loss_pos = f(x)\n        x[i] = orig - eps\n        loss_neg = f(x)\n        grad[i] = (loss_pos - loss_neg) / (2 * eps)\n        x[i] = orig\n    return grad`,
          cpp: `// Numerical gradient finite differences in C++\nvector<double> numericalGrad(function<double(vector<double>)> f, vector<double> x, double eps = 1e-5) {\n    vector<double> grad(x.size(), 0.0);\n    for (int i = 0; i < x.size(); i++) {\n        double orig = x[i];\n        x[i] = orig + eps; double l1 = f(x);\n        x[i] = orig - eps; double l2 = f(x);\n        grad[i] = (l1 - l2) / (2 * eps);\n        x[i] = orig;\n    }\n    return grad;\n}`,
          java: `// Numerical gradient baseline in Java\npublic double[] numericalGrad(Function<double[], Double> f, double[] x, double eps) {\n    double[] grad = new double[x.length];\n    for (int i = 0; i < x.length; i++) {\n        double orig = x[i];\n        x[i] = orig + eps; double l1 = f.apply(x);\n        x[i] = orig - eps; double l2 = f.apply(x);\n        grad[i] = (l1 - l2) / (2 * eps);\n        x[i] = orig;\n    }\n    return grad;\n}`,
          javascript: `function numericalGrad(f, x, eps = 1e-5) {\n    const grad = new Float64Array(x.length);\n    for (let i = 0; i < x.length; i++) {\n        const orig = x[i];\n        x[i] = orig + eps; const l1 = f(x);\n        x[i] = orig - eps; const l2 = f(x);\n        grad[i] = (l1 - l2) / (2 * eps);\n        x[i] = orig;\n    }\n    return grad;\n}`
        }
      },
      {
        id: 'better',
        name: 'Approach 2: Symbolic Automatic Differentiation / Loops',
        tier: 'Better Intermediate',
        badgeColor: 'text-amber-400 bg-amber-950/70 border-amber-800',
        intuition: 'Compute analytical derivatives using the chain rule layer by layer with Python loops over dimensions.',
        algorithm: [
          'Forward pass: record intermediate activations.',
          'Backward pass: propagate upstream gradient dL/dY.',
          'Compute weight gradient dL/dW = X^T * dL/dY.',
          'Compute bias gradient dL/dB = sum(dL/dY).'
        ],
        timeComplexity: 'O(Forward + Backward)',
        timeRationale: 'Single backward pass computes exact gradients for all parameters simultaneously.',
        spaceComplexity: 'O(Activations)',
        spaceRationale: 'Must cache forward activations in memory for the backward pass.',
        code: {
          python: `def linear_backward(dout, cache):\n    x, w, b = cache\n    dx = np.dot(dout, w.T)\n    dw = np.dot(x.T, dout)\n    db = np.sum(dout, axis=0)\n    return dx, dw, db`,
          cpp: `// Backward pass analytical step\nvoid linearBackward(const Matrix& dout, const Matrix& x, const Matrix& w, Matrix& dx, Matrix& dw, Vector& db) {\n    dx = dout * w.transpose();\n    dw = x.transpose() * dout;\n    db = dout.colwise().sum();\n}`,
          java: `// Analytical backward pass\npublic LayerGradients backward(double[][] dout, double[][] x, double[][] w) {\n    double[][] dx = matmul(dout, transpose(w));\n    double[][] dw = matmul(transpose(x), dout);\n    double[] db = sumCols(dout);\n    return new LayerGradients(dx, dw, db);\n}`,
          javascript: `function linearBackward(dout, cache) {\n    const { x, w, b } = cache;\n    const dx = matmul(dout, transpose(w));\n    const dw = matmul(transpose(x), dout);\n    const db = colSums(dout);\n    return { dx, dw, db };\n}`
        }
      },
      {
        id: 'optimal',
        name: 'Approach 3: Vectorized In-Place BLAS Execution (Optimal)',
        tier: 'Industry Gold Standard',
        badgeColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-800',
        intuition: 'Leverage contiguous memory layouts, vector fused multiply-adds (FMA), and SIMD instructions (AVX-512 / GPU Tensor Cores) to execute operations with zero memory reallocations.',
        algorithm: [
          'Allocate contiguous memory buffers C-contiguous.',
          'Use GEMM (General Matrix Multiply) via BLAS / LAPACK.',
          'Fuse bias addition and activation into a single kernel call.',
          'Apply momentum and weight decay in-place.'
        ],
        timeComplexity: 'O(M · N · K / SIMD_WIDTH)',
        timeRationale: 'Hardware vector acceleration executes up to 16 to 64 operations per clock cycle.',
        spaceComplexity: 'O(1) Auxiliary',
        spaceRationale: 'In-place accumulation into pre-allocated memory buffers.',
        code: {
          python: problem.starter_code || `import numpy as np\n\ndef solve(x, w, b):\n    # Vectorized forward + fused bias broadcast\n    return np.matmul(x, w) + b\n`,
          cpp: `#include <eigen3/Eigen/Dense>\nusing namespace Eigen;\n\nMatrixXd solveOptimal(const MatrixXd& x, const MatrixXd& w, const RowVectorXd& b) {\n    return (x * w).rowwise() + b;\n}`,
          java: `// Optimal ND4J / Vector API implementation\npublic INDArray solveOptimal(INDArray x, INDArray w, INDArray b) {\n    return x.mmul(w).addRowVector(b);\n}`,
          javascript: `// SIMD-optimized float array implementation\nfunction solveOptimal(x, w, b, M, N, K) {\n    const out = new Float64Array(M * N);\n    // Fused GEMM computation\n    for (let i = 0; i < M; i++) {\n        for (let j = 0; j < N; j++) {\n            let sum = b[j];\n            for (let k = 0; k < K; k++) sum += x[i * K + k] * w[k * N + j];\n            out[i * N + j] = sum;\n        }\n    }\n    return out;\n}`
        }
      }
    ];
  } else {
    // Default 3-tier algorithm breakdown (Dynamic Programming, Trees, Graphs, Sliding Window, etc.)
    approaches = [
      {
        id: 'brute',
        name: 'Approach 1: Brute Force (Exhaustive Search)',
        tier: 'Naive Baseline',
        badgeColor: 'text-rose-400 bg-rose-950/70 border-rose-800',
        intuition: `Test every valid state or branch through recursion/nested iteration without caching or pruning.`,
        algorithm: [
          'Enumerate every candidate solution in the search space.',
          'Verify if the candidate fulfills all problem constraints.',
          'Track and return the best solution found.'
        ],
        timeComplexity: isDP ? 'O(2^N)' : 'O(N²)',
        timeRationale: 'Exponential or quadratic branch combinations without memoization.',
        spaceComplexity: 'O(N) Call Stack',
        spaceRationale: 'Recursion depth on the call stack.',
        code: {
          python: `class Solution:\n    def solveNaive(self, data):\n        def backtrack(index, current):\n            if index == len(data):\n                return [current]\n            # Explore all branching paths\n            take = backtrack(index + 1, current + [data[index]])\n            skip = backtrack(index + 1, current)\n            return take + skip\n        return backtrack(0, [])`,
          cpp: `class Solution {\npublic:\n    void solveNaive(vector<int>& data, int idx, vector<int>& curr, vector<vector<int>>& res) {\n        if (idx == data.size()) {\n            res.push_back(curr);\n            return;\n        }\n        curr.push_back(data[idx]);\n        solveNaive(data, idx + 1, curr, res);\n        curr.pop_back();\n        solveNaive(data, idx + 1, curr, res);\n    }\n};`,
          java: `class Solution {\n    public void solveNaive(int[] data, int idx, List<Integer> curr, List<List<Integer>> res) {\n        if (idx == data.length) {\n            res.add(new ArrayList<>(curr));\n            return;\n        }\n        curr.add(data[idx]);\n        solveNaive(data, idx + 1, curr, res);\n        curr.remove(curr.size() - 1);\n        solveNaive(data, idx + 1, curr, res);\n    }\n}`,
          javascript: `function solveNaive(data) {\n    const res = [];\n    function backtrack(idx, curr) {\n        if (idx === data.length) { res.push([...curr]); return; }\n        curr.push(data[idx]);\n        backtrack(idx + 1, curr);\n        curr.pop();\n        backtrack(idx + 1, curr);\n    }\n    backtrack(0, []);\n    return res;\n}`
        }
      },
      {
        id: 'better',
        name: 'Approach 2: Better Approach (Memoization / Two Pointers / Sorting)',
        tier: 'Intermediate',
        badgeColor: 'text-amber-400 bg-amber-950/70 border-amber-800',
        intuition: `Prune impossible branches early, or sort the elements to establish an ordering property that eliminates subproblems.`,
        algorithm: [
          'Pre-process input (sorting or frequency map).',
          'Use top-down memoization cache or two converging pointers.',
          'Check if subproblem was already solved before recursing.',
          'Save computed result to cache before returning.'
        ],
        timeComplexity: 'O(N log N) or O(N)',
        timeRationale: 'Subproblems are computed at most once.',
        spaceComplexity: 'O(N)',
        spaceRationale: 'Hash table or recursion memoization table.',
        code: {
          python: `class Solution:\n    def solveMemo(self, data):\n        memo = {}\n        def helper(i):\n            if i in memo: return memo[i]\n            if i >= len(data): return 0\n            res = max(helper(i + 1), data[i] + helper(i + 2))\n            memo[i] = res\n            return res\n        return helper(0)`,
          cpp: `class Solution {\npublic:\n    int helper(int i, vector<int>& data, unordered_map<int, int>& memo) {\n        if (memo.count(i)) return memo[i];\n        if (i >= data.size()) return 0;\n        int res = max(helper(i + 1, data, memo), data[i] + helper(i + 2, data, memo));\n        return memo[i] = res;\n    }\n};`,
          java: `class Solution {\n    Map<Integer, Integer> memo = new HashMap<>();\n    public int helper(int i, int[] data) {\n        if (memo.containsKey(i)) return memo.get(i);\n        if (i >= data.length) return 0;\n        int res = Math.max(helper(i + 1, data), data[i] + helper(i + 2, data));\n        memo.put(i, res);\n        return res;\n    }\n}`,
          javascript: `function solveMemo(data) {\n    const memo = new Map();\n    function helper(i) {\n        if (memo.has(i)) return memo.get(i);\n        if (i >= data.length) return 0;\n        const res = Math.max(helper(i + 1), data[i] + helper(i + 2));\n        memo.set(i, res);\n        return res;\n    }\n    return helper(0);\n}`
        }
      },
      {
        id: 'optimal',
        name: 'Approach 3: Optimal (Bottom-Up Tabulation / In-Place / O(1) Space)',
        tier: 'Industry Gold Standard',
        badgeColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-800',
        intuition: `Convert recursion into an iterative bottom-up transition. Notice that to compute state i, we only need the previous 1 or 2 states, reducing auxiliary space to O(1).`,
        algorithm: [
          'Identify base cases (state at index 0 and 1).',
          'Maintain 2 variables `prev1` and `prev2` rather than allocating an array.',
          'Iterate from 2 to N, updating current state iteratively.',
          'Return the final state in O(1) extra space.'
        ],
        timeComplexity: 'O(N)',
        timeRationale: 'Single linear scan from 0 to N.',
        spaceComplexity: 'O(1)',
        spaceRationale: 'Only 2 scalar variables maintained in memory.',
        code: {
          python: problem.starter_code || `class Solution:\n    def solveOptimal(self, data):\n        if not data: return 0\n        prev2, prev1 = 0, 0\n        for num in data:\n            curr = max(prev1, prev2 + num)\n            prev2 = prev1\n            prev1 = curr\n        return prev1`,
          cpp: `class Solution {\npublic:\n    int solveOptimal(vector<int>& data) {\n        if (data.empty()) return 0;\n        int prev2 = 0, prev1 = 0;\n        for (int num : data) {\n            int curr = max(prev1, prev2 + num);\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};`,
          java: `class Solution {\n    public int solveOptimal(int[] data) {\n        if (data.length == 0) return 0;\n        int prev2 = 0, prev1 = 0;\n        for (int num : data) {\n            int curr = Math.max(prev1, prev2 + num);\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}`,
          javascript: `function solveOptimal(data) {\n    if (!data.length) return 0;\n    let prev2 = 0, prev1 = 0;\n    for (const num of data) {\n        const curr = Math.max(prev1, prev2 + num);\n        prev2 = prev1;\n        prev1 = curr;\n    }\n    return prev1;\n}`
        }
      }
    ];
  }

  // 3. DRY RUN & TRACE
  const dryRunTrace = [
    { step: 1, action: "Initialize lookup data structure & pointers", state: "lookup = {}, result = []", note: "Clean state ready for stream" },
    { step: 2, action: "Process item at index 0", state: "Inspect value, evaluate condition", note: "Condition not yet met, record state" },
    { step: 3, action: "Process subsequent elements", state: "O(1) lookup hits matching key", note: "Candidate found, prepare return payload" },
    { step: 4, action: "Terminate and return answer", state: "Optimal state returned", note: "Terminates in O(N) single pass" }
  ];

  // 4. COMMON PITFALLS & EDGE CASES
  const pitfalls = [
    "Handling empty or single-element inputs without throwing IndexError.",
    "Duplicate elements: ensure whether the same element can be used twice.",
    "Integer overflow when dealing with sum or multiplication of large integers (crucial in C++ and Java).",
    "Negative numbers and zeroes in array indices or modulo operations."
  ];

  return {
    inspiration,
    approaches,
    dryRunTrace,
    pitfalls
  };
}
