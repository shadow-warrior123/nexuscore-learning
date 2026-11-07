import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Video, 
  ExternalLink, 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  Star, 
  Code2,
  Server,
  Database,
  BrainCircuit,
  Trophy,
  FoldVertical,
  UnfoldVertical,
  X
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
  const [sysdesCourseFilter, setSysdesCourseFilter] = useState('all'); // all, beginners, ood, patterns, hld
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(initialCategory || null);
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // all, easy, medium, hard
  const [statusFilter, setStatusFilter] = useState('all'); // all, solved, unsolved, starred
  const [collapsedCategories, setCollapsedCategories] = useState({});

  useEffect(() => {
    setActiveCategoryFilter(initialCategory || null);
  }, [initialCategory]);

  const [starredProblems, setStarredProblems] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_starred_problems');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

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

          if (curatedListFilter === 'blind75' && !p.blind75) return false;
          if (curatedListFilter === 'neetcode150' && !p.neetcode150) return false;
          if (curatedListFilter === 'neetcode250' && !p.neetcode250) return false;

          if (difficultyFilter !== 'all' && (p.difficulty || '').toLowerCase() !== difficultyFilter) return false;

          const isSolved = solvedProblems.has(problemId);
          const isStarred = starredProblems.has(problemId);
          if (statusFilter === 'solved' && !isSolved) return false;
          if (statusFilter === 'unsolved' && isSolved) return false;
          if (statusFilter === 'starred' && !isStarred) return false;

          if (activeCategoryFilter && !category.toLowerCase().includes(activeCategoryFilter.toLowerCase())) return false;

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
          tagline: p.tagline || `${category} Invariant · Target Optimal Verification`,
          starter_code: p.starter_code || `# First-Principles Implementation: ${p.title}\n# Pattern Invariant: ${category}\n\nclass Solution:\n    def solve(self, *args):\n        # Implement optimal invariant below\n        pass\n`,
          solution_code: p.solution_code || null,
          approach_summary: p.approach_summary || null,
          testCases: p.testCases || [],
          description: p.description || null
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
          const catKey = `${track.trackTitle} · ${ch.chapterTitle}`;
          const qList = ch.questions.filter(q => {
            const problemId = `journey-${q.slug}`;

            if (difficultyFilter !== 'all' && (q.difficulty || '').toLowerCase() !== difficultyFilter) return false;
            
            const isSolved = solvedProblems.has(problemId);
            const isStarred = starredProblems.has(problemId);
            if (statusFilter === 'solved' && !isSolved) return false;
            if (statusFilter === 'unsolved' && isSolved) return false;
            if (statusFilter === 'starred' && !isStarred) return false;

            if (activeCategoryFilter) {
              const initLower = activeCategoryFilter.toLowerCase();
              if (!catKey.toLowerCase().includes(initLower) && !(track.trackTitle || '').toLowerCase().includes(initLower) && !(ch.chapterTitle || '').toLowerCase().includes(initLower)) return false;
            }

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
            starter_code: q.starter_code ? q.starter_code.replace(/\r\r\n/g, '\n').replace(/\r\n/g, '\n') : '',
            solution_code: q.solution_code ? q.solution_code.replace(/\r\r\n/g, '\n').replace(/\r\n/g, '\n') : null,
            approach_summary: q.approach_summary || null,
            researchPaper: q.researchPaper || null,
            hints: q.hints,
            testCases: q.testCases || [],
            trackType,
            description: (q.question_description || q.conceptual_brief || q.tagline || '').replace(/\r\r\n/g, '\n').replace(/\r\n/g, '\n')
          }));

          if (qList.length > 0) {
            map.set(catKey, qList);
          }
        }
      }
      return map;
    }

    if (trackType === 'sysdes') {
      const courses = Array.isArray(sysdesData) ? sysdesData : (sysdesData.courses || []);
      for (const course of courses) {
        if (sysdesCourseFilter === 'beginners' && !course.courseName.toLowerCase().includes('beginners')) continue;
        if (sysdesCourseFilter === 'ood' && !course.courseName.toLowerCase().includes('object-oriented design interview')) continue;
        if (sysdesCourseFilter === 'patterns' && !course.courseName.toLowerCase().includes('patterns')) continue;
        if (sysdesCourseFilter === 'hld' && !course.courseName.toLowerCase().includes('system design interview')) continue;

        for (const sec of (course.sections || [])) {
          const catKey = `${course.courseName} · ${sec.sectionName}`;
          
          const qList = (sec.questions || []).filter(p => {
            const problemId = `sysdes-${(course.courseId || course.courseName).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

            const diff = course.courseName.toLowerCase().includes('beginner') ? 'easy' :
                         course.courseName.toLowerCase().includes('interview') ? 'hard' : 'medium';
            if (difficultyFilter !== 'all' && diff !== difficultyFilter) return false;

            const isSolved = solvedProblems.has(problemId);
            const isStarred = starredProblems.has(problemId);
            if (statusFilter === 'solved' && !isSolved) return false;
            if (statusFilter === 'unsolved' && isSolved) return false;
            if (statusFilter === 'starred' && !isStarred) return false;

            if (activeCategoryFilter) {
              const initLower = activeCategoryFilter.toLowerCase();
              const matchCourse = course.courseName.toLowerCase().includes(initLower);
              const matchSec = sec.sectionName.toLowerCase().includes(initLower);
              const matchCat = catKey.toLowerCase().includes(initLower);
              if (!matchCourse && !matchSec && !matchCat) return false;
            }

            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              return p.title.toLowerCase().includes(q) || catKey.toLowerCase().includes(q);
            }
            return true;
          }).map(p => {
            const diff = course.courseName.toLowerCase().includes('beginner') ? 'Easy' :
                         course.courseName.toLowerCase().includes('interview') ? 'Hard' : 'Medium';
            const problemId = `sysdes-${(course.courseId || course.courseName).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            
            return {
              id: problemId,
              title: p.title,
              category: catKey,
              courseName: course.courseName,
              sectionName: sec.sectionName,
              difficulty: diff,
              durationMinutes: p.durationMinutes,
              isFree: p.isFree,
              vimeoId: p.vimeoId,
              youtubeVideoId: p.vimeoId || null,
              codeSolutions: p.codeSolutions,
              tagline: p.tagline || `${course.courseName} · ${sec.sectionName}${p.durationMinutes ? ` · ${p.durationMinutes}m` : ''}`,
              trackType: 'sysdes',
              starter_code: p.starter_code || `# Distributed Architecture Simulation: ${p.title}\n# Track: ${course.courseName} > ${sec.sectionName}\n`,
              solution_code: p.solution_code || null,
              approach_summary: p.approach_summary || null,
              testCases: p.testCases || [],
              description: p.description || null
            };
          });

          if (qList.length > 0) {
            map.set(catKey, qList);
          }
        }
      }
      return map;
    }

    return map;
  }, [trackType, dsaData, journeyData, sysdesData, curatedListFilter, sysdesCourseFilter, activeCategoryFilter, difficultyFilter, statusFilter, searchQuery, solvedProblems, starredProblems]);

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
    if (d === 'medium') return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
    if (d === 'hard' || d === 'boss') return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    return 'text-zinc-300 bg-zinc-800 border-zinc-700';
  };

  const allCategoryKeys = Array.from(categorizedProblems.keys());

  const trackMeta = {
    ml: { code: 'CURRICULUM 02', title: 'AI & Machine Learning Engineering', desc: 'From-scratch tensor mechanics, backpropagation, neural architectures, and multi-head attention.' },
    dsa: { code: 'CURRICULUM 03', title: 'Data Structures & Algorithmic Primitives', desc: '1,126 specifications mapped to production latency constraints, memory bounds, and 3-tier solutions.' },
    sysdes: { code: 'CURRICULUM 04', title: 'Distributed Systems & Architecture', desc: 'High-level distributed topology, sharding invariants, caching layers, and object-oriented state machines.' },
    data: { code: 'CURRICULUM 05', title: 'Data Engineering & Vector Pipelines', desc: 'Zero-copy NumPy broadcasting, Pandas columnar joins, OLAP SQL window frames, and PySpark DAGs.' }
  }[trackType] || { code: 'CURRICULUM', title: 'Engineering Specifications', desc: '' };

  return (
    <div className="bg-topography-grid min-h-screen">
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
        
        {/* Editorial Header & Control Panel */}
        <div className="bg-[#0f0f12] rounded-lg border border-zinc-800/90 p-6 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-800/80 pb-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                {trackMeta.code}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-zinc-100 mt-1 tracking-tight">
                {trackMeta.title}
              </h1>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                {trackMeta.desc}
              </p>
            </div>

            {/* Progress Readout */}
            <div className="flex items-center gap-3 bg-[#09090b] px-4 py-2.5 rounded-md border border-zinc-800/90 text-xs flex-shrink-0 font-mono">
              <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-zinc-300">
                  <span className="font-semibold text-emerald-400">{solvedShown}</span>
                  <span className="text-zinc-500 text-[11px]"> / {totalShown} VERIFIED</span>
                </div>
                <div className="w-28 h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 transition-all duration-500" 
                    style={{ width: `${totalShown > 0 ? (solvedShown / totalShown) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Topic Filter Pill */}
          {activeCategoryFilter && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500 text-[11px]">ACTIVE MODULE FILTER:</span>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 text-xs">
                <span>{activeCategoryFilter}</span>
                <button
                  onClick={() => setActiveCategoryFilter(null)}
                  className="hover:text-white p-0.5 rounded transition-colors"
                  title="Clear module filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* DSA Curated Track Switcher */}
          {trackType === 'dsa' && (
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'neetcode150', label: '01 / Core 150 Invariants', count: 150 },
                { id: 'blind75', label: '02 / Essential 75', count: 75 },
                { id: 'neetcode250', label: '03 / Extended 250', count: 250 },
                { id: 'all', label: '04 / Complete Archive', count: 1126 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCuratedListFilter(tab.id)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center gap-2 border ${
                    curatedListFilter === tab.id
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold'
                      : 'bg-[#09090b] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                    curatedListFilter === tab.id ? 'bg-zinc-900/15 text-zinc-900' : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* System Design Course Switcher */}
          {trackType === 'sysdes' && (
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: '01 / All Architectures', count: 49 },
                { id: 'beginners', label: '02 / Distributed Primitives', count: 21 },
                { id: 'ood', label: '03 / OOD State Machines', count: 7 },
                { id: 'patterns', label: '04 / Design Patterns', count: 11 },
                { id: 'hld', label: '05 / Production HLD', count: 10 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSysdesCourseFilter(tab.id)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center gap-2 border ${
                    sysdesCourseFilter === tab.id
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold'
                      : 'bg-[#09090b] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                    sysdesCourseFilter === tab.id ? 'bg-zinc-900/15 text-zinc-900' : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Status, Difficulty & Accordion Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded border border-zinc-800">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unsolved', label: 'Unsolved' },
                  { id: 'solved', label: 'Verified' },
                  { id: 'starred', label: '★ Bookmarked' }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                      statusFilter === st.id
                        ? 'bg-zinc-800 text-zinc-100 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded border border-zinc-800">
                {['all', 'easy', 'medium', 'hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-2.5 py-1 rounded capitalize text-[11px] transition-colors ${
                      difficultyFilter === diff
                        ? 'bg-zinc-800 text-zinc-100 font-semibold'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#09090b] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-[11px] border border-zinc-800 transition-colors"
              >
                <UnfoldVertical className="w-3 h-3 text-amber-400" />
                <span>Expand</span>
              </button>
              <button
                onClick={() => collapseAll(allCategoryKeys)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#09090b] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-[11px] border border-zinc-800 transition-colors"
              >
                <FoldVertical className="w-3 h-3 text-zinc-500" />
                <span>Collapse</span>
              </button>
            </div>
          </div>

        </div>

        {/* Category Sections */}
        <div className="space-y-3">
          {Array.from(categorizedProblems.entries()).map(([categoryName, problems], catIdx) => {
            const isCollapsed = !!collapsedCategories[categoryName];
            const categorySolved = problems.filter(p => solvedProblems.has(p.id)).length;
            const percent = Math.round((categorySolved / problems.length) * 100);

            return (
              <div 
                key={categoryName}
                className="rounded-lg border border-zinc-800/90 bg-[#0f0f12] overflow-hidden"
              >
                {/* Category Header */}
                <div 
                  onClick={() => toggleCategoryCollapse(categoryName)}
                  className="flex items-center justify-between px-4 py-3.5 bg-[#0f0f12] hover:bg-zinc-900/70 cursor-pointer border-b border-zinc-800/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-zinc-500">
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {String(catIdx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
                      <span>{categoryName}</span>
                      <span className="text-[11px] font-mono text-zinc-500 font-normal">
                        [{problems.length}]
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400">
                        {categorySolved}/{problems.length}
                      </span>
                      <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${percent === 100 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded border ${
                      percent === 100
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}>
                      {percent}%
                    </span>
                  </div>
                </div>

                {/* Problems Table */}
                {!isCollapsed && (
                  <div className="divide-y divide-zinc-800/60">
                    {problems.map((problem, pIdx) => {
                      const isSolved = solvedProblems.has(problem.id);
                      const isStarred = starredProblems.has(problem.id);

                      return (
                        <div
                          key={problem.id}
                          onClick={() => onSelectProblem(problem)}
                          className={`flex items-center justify-between py-3 px-4 sm:px-5 hover:bg-zinc-900/70 cursor-pointer transition-colors group ${
                            isSolved ? 'bg-emerald-950/[0.08]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleSolved) onToggleSolved(problem.id);
                              }}
                              className="text-zinc-600 hover:text-emerald-400 transition-colors flex-shrink-0"
                              title={isSolved ? "Mark Unverified" : "Mark Verified"}
                            >
                              {isSolved ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-zinc-700 hover:text-zinc-400" />
                              )}
                            </button>

                            <button
                              onClick={(e) => toggleStar(problem.id, e)}
                              className="text-zinc-700 hover:text-amber-400 transition-colors flex-shrink-0"
                              title={isStarred ? "Remove Bookmark" : "Bookmark Spec"}
                            >
                              <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
                            </button>

                            <span className="text-[10px] font-mono text-zinc-600 w-6 flex-shrink-0 hidden sm:inline">
                              {String(pIdx + 1).padStart(2, '0')}
                            </span>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium truncate transition-colors ${
                                  isSolved ? 'text-zinc-500 line-through' : 'text-zinc-100 group-hover:text-amber-300'
                                }`}>
                                  {problem.title}
                                </span>

                                {problem.blind75 && (
                                  <span className="hidden md:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                    BLIND-75
                                  </span>
                                )}
                                {problem.neetcode150 && (
                                  <span className="hidden md:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                    CORE-150
                                  </span>
                                )}
                              </div>
                              
                              {problem.tagline && (
                                <p className="text-[11px] text-zinc-500 truncate font-mono mt-0.5">
                                  {problem.tagline}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            {problem.testCases && problem.testCases.length > 0 && (
                              <span className="hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/25">
                                ✓ {problem.testCases.length} TESTS
                              </span>
                            )}
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getDifficultyBadge(problem.difficulty)}`}>
                              {problem.difficulty || 'Easy'}
                            </span>

                            {problem.youtubeVideoId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVideoModal({ isOpen: true, videoId: problem.youtubeVideoId, title: problem.title });
                                }}
                                className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                                title="Video Walkthrough"
                              >
                                <Video className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {problem.leetcodeUrl && (
                              <a
                                href={problem.leetcodeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors hidden sm:block"
                                title="External Benchmark Reference"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
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
            <div className="p-12 text-center text-zinc-500 rounded-lg bg-[#0f0f12] border border-dashed border-zinc-800 space-y-2">
              <Filter className="w-6 h-6 mx-auto text-zinc-600" />
              <h3 className="text-xs font-mono uppercase text-zinc-300">No specifications match the active filter</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Reset difficulty, status, or search filters above to view all modules.
              </p>
            </div>
          )}
        </div>

        {videoModal.isOpen && (
          <VideoModal
            isOpen={videoModal.isOpen}
            videoId={videoModal.videoId}
            problemTitle={videoModal.title}
            onClose={() => setVideoModal({ isOpen: false, videoId: null, title: '' })}
          />
        )}

      </div>
    </div>
  );
}
