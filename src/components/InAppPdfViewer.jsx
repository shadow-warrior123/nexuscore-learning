import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Download, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Cpu, 
  Layers, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InAppPdfViewer({ isOpen, onClose, paper }) {
  if (!isOpen || !paper) return null;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);

  // Use local backend PDF proxy or direct URL fallback
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const backendBase = typeof window !== 'undefined' && window.location.port === '3001' ? '' : `http://${host}:3001`;
  const pdfUrl = `${backendBase}/api/pdf-proxy?url=${encodeURIComponent(paper.pdf || paper.arxiv)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
          className={`relative bg-[#090d16] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'w-full h-full rounded-none border-none' : 'w-full max-w-6xl h-[92vh]'
          }`}
        >
          {/* Top PDF Reader Control Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0c1220] border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate max-w-md sm:max-w-xl">
                  {paper.title}
                </h3>
                <p className="text-[11px] text-pink-300/80 truncate">
                  {paper.authors} ({paper.year}) · ArXiv Document
                </p>
              </div>
            </div>

            {/* Toolbar Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  showNotes 
                    ? 'bg-pink-950/80 text-pink-300 border-pink-800' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{showNotes ? 'Hide Math Notes' : 'Show Math Notes'}</span>
              </button>

              <a
                href={paper.pdf}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </a>

              <a
                href={paper.arxiv}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Open ArXiv Abstract"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors ml-1"
                title="Close Viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Viewer Body (Split Pane: PDF on Left, Math Notes on Right) */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Embedded Native PDF Viewer inside Iframe */}
            <div className="flex-1 bg-slate-950 relative">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={paper.title}
              />
            </div>

            {/* Collapsible Math & Research Sidebar */}
            {showNotes && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden md:flex flex-col w-[340px] bg-[#0b0f19] border-l border-slate-800 p-5 overflow-y-auto space-y-5 text-xs text-slate-300"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400 font-bold px-2 py-0.5 rounded bg-pink-950/80 border border-pink-900/60">
                    Math Formulation
                  </span>
                  <h4 className="text-sm font-bold text-white pt-1">Key Equations & Derivations</h4>
                </div>

                {/* Math Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 leading-relaxed overflow-x-auto shadow-inner">
                  {paper.mathFocus}
                </div>

                {/* Conceptual Takeaway */}
                <div className="space-y-1.5">
                  <h5 className="font-mono uppercase text-slate-400 text-[10px] font-bold">
                    Architectural Impact
                  </h5>
                  <p className="leading-relaxed text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                    {paper.takeaway}
                  </p>
                </div>

                {/* Topics Covered */}
                <div className="space-y-1.5">
                  <h5 className="font-mono uppercase text-slate-400 text-[10px] font-bold">
                    Keywords & Topics
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {paper.topicMatch.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <p className="text-[11px] text-slate-400 italic">
                    Tip: Scroll or zoom inside the PDF reader on the left. All papers are rendered in full resolution.
                  </p>
                </div>
              </motion.div>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
