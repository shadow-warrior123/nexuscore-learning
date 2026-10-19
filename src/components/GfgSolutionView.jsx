import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Cpu, 
  Copy, 
  Check, 
  Code2, 
  Layers, 
  CheckCircle2, 
  Lightbulb, 
  TrendingUp,
  AlertTriangle,
  Table,
  Target,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';

import { generateNeetCodeSolution } from '../utils/solutionGenerator';

export default function GfgSolutionView({ problem }) {
  const [activeApproach, setActiveApproach] = useState(2); // Default to Optimal (Approach 3)
  const [selectedLang, setSelectedLang] = useState('python');
  const [copied, setCopied] = useState(false);

  // Generate deep multi-approach architectural breakdown
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
    <div className="space-y-8 pb-10">
      
      {/* 1. INSPIRATION & MENTAL MODEL */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/40 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Inspiration & Mental Model</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
            Architectural Solution Standard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-mono text-rose-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              The Core Dilemma
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {inspiration.coreDilemma}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              The Mental Shift & Invariant
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {inspiration.mentalModel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/50 text-xs text-indigo-200">
          <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="leading-relaxed font-sans">{inspiration.patternInsight}</span>
        </div>
      </div>

      {/* 2. PROGRESSIVE 3-TIER APPROACH SELECTOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider">
              Progressive Approaches (Brute → Better → Optimal)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {approaches.length} Distinct Paradigms
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {approaches.map((app, idx) => {
            const isSelected = activeApproach === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveApproach(idx)}
                className={`relative text-left p-4 rounded-xl transition-all border overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-950/50 ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:bg-slate-900/70'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500"></div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${app.badgeColor}`}>
                    {app.tier}
                  </span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {app.name.split(':')[1] || app.name}
                </h4>
                <div className="mt-2.5 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="text-amber-400/90">⏱ {app.timeComplexity}</span>
                  <span>•</span>
                  <span className="text-purple-400/90">💾 {app.spaceComplexity}</span>
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 pt-1"
          >
            {/* Intuition & Rationale */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <span>Intuition & Mechanism</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {current.intuition}
              </p>
            </div>

            {/* Step-by-Step Algorithm (GFG hallmark) */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Step-by-Step Algorithm</span>
              </h4>
              <div className="space-y-2">
                {current.algorithm.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-3 text-xs text-slate-300 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span className="leading-relaxed font-sans">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity Analysis Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Time Complexity</span>
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                    {current.timeComplexity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed font-sans">{current.timeRationale}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    <span>Space Complexity</span>
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                    {current.spaceComplexity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed font-sans">{current.spaceRationale}</p>
              </div>
            </div>

            {/* Multi-Language Code Implementation Tabs (Python, C++, Java, JS) */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-[#060910]">
              
              {/* Code Tabs Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-1.5">
                  {[
                    { id: 'python', label: 'Python 3' },
                    { id: 'cpp', label: 'C++' },
                    { id: 'java', label: 'Java' },
                    { id: 'javascript', label: 'JavaScript' }
                  ].map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLang(lang.id)}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-medium transition-all ${
                        selectedLang === lang.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700/60"
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Implementation'}</span>
                </button>
              </div>

              {/* Code Body with Prism Syntax Highlighting */}
              <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed bg-[#05080e] selection:bg-cyan-500/20">
                <code dangerouslySetInnerHTML={{ __html: getHighlightedCode(activeCodeSnippet, selectedLang) }} />
              </pre>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* 4. EXECUTION DRY RUN TRACE WALKTHROUGH */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-1.5">
          <Table className="w-3.5 h-3.5 text-cyan-400" />
          <span>Execution Dry Run Walkthrough</span>
        </h4>
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3 w-16">Step</th>
                <th className="p-3">Action Executed</th>
                <th className="p-3">Memory / Pointer State</th>
                <th className="p-3">Pedagogical Invariant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {dryRunTrace.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-cyan-400">{row.step}</td>
                  <td className="p-3 font-medium text-white">{row.action}</td>
                  <td className="p-3 font-mono text-[11px] text-emerald-300 bg-slate-950/50">{row.state}</td>
                  <td className="p-3 text-slate-400 leading-snug">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. COMMON PITFALLS & INTERVIEW TRAPS */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Common Edge Cases & Interview Traps</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pitfalls.map((pitfall, pIdx) => (
            <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-300 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <span className="text-amber-400 font-mono text-sm leading-none">•</span>
              <span className="leading-relaxed font-sans">{pitfall}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
