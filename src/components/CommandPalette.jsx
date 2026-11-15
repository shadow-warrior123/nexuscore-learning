import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  Code2,
  BrainCircuit,
  Server,
  Database,
  BookOpen,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const TRACK_BADGES = {
  ml: { label: 'AI & ML', icon: BrainCircuit, color: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
  dsa: { label: 'DSA', icon: Code2, color: 'text-sky-300 bg-sky-500/10 border-sky-500/30' },
  sysdes: { label: 'Systems', icon: Server, color: 'text-purple-300 bg-purple-500/10 border-purple-500/30' },
  data: { label: 'Data', icon: Database, color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
  paper: { label: 'ArXiv PDF', icon: BookOpen, color: 'text-rose-300 bg-rose-500/10 border-rose-500/30' }
};

export default function CommandPalette({
  isOpen,
  onClose,
  allProblems,
  papers,
  solvedProblems,
  onSelectProblem,
  onSelectPaper
}) {
  const [query, setQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('all'); // all | ml | dsa | sysdes | data | paper
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchedPapers = (trackFilter === 'all' || trackFilter === 'paper')
      ? papers
          .filter(p => !q || p.title.toLowerCase().includes(q) || p.authors.toLowerCase().includes(q) || p.topicMatch.some(t => t.toLowerCase().includes(q)))
          .map(p => ({ kind: 'paper', id: `paper-${p.title}`, title: p.title, subtitle: `${p.authors} (${p.year})`, trackType: 'paper', raw: p }))
      : [];

    const matchedProblems = trackFilter === 'paper'
      ? []
      : allProblems
          .filter(p => {
            if (trackFilter !== 'all' && p.trackType !== trackFilter) return false;
            if (!q) return true;
            return (
              p.title.toLowerCase().includes(q) ||
              (p.category || '').toLowerCase().includes(q) ||
              (p.tagline || '').toLowerCase().includes(q)
            );
          })
          .slice(0, 40)
          .map(p => ({
            kind: 'problem',
            id: p.id,
            title: p.title,
            subtitle: `${p.category} · ${p.difficulty || 'Easy'}`,
            trackType: p.trackType,
            raw: p
          }));

    return [...matchedPapers, ...matchedProblems].slice(0, 45);
  }, [query, trackFilter, allProblems, papers]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, trackFilter]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(Math.max(results.length - 1, 0), i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        const item = results[selectedIndex];
        if (item.kind === 'paper') onSelectPaper(item.raw);
        else onSelectProblem(item.raw);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, results, selectedIndex, onClose, onSelectProblem, onSelectPaper]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-xl bg-[#0f0f12] border border-zinc-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 1,547 specs, tensor kernels, distributed systems, & ArXiv papers..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
          />
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Track Filter Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#09090b] border-b border-zinc-800/80 overflow-x-auto text-[11px] font-mono">
          {[
            { id: 'all', label: 'All Tracks' },
            { id: 'ml', label: 'AI & ML' },
            { id: 'dsa', label: 'DSA' },
            { id: 'sysdes', label: 'Systems' },
            { id: 'data', label: 'Data' },
            { id: 'paper', label: 'Papers' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTrackFilter(tab.id)}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                trackFilter === tab.id
                  ? 'bg-zinc-800 text-amber-300 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">
          {results.length === 0 ? (
            <div className="p-10 text-center text-xs font-mono text-zinc-500">
              No matching problems or papers found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((item, idx) => {
              const badge = TRACK_BADGES[item.trackType] || TRACK_BADGES.dsa;
              const Icon = badge.icon;
              const isSolved = item.kind === 'problem' && solvedProblems.has(item.id);
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    if (item.kind === 'paper') onSelectPaper(item.raw);
                    else onSelectProblem(item.raw);
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                    isSelected ? 'bg-zinc-900/90' : 'hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono flex-shrink-0 ${badge.color}`}>
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-100 truncate">
                          {item.title}
                        </span>
                        {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isSelected ? 'text-amber-400' : 'text-zinc-700'}`} />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2 bg-[#09090b] border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span>↑↓ Navigate · ↵ Open · Esc Close</span>
          <span>Showing {results.length} match{results.length === 1 ? '' : 'es'}</span>
        </div>
      </div>
    </div>
  );
}
