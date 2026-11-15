import dsaData from '../data/dsa.json';
import journeyData from '../data/journey.json';
import sysdesData from '../data/system_design.json';
import researchPapers from '../data/research_papers.json';

export const ML_TRACK_SLUGS = ['ml-engineer', 'pytorch', 'tensorflow'];
export const DATA_TRACK_SLUGS = ['pandas', 'numpy', 'sql', 'data-engineering', 'pyspark'];

export function buildAllProblems() {
  const dsaProblems = [];
  for (const [category, items] of Object.entries(dsaData.categories || {})) {
    for (const p of items) {
      dsaProblems.push({
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
      });
    }
  }

  const mlProblems = [];
  const dataProblems = [];
  for (const track of journeyData) {
    const isMl = ML_TRACK_SLUGS.includes(track.trackSlug);
    const isData = DATA_TRACK_SLUGS.includes(track.trackSlug);
    if (!isMl && !isData) continue;
    const trackType = isMl ? 'ml' : 'data';

    for (const ch of track.chapters || []) {
      const catKey = `${track.trackTitle} · ${ch.chapterTitle}`;
      for (const q of ch.questions || []) {
        const item = {
          id: `journey-${q.slug}`,
          title: q.title,
          category: catKey,
          trackTitle: track.trackTitle,
          trackSlug: track.trackSlug,
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
        };
        if (isMl) mlProblems.push(item);
        else dataProblems.push(item);
      }
    }
  }

  const sysdesProblems = [];
  const courses = Array.isArray(sysdesData) ? sysdesData : (sysdesData.courses || []);
  for (const course of courses) {
    for (const sec of course.sections || []) {
      const catKey = `${course.courseName} · ${sec.sectionName}`;
      const diff = course.courseName.toLowerCase().includes('beginner')
        ? 'Easy'
        : course.courseName.toLowerCase().includes('interview')
          ? 'Hard'
          : 'Medium';
      for (const p of sec.questions || []) {
        const problemId = `sysdes-${(course.courseId || course.courseName).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        sysdesProblems.push({
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
        });
      }
    }
  }

  const allProblems = [...mlProblems, ...dsaProblems, ...sysdesProblems, ...dataProblems];

  return {
    allProblems,
    byTrack: {
      ml: mlProblems,
      dsa: dsaProblems,
      sysdes: sysdesProblems,
      data: dataProblems
    },
    counts: {
      ml: mlProblems.length,
      dsa: dsaProblems.length,
      sysdes: sysdesProblems.length,
      data: dataProblems.length,
      papers: researchPapers.length,
      total: allProblems.length
    },
    papers: researchPapers
  };
}
