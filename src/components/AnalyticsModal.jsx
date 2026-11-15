import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Trophy,
  Download,
  Upload,
  Trash2,
  Database,
  CheckCircle2,
  Server
} from 'lucide-react';
import { getBackendStats, checkBackendHealth } from '../utils/api';
import { exportProgressData, importProgressData, resetAllProgress } from '../utils/storage';

export default function AnalyticsModal({
  isOpen,
  onClose,
  catalog,
  solvedProblems,
  totalXp,
  onProgressChanged
}) {
  const [backendStatus, setBackendStatus] = useState({ isOnline: false });
  const [stats, setStats] = useState(null);
  const [importMessage, setImportMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    checkBackendHealth().then((h) => {
      if (!active) return;
      setBackendStatus(h);
      if (h.isOnline) {
        getBackendStats().then((s) => {
          if (active && s?.success) setStats(s);
        });
      }
    });
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const trackBreakdown = [
    { id: 'ml', label: 'AI & ML Engineering', items: catalog.byTrack.ml, color: 'bg-amber-400' },
    { id: 'dsa', label: 'Algorithms & Primitives', items: catalog.byTrack.dsa, color: 'bg-sky-400' },
    { id: 'sysdes', label: 'Distributed Systems', items: catalog.byTrack.sysdes, color: 'bg-purple-400' },
    { id: 'data', label: 'Data & Vector Pipelines', items: catalog.byTrack.data, color: 'bg-emerald-400' }
  ].map((t) => {
    const total = t.items.length;
    const solved = t.items.filter((p) => solvedProblems.has(p.id)).length;
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { ...t, total, solved, pct };
  });

  const handleExport = () => {
    const data = exportProgressData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexuscore-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      importProgressData(parsed);
      onProgressChanged();
      setImportMessage({ ok: true, text: 'Progress restored successfully.' });
    } catch (err) {
      setImportMessage({ ok: false, text: err.message || 'Invalid backup JSON.' });
    }
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Reset all local solved problems, XP, bookmarks, and code drafts?')) {
      resetAllProgress();
      onProgressChanged();
      setImportMessage({ ok: true, text: 'Local progress cleared.' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-xl bg-[#0f0f12] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-100 font-semibold">
              Telemetry, Mastery & Progress Backup
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3.5 rounded-lg bg-[#09090b] border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Total XP</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{totalXp}</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#09090b] border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Verified Labs</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {solvedProblems.size} <span className="text-xs text-zinc-500 font-normal">/ {catalog.counts.total}</span>
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#09090b] border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">SQLite Sync</div>
              <div className="text-xs font-semibold mt-2 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${backendStatus.isOnline ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                <span className={backendStatus.isOnline ? 'text-emerald-300' : 'text-zinc-400'}>
                  {backendStatus.isOnline ? 'Connected (:3001)' : 'Browser Local'}
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#09090b] border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Acceptance Rate</div>
              <div className="text-xl font-bold text-zinc-100 mt-1">
                {stats ? `${stats.acceptanceRate}%` : '—'}
              </div>
            </div>
          </div>

          {/* Per-Track Mastery */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
              Curriculum Breakdown
            </h3>
            <div className="space-y-2.5">
              {trackBreakdown.map((t) => (
                <div key={t.id} className="p-3.5 rounded-lg bg-[#09090b] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-200 font-medium">{t.label}</span>
                    <span className="text-zinc-400">
                      <strong className="text-zinc-100">{t.solved}</strong> / {t.total} ({t.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className={`h-full ${t.color} transition-all duration-300`} style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Backend Submissions (if SQLite server online) */}
          {stats && stats.recentSubmissions && stats.recentSubmissions.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-amber-400" />
                <span>Recent SQLite Submissions ({stats.totalSubmissions} total)</span>
              </h3>
              <div className="divide-y divide-zinc-800/70 rounded-lg border border-zinc-800 bg-[#09090b]">
                {stats.recentSubmissions.slice(0, 5).map((s) => (
                  <div key={s.id} className="px-3.5 py-2.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-200 truncate pr-3">{s.problem_title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-zinc-500">{s.execution_time_ms}ms</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        s.status === 'accepted'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backup / Restore Actions */}
          <div className="p-4 rounded-lg bg-[#09090b] border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Portable Progress Backup</span>
              </span>
              {importMessage && (
                <span className={`text-[11px] font-mono flex items-center gap-1 ${importMessage.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{importMessage.text}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-mono text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                className="hidden"
              />

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/50 font-mono text-xs transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Local Progress</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
