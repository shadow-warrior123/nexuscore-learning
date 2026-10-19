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
  ArrowRight,
  Bookmark,
  Check,
  Flame,
  Layers,
  FoldVertical,
  UnfoldVertical,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // all, easy, medium, hard
  const [statusFilter, setStatusFilter] = useState('all'); // all, solved, unsolved, starred
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

  const expandAll = () => setCollapsedCategories({});
  const collapseAll = (allCatKeys) => {
    const next = {};
    allCatKeys.forEach(k => next[k] = true);
    setCollapsedCategories(next);
  };

  // Group problems by Category
  const categorizedProblems = useMemo(() => {
    const map = new Map();

    if (trackType === 'dsa') {
      for (const [category, items] of Object.entries(dsaData.categories || {})) {
        const filteredItems = items.filter(p => {
          const problemId = `dsa-${p.githubCodeSlug || p.title}`;

          // Curated list filter
          if (curatedListFilter === 'blind75' && !p.blind75) return false;
          if (curatedListFilter === 'neetcode150' && !p.neetcode150) return false;
          if (curatedListFilter === 'neetcode250' && !p.neetcode250) return false;

          // Difficulty filter
          if (difficultyFilter !== 'all' && (p.difficulty || '').toLowerCase() !== difficultyFilter) return false;

          // Status filter
          const isSolved = solvedProblems.has(problemId);
          const isStarred = starredProblems.has(problemId);
          if (statusFilter === 'solved' && !isSolved) return false;
          if (statusFilter === 'unsolved' && isSolved) return false;
          if (statusFilter === 'starred' && !isStarred) return false;

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
          starter_code: `# Solution for: ${p.title}\nclass Solution:\n    def solve(self, *args):\n        # Write your code here\n        pass\n`,
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
            const problemId = `journey-${q.slug}`;

            if (difficultyFilter !== 'all' && (q.difficulty || '').toLowerCase() !== difficultyFilter) return false;
            
            const isSolved = solvedProblems.has(problemId);
            const isStarred = starredProblems.has(problemId);
            if (statusFilter === 'solved' && !isSolved) return false;
            if (statusFilter === 'unsolved' && isSolved) return false;
            if (statusFilter === 'starred' && !isStarred) return false;

            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              return q.title.toLowerCase().includes(query) || catKey.toLowerCase().includes(query) || (q.tagline || '').toLowerCase().includes(query);
            }
            return true;
          }).map(q => ({
            id: `journey-${q.slug}`,
            title: q.title,
            category: catKey,
            trackTitle: track.trackTitle,
            chapterTitle: ch.chapterTitle,
            difficulty: q.difficulty,
            xp: q.xp,
            tagline: q.tagline,
            objective: q.objective,
            starter_code: q.starter_code,
            solution_code: q.solution_code,
            hints: q.hints,
            testCases: q.testCases || [],
            trackType,
            description: q.conceptual_brief ? `${q.conceptual_brief}\n\n**Objective:** ${q.objective}` : q.tagline
          }));

          if (qList.length > 0) {
            map.set(catKey, qList);
          }
        }
      }
      return map;
    }

    if (trackType === 'sysdes') {
      for (const [category, items] of Object.entries(sysdesData.categories || {})) {
        const filteredItems = items.filter(p => {
          const problemId = `sysdes-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

          if (difficultyFilter !== 'all' && (p.difficulty || '').toLowerCase() !== difficultyFilter) return false;
          
          const isSolved = solvedProblems.has(problemId);
          const isStarred = starredProblems.has(problemId);
          if (statusFilter === 'solved' && !isSolved) return false;
          if (statusFilter === 'unsolved' && isSolved) return false;
          if (statusFilter === 'starred' && !isStarred) return false;

          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(q) || category.toLowerCase().includes(q);
          }
          return true;
        }).map(p => ({
          id: `sysdes-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: p.title,
          category,
          difficulty: p.difficulty,
          isFree: p.isFree,
          youtubeVideoId: p.youtubeSolution ? p.youtubeSolution.split('v=')[1] : null,
          trackType: 'sysdes',
          starter_code: `# System Design Architecture Blueprint for: ${p.title}\n\n"""\nCore Components:\n1. Client Tier & Load Balancing\n2. API Gateway & Rate Limiting\n3. Storage Strategy (SQL vs NoSQL vs Cache)\n4. Asynchronous Queues & Event Streaming\n5. Consistency & Partition Tolerance\n"""\n`,
          description: `### ${p.title}\n\n**Category:** ${category}  \n**Difficulty:** ${p.difficulty}  \n\nScalable real-world system architecture design challenge. Analyze traffic patterns, storage bounds, and trade-offs.`
        }));

        if (filteredItems.length > 0) {
          map.set(category, filteredItems);
        }
      }
      return map;
    }

    return map;
  }, [trackType, dsaData, journeyData, sysdesData, curatedListFilter, difficultyFilter, statusFilter, searchQuery, solvedProblems, starredProblems]);

  // Overall totals for current filtered view
  const { totalShown, solvedShown } = useMemo(() => {
    let tot = 0;
    let sol = 0;
    for (const items of categorizedProblems.values()) {
      tot += items.length;
      for (const p of items) {
        if (solvedProblems.has(p.id)) sol++;
      }
    }
    return { totalShown: tot, solvedShown: sol };
  }, [categorizedProblems, solvedProblems]);

  const getDifficultyBadge = (diff) => {
    const d = (diff || '').toLowerCase();
    if (d === 'easy') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (d === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (d === 'hard' || d === 'boss') return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  };

  const allCategoryKeys = Array.from(categorizedProblems.keys());

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      
      {/* NeetCode Style Filter Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Code2 className="w-6 h-6 text-cyan-400" />
              <span>
                {trackType === 'dsa' && 'Data Structures & Algorithms (NeetCode)'}
                {trackType === 'ml' && 'Machine Learning & Deep Learning'}
                {trackType === 'data' && 'Data Engineering & Scaled Systems'}
                {trackType === 'sysdes' && 'System Design & Distributed Architecture'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Structured question sets with in-browser terminal execution and NeetCode 3-tier solutions.
            </p>
          </div>

          {/* Quick Progress Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-xs flex-shrink-0 shadow-inner">
            <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <div className="font-mono text-slate-200">
                <span className="font-bold text-emerald-400">{solvedShown}</span>
                <span className="text-slate-500 text-[11px]"> / {totalShown} Solved</span>
              </div>
              <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
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

        {/* Multi-Filters Bar: Status, Difficulty & Expand/Collapse */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800/60">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { id: 'all', label: 'All' },
                { id: 'unsolved', label: 'Unsolved' },
                { id: 'solved', label: 'Solved' },
                { id: 'starred', label: '★ Starred' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                    statusFilter === st.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Difficulty Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['all', 'easy', 'medium', 'hard'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-2.5 py-1 rounded-md capitalize font-mono text-[11px] transition-all ${
                    difficultyFilter === diff
                      ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Expand / Collapse All Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors border border-slate-700/60"
              title="Expand All Categories"
            >
              <UnfoldVertical className="w-3 h-3 text-cyan-400" />
              <span>Expand All</span>
            </button>
            <button
              onClick={() => collapseAll(allCategoryKeys)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors border border-slate-700/60"
              title="Collapse All Categories"
            >
              <FoldVertical className="w-3 h-3 text-slate-400" />
              <span>Collapse All</span>
            </button>
          </div>

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
              className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl transition-all"
            >
              {/* Category Header */}
              <div 
                onClick={() => toggleCategoryCollapse(categoryName)}
                className="flex items-center justify-between p-4 bg-slate-900/90 hover:bg-slate-850 cursor-pointer border-b border-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-slate-400">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <span>{categoryName}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">
                        ({problems.length})
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Category Progress Bar */}
                  <div className="hidden sm:flex items-center gap-2.5 font-mono text-xs">
                    <span className={`text-[11px] font-bold ${percent === 100 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {categorySolved} / {problems.length}
                    </span>
                    <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${percent === 100 ? 'bg-emerald-400' : 'bg-cyan-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    percent === 100
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Problems Table / List */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-800/60">
                  {problems.map((problem) => {
                    const isSolved = solvedProblems.has(problem.id);
                    const isStarred = starredProblems.has(problem.id);

                    return (
                      <div
                        key={problem.id}
                        onClick={() => onSelectProblem(problem)}
                        className={`flex items-center justify-between p-3.5 px-4 sm:px-6 hover:bg-slate-800/50 cursor-pointer transition-all group ${
                          isSolved ? 'bg-emerald-950/10' : ''
                        }`}
                      >
                        {/* Left: Status, Star, Title, Badges */}
                        <div className="flex items-center gap-3.5 min-w-0 pr-4">
                          
                          {/* Solved Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleSolved) onToggleSolved(problem.id);
                            }}
                            className="text-slate-500 hover:text-emerald-400 transition-colors flex-shrink-0"
                            title={isSolved ? "Mark Unsolved" : "Mark Solved"}
                          >
                            {isSolved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                            )}
                          </button>

                          {/* Star Bookmark */}
                          <button
                            onClick={(e) => toggleStar(problem.id, e)}
                            className="text-slate-600 hover:text-amber-400 transition-colors flex-shrink-0"
                            title={isStarred ? "Unstar" : "Star Problem"}
                          >
                            <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                          </button>

                          {/* Title & Tagline */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold truncate transition-colors ${
                                isSolved ? 'text-slate-400 line-through' : 'text-slate-100 group-hover:text-cyan-300'
                              }`}>
                                {problem.title}
                              </span>

                              {/* Special NeetCode Badges */}
                              {problem.blind75 && (
                                <span className="hidden md:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 font-bold">
                                  Blind 75
                                </span>
                              )}
                              {problem.neetcode150 && (
                                <span className="hidden md:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-bold">
                                  NC 150
                                </span>
                              )}
                            </div>
                            
                            {problem.tagline && (
                              <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                                {problem.tagline}
                              </p>
                            )}
                          </div>

                        </div>

                        {/* Right: Actions, Difficulty Pill, Video, Terminal Link */}
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          
                          {/* Difficulty Pill */}
                          <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold ${getDifficultyBadge(problem.difficulty)}`}>
                            {problem.difficulty || 'Easy'}
                          </span>

                          {/* Video Solution Trigger */}
                          {problem.youtubeVideoId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setVideoModal({ isOpen: true, videoId: problem.youtubeVideoId, title: problem.title });
                              }}
                              className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                              title="Watch Video Solution"
                            >
                              <Video className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* LeetCode Direct Reference */}
                          {problem.leetcodeUrl && (
                            <a
                              href={problem.leetcodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-md text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors hidden sm:block"
                              title="View on LeetCode"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
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
          <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
            <Filter className="w-8 h-8 mx-auto text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-300">No problems match the current filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try switching your difficulty filter to "All", resetting search, or changing curated lists.
            </p>
          </div>
        )}
      </div>

      {/* Embedded Video Modal */}
      {videoModal.isOpen && (
        <VideoModal
          isOpen={videoModal.isOpen}
          videoId={videoModal.videoId}
          problemTitle={videoModal.title}
          onClose={() => setVideoModal({ isOpen: false, videoId: null, title: '' })}
        />
      )}

    </div>
  );
}
