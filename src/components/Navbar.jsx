import React, { useRef, useEffect } from 'react';
import {
  Compass,
  Code2,
  Server,
  BrainCircuit,
  Database,
  BookOpen,
  Terminal,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({
  activeTab,
  setActiveTab,
  solvedCount,
  totalCount,
  totalXp,
  searchQuery,
  setSearchQuery
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'roadmap', index: '01', label: 'Knowledge Topography', icon: Compass },
    { id: 'ml', index: '02', label: 'AI & ML Engineering', icon: BrainCircuit, count: 119 },
    { id: 'dsa', index: '03', label: 'Algorithms & Primitives', icon: Code2, count: 1126 },
    { id: 'sysdes', index: '04', label: 'Distributed Systems', icon: Server, count: 49 },
    { id: 'data', index: '05', label: 'Data & Vector Pipelines', icon: Database, count: 253 },
    { id: 'papers', index: '06', label: 'ArXiv Research Manual', icon: BookOpen, badge: 'PDF' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Editorial Bar */}
        <div className="flex items-center justify-between h-14">

          {/* Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('roadmap')}
          >
            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700/80 flex items-center justify-center group-hover:border-amber-500/60 transition-colors">
              <Terminal className="w-4 h-4 text-amber-400" />
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="font-serif text-xl tracking-normal text-zinc-100">
                NexusCore
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.18em] font-mono text-zinc-500 border-l border-zinc-800 pl-2.5">
                First-Principles AI & Systems Lab
              </span>
            </div>
          </div>

          {/* Center Command Search */}
          <div className="hidden md:flex items-center relative max-w-md w-full mx-6">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter 1,547 labs, tensor kernels, papers, architectures..."
              className="w-full bg-[#0f0f12] border border-zinc-800/90 rounded-md pl-8 pr-12 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
            />
            <kbd className="absolute right-2.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 pointer-events-none">
              ⌘K
            </kbd>
          </div>

          {/* Right Telemetry & Repository Link */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-3 px-3 py-1 rounded-md bg-[#0f0f12] border border-zinc-800/90 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="text-zinc-400">XP</span>
                <span className="text-zinc-100 font-semibold">{totalXp}</span>
              </div>
              <span className="text-zinc-800">|</span>
              <div className="flex items-center gap-1">
                <span className="text-zinc-400">VERIFIED</span>
                <span className="text-emerald-400 font-semibold">{solvedCount}</span>
                <span className="text-zinc-600">/{totalCount}</span>
              </div>
            </div>

            <a
              href="https://github.com/shadow-warrior123/nexuscore-learning"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0f0f12] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 border border-zinc-800/90 text-[11px] font-mono transition-colors"
              title="View Source Repository"
            >
              <span className="hidden sm:inline">GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
            </a>
          </div>
        </div>

        {/* Bottom Indexed Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto scrollbar-none border-t border-zinc-900 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 whitespace-nowrap transition-colors ${isActive
                    ? 'text-zinc-100 font-medium'
                    : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                <span className={`font-mono text-[10px] ${isActive ? 'text-amber-400' : 'text-zinc-600'}`}>
                  {item.index}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`} />
                <span className="tracking-tight">{item.label}</span>

                {item.count && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isActive ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600'
                    }`}>
                    {item.count}
                  </span>
                )}

                {item.badge && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="editorial-nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
