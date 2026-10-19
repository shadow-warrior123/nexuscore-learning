import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Code2, 
  Server, 
  BrainCircuit, 
  Database, 
  BookOpen, 
  Terminal, 
  Trophy, 
  HelpCircle,
  Search,
  Sparkles,
  Command,
  Flame,
  Activity
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

  const navItems = [
    { id: 'roadmap', label: 'Roadmap Graph', icon: Compass },
    { id: 'dsa', label: 'Algorithms & DSA', icon: Code2, count: 1126 },
    { id: 'sysdes', label: 'System Design', icon: Server, count: 35 },
    { id: 'ml', label: 'Machine Learning', icon: BrainCircuit, count: 119 },
    { id: 'data', label: 'Data Engineering', icon: Database, count: 253 },
    { id: 'papers', label: 'Research Papers', icon: BookOpen, badge: 'In-App PDF' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tier */}
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Identity */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveTab('roadmap')}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#070b14] rounded-full"></span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  NexusCore
                </span>
                <span className="text-[9px] uppercase tracking-widest font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-none hidden sm:block font-mono">
                DSA · Systems · ML Papers · Data
              </p>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="hidden md:flex items-center relative max-w-sm w-full mx-6">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 1,500+ problems, algorithms, papers..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-12 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
            />
            <span className="absolute right-3 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 pointer-events-none">
              ⌘K
            </span>
          </div>

          {/* Right Metrics & Badges */}
          <div className="flex items-center gap-3">
            {/* Total XP & Solved */}
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs shadow-inner">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                <Trophy className="w-4 h-4" />
                <span>{totalXp} XP</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="font-mono text-slate-300">
                <span className="text-emerald-400 font-bold">{solvedCount}</span>
                <span className="text-slate-500 text-[11px]"> / {totalCount}</span>
              </div>
            </div>

            <a
              href="https://github.com/shadow-warrior123/nexuscore-learning"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all"
              title="View on GitHub"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* Bottom Navigation with Framer-Motion Active Spring Tab */}
        <nav className="flex space-x-1.5 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 rounded-xl shadow-lg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="relative z-10">{item.label}</span>
                
                {item.count && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full relative z-10 ${
                    isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                )}

                {item.badge && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-pink-950 text-pink-300 border border-pink-800 relative z-10 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
