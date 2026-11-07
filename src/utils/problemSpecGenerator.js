/**
 * Fanout-Inspired First-Principles Problem Specification Engine
 * Enriches every problem across DSA, ML/AI Engineering, System Design, and Data Engineering with:
 * 1. The Production AI / Systems Bottleneck (Why this matters beyond interview trivia)
 * 2. First-Principles Mental Model & Invariant
 * 3. Architectural / Tensor / Pointer Dataflow Schematic
 * 4. Concrete Input / Output Examples & Asymptotic / Hardware Constraints
 * 5. Domain-Accurate Starter Code & Runnable Verification Suite
 */

export function generateProblemSpec(problem) {
  const title = problem?.title || 'Engineering Challenge';
  const category = problem?.category || problem?.trackType || 'General';
  const catLower = category.toLowerCase();
  const titleLower = title.toLowerCase();
  const trackType = problem?.trackType || 'dsa';

  // Detect specific canonical problems first, then fall back to rich category-level AI/Systems specs
  const isTwoSum = titleLower.includes('two sum');
  const isAnagram = titleLower.includes('anagram');
  const isDuplicate = titleLower.includes('duplicate');
  const isPalindrome = titleLower.includes('palindrome');
  const isLRUCache = titleLower.includes('lru cache');
  const isTrie = catLower.includes('trie') || titleLower.includes('trie') || titleLower.includes('prefix');
  const isSlidingWindow = catLower.includes('sliding window') || titleLower.includes('substring') || titleLower.includes('window');
  const isTwoPointers = catLower.includes('two pointers') || titleLower.includes('container') || titleLower.includes('3sum') || titleLower.includes('rain water');
  const isStack = catLower.includes('stack') || titleLower.includes('parentheses') || titleLower.includes('temperature') || titleLower.includes('histogram');
  const isBinarySearch = catLower.includes('binary search') || titleLower.includes('search') || titleLower.includes('rotated') || titleLower.includes('koko');
  const isLinkedList = catLower.includes('linked list') || titleLower.includes('list');
  const isTree = catLower.includes('tree') || titleLower.includes('tree') || titleLower.includes('bst');
  const isHeap = catLower.includes('heap') || catLower.includes('priority') || titleLower.includes('kth') || titleLower.includes('median') || titleLower.includes('top k');
  const isGraph = catLower.includes('graph') || titleLower.includes('island') || titleLower.includes('course') || titleLower.includes('network');
  const isDP = catLower.includes('dynamic programming') || catLower.includes('dp') || titleLower.includes('climb') || titleLower.includes('robber') || titleLower.includes('subsequence') || titleLower.includes('knapsack');
  const isInterval = catLower.includes('interval') || titleLower.includes('interval') || titleLower.includes('meeting');
  const isBit = catLower.includes('bit') || titleLower.includes('bit') || titleLower.includes('xor');

  // ============================================================================
  // 1. MACHINE LEARNING & DEEP LEARNING TRACK
  // ============================================================================
  if (trackType === 'ml') {
    const isAttention = catLower.includes('attention') || titleLower.includes('attention') || titleLower.includes('transformer');
    const isBackprop = catLower.includes('loss') || catLower.includes('optimization') || titleLower.includes('gradient') || titleLower.includes('loss') || titleLower.includes('backprop');
    const isNeural = catLower.includes('neural') || catLower.includes('pytorch') || titleLower.includes('tensor') || titleLower.includes('layer');

    return {
      domainTag: isAttention ? 'LLM INTERNALS · ATTENTION KERNELS' : isBackprop ? 'OPTIMIZATION · AUTOGRAD MECHANICS' : 'TENSOR COMPUTATION · ML SYSTEMS',
      productionBottleneck: isAttention
        ? `In production LLM serving (vLLM, TensorRT-LLM), self-attention scales quadratically O(L²) with sequence length L and becomes memory-bandwidth bound on GPU HBM. Engineers who only call high-level framework wrappers cannot debug attention mask leaks, logit numerical overflow before softmax, or KV-cache tensor broadcasting bugs.`
        : isBackprop
        ? `Training instability—diverging loss spikes, vanishing gradients, or silent NaN propagation—rarely throws a syntax error. Understanding exact analytical Jacobian contractions, log-sum-exp numerical stability, and vectorized weight updates is what separates first-principles AI engineers from API consumers.`
        : `Python for-loops over tensor dimensions execute ~1000× slower than contiguous C/CUDA SIMD kernels and starve GPU Tensor Cores. Every production ML pipeline requires expressing mathematical transformations as zero-copy broadcasted array operations.`,
      firstPrinciplesSolution: isAttention
        ? `Deconstruct scaled dot-product attention into explicit matrix contractions: scale Q·K^T by 1/√d_k to preserve unit variance, apply causal/padding mask in log-space (-∞), subtract row-wise max for numerically stable Softmax, and contract with Value tensor V.`
        : isBackprop
        ? `Formulate the forward objective and analytical gradient vector without scalar loops. Clip probabilities to [ε, 1-ε] to prevent log(0) singularities and propagate upstream gradients via transposed weight contractions.`
        : `Align array axes right-to-left using stride tricks and vectorized BLAS primitives so operations execute in a single contiguous memory pass.`,
      schematic: {
        title: isAttention ? 'Scaled Dot-Product Attention & Tensor Shape Pipeline' : 'Vectorized Tensor Forward & Gradient Contraction Flow',
        invariantFormula: isAttention
          ? 'Attention(Q, K, V) = softmax((Q · Kᵀ) / √dₖ + M) · V'
          : '∇_W L = (1 / B) · Xᵀ · (ŷ - y)   |   W ← W - η · ∇_W L',
        hardwareImpact: 'Eliminates Python interpreter dispatch overhead; maps directly to fused GEMM / SIMD vector registers.',
        stages: isAttention
          ? [
              { step: '01', label: 'Query · Key Projection', shape: '[B, H, L, d_k]', detail: 'Contiguous transpose Kᵀ → [B, H, d_k, L]' },
              { step: '02', label: 'Logit Scaling & Causal Mask', shape: '[B, H, L, L]', detail: 'Scale by 1/√d_k; fill upper triangle j > i with -1e9' },
              { step: '03', label: 'Safe Softmax Normalization', shape: '[B, H, L, L]', detail: 'exp(x - max(x)) / Σ exp(x - max(x)) along dim=-1' },
              { step: '04', label: 'Value Aggregation', shape: '[B, H, L, d_v]', detail: 'Batched matmul P · V yielding contextualized representations' }
            ]
          : [
              { step: '01', label: 'Input Tensor Allocation', shape: '[B, D_in]', detail: 'C-contiguous float64/float32 memory buffer' },
              { step: '02', label: 'Broadcast / Linear Kernel', shape: '[B, D_out]', detail: 'Zero-copy stride expansion + GEMM contraction' },
              { step: '03', label: 'Reduction / Loss Scalar', shape: 'Scalar () / [B,]', detail: 'Axis-specific vector reduction without Python loops' },
              { step: '04', label: 'Output Verification', shape: 'Deterministic Tensor', detail: 'Validated against analytical tolerance rtol=1e-5' }
            ]
      },
      ioExamples: [
        {
          input: problem?.tagline ? `Input Tensor / Records (${problem.title})` : `X = [[1.0, 2.0], [3.0, 4.0]]`,
          output: `Vectorized Output matching target shape & numerical precision (1e-5)`,
          explanation: `All operations execute via vectorized NumPy/PyTorch primitives with zero explicit element-wise Python loops.`
        }
      ],
      constraints: [
        { label: 'Execution Engine', value: 'Pyodide WASM (NumPy / Python 3.13)' },
        { label: 'Numerical Tolerance', value: 'rtol = 1e-5, atol = 1e-6' },
        { label: 'Vectorization Rule', value: 'O(1) Python loop depth (use broadcasting / ufuncs)' },
        { label: 'Memory Layout', value: 'Contiguous strided array views preferred over deep copies' }
      ]
    };
  }

  // ============================================================================
  // 2. DATA ENGINEERING & SCALED ANALYTICS TRACK
  // ============================================================================
  if (trackType === 'data') {
    const isSQL = catLower.includes('sql');
    const isPySpark = catLower.includes('pyspark') || catLower.includes('spark');

    return {
      domainTag: isSQL ? 'OLAP ANALYTICS · WINDOW KERNELS' : isPySpark ? 'DISTRIBUTED DAG · SHUFFLE OPTIMIZATION' : 'COLUMNAR VECTORIZATION · DATA PIPELINES',
      productionBottleneck: isSQL
        ? `Analytical feature pipelines feeding ML training sets often collapse under self-joins and correlated subqueries that trigger quadratic disk spills. Window functions (ROW_NUMBER, LAG/LEAD, rolling frames) compute point-in-time features in a single sorted partition scan.`
        : isPySpark
        ? `In distributed Spark clusters, wide transformations (groupByKey, unbroadcasted joins) trigger massive network shuffles across executors and OOM crashes. Pushing predicates down and aggregating via Catalyst columnar expressions keeps execution memory-resident.`
        : `Iterating over DataFrames with .iterrows() or Python loops serializes each row into a boxed Python object, turning a 50ms columnar vector operation into a 30-second CPU bottleneck during feature engineering.`,
      firstPrinciplesSolution: `Express transformations declaratively over whole columns/partitions: leverage hash-partitioned group aggregations, window frames, and vectorized boolean masks so the execution engine operates on contiguous Arrow/NumPy buffers.`,
      schematic: {
        title: 'Columnar Vectorization & Partition Pipeline',
        invariantFormula: 'Scan(Partition_k) → Filter(Predicate) → HashAggregate / WindowFrame → Materialize',
        hardwareImpact: 'Maximizes L1/L2 CPU cache line utilization via columnar memory layout.',
        stages: [
          { step: '01', label: 'Ingestion & Schema Binding', shape: 'DataFrame [N, C]', detail: 'Bind raw records into typed columnar series' },
          { step: '02', label: 'Predicate Pushdown / Mask', shape: 'Bitmask [N]', detail: 'Filter rows via vectorized SIMD comparison' },
          { step: '03', label: 'Split-Apply-Combine / Window', shape: 'Grouped [G, C]', detail: 'Hash-table group aggregation or sorted window frame' },
          { step: '04', label: 'Deterministic Serialization', shape: 'Normalized Dict/List', detail: 'Sorted, rounded schema-compliant output payload' }
        ]
      },
      ioExamples: [
        {
          input: `records = [{"id": 1, "metric": 90.0}, {"id": 2, "metric": 70.0}]`,
          output: `{"mean": 80.0, "max": 90, "above_avg": 1}`,
          explanation: `Columnar aggregations compute exact statistics in a single pass over typed series buffers.`
        }
      ],
      constraints: [
        { label: 'Time Complexity', value: 'O(N) for scans / O(N log N) for sorted windows' },
        { label: 'Forbidden Antipattern', value: 'No .iterrows() or row-by-row Python mutation' },
        { label: 'Null Semantics', value: 'Gracefully handle NaN / NULL boundary conditions' },
        { label: 'Output Determinism', value: 'Round floats to 2 decimal places & sort keys where specified' }
      ]
    };
  }

  // ============================================================================
  // 3. SYSTEM DESIGN & DISTRIBUTED ARCHITECTURE TRACK
  // ============================================================================
  if (trackType === 'sysdes') {
    const isLLD = catLower.includes('object-oriented') || catLower.includes('patterns');

    return {
      domainTag: isLLD ? 'LOW-LEVEL ARCHITECTURE · STATE INVARIANTS' : 'DISTRIBUTED SYSTEMS · HIGH-SCALE INFRASTRUCTURE',
      productionBottleneck: isLLD
        ? `Tightly coupled domain models turn into unmaintainable monoliths when concurrency, new payment/routing strategies, or state transitions are added under production velocity.`
        : `At 100,000+ QPS—such as distributed LLM inference routers, vector search clusters, or global event streams—single-node locks, unsharded relational tables, and synchronous RPC chains cause cascading p99 tail-latency outages.`,
      firstPrinciplesSolution: isLLD
        ? `Isolate volatile state behind strict interfaces: apply Strategy/Observer/State patterns, enforce thread-safe state transitions via atomic compare-and-swap or fine-grained locks, and separate domain entities from orchestration.`
        : `Partition state via Consistent Hashing with virtual nodes, absorb read skew with write-around/read-through Redis + CDN tiers, decouple slow consumers via partitioned Kafka logs, and bound tail latency with token-bucket rate limiters and circuit breakers.`,
      schematic: {
        title: isLLD ? 'Object-Oriented State Machine & Interface Boundary' : `Distributed Topology & Failure-Isolated Dataflow (${title})`,
        invariantFormula: isLLD
          ? 'Client → Interface(Abstraction) → Strategy/State Transition → Thread-Safe Entity Store'
          : 'p99 Latency = T_Edge + P(CacheMiss) · [T_ShardRouter + T_QuorumRead(R + W > N)]',
        hardwareImpact: 'Eliminates single points of failure (SPOF) and bounds p99 latency under 10x traffic spikes.',
        stages: isLLD
          ? [
              { step: '01', label: 'API Contract & Domain Entities', shape: 'Strict Interfaces', detail: 'Encapsulate invariants & decouple concrete implementations' },
              { step: '02', label: 'State Machine / Pattern Dispatch', shape: 'O(1) Polymorphic', detail: 'Route actions via Strategy / Factory / Observer hooks' },
              { step: '03', label: 'Concurrency & Lock Granularity', shape: 'Mutex / Optimistic', detail: 'Prevent race conditions during simultaneous mutations' },
              { step: '04', label: 'Extensibility Verification', shape: 'Open-Closed Principle', detail: 'Add new behaviors with zero modification to core engine' }
            ]
          : [
              { step: '01', label: 'Edge Gateway & Rate Limiter', shape: '100k+ QPS Ingress', detail: 'TLS termination, JWT auth, Token Bucket throttling' },
              { step: '02', label: 'Stateless Compute & Read Cache', shape: 'p99 < 5ms Tier', detail: 'Redis cluster cache-aside with TTL jitter to prevent stampedes' },
              { step: '03', label: 'Consistent Hash Sharding', shape: 'K Virtual Nodes', detail: 'Partition writes across shards; Quorum R+W > N consistency' },
              { step: '04', label: 'Async Event Bus & Observability', shape: 'Kafka / Wal Log', detail: 'Outbox pattern for downstream indexing, analytics & retries' }
            ]
      },
      ioExamples: [
        {
          input: `Workload: 75,000 Read QPS, 8,500 Write QPS, Payload = 4 KB, SLA = 99.99% availability`,
          output: `Cluster Health: HEALTHY | Active Shards: 8 | Cache Hit Ratio: 94.2% | p99 Latency: 12.4 ms`,
          explanation: `Simulates capacity planning, consistent hash routing, and cache hit latency calculation in the runnable architecture sandbox.`
        }
      ],
      constraints: [
        { label: 'Latency Budget (p99)', value: '< 25ms reads, < 60ms quorum writes' },
        { label: 'Availability SLA', value: '99.99% (< 52.6 mins downtime/year)' },
        { label: 'Consistency Model', value: 'Tunable Quorum (R + W > N) / Eventual via CDC' },
        { label: 'Failure Isolation', value: 'Survives full Availability Zone (AZ) loss without data loss' }
      ]
    };
  }

  // ============================================================================
  // 4. DATA STRUCTURES & ALGORITHMS (WITH AI / SYSTEMS PRODUCTION MAPPING)
  // ============================================================================
  let productionBottleneck = `In high-throughput AI and distributed backend systems, naive O(N²) or exponential algorithms create severe CPU/GPU stalls when input sizes scale from toy arrays to 10⁵+ tokens, embeddings, or event streams.`;
  let firstPrinciplesSolution = `Exploit structural invariants—hash-indexed O(1) lookups, monotonic state pruning, or converging pointers—to collapse nested search loops into a single linear or logarithmic pass.`;
  let schematicTitle = `Algorithmic State & Memory Invariant (${category})`;
  let invariantFormula = `T(N) : O(N²) → O(N)   |   Invariant: Maintain sufficient state in O(1) amortized lookup`;
  let hardwareImpact = `Reduces instruction count by 10,000× at N = 10⁵ and preserves CPU cache locality.`;
  let stages = [
    { step: '01', label: 'Input Stream Ingestion', shape: 'Array / Sequence [N]', detail: 'Read contiguous elements sequentially' },
    { step: '02', label: 'Invariant State Update', shape: 'Auxiliary State', detail: 'Update hash map, pointer pair, or DP frontier in O(1)' },
    { step: '03', label: 'Branch Pruning', shape: 'Eliminate O(N) Inner Loop', detail: 'Skip redundant comparisons guaranteed by invariant' },
    { step: '04', label: 'Optimal Emission', shape: 'Target Output', detail: 'Return verified optimal answer in single pass' }
  ];
  let ioExamples = [];

  if (isSlidingWindow) {
    productionBottleneck = `In streaming LLM inference (Sliding Window Attention in Mistral/Llama, token rate-limiting, and real-time telemetry aggregation), re-computing statistics over a window of size W from scratch at every token step takes O(N · W) time—stalling token generation throughput.`;
    firstPrinciplesSolution = `Maintain a dynamic window [L, R] where R expands monotonically to ingest new tokens and L contracts only when the window constraint is violated. Each element enters and exits the window at most once, guaranteeing strict O(N) amortized execution.`;
    schematicTitle = `Dynamic Sliding Window [L..R] State Machine`;
    invariantFormula = `Window[L..R] Valid ⟺ Increment R (Expand)   |   Invalid ⟺ Increment L (Evict) — Total Ops ≤ 2N`;
    hardwareImpact = `Sequential memory access pattern achieves >95% L1 hardware prefetcher hit rate.`;
    stages = [
      { step: '01', label: 'Expand Right Pointer (R++)', shape: 'Ingest x[R]', detail: 'Add incoming token/element into window frequency/sum state' },
      { step: '02', label: 'Evaluate Window Invariant', shape: 'Check Constraint', detail: 'Verify uniqueness, sum budget, or k-replacement bound' },
      { step: '03', label: 'Evict Left Pointer (L++)', shape: 'Contract Window', detail: 'While constraint is violated, shrink window from left in O(1)' },
      { step: '04', label: 'Update Global Optimum', shape: 'max/min(R - L + 1)', detail: 'Record optimal valid span length or subarray slice' }
    ];
    ioExamples = [
      { input: `s = "abcabcbb" (or nums = [2, 3, 1, 2, 4, 3], target = 7)`, output: `3 (Optimal valid window span)`, explanation: `The window expands right and evicts left duplicates/excess in O(1) per step without ever resetting R backward.` },
      { input: `s = "bbbbb"`, output: `1`, explanation: `Duplicate constraint triggers immediate left-pointer eviction on every step.` }
    ];
  } else if (isTwoPointers) {
    productionBottleneck = `When intersecting sorted posting lists in hybrid RAG search engines or compacting fragmented memory buffers in-place, allocating auxiliary O(N) copies or running nested O(N²) pair scans exhausts memory bandwidth.`;
    firstPrinciplesSolution = `Exploit sorted order or boundary monotonicity using two converging pointers (L = 0, R = N - 1). Each comparison deterministically eliminates an entire row or column of the search space in O(1) auxiliary memory.`;
    schematicTitle = `Converging Two-Pointer Search Space Pruning`;
    invariantFormula = `At step (L, R): Comparison eliminates N - 1 pairs simultaneously → O(N) time, O(1) space`;
    stages = [
      { step: '01', label: 'Establish Monotonic Order', shape: 'L = 0, R = N - 1', detail: 'Sort input if unordered, or bind boundary pointers' },
      { step: '02', label: 'Evaluate Pair Objective', shape: 'f(nums[L], nums[R])', detail: 'Compute sum, container area, or prefix-max water level' },
      { step: '03', label: 'Deterministic Pointer Shift', shape: 'L++ or R--', detail: 'Advance the limiting boundary that cannot improve current state' },
      { step: '04', label: 'Convergence Termination', shape: 'L == R', detail: 'Entire N² search space pruned in exactly N steps' }
    ];
    ioExamples = [
      { input: `nums = [-4, -1, -1, 0, 1, 2] (or heights = [1,8,6,2,5,4,8,3,7])`, output: `[[-1, -1, 2], [-1, 0, 1]] (or max_area = 49)`, explanation: `Converging pointers skip duplicate values and prune suboptimal boundaries in linear time.` }
    ];
  } else if (isStack) {
    productionBottleneck = `In compiler AST parsing, reverse-mode autograd tape evaluation, and finding next-greater span bounds in time-series telemetry, naive backward/forward scans require O(N²) lookaheads.`;
    firstPrinciplesSolution = `Maintain an explicit LIFO Monotonic Stack of unresolved indices. When a new element breaks monotonicity, pop and resolve all dominated stack elements in O(1) amortized time per element.`;
    schematicTitle = `Monotonic LIFO Stack Resolution Pipeline`;
    invariantFormula = `Stack S maintains indices i₁ < i₂ < ... < iₖ with monotonic values → Each index pushed & popped ≤ 1 time`;
    stages = [
      { step: '01', label: 'Inspect Incoming Element', shape: 'x[i] at index i', detail: 'Compare x[i] against top of monotonic stack S[-1]' },
      { step: '02', label: 'Pop & Resolve Dominated', shape: 'While x[i] breaks invariant', detail: 'Pop index prev = S.pop(); span = i - prev' },
      { step: '03', label: 'Push Current Index', shape: 'S.append(i)', detail: 'Defer resolution of i until a future boundary arrives' },
      { step: '04', label: 'Finalize Remaining Stack', shape: 'Clean Termination', detail: 'Every element enters and leaves the stack at most once: O(N)' }
    ];
    ioExamples = [
      { input: `temperatures = [73, 74, 75, 71, 69, 72, 76, 73]`, output: `[1, 1, 4, 2, 1, 1, 0, 0]`, explanation: `Monotonic decreasing stack resolves waiting days as soon as a warmer temperature is encountered.` }
    ];
  } else if (isBinarySearch) {
    productionBottleneck = `In LLM nucleus (top-p) token sampling, quantization clipping threshold calibration, and distributed log index lookups, linear O(N) scanning across vocabularies of 128,000+ tokens or billions of log offsets violates sub-millisecond latency budgets.`;
    firstPrinciplesSolution = `Identify the monotonic boolean predicate P(mid) over the index or answer space [lo, hi]. Halve the search interval at every step to locate the exact boundary transition in O(log N) comparisons.`;
    schematicTitle = `Monotonic Predicate Binary Search [lo .. mid .. hi]`;
    invariantFormula = `P(x) = False for x < x* and True for x ≥ x*   |   Search Space: N → N/2 → N/4 → ... → 1 in ⌈log₂ N⌉ steps`;
    stages = [
      { step: '01', label: 'Define Search Bounds', shape: '[lo, hi]', detail: 'Bound either array indices [0, N-1] or monotonic answer range' },
      { step: '02', label: 'Overflow-Safe Midpoint', shape: 'mid = lo + (hi - lo)//2', detail: 'Evaluate monotonic feasibility predicate P(mid)' },
      { step: '03', label: 'Half-Space Elimination', shape: 'Discard 50% of range', detail: 'If P(mid) holds, tighten hi = mid; else advance lo = mid + 1' },
      { step: '04', label: 'Exact Boundary Convergence', shape: 'lo == hi', detail: 'Converges in ≤ 30 operations even for N = 10⁹' }
    ];
    ioExamples = [
      { input: `nums = [4, 5, 6, 7, 0, 1, 2], target = 0`, output: `4`, explanation: `At least one half of a rotated sorted array remains strictly sorted; binary search halves the space in O(log N).` }
    ];
  } else if (isTrie || isTree) {
    productionBottleneck = `In modern LLM inference servers (SGLang RadixAttention, vLLM prefix caching) and hierarchical file/AST routers, flat array scans cannot share common token prefixes or hierarchical subtrees across concurrent requests.`;
    firstPrinciplesSolution = `Represent hierarchical state as a recursive Tree or Prefix Trie where every node satisfies a local structural invariant (BST ordering, height balance, or shared token prefix path) computable via bottom-up DFS or level-order BFS.`;
    schematicTitle = isTrie ? `Radix / Prefix Trie Shared Path Traversal` : `Recursive Subtree DFS / BFS State Aggregation`;
    invariantFormula = isTrie ? `Lookup / Insert Prefix of length L = O(L) independent of corpus size N` : `f(node) = Combine(node.val, f(node.left), f(node.right)) — O(V) single traversal`;
    stages = [
      { step: '01', label: 'Base Case / Null Guard', shape: 'if not node: return base', detail: 'Define exact identity value for empty subtrees / terminal leaves' },
      { step: '02', label: 'Recursive / Prefix Descent', shape: 'Traverse Children', detail: 'Propagate constraints down or aggregate subtree metrics up' },
      { step: '03', label: 'Local Invariant Merge', shape: 'O(1) per Node', detail: 'Combine left & right subtree results at current root' },
      { step: '04', label: 'Global Root Resolution', shape: 'O(N) Total Time', detail: 'Every node visited a constant number of times; O(H) stack space' }
    ];
    ioExamples = [
      { input: `root = [3, 9, 20, null, null, 15, 7]`, output: `[[3], [9, 20], [15, 7]] (or max_depth = 3)`, explanation: `Each tree node is visited once in O(N) time and O(H) recursion/queue space.` }
    ];
  } else if (isHeap) {
    productionBottleneck = `During LLM Beam Search decoding, HNSW vector similarity retrieval (Top-K nearest neighbors), and priority-based GPU job scheduling, sorting all N candidates at every step wastes O(N log N) compute when only the top K items matter.`;
    firstPrinciplesSolution = `Maintain a bounded Min-Heap / Max-Heap of size K (or dual heaps for streaming percentiles). Evicting the weakest candidate takes O(log K), reducing total stream complexity to O(N log K).`;
    schematicTitle = `Bounded Top-K Priority Queue / Dual-Heap Stream`;
    invariantFormula = `Heap Size ≤ K   |   Insert + Evict = O(log K)   |   Total Stream Cost = O(N log K) ≪ O(N log N)`;
    stages = [
      { step: '01', label: 'Stream Element Arrival', shape: 'Candidate x_i', detail: 'Compare incoming priority against heap root S[0]' },
      { step: '02', label: 'Logarithmic Heap Push/Pop', shape: 'heappushpop(H, x_i)', detail: 'Sift element into binary heap array in O(log K) swaps' },
      { step: '03', label: 'Enforce Capacity Invariant', shape: '|H| == K', detail: 'Root H[0] always holds the exact K-th threshold element' },
      { step: '04', label: 'Extract Optimal Top-K', shape: 'O(K) Readout', detail: 'Avoids allocating or sorting the remaining N - K elements' }
    ];
    ioExamples = [
      { input: `nums = [1, 1, 1, 2, 2, 3], k = 2`, output: `[1, 2]`, explanation: `Frequency map + bounded min-heap of size K extracts top-K elements in O(N log K).` }
    ];
  } else if (isGraph) {
    productionBottleneck = `In multi-agent DAG orchestration (parallel fan-out/fan-in), PyTorch computation graph compilation, and distributed network routing, cyclic dependencies cause deadlocks while unpruned path searches explode exponentially.`;
    firstPrinciplesSolution = `Model entities and transitions as an explicit adjacency list G = (V, E). Apply Kahn's in-degree topological sort for DAG scheduling, BFS for unweighted shortest hops, or Dijkstra/Union-Find for weighted connectivity in O(V + E).`;
    schematicTitle = `Graph Topology & Frontier Expansion (G = V, E)`;
    invariantFormula = `Topological / BFS Invariant: Visit each vertex V and directed edge E at most once → O(V + E)`;
    stages = [
      { step: '01', label: 'Build Adjacency & In-Degrees', shape: 'adj[u] → [v₁, v₂...]', detail: 'Construct sparse graph representation in O(V + E)' },
      { step: '02', label: 'Seed Zero-Dependency Frontier', shape: 'Queue / Visited Set', detail: 'Enqueue source nodes (in_degree == 0) or starting coordinates' },
      { step: '03', label: 'Level-Order / Edge Relaxation', shape: 'Dequeue u → Relax (u,v)', detail: 'Mark visited immediately upon enqueue to prevent duplicate work' },
      { step: '04', label: 'Cycle & Reachability Check', shape: 'Visited == |V|', detail: 'Detect dependency cycles or emit optimal path distance' }
    ];
    ioExamples = [
      { input: `numCourses = 4, prerequisites = [[1,0], [2,0], [3,1], [3,2]]`, output: `[0, 1, 2, 3] (Valid Topological Execution Order)`, explanation: `Kahn's BFS processes nodes with in-degree 0 and unlocks downstream dependents in O(V + E).` }
    ];
  } else if (isDP) {
    productionBottleneck = `In sequence alignment, speculative decoding verification trees, and compiler operator-fusion planners, overlapping subproblems cause naive recursion to recompute identical states O(2^N) times.`;
    firstPrinciplesSolution = `Formulate the Bellman recurrence relation over a minimal state tuple, prove optimal substructure, and evaluate bottom-up in topological state order—compressing auxiliary memory to only the active rolling frontier.`;
    schematicTitle = `Dynamic Programming State Transition Lattice`;
    invariantFormula = `dp[i] =最优 Combine(dp[i - 1], dp[i - 2] + cost[i])   |   Rolling Frontier compresses Space: O(N) → O(1)`;
    stages = [
      { step: '01', label: 'Define Minimal State Tuple', shape: 'dp[i] or dp[i][j]', detail: 'Capture only parameters required to make future decisions' },
      { step: '02', label: 'Establish Base Cases', shape: 'dp[0], dp[1]', detail: 'Anchor boundary conditions before transition loop' },
      { step: '03', label: 'Bottom-Up State Transition', shape: 'Iterative Bellman Step', detail: 'Compute each state once from already-solved predecessors' },
      { step: '04', label: 'Rolling Register Compression', shape: 'prev2, prev1 → curr', detail: 'Drop historical table rows no longer referenced: O(1) space' }
    ];
    ioExamples = [
      { input: `nums = [2, 7, 9, 3, 1] (or coins = [1, 2, 5], amount = 11)`, output: `12 (or min_coins = 3)`, explanation: `Bottom-up state transition solves each subproblem once in O(N) time and O(1) rolling space.` }
    ];
  } else {
    // Arrays & Hashing / Intervals / Bit / General
    productionBottleneck = `In high-throughput tokenizers, embedding lookup tables, and feature deduplication pipelines, scanning arrays repeatedly with nested loops turns linear ingestion into an O(N²) CPU bottleneck that drops requests under load.`;
    firstPrinciplesSolution = `Trade O(N) auxiliary hash-table memory (or prefix-sum precomputation) for O(1) average-case complement/frequency lookups, collapsing quadratic nested loops into a single deterministic pass.`;
    schematicTitle = `Single-Pass Hash Invariant & Prefix State Pipeline`;
    invariantFormula = `Lookup(target - x[i]) ∈ HashMap → O(1) Average Time   |   Total Pipeline Cost: O(N)`;
    ioExamples = isTwoSum
      ? [
          { input: `nums = [2, 7, 11, 15], target = 9`, output: `[0, 1]`, explanation: `At index 1 (num = 7), complement 9 - 7 = 2 is found in hash map at index 0 in O(1).` },
          { input: `nums = [3, 2, 4], target = 6`, output: `[1, 2]`, explanation: `Single pass stores {3: 0, 2: 1} and matches complement 6 - 4 = 2 at index 2.` }
        ]
      : [
          { input: `nums = [1, 2, 3, 1] (or strs = ["eat","tea","tan","ate","nat","bat"])`, output: `true (or grouped equivalence classes)`, explanation: `Hash signature / seen set resolves membership in O(1) per element.` }
        ];
  }

  return {
    domainTag: `ALGORITHMIC PRIMITIVES · ${category.toUpperCase()}`,
    productionBottleneck,
    firstPrinciplesSolution,
    schematic: {
      title: schematicTitle,
      invariantFormula,
      hardwareImpact,
      stages
    },
    ioExamples,
    constraints: [
      { label: 'Target Time Complexity', value: isBinarySearch ? 'O(log N)' : isHeap ? 'O(N log K)' : isGraph ? 'O(V + E)' : 'O(N) Optimal Pass' },
      { label: 'Target Space Complexity', value: isTwoPointers || isBinarySearch ? 'O(1) Auxiliary Memory' : 'O(N) Bounded State' },
      { label: 'Input Scale Bound', value: '1 ≤ N ≤ 10⁵ elements (must execute < 50ms)' },
      { label: 'Edge Case Invariants', value: 'Empty/single-element inputs, negative values, duplicates' }
    ]
  };
}

