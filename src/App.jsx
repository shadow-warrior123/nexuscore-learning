import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import RoadmapView from './components/RoadmapView';
import ProblemListView from './components/ProblemListView';
import ProblemWorkspace from './components/ProblemWorkspace';
import ResearchPapersView from './components/ResearchPapersView';
import CommandPalette from './components/CommandPalette';
import AnalyticsModal from './components/AnalyticsModal';
import InAppPdfViewer from './components/InAppPdfViewer';

import journeyData from './data/journey.json';
import dsaData from './data/dsa.json';
import sysdesData from './data/system_design.json';

import {
  getSolvedProblems,
  getTotalXP,
  toggleProblemSolved,
  syncSolvedFromBackend
} from './utils/storage';
import { fetchBackendProgress, toggleProgressOnBackend } from './utils/api';
import { buildAllProblems } from './utils/catalog';

export default function App() {
  const [activeTab, setActiveTab] = useState('roadmap'); // roadmap, dsa, sysdes, ml, data, papers
  const [activeProblem, setActiveProblem] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [totalXp, setTotalXp] = useState(0);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [quickPdfPaper, setQuickPdfPaper] = useState(null);

  const catalog = useMemo(() => buildAllProblems(), []);

  const refreshLocalProgress = () => {
    setSolvedProblems(getSolvedProblems());
    setTotalXp(getTotalXP());
  };

  useEffect(() => {
    refreshLocalProgress();
    fetchBackendProgress().then((res) => {
      if (res?.success && Array.isArray(res.progress)) {
        const synced = syncSolvedFromBackend(res.progress);
        setSolvedProblems(new Set(synced.solved));
        setTotalXp(synced.totalXp);
      }
    });
  }, []);

  const handleProblemSolved = () => {
    refreshLocalProgress();
  };

  const handleToggleSolved = (problemId) => {
    const matched = catalog.allProblems.find((p) => p.id === problemId);
    const xp = matched?.xp || 10;
    const isNowSolved = toggleProblemSolved(problemId, xp);
    refreshLocalProgress();
    toggleProgressOnBackend({
      problemId,
      solved: isNowSolved,
      problemTitle: matched?.title || '',
      category: matched?.category || '',
      trackType: matched?.trackType || '',
      xp
    });
  };

  const handleSelectFromRoadmap = (branchId, categoryName) => {
    setFilterCategory(categoryName);
    setActiveTab(branchId);
    setActiveProblem(null);
  };

  const handleSelectProblem = (problem) => {
    setActiveProblem(problem);
  };

  const handleBackFromWorkspace = () => {
    setActiveProblem(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">

      <Navbar
        activeTab={activeProblem ? 'workspace' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveProblem(null);
          setFilterCategory(null);
        }}
        solvedCount={solvedProblems.size}
        totalCount={catalog.counts.total}
        totalXp={totalXp}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q && activeTab === 'roadmap') {
            setActiveTab('dsa');
          }
        }}
        trackCounts={catalog.counts}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
      />

      <main className="flex-1">
        {activeProblem ? (
          <ProblemWorkspace
            problem={activeProblem}
            onBack={handleBackFromWorkspace}
            onProblemSolved={handleProblemSolved}
          />
        ) : activeTab === 'roadmap' ? (
          <RoadmapView
            onSelectCategory={handleSelectFromRoadmap}
            solvedProblems={solvedProblems}
            trackCounts={catalog.counts}
          />
        ) : activeTab === 'papers' ? (
          <ResearchPapersView
            onSelectPaperTopic={(topic) => {
              setActiveTab('ml');
              setSearchQuery(topic);
            }}
          />
        ) : (
          <ProblemListView
            trackType={activeTab}
            dsaData={dsaData}
            journeyData={journeyData}
            sysdesData={sysdesData}
            solvedProblems={solvedProblems}
            onSelectProblem={handleSelectProblem}
            initialCategory={filterCategory}
            searchQuery={searchQuery}
            onToggleSolved={handleToggleSolved}
          />
        )}
      </main>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        allProblems={catalog.allProblems}
        papers={catalog.papers}
        solvedProblems={solvedProblems}
        onSelectProblem={(p) => {
          setActiveTab(p.trackType);
          setActiveProblem(p);
        }}
        onSelectPaper={(paper) => setQuickPdfPaper(paper)}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        catalog={catalog}
        solvedProblems={solvedProblems}
        totalXp={totalXp}
        onProgressChanged={refreshLocalProgress}
      />

      <InAppPdfViewer
        isOpen={Boolean(quickPdfPaper)}
        paper={quickPdfPaper}
        onClose={() => setQuickPdfPaper(null)}
      />

    </div>
  );
}
