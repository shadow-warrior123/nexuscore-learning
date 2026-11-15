import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  BookOpen,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkBackendHealth, BACKEND_URL } from '../utils/api';

export default function InAppPdfViewer({ isOpen, onClose, paper }) {
  // Always declare hooks unconditionally before any early return (Rules of Hooks)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [viewerMode, setViewerMode] = useState('auto'); // 'auto' | 'proxy' | 'google' | 'direct'
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    if (!isOpen || !paper) return;
    let active = true;
    checkBackendHealth().then((health) => {
      if (active) {
        setBackendOnline(Boolean(health?.isOnline));
      }
    });
    return () => {
      active = false;
    };
  }, [isOpen, paper]);

  if (!isOpen || !paper) return null;

  const rawPdfUrl = paper.pdf || paper.arxiv;
  const proxyUrl = `${BACKEND_URL}/api/pdf-proxy?url=${encodeURIComponent(rawPdfUrl)}`;
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawPdfUrl)}&embedded=true`;

  const resolvedMode = viewerMode === 'auto'
    ? (backendOnline ? 'proxy' : 'google')
    : viewerMode;

  const iframeSrc =
    resolvedMode === 'proxy'
      ? `${proxyUrl}#toolbar=1&navpanes=0`
      : resolvedMode === 'google'
        ? googleViewerUrl
        : `${rawPdfUrl}#toolbar=1&navpanes=0`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
          className={`relative bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'w-full h-full rounded-none border-none' : 'w-full max-w-6xl h-[92vh]'
          }`}
        >
          {/* Top PDF Reader Control Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f12] border-b border-zinc-800 flex-shrink-0 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-zinc-100 truncate max-w-md sm:max-w-xl">
                  {paper.title}
                </h3>
                <p className="text-[11px] text-zinc-400 truncate font-mono">
                  {paper.authors} ({paper.year}) · {resolvedMode === 'proxy' ? 'Local Proxy' : resolvedMode === 'google' ? 'Cloud PDF Viewer' : 'Direct Source'}
                </p>
              </div>
            </div>

            {/* Toolbar Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden lg:flex items-center bg-[#09090b] p-0.5 rounded-lg border border-zinc-800 text-[10px] font-mono">
                {[
                  { id: 'auto', label: 'Auto' },
                  ...(backendOnline ? [{ id: 'proxy', label: 'Proxy' }] : []),
                  { id: 'google', label: 'Embedded' },
                  { id: 'direct', label: 'Direct' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setViewerMode(m.id)}
                    className={`px-2 py-1 rounded transition-colors ${
                      viewerMode === m.id
                        ? 'bg-zinc-800 text-zinc-100 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                  showNotes
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-100'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{showNotes ? 'Hide Notes' : 'Show Notes'}</span>
              </button>

              <a
                href={paper.pdf || paper.arxiv}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </a>

              <a
                href={paper.arxiv}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                title="Open ArXiv Abstract"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition-colors ml-1"
                title="Close Viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Viewer Body (Split Pane: PDF on Left, Math Notes on Right) */}
          <div className="flex-1 flex overflow-hidden">

            {/* Embedded PDF Viewer inside Iframe */}
            <div className="flex-1 bg-zinc-950 relative">
              <iframe
                key={iframeSrc}
                src={iframeSrc}
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
                className="hidden md:flex flex-col w-[340px] bg-[#0f0f12] border-l border-zinc-800 p-5 overflow-y-auto space-y-5 text-xs text-zinc-300"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    Math Formulation
                  </span>
                  <h4 className="text-sm font-bold text-zinc-100 pt-1">Key Equations & Derivations</h4>
                </div>

                {/* Math Card */}
                <div className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 font-mono text-[11px] text-amber-300 leading-relaxed overflow-x-auto shadow-inner">
                  {paper.mathFocus}
                </div>

                {/* Conceptual Takeaway */}
                <div className="space-y-1.5">
                  <h5 className="font-mono uppercase text-zinc-400 text-[10px] font-bold">
                    Architectural Impact
                  </h5>
                  <p className="leading-relaxed text-zinc-300 bg-[#09090b] p-3 rounded-xl border border-zinc-800/80">
                    {paper.takeaway}
                  </p>
                </div>

                {/* Topics Covered */}
                <div className="space-y-1.5">
                  <h5 className="font-mono uppercase text-zinc-400 text-[10px] font-bold">
                    Keywords & Topics
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {(paper.topicMatch || []).map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80">
                  <p className="text-[11px] text-zinc-400 italic">
                    Tip: If a host blocks embedding, switch between Embedded / Direct mode above or open the ArXiv link directly.
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
