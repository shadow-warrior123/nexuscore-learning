import React, { useState } from 'react';
import { 
  Clock, 
  Cpu, 
  Copy, 
  Layers, 
  Lightbulb, 
  TrendingUp,
  AlertTriangle,
  Table,
  Compass,
  CheckCheck,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';

import { generateNeetCodeSolution } from '../utils/solutionGenerator';

export default function GfgSolutionView({ problem, onLoadSolution }) {
  const [activeApproach, setActiveApproach] = useState(2); // Default to Optimal (Approach 3)
  const [selectedLang, setSelectedLang] = useState('python');
  const [copied, setCopied] = useState(false);
  const [loadedToEditor, setLoadedToEditor] = useState(false);

  const solutionData = generateNeetCodeSolution(problem);
  const { inspiration, approaches, dryRunTrace, pitfalls } = solutionData;

  const current = approaches[activeApproach] || approaches[approaches.length - 1];
  const activeCodeSnippet = current?.code?.[selectedLang] || current?.code?.python || '';

  const getHighlightedCode = (code, lang) => {
    try {
      const prismLang = lang === 'cpp' ? 'cpp' : lang === 'java' ? 'java' : lang === 'sql' ? 'sql' : lang === 'javascript' ? 'javascript' : 'python';
      const grammar = Prism.languages[prismLang] || Prism.languages.python;
      return Prism.highlight(code, grammar, prismLang);
    } catch (e) {
      return code;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-7 pb-10">
      
      {/* 1. INSPIRATION & MENTAL MODEL */}
      <div className="p-5 rounded-lg bg-[#0f0f12] border border-zinc-800/90 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2 text-amber-400 text-[11px] font-mono uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" />
            <span>First-Principles Mental Model</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
            3-Tier Complexity Progression
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-md bg-[#09090b] border border-zinc-800/90 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              The Naive Bottleneck
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {inspiration.coreDilemma}
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-[#09090b] border border-zinc-800/90 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              The Invariant Shift
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {inspiration.mentalModel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-md bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{inspiration.patternInsight}</span>
        </div>
      </div>

      {/* 2. PROGRESSIVE 3-TIER APPROACH SELECTOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-[11px] font-mono uppercase text-zinc-400 tracking-widest">
              Select Paradigm (01 Brute → 02 Intermediate → 03 Optimal)
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {approaches.map((app, idx) => {
            const isSelected = activeApproach === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveApproach(idx)}
                className={`relative text-left p-3.5 rounded-lg transition-all border ${
                  isSelected
                    ? 'bg-[#0f0f12] border-amber-400/80'
                    : 'bg-[#09090b] border-zinc-800/90 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${app.badgeColor}`}>
                    0{idx + 1} / {app.tier}
                  </span>
                </div>
                <h4 className={`text-xs font-semibold ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                  {app.name.split(':')[1] || app.name}
                </h4>
                <div className="mt-2.5 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                  <span className="text-amber-300">T: {app.timeComplexity}</span>
                  <span>·</span>
                  <span className="text-zinc-300">S: {app.spaceComplexity}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE APPROACH DETAILS */}
      {current && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeApproach}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
          >
            {/* Intuition & Mechanism */}
            <div className="p-4 rounded-lg bg-[#0f0f12] border border-zinc-800/90 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                Mathematical & Algorithmic Intuition
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {current.intuition}
              </p>
            </div>

            {/* Step-by-Step Execution Protocol */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono uppercase text-zinc-400 tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Execution Protocol</span>
              </h4>
              <div className="space-y-1.5">
                {current.algorithm.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-3 text-xs text-zinc-300 p-3 rounded-md bg-[#0f0f12] border border-zinc-800/90">
                    <span className="text-[10px] font-mono text-amber-400 font-semibold mt-0.5">
                      0{sIdx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity Proofs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-[#0f0f12] border border-zinc-800/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Time Bound</span>
                  </span>
                  <span className="text-xs font-mono font-semibold text-amber-300">
                    {current.timeComplexity}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 pt-1 leading-relaxed">{current.timeRationale}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0f0f12] border border-zinc-800/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Memory Bound</span>
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-300">
                    {current.spaceComplexity}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 pt-1 leading-relaxed">{current.spaceRationale}</p>
              </div>
            </div>

            {/* Multi-Language Reference Implementation */}
            <div className="rounded-lg border border-zinc-800/90 overflow-hidden bg-[#09090b]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f12] border-b border-zinc-800/90 text-xs font-mono">
                <div className="flex items-center space-x-1">
                  {[
                    { id: 'python', label: 'Python 3' },
                    { id: 'cpp', label: 'C++ 20' },
                    { id: 'java', label: 'Java 21' },
                    { id: 'javascript', label: 'JavaScript' }
                  ].map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLang(lang.id)}
                      className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                        selectedLang === lang.id
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {onLoadSolution && (
                    <button
                      onClick={() => {
                        onLoadSolution(activeCodeSnippet, selectedLang);
                        setLoadedToEditor(true);
                        setTimeout(() => setLoadedToEditor(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] border border-emerald-500/40 transition-colors font-semibold"
                    >
                      {loadedToEditor ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />}
                      <span>{loadedToEditor ? 'Loaded into Editor' : 'Load into Editor'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] border border-zinc-800 transition-colors"
                  >
                    {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed bg-[#09090b]">
                <code dangerouslySetInnerHTML={{ __html: getHighlightedCode(activeCodeSnippet, selectedLang) }} />
              </pre>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* 4. EXECUTION DRY RUN TRACE */}
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-mono uppercase text-zinc-400 tracking-widest flex items-center gap-1.5">
          <Table className="w-3.5 h-3.5 text-amber-400" />
          <span>Deterministic State Trace</span>
        </h4>
        <div className="overflow-x-auto rounded-lg border border-zinc-800/90 bg-[#0f0f12]">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#09090b] text-zinc-500 font-mono text-[10px] uppercase border-b border-zinc-800">
              <tr>
                <th className="p-3 w-14">Step</th>
                <th className="p-3">Operation</th>
                <th className="p-3">Register / State</th>
                <th className="p-3">Invariant Guarantee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {dryRunTrace.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-3 font-mono text-amber-400">0{row.step}</td>
                  <td className="p-3 font-medium text-zinc-100">{row.action}</td>
                  <td className="p-3 font-mono text-[11px] text-emerald-400">{row.state}</td>
                  <td className="p-3 text-zinc-400">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. FAILURE MODES & EDGE CASES */}
      <div className="p-4 rounded-lg bg-[#0f0f12] border border-zinc-800/90 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 text-[11px] font-mono uppercase tracking-widest">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Production Failure Modes & Boundary Traps</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {pitfalls.map((pitfall, pIdx) => (
            <div key={pIdx} className="flex items-start gap-2 text-xs text-zinc-300 p-3 rounded bg-[#09090b] border border-zinc-800/80">
              <span className="text-amber-400 font-mono text-xs">0{pIdx + 1}</span>
              <span className="leading-relaxed">{pitfall}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
