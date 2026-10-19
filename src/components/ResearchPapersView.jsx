import React, { useState } from 'react';
import { BookOpen, ExternalLink, Search, Sparkles, FileText, ChevronRight, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/70 border border-pink-800 text-pink-300 text-xs font-mono"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>In-App Research Paper Library</span>
        </motion.div>
        
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Read Papers & Math <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">Directly In-App</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Full ArXiv papers embedded inside the platform with mathematical derivations, architecture summaries, and key takeaways.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search papers (e.g. Attention, Adam, ResNet, GAN, LoRA)..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-lg"
          />
        </div>
      </div>

      {/* Grid of Papers with Framer-Motion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((paper, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-pink-900/60 p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all group backdrop-blur-sm"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-800/80 font-semibold">
                  {paper.year} · ArXiv Landmark
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActivePdfModal({ isOpen: true, paper })}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-950/70 hover:bg-pink-900 text-pink-300 text-xs font-semibold border border-pink-800/60 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-pink-400" />
                    <span>Read PDF In-App</span>
                  </button>
                  <a
                    href={paper.arxiv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="View on ArXiv"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <h3 
                onClick={() => setActivePdfModal({ isOpen: true, paper })}
                className="text-base font-bold text-white group-hover:text-pink-300 transition-colors cursor-pointer"
              >
                {paper.title}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {paper.authors}
              </p>

              {/* Math Formula Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed shadow-inner overflow-x-auto">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                  Core Mathematical Formulation:
                </div>
                {paper.mathFocus}
              </div>

              {/* Key Concept Takeaway */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800/60">
                <strong className="text-pink-300">Takeaway: </strong>
                {paper.takeaway}
              </p>
            </div>

            {/* Related Topics Pills & Bottom Action */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div className="flex flex-wrap gap-1.5">
                {paper.topicMatch.slice(0, 3).map((t, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    #{t}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setActivePdfModal({ isOpen: true, paper })}
                className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
              >
                <span>Open Reader</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Embedded In-App PDF Reader Modal */}
      <InAppPdfViewer
        isOpen={activePdfModal.isOpen}
        paper={activePdfModal.paper}
        onClose={() => setActivePdfModal({ isOpen: false, paper: null })}
      />

    </div>
  );
}
