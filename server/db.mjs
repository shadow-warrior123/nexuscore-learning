import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists
const dbPath = path.join(__dirname, 'platform.db');
const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  PRAGMA journal_mode = WAL;

  -- Solved Progress Table
  CREATE TABLE IF NOT EXISTS user_progress (
    problem_id TEXT PRIMARY KEY,
    problem_title TEXT,
    category TEXT,
    track_type TEXT,
    status TEXT NOT NULL, -- 'solved', 'attempted'
    saved_code TEXT,
    xp_earned INTEGER DEFAULT 10,
    solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Submissions History Table
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id TEXT NOT NULL,
    problem_title TEXT,
    track_type TEXT,
    code TEXT NOT NULL,
    status TEXT NOT NULL, -- 'accepted', 'failed', 'error'
    execution_time_ms INTEGER DEFAULT 0,
    test_results TEXT, -- JSON string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Custom Execution Runs Log
  CREATE TABLE IF NOT EXISTS execution_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id TEXT,
    code TEXT,
    stdout TEXT,
    stderr TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Indexes for speedy retrieval
  CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);
  CREATE INDEX IF NOT EXISTS idx_progress_status ON user_progress(status);
`);

console.log(`[Database] SQLite initialized successfully at: ${dbPath}`);

export { db };
