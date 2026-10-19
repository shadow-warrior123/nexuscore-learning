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
  Workflow,
  Zap,
  Compass,
  Trophy,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoadmapView({ onSelectCategory, solvedProblems }) {
  const [activeRoadmapTab, setActiveRoadmapTab] = useState('dsa_graph'); // dsa_graph, branches

  // Classic Algorithmic Prerequisite Node Graph Structure
  const dsaGraphNodes = [
    {
      id: 'arrays',
      name: 'Arrays & Hashing',
      count: 208,
      difficulty: 'Easy',
      tier: 'Foundation 01',
      leadsTo: ['Two Pointers', 'Stack'],
      tagline: 'Hash maps, frequency counters, prefix sums'
    },
    {
      id: 'two-pointers',
      name: 'Two Pointers',
      count: 48,
      difficulty: 'Medium',
      tier: 'Intermediate 02',
      leadsTo: ['Sliding Window', 'Binary Search', 'Linked List'],
      tagline: 'Left/right indices, converging pointers'
    },
    {
      id: 'stack',
      name: 'Stack',
      count: 42,
      difficulty: 'Medium',
      tier: 'Intermediate 02',
      leadsTo: [],
      tagline: 'Monotonic stacks, parentheses matching'
    },
    {
      id: 'binary-search',
      name: 'Binary Search',
      count: 49,
      difficulty: 'Medium',
      tier: 'Intermediate 03',
      leadsTo: ['Trees'],
      tagline: 'Logarithmic search space pruning'
    },
    {
      id: 'sliding-window',
      name: 'Sliding Window',
      count: 47,
      difficulty: 'Medium',
      tier: 'Intermediate 03',
      leadsTo: [],
      tagline: 'Variable-length & fixed-length sub-arrays'
    },
    {
      id: 'linked-list',
      name: 'Linked List',
      count: 41,
      difficulty: 'Medium',
      tier: 'Intermediate 03',
      leadsTo: ['Trees'],
      tagline: 'Fast/slow pointers, list reversal'
    },
    {
      id: 'trees',
      name: 'Trees',
      count: 112,
      difficulty: 'Medium',
      tier: 'Core Structure 04',
      leadsTo: ['Tries', 'Heap', 'Backtracking'],
      tagline: 'DFS/BFS, traversals, LCA, BST properties'
    },
    {
      id: 'tries',
      name: 'Tries',
      count: 16,
      difficulty: 'Medium',
      tier: 'Advanced 05',
      leadsTo: [],
      tagline: 'Prefix trees, auto-complete'
    },
    {
      id: 'heap',
      name: 'Heap / Priority Queue',
      count: 36,
      difficulty: 'Medium',
      tier: 'Advanced 05',
      leadsTo: ['Intervals'],
      tagline: 'Top-K elements, streaming medians'
    },
    {
      id: 'backtracking',
      name: 'Backtracking',
      count: 45,
      difficulty: 'Medium',
      tier: 'Advanced 05',
      leadsTo: ['Graphs', '1-D DP'],
      tagline: 'Combinations, permutations, pruning search trees'
    },
    {
      id: 'graphs',
      name: 'Graphs',
      count: 138,
      difficulty: 'Medium',
      tier: 'Complex Systems 06',
      leadsTo: ['Advanced Graphs'],
      tagline: 'Adjacency lists, topological sort, flood fill'
    },
    {
      id: '1-d-dp',
      name: '1-D Dynamic Programming',
      count: 61,
      difficulty: 'Medium',
      tier: 'Complex Systems 06',
      leadsTo: ['2-D DP'],
      tagline: 'Optimal substructure, memoization, tabulation'
    },
    {
      id: 'intervals',
      name: 'Intervals',
      count: 22,
      difficulty: 'Medium',
      tier: 'Applied 07',
      leadsTo: [],
      tagline: 'Merging, inserting, and scheduling ranges'
    },
    {
      id: 'greedy',
      name: 'Greedy',
      count: 43,
      difficulty: 'Medium',
      tier: 'Applied 07',
      leadsTo: [],
      tagline: 'Local optimal choices yielding global optimum'
    },
    {
      id: 'advanced-graphs',
      name: 'Advanced Graphs',
      count: 36,
      difficulty: 'Hard',
      tier: 'Mastery 08',
      leadsTo: [],
      tagline: "Dijkstra's, Bellman-Ford, Kruskal's MST, Network Flow"
    },
    {
      id: '2-d-dp',
      name: '2-D Dynamic Programming',
      count: 67,
      difficulty: 'Hard',
      tier: 'Mastery 08',
      leadsTo: [],
      tagline: 'Knapsack, edit distance, grid paths, game DP'
    },
    {
      id: 'bit-manipulation',
      name: 'Bit Manipulation',
      count: 33,
      difficulty: 'Medium',
      tier: 'Low-Level 09',
      leadsTo: [],
      tagline: 'Bitmasks, XOR tricks, binary representations'
    },
    {
      id: 'math-geometry',
      name: 'Math & Geometry',
      count: 31,
      difficulty: 'Medium',
      tier: 'Low-Level 09',
      leadsTo: [],
      tagline: 'GCD, primes, matrix rotation, spiral grids'
    }
  ];

  // 4 Disciplines Roadmap Branches
  const branches = [
    {
      id: 'dsa',
      title: 'Advanced Data Structures & Algorithms (1,126)',
      tagline: 'Foundations → Two Pointers → Trees → Graphs → 2-D DP',
      icon: Code2,
      color: 'from-amber-500 to-orange-600',
      badge: '1,126 Problems',
      levels: [
        { name: 'Foundations: Arrays, Hashing & Pointers', count: 256, category: 'Arrays & Hashing' },
        { name: 'Core Structures: Trees & Linked Lists', count: 153, category: 'Trees' },
        { name: 'Search & Recursion: Backtracking & Tries', count: 61, category: 'Backtracking' },
        { name: 'Complex Networks: BFS/DFS & Graph Algorithms', count: 174, category: 'Graphs' },
        { name: 'Optimal State: 1-D & 2-D Dynamic Programming', count: 128, category: '1-D Dynamic Programming' }
      ]
    },
    {
      id: 'sysdes',
      title: 'System Design (HLD & LLD)',
      tagline: 'Scalability, Caching, Sharding, Microservices, Design Patterns',
      icon: Server,
      color: 'from-blue-500 to-indigo-600',
      badge: '49 Architectures',
      levels: [
        { name: 'System Design for Beginners', count: 21, category: 'System Design for Beginners' },
        { name: 'Object-Oriented Design Interview', count: 7, category: 'Object-Oriented Design Interview' },
        { name: 'Object-Oriented Design Patterns', count: 11, category: 'Object-Oriented Design Patterns' },
        { name: 'High-Level Distributed System Design', count: 10, category: 'System Design Interview' }
      ]
    },
    {
      id: 'ml',
      title: 'Machine Learning & Deep Learning',
      tagline: 'Optimization, PyTorch, Transformers, LLMs + Research Papers',
      icon: BrainCircuit,
      color: 'from-purple-500 to-pink-600',
      badge: '119 + Papers',
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
      badge: '253 Problems',
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono shadow-lg shadow-cyan-950/40">
          <Workflow className="w-4 h-4 text-cyan-400" />
          <span>Interactive Prerequisite Roadmap</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Visual <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Curriculum Map</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
          Navigate prerequisites in exact pedagogical sequence. Click any node to instantly open all corresponding challenges and start coding.
        </p>

        {/* View Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium shadow-inner">
          <button
            onClick={() => setActiveRoadmapTab('dsa_graph')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeRoadmapTab === 'dsa_graph'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Algorithm Skill Tree</span>
          </button>
          <button
            onClick={() => setActiveRoadmapTab('branches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeRoadmapTab === 'branches'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All 4 Disciplines Overview</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* INTERACTIVE DSA NODE GRAPH */}
      {/* ============================================================== */}
      {activeRoadmapTab === 'dsa_graph' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <span>DSA Skill Tree & Prerequisite Flow</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Master each algorithmic pattern before unlocking downstream dependent topics.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Core Path</span>
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Unlocked</span>
              </span>
            </div>
          </div>

          {/* Grid Flow Graph */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {dsaGraphNodes.map((node, idx) => (
              <motion.div
                key={node.id}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => onSelectCategory('dsa', node.name)}
                className="group p-5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all shadow-lg relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
                    {node.tier}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    node.difficulty === 'Easy' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' :
                    node.difficulty === 'Medium' ? 'bg-amber-950/80 text-amber-400 border-amber-800' :
                    'bg-rose-950/80 text-rose-400 border-rose-800'
                  }`}>
                    {node.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mt-3">
                  {node.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {node.tagline}
                </p>

                {node.leadsTo && node.leadsTo.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-900 flex items-center gap-1.5 text-[10px] font-mono text-slate-500 truncate">
                    <ArrowRight className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                    <span className="text-slate-400 truncate">Unlocks: {node.leadsTo.join(', ')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-900 text-xs font-mono text-slate-400">
                  <span>{node.count} questions</span>
                  <div className="flex items-center gap-1 text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Solve</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
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
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${branch.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">{branch.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{branch.tagline}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                      {branch.badge}
                    </span>
                  </div>

                  <div className="space-y-2.5 my-4">
                    {branch.levels.map((lvl, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ x: 4 }}
                        onClick={() => onSelectCategory(branch.id, lvl.category)}
                        className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-400 group-hover:text-cyan-400 border border-slate-700/80 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                              {lvl.name}
                            </h4>
                            {lvl.paper && (
                              <p className="text-[11px] text-pink-400/90 truncate flex items-center gap-1 mt-0.5">
                                <BookOpen className="w-3 h-3 flex-shrink-0" />
                                <span>{lvl.paper}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-200">
                            {lvl.count} questions
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectCategory(branch.id, '')}
                  className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700 text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Explore Full {branch.title.split(' ')[0]} Track</span>
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
