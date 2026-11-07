import React, { useState } from 'react';
import { BookOpen, ExternalLink, Search, ChevronRight, Eye } from 'lucide-react';
import researchPapers from '../data/research_papers.json';
import InAppPdfViewer from './InAppPdfViewer';

export default function ResearchPapersView({ onSelectPaperTopic }) {
  const [search, setSearch] = useState('');
  const [activePdfModal, setActivePdfModal] = useState({ isOpen: false, paper: null });

  const filtered = researchPapers.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) ||
           p.authors.toLowerCase().includes(q) ||
           p.mathFocus.toLowerCase().includes(q) ||
           p.takeaway.toLowerCase().includes(q) ||
           p.topicMatch.some(t => t.includes(q));
  });

  return (
    <div className="bg-topography-grid min-h-screen">
      <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/90 pb-8">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>CURRICULUM 06 · FOUNDATIONAL ARXIV MONOGRAPHS</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl text-zinc-100 tracking-tight">
              Landmark AI & Deep Learning Papers, Annotated.
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Read primary ArXiv manuscripts directly inside the workspace alongside exact mathematical formulations and architectural takeaways.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter papers (Attention, ResNet, LoRA)..."
              className="w-full bg-[#0f0f12] border border-zinc-800 rounded-md pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>
        </div>

        {/* Grid of Papers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((paper, idx) => (
            <div
              key={idx}
              className="editorial-card rounded-lg p-6 flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    PAPER 0{idx + 1} · {paper.year}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setActivePdfModal({ isOpen: true, paper })}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-[11px] font-mono font-semibold transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Read PDF In-App</span>
                    </button>
                    <a
                      href={paper.arxiv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors"
                      title="Open on ArXiv"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <h3 
                  onClick={() => setActivePdfModal({ isOpen: true, paper })}
                  className="font-serif text-2xl text-zinc-100 group-hover:text-amber-300 transition-colors cursor-pointer leading-snug"
                >
                  {paper.title}
                </h3>
                <p className="text-xs font-mono text-zinc-500">
                  {paper.authors}
                </p>

                {/* Math Formula Card */}
                <div className="p-3.5 rounded-md bg-[#09090b] border border-zinc-800/90 font-mono text-xs text-amber-300 leading-relaxed overflow-x-auto">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    Core Mathematical Formulation:
                  </div>
                  {paper.mathFocus}
                </div>

                {/* Key Concept Takeaway */}
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/50 p-3.5 rounded-md border border-zinc-800/80">
                  <strong className="font-mono text-zinc-100 uppercase text-[10px] mr-1.5">[Architectural Takeaway]</strong>
                  {paper.takeaway}
                </p>
              </div>

              {/* Bottom Action */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                <div className="flex flex-wrap gap-1.5">
                  {paper.topicMatch.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setActivePdfModal({ isOpen: true, paper })}
                  className="text-xs font-mono text-zinc-300 group-hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <span>Inspect Manuscript</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <InAppPdfViewer
          isOpen={activePdfModal.isOpen}
          paper={activePdfModal.paper}
          onClose={() => setActivePdfModal({ isOpen: false, paper: null })}
        />

      </div>
    </div>
  );
}
