import React, { useState } from 'react';
import { 
  GitBranch, 
  Code2, 
  Server, 
  BrainCircuit, 
  Database, 
  ArrowRight, 
  BookOpen, 
  ChevronRight, 
  Layers, 
  Terminal, 
  Cpu, 
  Workflow,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Network
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoadmapView({ onSelectCategory, solvedProblems }) {
  const [activeTopographyMode, setActiveTopographyMode] = useState('ai_topography'); // ai_topography, dsa_graph, branches
  const [selectedStackLayer, setSelectedStackLayer] = useState(0);
  const [hoveredNodeId, setHoveredNodeId] = useState('attention');

  // 4-Layer Floor-to-Ceiling AI Engineering Stack (Problem -> Solution Interactive Map)
  const engineeringStackLayers = [
    {
      layer: 'LAYER 04',
      name: 'Transformers, Attention & Generative AI Internals',
      trackId: 'ml',
      categoryFilter: 'Attention',
      bottleneck: 'Black-box prompt wrappers fail when attention masks leak future tokens, KV-caches exhaust GPU HBM memory, or logits overflow before Softmax.',
      solution: 'Implement Scaled Dot-Product Attention, Multi-Head Projections, Causal Masking, and LoRA low-rank adapters from scratch with explicit tensor shapes.',
      invariant: 'Attention(Q, K, V) = softmax(QKᵀ / √dₖ + M) · V',
      modules: ['Self-Attention Kernels', 'Transformer Blocks', 'Autoregressive Decoding', 'ArXiv Landmark Papers']
    },
    {
      layer: 'LAYER 03',
      name: 'Distributed Serving, Sharding & Tail-Latency Systems',
      trackId: 'sysdes',
      categoryFilter: 'System Design Interview',
      bottleneck: 'At 100k+ QPS, naive single-node databases, unsharded vector indexes, and synchronous RPC chains collapse under p99 latency spikes and hot-key skew.',
      solution: 'Architect Consistent Hashing rings, Token-Bucket Rate Limiters, Read-Through Redis Clusters, and Partitioned Event Streams with quorum consistency.',
      invariant: 'p99 Latency = T_Edge + P(CacheMiss) · T_QuorumShard',
      modules: ['Consistent Hashing', 'Rate Limiters', 'Distributed KV Stores', 'High-Throughput Queues']
    },
    {
      layer: 'LAYER 02',
      name: 'Vectorized Tensor Kernels, Autograd & Data Pipelines',
      trackId: 'data',
      categoryFilter: 'NumPy Road',
      bottleneck: 'Python for-loops and DataFrame .iterrows() run 1,000× slower than contiguous C/SIMD memory strides, starving GPU Tensor Cores during training and ETL.',
      solution: 'Replace scalar loops with zero-copy NumPy broadcasting, analytical Jacobian backpropagation, Pandas split-apply-combine, and SQL window frames.',
      invariant: 'Stride View [B, D] → Contiguous BLAS / Arrow Vector Execution',
      modules: ['NumPy Vectorization', 'Analytical Backprop', 'Window Function OLAP', 'PySpark Partitioning']
    },
    {
      layer: 'LAYER 01',
      name: 'Algorithmic Invariants & Memory Data Structures',
      trackId: 'dsa',
      categoryFilter: 'Arrays & Hashing',
      bottleneck: 'Unoptimized O(N²) token lookups, unpruned search trees, and unbounded priority queues stall inference schedulers, compilers, and RAG retrievers.',
      solution: 'Master the 19 foundational algorithmic invariants—Sliding Windows, Monotonic Stacks, Radix Tries, Top-K Heaps, and Topological DAGs.',
      invariant: 'T(N) : O(N²) → O(N) via O(1) Amortized State Invariants',
      modules: ['Sliding Window Eviction', 'Radix Prefix Tries', 'Top-K Beam Heaps', 'DAG Topological Sort']
    }
  ];

  // Cross-Discipline Knowledge Topography Nodes (Connecting DSA + ML + Systems + Data)
  const topographyStages = [
    {
      stage: 'STAGE 01',
      title: 'Memory & Mathematical Primitives',
      subtitle: 'Contiguous buffers, hashing & linear algebra',
      nodes: [
        {
          id: 'arrays-hashing',
          code: 'ALG-101',
          name: 'Arrays & Hash Invariants',
          discipline: 'Algorithms',
          trackId: 'dsa',
          category: 'Arrays & Hashing',
          count: 208,
          prereqs: [],
          unlocks: ['two-pointers', 'sliding-window', 'consistent-hashing', 'vector-numpy'],
          productionWhy: 'Powers O(1) BPE token vocabulary lookups, embedding deduplication, and hash-partitioned sharding.'
        },
        {
          id: 'vector-numpy',
          code: 'TNS-102',
          name: 'NumPy Strides & Broadcasting',
          discipline: 'Data & Tensors',
          trackId: 'data',
          category: 'NumPy Road',
          count: 37,
          prereqs: ['arrays-hashing'],
          unlocks: ['linear-opt', 'pandas-olap', 'neural-tensors'],
          productionWhy: 'Eliminates 1000× Python loop overhead via contiguous C-memory strides and SIMD vectorization.'
        },
        {
          id: 'math-foundations',
          code: 'MTH-103',
          name: 'Linear Projections & PCA Math',
          discipline: 'AI & ML Math',
          trackId: 'ml',
          category: 'Foundations',
          count: 14,
          prereqs: [],
          unlocks: ['linear-opt', 'attention'],
          productionWhy: 'Eigenvalues, covariance matrices, and low-rank projections form the backbone of LoRA and embeddings.'
        }
      ]
    },
    {
      stage: 'STAGE 02',
      title: 'Windowing, Pointers & Gradient Flow',
      subtitle: 'Streaming bounds, analytical derivatives & OLAP',
      nodes: [
        {
          id: 'two-pointers',
          code: 'ALG-201',
          name: 'Two Pointers & Binary Search',
          discipline: 'Algorithms',
          trackId: 'dsa',
          category: 'Two Pointers',
          count: 97,
          prereqs: ['arrays-hashing'],
          unlocks: ['sliding-window', 'trees-tries'],
          productionWhy: 'Used in sorted posting-list intersections for hybrid RAG search and O(log V) top-p logit sampling.'
        },
        {
          id: 'sliding-window',
          code: 'ALG-202',
          name: 'Sliding Window & Monotonic Stack',
          discipline: 'Algorithms',
          trackId: 'dsa',
          category: 'Sliding Window',
          count: 89,
          prereqs: ['arrays-hashing', 'two-pointers'],
          unlocks: ['attention', 'rate-limiter'],
          productionWhy: 'Directly models Sliding Window Attention (Mistral/Llama) and rolling token-bucket rate limiters.'
        },
        {
          id: 'linear-opt',
          code: 'ML-203',
          name: 'Loss Functions, GD & Backprop',
          discipline: 'AI & ML Math',
          trackId: 'ml',
          category: 'Loss & Optimization',
          count: 19,
          prereqs: ['vector-numpy', 'math-foundations'],
          unlocks: ['neural-tensors', 'attention'],
          productionWhy: 'Analytical Jacobian chain-rule contractions and Adam momentum prevent gradient explosion/vanishing.'
        },
        {
          id: 'pandas-olap',
          code: 'DAT-204',
          name: 'Columnar GroupBy & SQL Windows',
          discipline: 'Data & Tensors',
          trackId: 'data',
          category: 'SQL Road',
          count: 87,
          prereqs: ['vector-numpy'],
          unlocks: ['spark-distributed'],
          productionWhy: 'Point-in-time feature engineering via window frames (LAG/LEAD/ROW_NUMBER) without self-join spills.'
        }
      ]
    },
    {
      stage: 'STAGE 03',
      title: 'Hierarchical Prefix Trees & Neural Kernels',
      subtitle: 'Radix trees, top-K heaps & autograd modules',
      nodes: [
        {
          id: 'trees-tries',
          code: 'ALG-301',
          name: 'Trees, BSTs & Radix Prefix Tries',
          discipline: 'Algorithms',
          trackId: 'dsa',
          category: 'Trees',
          count: 128,
          prereqs: ['two-pointers'],
          unlocks: ['heaps-topk', 'graphs-dag', 'attention'],
          productionWhy: 'Radix Trees power SGLang RadixAttention & vLLM prefix caching for multi-turn agent KV-cache reuse.'
        },
        {
          id: 'heaps-topk',
          code: 'ALG-302',
          name: 'Priority Queues & Top-K Heaps',
          discipline: 'Algorithms',
          trackId: 'dsa',
          category: 'Heap / Priority Queue',
          count: 36,
          prereqs: ['trees-tries'],
          unlocks: ['graphs-dag', 'llm-generative'],
          productionWhy: 'Maintains Top-K candidates during LLM Beam Search decoding and HNSW vector ANN retrieval in O(N log K).'
        },
        {
          id: 'neural-tensors',
          code: 'ML-303',
          name: 'PyTorch Tensors, CNNs & ResNets',
          discipline: 'AI & ML Math',
          trackId: 'ml',
          category: 'Neural Networks',
          count: 58,
          prereqs: ['vector-numpy', 'linear-opt'],
          unlocks: ['attention', 'llm-generative'],
          productionWhy: 'Residual skip connections (x + F(x)) and Batch/Layer Normalization preserve gradient flow across deep layers.'
        },
        {
          id: 'consistent-hashing',
          code: 'SYS-304',
          name: 'Consistent Hashing & OOD Patterns',
          discipline: 'Systems',
          trackId: 'sysdes',
          category: 'System Design for Beginners',
          count: 39,
          prereqs: ['arrays-hashing'],
          unlocks: ['rate-limiter'],
          productionWhy: 'Minimizes state remapping to K/N keys when scaling distributed cache nodes or model shards.'
        }
      ]
    },
    {
      stage: 'STAGE 04',
      title: 'Attention, DAG Orchestration & DP Lattices',
      subtitle: 'Transformers, agent graphs & distributed scale',
      nodes: [
        {
          id: 'attention',
          code: 'AI-401',
          name: 'Multi-Head Attention & Transformers',
          discipline: 'AI & ML Math',
          trackId: 'ml',
          category: 'Attention',
          count: 15,
          prereqs: ['sliding-window', 'linear-opt', 'trees-tries', 'neural-tensors'],
          unlocks: ['llm-generative'],
          productionWhy: 'The core compute engine of modern AI: QKᵀ/√dₖ scaling, causal masking, and KV-cache memory layout.'
        },
        {
          id: 'graphs-dag',
          code: 'ALG-402',
          name: 'Graphs, Topological Sort & DP',
          discipline: 'Algorithms',
          trackId: 'dsa',
          category: 'Graphs',
          count: 302,
          prereqs: ['trees-tries', 'heaps-topk'],
          unlocks: ['llm-generative', 'spark-distributed'],
          productionWhy: 'Schedules parallel fan-out/fan-in Agent DAGs, torch.compile execution graphs, and Viterbi decoding.'
        },
        {
          id: 'rate-limiter',
          code: 'SYS-403',
          name: 'Distributed HLD & High-Scale Infra',
          discipline: 'Systems',
          trackId: 'sysdes',
          category: 'System Design Interview',
          count: 10,
          prereqs: ['sliding-window', 'consistent-hashing'],
          unlocks: ['llm-generative'],
          productionWhy: 'End-to-end architecture for high-QPS rate limiters, distributed KV stores, and fault-isolated clusters.'
        },
        {
          id: 'spark-distributed',
          code: 'DAT-404',
          name: 'PySpark DAGs & Pipeline Capstones',
          discipline: 'Data & Tensors',
          trackId: 'data',
          category: 'PySpark Road',
          count: 63,
          prereqs: ['pandas-olap', 'graphs-dag'],
          unlocks: ['llm-generative'],
          productionWhy: 'Distributed shuffle minimization, lazy Catalyst execution plans, and petabyte-scale corpus curation.'
        }
      ]
    },
    {
      stage: 'STAGE 05',
      title: 'Production LLM Systems & ArXiv Frontier',
      subtitle: 'Generative models, LoRA & paper implementations',
      nodes: [
        {
          id: 'llm-generative',
          code: 'AI-501',
          name: 'Generative Models, LLMs & LoRA',
          discipline: 'AI & ML Math',
          trackId: 'ml',
          category: 'Generative Models',
          count: 21,
          prereqs: ['attention', 'heaps-topk', 'graphs-dag', 'rate-limiter', 'spark-distributed'],
          unlocks: [],
          productionWhy: 'Synthesizes attention, top-k/top-p sampling, low-rank adaptation, and distributed serving into production AI.'
        }
      ]
    }
  ];

  const allTopographyNodes = topographyStages.flatMap(s => s.nodes);
  const activeHoveredNode = allTopographyNodes.find(n => n.id === hoveredNodeId) || allTopographyNodes[0];

  // Classic 18-Node Algorithmic Prerequisite Graph
  const dsaGraphNodes = [
    { id: 'arrays', name: 'Arrays & Hashing', count: 208, difficulty: 'Easy', tier: '01 / FOUNDATION', leadsTo: ['Two Pointers', 'Stack'], tagline: 'Hash tables, prefix sums, frequency invariants' },
    { id: 'two-pointers', name: 'Two Pointers', count: 48, difficulty: 'Medium', tier: '02 / CONVERGENCE', leadsTo: ['Sliding Window', 'Binary Search', 'Linked List'], tagline: 'In-place boundary pruning in O(1) auxiliary space' },
    { id: 'stack', name: 'Stack', count: 42, difficulty: 'Medium', tier: '02 / LIFO INVARIANT', leadsTo: [], tagline: 'Monotonic span resolution & AST evaluation' },
    { id: 'binary-search', name: 'Binary Search', count: 49, difficulty: 'Medium', tier: '03 / LOGARITHMIC', leadsTo: ['Trees'], tagline: 'Monotonic predicate half-space elimination' },
    { id: 'sliding-window', name: 'Sliding Window', count: 47, difficulty: 'Medium', tier: '03 / STREAMING', leadsTo: [], tagline: 'Dynamic [L..R] window state & KV eviction' },
    { id: 'linked-list', name: 'Linked List', count: 41, difficulty: 'Medium', tier: '03 / POINTERS', leadsTo: ['Trees'], tagline: 'Floyd cycle detection, LRU doubly-linked nodes' },
    { id: 'trees', name: 'Trees', count: 112, difficulty: 'Medium', tier: '04 / HIERARCHY', leadsTo: ['Tries', 'Heap', 'Backtracking'], tagline: 'Recursive DFS, level-order BFS, BST invariants' },
    { id: 'tries', name: 'Tries', count: 16, difficulty: 'Medium', tier: '05 / PREFIX TREE', leadsTo: [], tagline: 'Radix prefix caching & O(L) token lookup' },
    { id: 'heap', name: 'Heap / Priority Queue', count: 36, difficulty: 'Medium', tier: '05 / STREAM TOP-K', leadsTo: ['Intervals'], tagline: 'Bounded O(N log K) beam search & median streams' },
    { id: 'backtracking', name: 'Backtracking', count: 45, difficulty: 'Medium', tier: '05 / STATE SEARCH', leadsTo: ['Graphs', '1-D DP'], tagline: 'Constraint satisfaction & branch pruning' },
    { id: 'graphs', name: 'Graphs', count: 138, difficulty: 'Medium', tier: '06 / TOPOLOGY', leadsTo: ['Advanced Graphs'], tagline: 'Kahn topological DAG sort, BFS/DFS, Union-Find' },
    { id: '1-d-dp', name: '1-D Dynamic Programming', count: 61, difficulty: 'Medium', tier: '06 / BELLMAN STATE', leadsTo: ['2-D DP'], tagline: 'Optimal substructure & O(1) rolling registers' },
    { id: 'intervals', name: 'Intervals', count: 22, difficulty: 'Medium', tier: '07 / SCHEDULING', leadsTo: [], tagline: 'Sweep-line conflict resolution & span merging' },
    { id: 'greedy', name: 'Greedy', count: 43, difficulty: 'Medium', tier: '07 / EXCHANGE PROOF', leadsTo: [], tagline: 'Locally optimal choices with global guarantee' },
    { id: 'advanced-graphs', name: 'Advanced Graphs', count: 36, difficulty: 'Hard', tier: '08 / NETWORK FLOW', leadsTo: [], tagline: 'Dijkstra, Bellman-Ford, Kruskal MST' },
    { id: '2-d-dp', name: '2-D Dynamic Programming', count: 67, difficulty: 'Hard', tier: '08 / STATE LATTICE', leadsTo: [], tagline: 'Sequence alignment, knapsack, edit distance' },
    { id: 'bit-manipulation', name: 'Bit Manipulation', count: 33, difficulty: 'Medium', tier: '09 / HARDWARE ALU', leadsTo: [], tagline: 'Bitmasks, XOR parity, register arithmetic' },
    { id: 'math-geometry', name: 'Math & Geometry', count: 31, difficulty: 'Medium', tier: '09 / LINEAR ALGEBRA', leadsTo: [], tagline: 'Matrix rotation, modular arithmetic, combinatorics' }
  ];

  // 4 Disciplines Overview
  const branches = [
    {
      id: 'ml',
      code: 'TRACK 01',
      title: 'AI & Machine Learning Engineering',
      tagline: 'Linear Algebra → Autograd & Optimization → PyTorch Tensors → Transformers & LLMs',
      icon: BrainCircuit,
      badge: '119 Labs + ArXiv Papers',
      levels: [
        { name: 'Mathematical Foundations & Statistics', count: 14, category: 'Foundations', paper: 'Pearson (1901) — PCA' },
        { name: 'Loss Functions, Gradient Descent & Backprop', count: 19, category: 'Loss & Optimization', paper: 'Kingma & Ba (2014) — Adam' },
        { name: 'Neural Networks & PyTorch Tensor Mechanics', count: 46, category: 'Neural Networks', paper: 'Ioffe & Szegedy (2015) — BatchNorm' },
        { name: 'Computer Vision & Residual Architectures', count: 12, category: 'Computer Vision', paper: 'He et al. (2015) — ResNet' },
        { name: 'Multi-Head Attention & Transformers', count: 15, category: 'Attention', paper: 'Vaswani et al. (2017) — Attention' },
        { name: 'Generative Models, LLMs & Low-Rank Adaptation', count: 21, category: 'Generative Models', paper: 'Hu et al. (2021) — LoRA' }
      ]
    },
    {
      id: 'dsa',
      code: 'TRACK 02',
      title: 'Data Structures & Algorithmic Invariants',
      tagline: 'Arrays & Hashing → Sliding Window → Trees & Tries → Graphs → Dynamic Programming',
      icon: Code2,
      badge: '1,126 Problems',
      levels: [
        { name: 'Foundations: Arrays, Hashing & Two Pointers', count: 256, category: 'Arrays & Hashing' },
        { name: 'Streaming & Scope: Sliding Window, Stack & Binary Search', count: 138, category: 'Sliding Window' },
        { name: 'Hierarchical State: Trees, Linked Lists & Radix Tries', count: 169, category: 'Trees' },
        { name: 'Topology & Scheduling: Graphs, Heaps & Backtracking', count: 255, category: 'Graphs' },
        { name: 'State Lattices: 1-D & 2-D Dynamic Programming', count: 128, category: '1-D Dynamic Programming' }
      ]
    },
    {
      id: 'sysdes',
      code: 'TRACK 03',
      title: 'Distributed Systems & Architecture',
      tagline: 'Networking & Caching → Consistent Hashing → OOD Patterns → High-Scale HLD',
      icon: Server,
      badge: '49 Architectures',
      levels: [
        { name: 'Distributed Primitives: DNS, TCP/UDP, Sharding & Caching', count: 21, category: 'System Design for Beginners' },
        { name: 'Object-Oriented State Machines & Concurrency', count: 7, category: 'Object-Oriented Design Interview' },
        { name: 'Creational, Structural & Behavioral Design Patterns', count: 11, category: 'Object-Oriented Design Patterns' },
        { name: 'Production HLD: Rate Limiters, Feeds, Storage & Messaging', count: 10, category: 'System Design Interview' }
      ]
    },
    {
      id: 'data',
      code: 'TRACK 04',
      title: 'Data Engineering & Vector Pipelines',
      tagline: 'NumPy Broadcasting → Pandas GroupBy → SQL Window Functions → PySpark DAGs',
      icon: Database,
      badge: '253 Labs',
      levels: [
        { name: 'NumPy Contiguous Memory & Broadcasting Kernels', count: 37, category: 'NumPy Road' },
        { name: 'Pandas Columnar Wrangling & Relational Merges', count: 48, category: 'Pandas Road' },
        { name: 'SQL OLAP Window Functions & CTE Pipelines', count: 39, category: 'SQL Road' },
        { name: 'PySpark Partitioning, Shuffles & Lazy Execution', count: 30, category: 'PySpark Road' },
        { name: 'End-to-End Production Data Engineering Capstones', count: 33, category: 'Data Engineering Road' }
      ]
    }
  ];

  const getDisciplineBadgeStyle = (discipline) => {
    if (discipline === 'AI & ML Math') return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
    if (discipline === 'Systems') return 'text-sky-300 bg-sky-500/10 border-sky-500/30';
    if (discipline === 'Data & Tensors') return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
    return 'text-zinc-300 bg-zinc-800 border-zinc-700';
  };

  return (
    <div className="bg-topography-grid min-h-screen">
      <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        
        {/* ============================================================== */}
        {/* SECTION 1: EDITORIAL MANIFESTO HERO (THE PROBLEM vs SOLUTION) */}
        {/* ============================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-zinc-800/90 pb-12">
          
          {/* Left 7 Cols: Editorial Thesis + Problem/Solution Articulation */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400 text-[11px] font-mono uppercase tracking-widest">
                <span>SYSTEMS MONOGRAPH & EXECUTION SANDBOX</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl text-zinc-100 leading-[1.06] tracking-tight">
                Move beyond shallow API wrappers to{' '}
                <span className="italic text-amber-300">first-principles</span>{' '}
                AI & systems engineering.
              </h1>

              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                Most platforms teach you to call high-level library wrappers or memorize isolated interview templates. NexusCore maps the complete engineering stack—from mathematical papers and vectorized tensor kernels down to algorithmic invariants and distributed serving infrastructure.
              </p>
            </div>

            {/* Expressing The Problem vs. The Solution (Fanout Philosophy) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-[#0f0f12] border border-zinc-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>01 / THE BLACK-BOX TRAP</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600">WHY TEAMS STALL</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Calling <code className="font-mono text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded">model.fit()</code> or <code className="font-mono text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded">generateText()</code> hides KV-cache memory blowups, unvectorized Python loops, broken gradient flows, and p99 tail-latency bottlenecks under production load.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0f0f12] border border-zinc-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>02 / FLOOR-TO-CEILING EXECUTION</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600">THE SOLUTION</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Every module connects <strong className="text-zinc-100 font-medium">the production bottleneck</strong> to its <strong className="text-zinc-100 font-medium">mathematical & architectural invariant</strong>—verified by writing and executing real code in a client-side WebAssembly sandbox.
                </p>
              </div>
            </div>

            {/* Quick Entry CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onSelectCategory('ml', 'Attention')}
                className="px-4 py-2.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <span>Launch AI & Attention Labs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSelectCategory('dsa', 'Arrays & Hashing')}
                className="px-4 py-2.5 rounded-md bg-[#0f0f12] hover:bg-zinc-900 text-zinc-200 border border-zinc-800 font-mono text-xs flex items-center gap-2 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Explore 1,126 Algorithmic Specs</span>
              </button>
              <div className="text-[11px] font-mono text-zinc-500 pl-1">
                1,547 Interactive Specs · In-Browser Python 3.13 WASM · Zero Login
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Interactive 4-Layer AI Engineering Stack Inspector */}
          <div className="lg:col-span-5 rounded-lg bg-[#0f0f12] border border-zinc-800/90 p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                  ARCHITECTURE DECONSTRUCTION
                </span>
                <h2 className="text-sm font-semibold text-zinc-100 mt-0.5">
                  The 4-Layer Production AI & Systems Stack
                </h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                Click Layer to Inspect
              </span>
            </div>

            {/* Stack Selector Bars */}
            <div className="space-y-2">
              {engineeringStackLayers.map((item, idx) => {
                const isSelected = selectedStackLayer === idx;
                return (
                  <div
                    key={item.layer}
                    onClick={() => setSelectedStackLayer(idx)}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900/90 border-amber-500/50'
                        : 'bg-[#09090b]/60 border-zinc-800/70 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-amber-400/15 text-amber-300 border border-amber-500/30' : 'bg-zinc-900 text-zinc-500'
                        }`}>
                          {item.layer}
                        </span>
                        <span className={`text-xs font-medium ${isSelected ? 'text-zinc-100' : 'text-zinc-400'}`}>
                          {item.name}
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-amber-400 rotate-90' : 'text-zinc-600'}`} />
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2.5 text-xs">
                        <div className="text-zinc-400 leading-relaxed">
                          <span className="text-rose-400 font-mono text-[10px] uppercase mr-1.5">[Bottleneck]</span>
                          {item.bottleneck}
                        </div>
                        <div className="text-zinc-300 leading-relaxed">
                          <span className="text-emerald-400 font-mono text-[10px] uppercase mr-1.5">[First-Principles Fix]</span>
                          {item.solution}
                        </div>
                        <div className="p-2 rounded bg-[#09090b] border border-zinc-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
                          {item.invariant}
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-wrap gap-1">
                            {item.modules.slice(0, 3).map((m, i) => (
                              <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                                {m}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCategory(item.trackId, item.categoryFilter);
                            }}
                            className="text-[11px] font-mono font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 flex-shrink-0"
                          >
                            <span>Open Track</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: KNOWLEDGE TOPOGRAPHY & CURRICULUM SWITCHER         */}
        {/* ============================================================== */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                <Network className="w-3.5 h-3.5 text-amber-400" />
                <span>KNOWLEDGE TOPOGRAPHY (/TOPOGRAPHY)</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-zinc-100 mt-1">
                Connected System, Mathematical & Algorithmic Dependency Graph
              </h2>
            </div>

            {/* Mode Switcher */}
            <div className="inline-flex p-1 rounded-md bg-[#0f0f12] border border-zinc-800 text-xs font-mono">
              <button
                onClick={() => setActiveTopographyMode('ai_topography')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeTopographyMode === 'ai_topography'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                01 / Unified AI Topography
              </button>
              <button
                onClick={() => setActiveTopographyMode('dsa_graph')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeTopographyMode === 'dsa_graph'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                02 / 18-Node DSA DAG
              </button>
              <button
                onClick={() => setActiveTopographyMode('branches')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeTopographyMode === 'branches'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                03 / 4-Track Syllabus
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* MODE 1: UNIFIED CROSS-DISCIPLINE AI & SYSTEMS TOPOGRAPHY       */}
          {/* ============================================================== */}
          {activeTopographyMode === 'ai_topography' && (
            <div className="space-y-6">
              
              {/* Live Hovered Node Dependency Telemetry Bar */}
              <div className="p-4 rounded-lg bg-[#0f0f12] border border-zinc-800/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-500/30 font-semibold">
                      ACTIVE NODE · {activeHoveredNode.code}
                    </span>
                    <span className="text-sm font-semibold text-zinc-100">
                      {activeHoveredNode.name}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getDisciplineBadgeStyle(activeHoveredNode.discipline)}`}>
                      {activeHoveredNode.discipline}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    <strong className="text-zinc-200 font-mono text-[11px]">Production Impact: </strong>
                    {activeHoveredNode.productionWhy}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-400/30 border border-sky-400"></span>
                    <span className="text-zinc-400">Upstream Prereqs ({activeHoveredNode.prereqs.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/30 border border-amber-400"></span>
                    <span className="text-zinc-400">Selected Module</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/30 border border-emerald-400"></span>
                    <span className="text-zinc-400">Unlocks Downstream ({activeHoveredNode.unlocks.length})</span>
                  </div>
                </div>
              </div>

              {/* 5-Stage Connected Topography Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topographyStages.map((stageObj) => (
                  <div
                    key={stageObj.stage}
                    className="rounded-lg bg-[#0f0f12]/90 border border-zinc-800/80 p-4 flex flex-col space-y-4"
                  >
                    <div className="border-b border-zinc-800/80 pb-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                        {stageObj.stage}
                      </span>
                      <h3 className="text-xs font-semibold text-zinc-100 mt-0.5">
                        {stageObj.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {stageObj.subtitle}
                      </p>
                    </div>

                    <div className="space-y-3 flex-1">
                      {stageObj.nodes.map((node) => {
                        const isHovered = hoveredNodeId === node.id;
                        const isUpstreamPrereq = activeHoveredNode?.prereqs.includes(node.id);
                        const isDownstreamUnlock = activeHoveredNode?.unlocks.includes(node.id);

                        let borderClass = 'border-zinc-800/90 bg-[#09090b] hover:border-zinc-600';
                        let statusBadge = null;

                        if (isHovered) {
                          borderClass = 'border-amber-400 bg-amber-500/[0.06] shadow-lg';
                          statusBadge = <span className="text-[9px] font-mono text-amber-300 uppercase">Selected</span>;
                        } else if (isUpstreamPrereq) {
                          borderClass = 'border-sky-400/80 bg-sky-500/[0.06]';
                          statusBadge = <span className="text-[9px] font-mono text-sky-300 uppercase">← Prerequisite</span>;
                        } else if (isDownstreamUnlock) {
                          borderClass = 'border-emerald-400/80 bg-emerald-500/[0.06]';
                          statusBadge = <span className="text-[9px] font-mono text-emerald-300 uppercase">→ Unlocks</span>;
                        }

                        return (
                          <div
                            key={node.id}
                            onMouseEnter={() => setHoveredNodeId(node.id)}
                            onClick={() => onSelectCategory(node.trackId, node.category)}
                            className={`p-3.5 rounded-md border transition-all cursor-pointer group ${borderClass}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="text-[10px] font-mono text-zinc-500">
                                {node.code}
                              </span>
                              {statusBadge || (
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${getDisciplineBadgeStyle(node.discipline)}`}>
                                  {node.discipline}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors leading-snug">
                              {node.name}
                            </h4>

                            <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                              {node.productionWhy}
                            </p>

                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-500">
                              <span>{node.count} Labs</span>
                              <span className="text-zinc-300 group-hover:text-amber-300 flex items-center gap-0.5">
                                Open <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE 2: 18-NODE ALGORITHMIC PREREQUISITE DAG                   */}
          {/* ============================================================== */}
          {activeTopographyMode === 'dsa_graph' && (
            <div className="rounded-lg bg-[#0f0f12] border border-zinc-800/90 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-amber-400" />
                    <span>18-Pattern Algorithmic Dependency Tree (1,126 Problems)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Sequenced by prerequisite invariants. Click any node to open its problem set and production specs.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  TIER 01 (FOUNDATION) → TIER 09 (HARDWARE & MATH)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dsaGraphNodes.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => onSelectCategory('dsa', node.name)}
                    className="editorial-card p-4 rounded-lg cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {node.tier}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          node.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                          node.difficulty === 'Medium' ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' :
                          'text-rose-400 bg-rose-500/10 border-rose-500/30'
                        }`}>
                          {node.difficulty}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors mt-2.5">
                        {node.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {node.tagline}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
                      {node.leadsTo.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 truncate">
                          <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span className="truncate">Unlocks: {node.leadsTo.join(', ')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>{node.count} specifications</span>
                        <span className="text-zinc-200 group-hover:text-amber-300 flex items-center gap-1">
                          <span>Enter Track</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE 3: 4 DISCIPLINES SYLLABUS & PAPER MAPPINGS                */}
          {/* ============================================================== */}
          {activeTopographyMode === 'branches' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {branches.map((branch) => {
                const Icon = branch.icon;
                return (
                  <div
                    key={branch.id}
                    className="rounded-lg bg-[#0f0f12] border border-zinc-800/90 p-6 flex flex-col justify-between space-y-6"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                              {branch.code}
                            </span>
                            <h3 className="text-base font-semibold text-zinc-100">{branch.title}</h3>
                            <p className="text-xs text-zinc-400 mt-0.5">{branch.tagline}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 flex-shrink-0">
                          {branch.badge}
                        </span>
                      </div>

                      <div className="divide-y divide-zinc-800/60 my-2">
                        {branch.levels.map((lvl, idx) => (
                          <div
                            key={idx}
                            onClick={() => onSelectCategory(branch.id, lvl.category)}
                            className="group flex items-center justify-between py-3 px-2 hover:bg-zinc-900/60 transition-colors cursor-pointer rounded"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-[11px] font-mono text-zinc-500 group-hover:text-amber-400 w-5 flex-shrink-0">
                                0{idx + 1}
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-xs font-medium text-zinc-200 group-hover:text-amber-300 truncate">
                                  {lvl.name}
                                </h4>
                                {lvl.paper && (
                                  <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1 mt-0.5 font-mono">
                                    <BookOpen className="w-3 h-3 text-amber-400/80 flex-shrink-0" />
                                    <span>Paper: {lvl.paper}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                              <span className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300">
                                {lvl.count}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCategory(branch.id, '')}
                      className="w-full py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-mono font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Open Complete {branch.title} Curriculum</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
