/**
 * Local progress & state manager
 * Zero login required for visitors!
 */

const SOLVED_KEY = 'nexus_solved_problems';
const SOLVED_XP_MAP_KEY = 'nexus_solved_xp_map';
const USER_CODE_KEY = 'nexus_saved_code';
const USER_XP_KEY = 'nexus_total_xp';
const STARRED_KEY = 'nexus_starred_problems';

function getSolvedXpMap() {
  try {
    const raw = localStorage.getItem(SOLVED_XP_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveSolvedXpMap(map) {
  try {
    localStorage.setItem(SOLVED_XP_MAP_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save XP map:', e);
  }
}

export function getSolvedProblems() {
  try {
    const raw = localStorage.getItem(SOLVED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

export function getTotalXP() {
  const raw = localStorage.getItem(USER_XP_KEY);
  const parsed = raw ? parseInt(raw, 10) : 0;
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

export function markProblemSolved(problemId, xpEarned = 10) {
  const solved = getSolvedProblems();
  if (!solved.has(problemId)) {
    solved.add(problemId);
    localStorage.setItem(SOLVED_KEY, JSON.stringify(Array.from(solved)));

    const xpMap = getSolvedXpMap();
    xpMap[problemId] = xpEarned;
    saveSolvedXpMap(xpMap);

    const currentXp = getTotalXP();
    localStorage.setItem(USER_XP_KEY, String(currentXp + xpEarned));
    return true; // Newly solved
  }
  return false;
}

export function toggleProblemSolved(problemId, xpEarned = 10) {
  const solved = getSolvedProblems();
  const xpMap = getSolvedXpMap();
  const currentXp = getTotalXP();

  if (solved.has(problemId)) {
    solved.delete(problemId);
    const earnedForProblem = xpMap[problemId] !== undefined ? xpMap[problemId] : xpEarned;
    delete xpMap[problemId];
    localStorage.setItem(SOLVED_KEY, JSON.stringify(Array.from(solved)));
    saveSolvedXpMap(xpMap);
    localStorage.setItem(USER_XP_KEY, String(Math.max(0, currentXp - earnedForProblem)));
    return false;
  } else {
    solved.add(problemId);
    xpMap[problemId] = xpEarned;
    localStorage.setItem(SOLVED_KEY, JSON.stringify(Array.from(solved)));
    saveSolvedXpMap(xpMap);
    localStorage.setItem(USER_XP_KEY, String(currentXp + xpEarned));
    return true;
  }
}

export function syncSolvedFromBackend(progressRows = []) {
  const solved = getSolvedProblems();
  const xpMap = getSolvedXpMap();
  let addedXp = 0;

  for (const row of progressRows) {
    if (row.status === 'solved' && row.problem_id && !solved.has(row.problem_id)) {
      const xp = row.xp_earned || 10;
      solved.add(row.problem_id);
      xpMap[row.problem_id] = xp;
      addedXp += xp;
    }
  }

  if (addedXp > 0) {
    localStorage.setItem(SOLVED_KEY, JSON.stringify(Array.from(solved)));
    saveSolvedXpMap(xpMap);
    localStorage.setItem(USER_XP_KEY, String(getTotalXP() + addedXp));
  }

  return { solved, totalXp: getTotalXP() };
}

export function getSavedCode(problemId, defaultCode = '') {
  try {
    const raw = localStorage.getItem(USER_CODE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[problemId] !== undefined ? map[problemId] : defaultCode;
  } catch (e) {
    return defaultCode;
  }
}

export function saveCode(problemId, code) {
  try {
    const raw = localStorage.getItem(USER_CODE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[problemId] = code;
    localStorage.setItem(USER_CODE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save code:", e);
  }
}

export function exportProgressData() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    solvedProblems: Array.from(getSolvedProblems()),
    solvedXpMap: getSolvedXpMap(),
    totalXp: getTotalXP(),
    starredProblems: (() => {
      try {
        return JSON.parse(localStorage.getItem(STARRED_KEY) || '[]');
      } catch {
        return [];
      }
    })(),
    savedCode: (() => {
      try {
        return JSON.parse(localStorage.getItem(USER_CODE_KEY) || '{}');
      } catch {
        return {};
      }
    })()
  };
}

export function importProgressData(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid progress backup file.');
  }
  const solvedArr = Array.isArray(payload.solvedProblems) ? payload.solvedProblems : [];
  const xpMap = payload.solvedXpMap && typeof payload.solvedXpMap === 'object' ? payload.solvedXpMap : {};
  const computedXp = typeof payload.totalXp === 'number'
    ? Math.max(0, payload.totalXp)
    : solvedArr.reduce((acc, id) => acc + (xpMap[id] || 10), 0);

  localStorage.setItem(SOLVED_KEY, JSON.stringify(solvedArr));
  saveSolvedXpMap(xpMap);
  localStorage.setItem(USER_XP_KEY, String(computedXp));

  if (Array.isArray(payload.starredProblems)) {
    localStorage.setItem(STARRED_KEY, JSON.stringify(payload.starredProblems));
  }
  if (payload.savedCode && typeof payload.savedCode === 'object') {
    localStorage.setItem(USER_CODE_KEY, JSON.stringify(payload.savedCode));
  }
}

export function resetAllProgress() {
  localStorage.removeItem(SOLVED_KEY);
  localStorage.removeItem(SOLVED_XP_MAP_KEY);
  localStorage.removeItem(USER_CODE_KEY);
  localStorage.removeItem(USER_XP_KEY);
  localStorage.removeItem(STARRED_KEY);
}
