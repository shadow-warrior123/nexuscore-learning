import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Video, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Filter, 
  Star, 
  Terminal,
  Code2,
  Trophy,
  ArrowRight
} from 'lucide-react';
import VideoModal from './VideoModal';

export default function ProblemListView({ 
  trackType, 
  dsaData, 
  journeyData, 
  sysdesData, 
  solvedProblems, 
  onSelectProblem,
  initialCategory,
  searchQuery,
  onToggleSolved
}) {
  const [curatedListFilter, setCuratedListFilter] = useState('neetcode150'); // neetcode150, blind75, neetcode250, all
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [starredProblems, setStarredProblems] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_starred_problems');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Video modal state
  const [videoModal, setVideoModal] = useState({ isOpen: false, videoId: null, title: '' });

  const toggleStar = (problemId, e) => {
    e.stopPropagation();
    const updated = new Set(starredProblems);
    if (updated.has(problemId)) updated.delete(problemId);
    else updated.add(problemId);
    setStarredProblems(updated);
    localStorage.setItem('nexus_starred_problems', JSON.stringify(Array.from(updated)));
  };

  const toggleCategoryCollapse = (catName) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Group problems by Category
  const categorizedProblems = useMemo(() => {
    const map = new Map();

    if (trackType === 'dsa') {
      for (const [category, items] of Object.entries(dsaData.categories || {})) {
        const filteredItems = items.filter(p => {
          // Curated list filter
          if (curatedListFilter === 'blind75' && !p.blind75) return false;
          if (curatedListFilter === 'neetcode150' && !p.neetcode150) return false;
          if (curatedListFilter === 'neetcode250' && !p.neetcode250) return false;

          // Difficulty filter
          if (difficultyFilter !== 'all' && (p.difficulty || '').toLowerCase() !== difficultyFilter) return false;

          // Search query
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(q) || category.toLowerCase().includes(q);
          }
          return true;
        }).map(p => ({
          id: `dsa-${p.githubCodeSlug || p.title}`,
          title: p.title,
          category,
          difficulty: p.difficulty,
          blind75: p.blind75,
          neetcode150: p.neetcode150,
          neetcode250: p.neetcode250,
          neetcodeUrl: p.neetcodeUrl,
          leetcodeUrl: p.leetcodeUrl,
          youtubeVideoId: p.youtubeSolution ? p.youtubeSolution.split('v=')[1] : null,
          trackType: 'dsa',
          starter_code: `# Solution for: ${p.title}\nclass Solution:\n    def solve(self, *args):\n        # Write code here\n        pass\n`,
          description: `### ${p.title}\n\n**Category:** ${category}  \n**Difficulty:** ${p.difficulty}  \n\nClassic algorithmic interview problem. Implement your solution below, test it in the interactive Pyodide terminal, or review the multi-language optimal solutions.`
        }));

        if (filteredItems.length > 0) {
          map.set(category, filteredItems);
        }
      }
      return map;
    }

    if (trackType === 'ml' || trackType === 'data') {
      const allowedTracks = trackType === 'ml' 
        ? ['ml-engineer', 'pytorch', 'tensorflow']
        : ['pandas', 'numpy', 'sql', 'data-engineering', 'pyspark'];

      const targetTracks = journeyData.filter(t => allowedTracks.includes(t.trackSlug));
      for (const track of targetTracks) {
        for (const ch of track.chapters) {
          const catKey = `${track.trackTitle} > ${ch.chapterTitle}`;
          const qList = ch.questions.filter(q => {
            if (difficultyFilter !== 'all' && (q.difficulty || '').toLowerCase() !== difficultyFilter) return false;
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return q.title.toLowerCase().includes(query) || catKey.toLowerCase().includes(query) || (q.tagline || '').toLowerCase().includes(query);
            }
            return true;
          }).map(q => ({
            id: q.id || q.slug,
            slug: q.slug,
            title: q.title,
            category: ch.chapterTitle,
            trackTitle: track.trackTitle,
            difficulty: q.difficulty,
            tagline: q.tagline,
            objective: q.objective,
            description: q.question_description,
            starter_code: q.starter_code,
            hints: q.hints,
            researchPaper: q.researchPaper,
            trackType: trackType,
            xp: q.xp || 10
          }));

          if (qList.length > 0) {
            map.set(catKey, qList);
          }
        }
      }
      return map;
    }

    if (trackType === 'sysdes') {
      for (const course of (sysdesData || [])) {
        for (const sec of course.sections) {
          const catKey = `${course.courseName} > ${sec.name}`;
          const qList = (sec.lessons || []).filter(q => {
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return q.name.toLowerCase().includes(query) || catKey.toLowerCase().includes(query);
            }
            return true;
          }).map(q => ({
            id: `sysdes-${q.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            title: q.name,
            category: sec.name,
            trackTitle: course.courseName,
            difficulty: course.courseName.includes('Beginners') ? 'Core' : 'Architecture',
            durationMinutes: q.length,
            isFree: q.free,
            trackType: 'sysdes',
            description: `### ${q.name}\n\n**Course:** ${course.courseName}  \n**Section:** ${sec.name}  \n\nStudy this system architecture challenge. Break down requirements (functional & non-functional), estimate capacity, choose database models, design API contracts, and draft component diagrams.`
          }));

          if (qList.length > 0) {
            map.set(catKey, qList);
          }
        }
      }
      return map;
    }

    return map;
  }, [trackType, dsaData, journeyData, sysdesData, curatedListFilter, difficultyFilter, searchQuery]);

  // Overall counts
  const totalShown = useMemo(() => {
    let count = 0;
    for (const list of categorizedProblems.values()) count += list.length;
    return count;
  }, [categorizedProblems]);

  const solvedShown = useMemo(() => {
    let count = 0;
    for (const list of categorizedProblems.values()) {
      for (const p of list) {
        if (solvedProblems.has(p.id)) count++;
      }
    }
    return count;
  }, [categorizedProblems, solvedProblems]);

  const difficultyBadge = (diff) => {
    const d = (diff || '').toLowerCase();
    if (d === 'easy') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (d === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (d === 'hard' || d === 'boss') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      
      {/* NeetCode Style Filter Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Code2 className="w-6 h-6 text-cyan-400" />
              <span>
                {trackType === 'dsa' && 'Data Structures & Algorithms'}
                {trackType === 'ml' && 'Machine Learning & Deep Learning'}
                {trackType === 'data' && 'Data Engineering & Analytics'}
                {trackType === 'sysdes' && 'System Design & Architecture'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured question sets with in-browser terminal execution and GeeksforGeeks multi-approach solutions.
            </p>
          </div>

          {/* Quick Progress Ring */}
          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs flex-shrink-0">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-mono text-slate-200">
                <span className="font-bold text-emerald-400">{solvedShown}</span>
                <span className="text-slate-500"> / {totalShown} Solved</span>
              </div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-500" 
                  style={{ width: `${totalShown > 0 ? (solvedShown / totalShown) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* DSA Curated Lists Pills (NeetCode 150, Blind 75, NeetCode 250) */}
        {trackType === 'dsa' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            {[
              { id: 'neetcode150', label: '🚀 NeetCode 150', count: 150 },
              { id: 'blind75', label: '🧠 Blind 75', count: 75 },
              { id: 'neetcode250', label: '🦄 NeetCode 250', count: 250 },
              { id: 'all', label: '🌐 All Problems', count: 1126 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCuratedListFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  curatedListFilter === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  curatedListFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Difficulty Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 text-xs font-mono mr-1">Difficulty:</span>
          {['all', 'easy', 'medium', 'hard'].map(diff => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-2.5 py-1 rounded-md capitalize font-mono text-[11px] transition-all ${
                difficultyFilter === diff
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

      </div>

      {/* Accordion Categories (NeetCode Style) */}
      <div className="space-y-4">
        {Array.from(categorizedProblems.entries()).map(([categoryName, problems]) => {
          const isCollapsed = !!collapsedCategories[categoryName];
          const categorySolved = problems.filter(p => solvedProblems.has(p.id)).length;
          const percent = Math.round((categorySolved / problems.length) * 100);

          return (
            <div
              key={categoryName}
              className="rounded-2xl bg-slate-900/70 border border-slate-800/90 overflow-hidden shadow-lg transition-all"
            >
              {/* Accordion Category Header */}
              <div
                onClick={() => toggleCategoryCollapse(categoryName)}
                className="flex items-center justify-between px-5 py-3.5 bg-slate-900 hover:bg-slate-800/60 cursor-pointer select-none transition-colors border-b border-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{categoryName}</span>
                    <span className="text-xs font-mono font-normal text-slate-500">
                      ({problems.length})
                    </span>
                  </h3>
                </div>

                {/* Progress bar inside accordion header */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400 text-[11px]">
                      {categorySolved} / {problems.length}
                    </span>
                    <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${percent === 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    percent === 100 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Category Problems List Table */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-800/60">
                  {problems.map((p, pIdx) => {
                    const isSolved = solvedProblems.has(p.id);
                    const isStarred = starredProblems.has(p.id);

                    return (
                      <div
                        key={p.id || pIdx}
                        onClick={() => onSelectProblem(p)}
                        className="px-5 py-3 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                      >
                        {/* Status Checkbox & Title */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Custom Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleSolved) onToggleSolved(p.id);
                            }}
                            className="flex-shrink-0 text-slate-600 hover:text-emerald-400 transition-colors"
                          >
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                            )}
                          </button>

                          {/* Star toggle */}
                          <button
                            type="button"
                            onClick={(e) => toggleStar(p.id, e)}
                            className={`flex-shrink-0 transition-colors ${
                              isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400' : ''}`} />
                          </button>

                          {/* Problem Title */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs sm:text-sm font-medium tracking-tight group-hover:text-cyan-300 transition-colors truncate ${
                                isSolved ? 'text-slate-400 line-through' : 'text-slate-200'
                              }`}>
                                {p.title}
                              </span>

                              {p.researchPaper && (
                                <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-pink-950/80 text-pink-300 border border-pink-800 flex-shrink-0">
                                  <BookOpen className="w-2.5 h-2.5" />
                                  <span>Paper</span>
                                </span>
                              )}
                            </div>
                            {p.tagline && (
                              <p className="text-[11px] text-slate-500 line-clamp-1">{p.tagline}</p>
                            )}
                          </div>
                        </div>

                        {/* Action Icons & Difficulty */}
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          {/* Difficulty Pill */}
                          <span className={`text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full border ${difficultyBadge(p.difficulty)}`}>
                            {p.difficulty || 'Easy'}
                          </span>

                          {/* Video Solution Modal Button (NeetCode trademark) */}
                          {p.youtubeVideoId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVideoModal({ isOpen: true, videoId: p.youtubeVideoId, title: p.title });
                              }}
                              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700/60 transition-colors"
                              title="Watch Video Solution"
                            >
                              <Video className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* External LeetCode link */}
                          {p.leetcodeUrl && (
                            <a
                              href={p.leetcodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700/60 transition-colors"
                              title="Open on LeetCode"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {categorizedProblems.size === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500">
            <Code2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium">No problems matched your current filters.</p>
          </div>
        )}
      </div>

      {/* Embedded NeetCode Video Modal */}
      <VideoModal
        isOpen={videoModal.isOpen}
        videoId={videoModal.videoId}
        problemTitle={videoModal.title}
        onClose={() => setVideoModal({ isOpen: false, videoId: null, title: '' })}
      />

    </div>
  );
}
