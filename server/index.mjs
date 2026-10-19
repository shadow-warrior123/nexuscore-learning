import express from 'express';
import cors from 'cors';
import { db } from './db.mjs';
import { spawn } from 'child_process';
import os from 'os';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'SQLite (WAL Mode)',
    nodeVersion: process.version,
    platform: process.platform,
    hostname: os.hostname()
  });
});

// Helper function to stream URL following redirects
function streamPdfWithRedirects(targetUrl, res, maxRedirects = 5) {
  if (maxRedirects <= 0) {
    return res.status(508).send('Too many redirects');
  }

  try {
    const urlObj = new URL(targetUrl);
    const client = urlObj.protocol === 'https:' ? https : http;

    const proxyReq = client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,*/*'
      }
    }, (proxyRes) => {
      // Follow redirect
      if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        const nextUrl = new URL(proxyRes.headers.location, targetUrl).toString();
        return streamPdfWithRedirects(nextUrl, res, maxRedirects - 1);
      }

      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');

      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.status(502).send('Error proxying PDF: ' + err.message);
    });
  } catch (e) {
    res.status(400).send('Invalid URL: ' + e.message);
  }
}

// 2. High-speed In-App PDF Proxy
app.get('/api/pdf-proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing url parameter');
  streamPdfWithRedirects(targetUrl, res);
});

// 3. Get User Progress & Solved List
app.get('/api/progress', (req, res) => {
  try {
    const query = db.prepare('SELECT * FROM user_progress ORDER BY updated_at DESC');
    const rows = query.all();

    const solvedList = rows.filter(r => r.status === 'solved');
    const totalXp = solvedList.reduce((acc, r) => acc + (r.xp_earned || 10), 0);

    res.json({
      success: true,
      totalSolved: solvedList.length,
      totalXp,
      solvedIds: solvedList.map(r => r.problem_id),
      progress: rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Save Code Draft
app.post('/api/progress/save-code', (req, res) => {
  const { problemId, code, problemTitle, category, trackType } = req.body;
  if (!problemId) return res.status(400).json({ error: 'problemId is required' });

  try {
    const stmt = db.prepare(`
      INSERT INTO user_progress (problem_id, problem_title, category, track_type, status, saved_code, updated_at)
      VALUES (?, ?, ?, ?, 'attempted', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(problem_id) DO UPDATE SET
        saved_code = excluded.saved_code,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(problemId, problemTitle || '', category || '', trackType || '', code || '');
    res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get Code Draft
app.get('/api/progress/code/:problemId', (req, res) => {
  try {
    const stmt = db.prepare('SELECT saved_code FROM user_progress WHERE problem_id = ?');
    const row = stmt.get(req.params.problemId);
    res.json({ success: true, code: row ? row.saved_code : null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Submit Problem Result
app.post('/api/submissions', (req, res) => {
  const { problemId, problemTitle, trackType, category, code, status, executionTimeMs, testResults, xp } = req.body;
  if (!problemId || !code) return res.status(400).json({ error: 'Missing required submission fields' });

  try {
    const testResultsStr = typeof testResults === 'object' ? JSON.stringify(testResults) : (testResults || '[]');

    const subStmt = db.prepare(`
      INSERT INTO submissions (problem_id, problem_title, track_type, code, status, execution_time_ms, test_results)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = subStmt.run(problemId, problemTitle || '', trackType || '', code, status, executionTimeMs || 0, testResultsStr);

    if (status === 'accepted') {
      const progStmt = db.prepare(`
        INSERT INTO user_progress (problem_id, problem_title, category, track_type, status, saved_code, xp_earned, solved_at, updated_at)
        VALUES (?, ?, ?, ?, 'solved', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(problem_id) DO UPDATE SET
          status = 'solved',
          saved_code = excluded.saved_code,
          xp_earned = excluded.xp_earned,
          updated_at = CURRENT_TIMESTAMP
      `);
      progStmt.run(problemId, problemTitle || '', category || '', trackType || '', code, xp || 10);
    }

    res.json({
      success: true,
      submissionId: result.lastInsertRowid,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Get Submissions History for a Problem
app.get('/api/submissions/:problemId', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, problem_id, status, execution_time_ms, test_results, created_at, code
      FROM submissions
      WHERE problem_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `);
    const rows = stmt.all(req.params.problemId);
    
    const parsedRows = rows.map(r => ({
      ...r,
      test_results: JSON.parse(r.test_results || '[]')
    }));

    res.json({ success: true, count: parsedRows.length, submissions: parsedRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Overall Analytics & Stats
app.get('/api/stats', (req, res) => {
  try {
    const totalSubmissions = db.prepare('SELECT COUNT(*) as count FROM submissions').get().count;
    const acceptedCount = db.prepare("SELECT COUNT(*) as count FROM submissions WHERE status = 'accepted'").get().count;
    const totalSolved = db.prepare("SELECT COUNT(*) as count FROM user_progress WHERE status = 'solved'").get().count;
    
    const byTrack = db.prepare(`
      SELECT track_type, COUNT(*) as count
      FROM user_progress
      WHERE status = 'solved'
      GROUP BY track_type
    `).all();

    const recentSubmissions = db.prepare(`
      SELECT id, problem_title, track_type, status, execution_time_ms, created_at
      FROM submissions
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    res.json({
      success: true,
      totalSubmissions,
      acceptedCount,
      acceptanceRate: totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 100,
      totalSolved,
      solvedByTrack: byTrack,
      recentSubmissions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Python Process Runner
app.post('/api/execute', (req, res) => {
  const { code, problemId } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const startTime = Date.now();
  const py = spawn('python', ['-c', code]);

  let stdout = '';
  let stderr = '';
  let isDone = false;

  const timer = setTimeout(() => {
    if (!isDone) {
      isDone = true;
      py.kill('SIGKILL');
      res.json({
        success: false,
        stdout,
        stderr: 'Execution timed out (5s limit exceeded)',
        durationMs: Date.now() - startTime
      });
    }
  }, 5000);

  py.stdout.on('data', (d) => { stdout += d.toString(); });
  py.stderr.on('data', (d) => { stderr += d.toString(); });

  py.on('close', (exitCode) => {
    if (!isDone) {
      isDone = true;
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;

      try {
        db.prepare('INSERT INTO execution_runs (problem_id, code, stdout, stderr, duration_ms) VALUES (?, ?, ?, ?, ?)')
          .run(problemId || '', code, stdout, stderr, durationMs);
      } catch (e) {
        console.error('Run log error:', e);
      }

      res.json({
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode,
        durationMs
      });
    }
  });

  py.on('error', (err) => {
    if (!isDone) {
      isDone = true;
      clearTimeout(timer);
      res.json({
        success: false,
        stdout,
        stderr: err.message,
        durationMs: Date.now() - startTime
      });
    }
  });
});

// 10. Serve built static frontend & SPA fallback
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // In dev mode if dist is absent, redirect to Vite dev server
      res.redirect('http://localhost:5173' + req.url);
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 NexusEngine Backend Server Online!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📄 PDF Proxy: http://localhost:${PORT}/api/pdf-proxy?url=...`);
  console.log(`🗄️ Database: SQLite (server/platform.db)`);
  console.log(`====================================================`);
});
