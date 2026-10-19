import React from 'react';
import { Server, Laptop, Cpu, ShieldCheck, Database, Rocket, X, Check, Copy } from 'lucide-react';

export default function BackendGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Backend & Self-Hosting Guide</h2>
              <p className="text-xs text-slate-400">Architecture breakdown for hosting from your own laptop with zero login</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: How It Works Right Now (Zero Backend Needed!) */}
        <div className="space-y-3 p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Right Now: 100% Client-Side WebAssembly (Pyodide)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            You do <strong>not need any backend server running</strong> right now! The code editor uses <strong>Pyodide (WebAssembly Python)</strong>. When a user runs code, their browser executes real Python code inside a secure sandbox on their device.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-emerald-400 font-bold">✓ 0 Server Cost</span>
              <p className="text-slate-400 text-[10px] mt-0.5">Runs on client hardware</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-emerald-400 font-bold">✓ Zero Setup</span>
              <p className="text-slate-400 text-[10px] mt-0.5">No Docker/Database required</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-emerald-400 font-bold">✓ 100% Safe</span>
              <p className="text-slate-400 text-[10px] mt-0.5">Cannot access your laptop files</p>
            </div>
          </div>
        </div>

        {/* Section 2: How to Run on Localhost Right Now */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Laptop className="w-4 h-4 text-indigo-400" />
            <span>Step 1: Running on Your Localhost</span>
          </h3>
          <p className="text-xs text-slate-400">
            In your terminal inside this project folder, simply execute:
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
            <code>npm run dev</code>
          </div>
          <p className="text-xs text-slate-400">
            Open <strong className="text-cyan-300">http://localhost:5173</strong> in Chrome/Edge/Firefox. Anyone on your local Wi-Fi can also view it by using <strong className="text-cyan-300">npm run dev -- --host</strong> and navigating to your local IP address!
          </p>
        </div>

        {/* Section 3: Recommended Backend If You Expand Later */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Step 2: Recommended Architecture If You Add a Backend Later</span>
          </h3>
          
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
              <div className="font-semibold text-white">Backend Framework: FastAPI (Python) or Express.js (Node.js)</div>
              <p className="text-slate-400">FastAPI is ideal because your platform focuses on Machine Learning, Data Science, and Python execution.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
              <div className="font-semibold text-white">Database: SQLite (Local) or Supabase / PostgreSQL (Cloud)</div>
              <p className="text-slate-400">SQLite requires zero configuration and lives as a single local file on your laptop. If you want cross-device syncing later, free Supabase PostgreSQL is standard.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
              <div className="font-semibold text-white">Production Sandboxing (If compiling untrusted C++/Java): Judge0 or Docker</div>
              <p className="text-slate-400">Pyodide handles Python securely in the browser. For multi-language code execution in production, use a Judge0 Docker container or remote Judge0 API.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Free Cloud Hosting Option */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-800/60 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
            <Rocket className="w-4 h-4" />
            <span>Want Free Global Hosting Instead of Keeping Laptop On?</span>
          </div>
          <p className="text-xs text-slate-300">
            Because this platform is completely self-contained, you can push this repo to GitHub and connect it to <strong>Vercel</strong> or <strong>Cloudflare Pages</strong> for <strong>100% free, 24/7 global hosting</strong> with custom domains and HTTPS!
          </p>
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Got it, Let's Code
          </button>
        </div>

      </div>
    </div>
  );
}
