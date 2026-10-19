import React, { useState } from 'react';
import { 
  GitBranch, 
  Code2, 
  Server, 
  BrainCircuit, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  Flame,
  Layers,
  Terminal,
  Cpu,
  Workflow
} from 'lucide-react';

export default function RoadmapView({ onSelectCategory, solvedProblems }) {
  const [activeRoadmapTab, setActiveRoadmapTab] = useState('dsa_graph'); // dsa_graph, branches

  // Classic NeetCode Prerequisite Node Graph Structure
  const dsaGraphNodes = [
    {
      id: 'arrays',
      name: 'Arrays & Hashing',
      count: 208,
      difficulty: 'Easy',
      x: 1, y: 1,
      connections: ['two-pointers', 'stack'],
      tagline: 'Hash maps, frequency counters, prefix sums'
    },
    {
      id: 'two-pointers',
      name: 'Two Pointers',
      count: 48,
      difficulty: 'Medium',
      x: 2, y: 1,
      connections: ['sliding-window', 'binary-search', 'linked-list'],
      tagline: 'Left/right indices, converging pointers'
    },
    {
      id: 'stack',
      name: 'Stack',
      count: 42,
      difficulty: 'Medium',
      x: 1, y: 2,
      connections: [],
      tagline: 'Monotonic stacks, parentheses matching'
    },
    {
      id: 'binary-search',
      name: 'Binary Search',
      count: 49,
      difficulty: 'Medium',
      x: 3, y: 0,
      connections: ['trees'],
      tagline: 'Logarithmic search space pruning'
    },
    {
      id: 'sliding-window',
      name: 'Sliding Window',
      count: 47,
      difficulty: 'Medium',
      x: 3, y: 1,
      connections: [],
      tagline: 'Variable-length & fixed-length sub-arrays'
    },
    {
      id: 'linked-list',
      name: 'Linked List',
      count: 41,
      difficulty: 'Medium',
      x: 3, y: 2,
      connections: ['trees'],
      tagline: 'Fast/slow pointers, list reversal'
    },
    {
      id: 'trees',
      name: 'Trees',
      count: 112,
      difficulty: 'Medium',
      x: 4, y: 1,
      connections: ['tries', 'heap', 'backtracking'],
      tagline: 'DFS/BFS, traversals, LCA, BST properties'
    },
    {
      id: 'tries',
      name: 'Tries',
      count: 16,
      difficulty: 'Medium',
      x: 5, y: 0,
      connections: [],
      tagline: 'Prefix trees, auto-complete'
    },
    {
      id: 'heap',
      name: 'Heap / Priority Queue',
      count: 36,
      difficulty: 'Medium',
      x: 5, y: 1,
      connections: ['intervals'],
      tagline: 'Min-heap, max-heap, top-k elements'
    },
    {
      id: 'backtracking',
      name: 'Backtracking',
      count: 45,
      difficulty: 'Medium',
      x: 5, y: 2,
      connections: ['graphs'],
      tagline: 'State recursion, permutations, subsets'
    },
    {
      id: 'graphs',
      name: 'Graphs',
      count: 76,
      difficulty: 'Medium',
      x: 6, y: 1,
      connections: ['1d-dp', 'advanced-graphs'],
      tagline: 'Connected components, topological sort, BFS/DFS'
    },
    {
      id: 'intervals',
      name: 'Intervals',
      count: 24,
      difficulty: 'Medium',
      x: 6, y: 0,
      connections: [],
      tagline: 'Merge, insert, sweep-line algorithms'
    },
    {
      id: '1d-dp',
      name: '1-D Dynamic Programming',
      count: 61,
      difficulty: 'Medium-Hard',
      x: 7, y: 1,
      connections: ['2d-dp'],
      tagline: 'Optimal substructure, memoization & tabulation'
    },
    {
      id: 'advanced-graphs',
      name: 'Advanced Graphs',
      count: 36,
      difficulty: 'Hard',
      x: 7, y: 2,
      connections: [],
      tagline: "Dijkstra's, Prim's, Bellman-Ford, Network Flow"
    },
    {
      id: '2d-dp',
      name: '2-D Dynamic Programming',
      count: 67,
      difficulty: 'Hard',
      x: 8, y: 1,
      connections: ['bit-manipulation'],
      tagline: 'LCS, Knapsack, Matrix DP, String edits'
    },
    {
      id: 'bit-manipulation',
      name: 'Bit Manipulation',
      count: 33,
      difficulty: 'Medium',
      x: 9, y: 1,
      connections: [],
      tagline: 'Bitwise XOR, shifts, two\'s complement'
    }
  ];

  const branches = [
    {
      id: 'dsa',
      title: 'Advanced DSA',
      tagline: 'NeetCode 150 & 250, Blind 75, 19 Algorithmic Patterns',
      icon: Code2,
      color: 'from-amber-500 to-orange-600',
      levels: [
        { name: 'Arrays, Hashing & Two Pointers', count: 256, category: 'Arrays & Hashing' },
        { name: 'Sliding Window & Stack', count: 89, category: 'Sliding Window' },
        { name: 'Binary Search & Linked Lists', count: 90, category: 'Binary Search' },
        { name: 'Trees, Tries & Heap', count: 164, category: 'Trees' },
        { name: 'Backtracking & Graphs', count: 157, category: 'Graphs' },
        { name: '1D & 2D Dynamic Programming', count: 128, category: '1-D Dynamic Programming' }
      ]
    },
    {
      id: 'sysdes',
      title: 'System Design & Architecture',
      tagline: 'High-Level Design (HLD), Low-Level Design (LLD), Design Patterns',
      icon: Server,
      color: 'from-blue-500 to-cyan-600',
      levels: [
        { name: 'System Design Fundamentals', count: 21, category: 'System Design for Beginners' },
        { name: 'High-Level Design (Twitter, YouTube, Rate Limiter)', count: 10, category: 'System Design Interview' },
        { name: 'Object-Oriented Design (Elevator, Parking Lot, Chess)', count: 7, category: 'Object-Oriented Design Interview' },
        { name: 'Design Patterns (Factory, Observer, Strategy)', count: 11, category: 'Object-Oriented Design Patterns' }
      ]
    },
    {
      id: 'ml',
      title: 'Machine Learning & Deep Learning',
      tagline: 'Optimization, PyTorch, Transformers, LLMs + Research Papers',
      icon: BrainCircuit,
      color: 'from-purple-500 to-pink-600',
      hasPapers: true,
      levels: [
        { name: 'Foundations & Statistics', count: 14, category: 'Foundations', paper: 'Pearson (1901) - PCA' },
        { name: 'Loss, Gradient Descent & Backprop', count: 19, category: 'Loss & Optimization', paper: 'Rumelhart et al. (1986)' },
        { name: 'Neural Networks & PyTorch Tensors', count: 46, category: 'Neural Networks', paper: 'Ioffe & Szegedy (2015)' },
        { name: 'Computer Vision & CNNs', count: 12, category: 'Computer Vision', paper: 'He et al. (2015) - ResNet' },
        { name: 'Attention & Transformers', count: 15, category: 'Attention', paper: 'Vaswani et al. (2017)' },
        { name: 'Generative Models & LLMs', count: 21, category: 'Generative Models', paper: 'Goodfellow (2014) - GANs' }
      ]
    },
    {
      id: 'data',
      title: 'Data Engineering & Scaled Systems',
      tagline: 'Pandas, NumPy, SQL, PySpark, Pipeline Orchestration',
      icon: Database,
      color: 'from-emerald-500 to-teal-600',
      levels: [
        { name: 'NumPy Array Vectorization', count: 37, category: 'NumPy Road' },
        { name: 'Pandas Data Wrangling', count: 48, category: 'Pandas Road' },
        { name: 'SQL Analytics & Window Functions', count: 39, category: 'SQL Road' },
        { name: 'PySpark Distributed Processing', count: 30, category: 'PySpark Road' },
        { name: 'Pipeline Capstones & Architecture', count: 33, category: 'Data Engineering Road' }
      ]
    }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono">
          <Workflow className="w-3.5 h-3.5" />
          <span>Interactive Prerequisite Roadmap</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Visual <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Curriculum Map</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Navigate prerequisites in exact sequence. Click any node to instantly open all challenges and start coding.
        </p>

        {/* View Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveRoadmapTab('dsa_graph')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all ${
              activeRoadmapTab === 'dsa_graph'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>NeetCode DSA Graph</span>
          </button>
          <button
            onClick={() => setActiveRoadmapTab('branches')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all ${
              activeRoadmapTab === 'branches'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All 4 Disciplines Overview</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* NEETCODE INTERACTIVE DSA NODE GRAPH */}
      {/* ============================================================== */}
      {activeRoadmapTab === 'dsa_graph' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <span>NeetCode Prerequisite Dependency Flow</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Master each algorithmic pattern before unlocking downstream dependent topics.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Core Path</span>
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Unlocked</span>
              </span>
            </div>
          </div>

          {/* Grid Flow Graph */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dsaGraphNodes.map((node, idx) => (
              <div
                key={node.id}
                onClick={() => onSelectCategory('dsa', node.name)}
                className="group p-4 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all shadow-md relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-amber-400 transition-colors">
                    LEVEL {idx + 1}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-amber-900/60 font-semibold">
                    {node.difficulty}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors mt-2">
                  {node.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {node.tagline}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-500">
                  <span>{node.count} questions</span>
                  <div className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Solve</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4 DISCIPLINES BRANCHES OVERVIEW */}
      {/* ============================================================== */}
      {activeRoadmapTab === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {branches.map((branch) => {
            const Icon = branch.icon;
            return (
              <div
                key={branch.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${branch.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{branch.title}</h3>
                      <p className="text-xs text-slate-400">{branch.tagline}</p>
                    </div>
                  </div>

                  <div className="space-y-2 my-4">
                    {branch.levels.map((lvl, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectCategory(branch.id, lvl.category)}
                        className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-slate-400 group-hover:text-cyan-400 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                              {lvl.name}
                            </h4>
                            {lvl.paper && (
                              <p className="text-[10px] text-pink-400/90 truncate flex items-center gap-1">
                                <BookOpen className="w-2.5 h-2.5" />
                                <span>{lvl.paper}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {lvl.count} probs
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectCategory(branch.id, null)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-cyan-400 hover:text-cyan-300 border border-slate-700/60 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Explore {branch.title} Challenges</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
