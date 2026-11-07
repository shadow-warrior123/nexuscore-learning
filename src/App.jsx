import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoadmapView from './components/RoadmapView';
import ProblemListView from './components/ProblemListView';
import ProblemWorkspace from './components/ProblemWorkspace';
import ResearchPapersView from './components/ResearchPapersView';

import journeyData from './data/journey.json';
import dsaData from './data/dsa.json';
import sysdesData from './data/system_design.json';

import { getSolvedProblems, getTotalXP, markProblemSolved } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('roadmap'); // roadmap, dsa, sysdes, ml, data, papers
  const [activeProblem, setActiveProblem] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    setSolvedProblems(getSolvedProblems());
    setTotalXp(getTotalXP());
  }, []);

  const handleProblemSolved = () => {
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

  const totalProblemsCount = 372 + (dsaData.summary?.totalProblems || 1126) + 49;

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
        totalCount={totalProblemsCount}
        totalXp={totalXp}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q && activeTab === 'roadmap') {
            setActiveTab('dsa');
          }
        }}
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

    </div>
  );
}
