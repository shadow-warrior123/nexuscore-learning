import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoadmapView from './components/RoadmapView';
import ProblemListView from './components/ProblemListView';
import ProblemWorkspace from './components/ProblemWorkspace';
import ResearchPapersView from './components/ResearchPapersView';
import BackendGuideModal from './components/BackendGuideModal';

import journeyData from './data/journey.json';
import dsaData from './data/dsa.json';
import sysdesData from './data/system_design.json';
import researchPapers from './data/research_papers.json';

import { getSolvedProblems, getTotalXP, markProblemSolved } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('roadmap'); // roadmap, dsa, sysdes, ml, data, papers
  const [activeProblem, setActiveProblem] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Solved problems & XP state
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    setSolvedProblems(getSolvedProblems());
    setTotalXp(getTotalXP());
  }, []);

  const handleProblemSolved = (problemId) => {
    setSolvedProblems(getSolvedProblems());
    setTotalXp(getTotalXP());
  };

  const handleToggleSolved = (problemId) => {
    const solved = getSolvedProblems();
    if (solved.has(problemId)) {
      solved.delete(problemId);
      localStorage.setItem('nexus_solved_problems', JSON.stringify(Array.from(solved)));
    } else {
      markProblemSolved(problemId, 10);
    }
    setSolvedProblems(getSolvedProblems());
    setTotalXp(getTotalXP());
  };

  // When clicking a node in the roadmap
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

  // Total problems count across all curricula
  const totalProblemsCount = 372 + (dsaData.summary?.totalProblems || 1126) + 38;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeProblem ? 'workspace' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveProblem(null);
          setFilterCategory(null);
        }}
        solvedCount={solvedProblems.size}
        totalCount={totalProblemsCount}
        totalXp={totalXp}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
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

      {/* Backend & Self-Hosting Guide Modal */}
      <BackendGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
}
