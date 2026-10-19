/**
 * Local progress & state manager
 * Zero login required for visitors!
 */

const SOLVED_KEY = 'nexus_solved_problems';
const USER_CODE_KEY = 'nexus_saved_code';
const USER_XP_KEY = 'nexus_total_xp';

export function getSolvedProblems() {
  try {
    const raw = localStorage.getItem(SOLVED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

export function markProblemSolved(problemId, xpEarned = 10) {
  const solved = getSolvedProblems();
  if (!solved.has(problemId)) {
    solved.add(problemId);
    localStorage.setItem(SOLVED_KEY, JSON.stringify(Array.from(solved)));
    
    // Increment XP
    const currentXp = getTotalXP();
    localStorage.setItem(USER_XP_KEY, String(currentXp + xpEarned));
    return true; // Newly solved
  }
  return false;
}

export function getTotalXP() {
  const raw = localStorage.getItem(USER_XP_KEY);
  return raw ? parseInt(raw, 10) : 0;
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

export function resetAllProgress() {
  localStorage.removeItem(SOLVED_KEY);
  localStorage.removeItem(USER_CODE_KEY);
  localStorage.removeItem(USER_XP_KEY);
}
