import https from 'https';
import fs from 'fs';

const SUPABASE_URL = 'https://dlgbfogajthnojooqumo.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZ2Jmb2dhanRobm9qb29xdW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDg1MjYsImV4cCI6MjA4MTM4NDUyNn0.rat1xTAfEGSWbbCP6EYwx7jSzu2qv5-fGJbBz-gvVgk';

function httpGet(urlStr, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0', ...headers }
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function getTracksRegistry() {
    console.log("Fetching track structure from mlplayground.in...");
    const indexJs = await httpGet('https://mlplayground.in/assets/index-BHyWUnS5.js');
    const regChunkMatch = indexJs.match(/assets\/registry-[a-zA-Z0-9_\-]+\.js/);
    if (!regChunkMatch) throw new Error("Could not find registry chunk");
    
    const regJs = await httpGet(`https://mlplayground.in/${regChunkMatch[0]}`);
    fs.writeFileSync('.temp_registry.mjs', regJs, 'utf8');
    const mod = await import('./.temp_registry.mjs');
    fs.unlinkSync('.temp_registry.mjs');
    return mod.g();
}

async function fetchAllStations() {
    console.log("Fetching all 372 questions from Supabase...");
    const raw = await httpGet(`${SUPABASE_URL}/rest/v1/journey_stations?select=*&limit=500`, {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
    });
    return JSON.parse(raw);
}

async function main() {
    const [tracks, stations] = await Promise.all([getTracksRegistry(), fetchAllStations()]);
    console.log(`Retrieved ${tracks.length} tracks and ${stations.length} total stations.`);

    const stationMap = new Map(stations.map(s => [s.slug, s]));
    const structuredOutput = [];
    let matchedCount = 0;

    for (const track of tracks) {
        const trackObj = {
            trackSlug: track.slug,
            trackTitle: track.title,
            trackName: track.name,
            totalChapters: track.chapters?.length || 0,
            chapters: []
        };

        for (const ch of track.chapters || []) {
            const chapterObj = {
                chapterSlug: ch.slug || ch.id,
                chapterTitle: ch.title,
                chapterSubtitle: ch.subtitle || '',
                questions: []
            };

            for (const item of (ch.stations || [])) {
                const dbStation = stationMap.get(item.slug);
                if (dbStation) {
                    matchedCount++;
                    chapterObj.questions.push({
                        id: dbStation.id,
                        slug: item.slug,
                        title: dbStation.title || item.name,
                        difficulty: dbStation.difficulty || item.difficulty,
                        tagline: item.tagline || dbStation.briefing_data?.tagline || '',
                        kind: item.kind || dbStation.kind,
                        mins: item.mins,
                        xp: dbStation.xp_reward || item.xp,
                        question_description: dbStation.description || '',
                        objective: dbStation.briefing_data?.objective || '',
                        starter_code: dbStation.starter_code || '',
                        hints: dbStation.hints || [],
                        test_cases_count: dbStation.test_cases?.length || 0
                    });
                }
            }
            trackObj.chapters.push(chapterObj);
        }
        structuredOutput.push(trackObj);
    }

    console.log(`Matched ${matchedCount} / ${stations.length} questions.`);

    // 1. JSON
    fs.writeFileSync('all_journey_questions.json', JSON.stringify(structuredOutput, null, 2), 'utf8');

    // 2. Markdown
    let md = `# ML Playground - Complete Journey Questions Bank\n\n`;
    md += `Total Questions: **${matchedCount}** across **${tracks.length}** Tracks\n\n`;
    md += `Source: [mlplayground.in/journey](https://mlplayground.in/journey)\n\n`;
    md += `## Table of Contents\n\n`;

    for (const track of structuredOutput) {
        md += `- [${track.trackTitle}](#${track.trackSlug})\n`;
        for (const ch of track.chapters) {
            md += `  - [${ch.chapterTitle}](#${ch.chapterSlug}) (${ch.questions.length} questions)\n`;
        }
    }
    md += `\n---\n\n`;

    for (const track of structuredOutput) {
        md += `<a id="${track.trackSlug}"></a>\n\n# Track: ${track.trackTitle}\n\n`;
        for (const ch of track.chapters) {
            md += `<a id="${ch.chapterSlug}"></a>\n\n## Category: ${track.trackTitle} > ${ch.chapterTitle}\n`;
            if (ch.chapterSubtitle) {
                md += `*${ch.chapterSubtitle}*\n\n`;
            }
            for (let i = 0; i < ch.questions.length; i++) {
                const q = ch.questions[i];
                md += `### ${i + 1}. ${q.title} \`[${q.difficulty.toUpperCase()}]\`\n\n`;
                md += `**Category:** ${track.trackTitle} > ${ch.chapterTitle}  \n`;
                md += `**Direct URL:** https://mlplayground.in/journey/${track.trackSlug}/${q.slug}  \n`;
                if (q.tagline) md += `**Tagline:** ${q.tagline}  \n`;
                if (q.objective) md += `**Objective:** ${q.objective}  \n`;
                md += `\n**Question / Problem Statement:**\n\n${q.question_description}\n\n`;
                if (q.starter_code) {
                    md += `**Starter Code:**\n\`\`\`python\n${q.starter_code.trim()}\n\`\`\`\n\n`;
                }
                md += `---\n\n`;
            }
        }
    }
    fs.writeFileSync('all_journey_questions.md', md, 'utf8');

    // 3. CSV
    let csv = `Track,Category_Chapter,Question_Number,Title,Difficulty,Slug,URL\n`;
    for (const track of structuredOutput) {
        for (const ch of track.chapters) {
            for (let i = 0; i < ch.questions.length; i++) {
                const q = ch.questions[i];
                const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;
                csv += `${escapeCsv(track.trackTitle)},${escapeCsv(ch.chapterTitle)},${i+1},${escapeCsv(q.title)},${escapeCsv(q.difficulty)},${escapeCsv(q.slug)},https://mlplayground.in/journey/${track.trackSlug}/${q.slug}\n`;
            }
        }
    }
    fs.writeFileSync('all_journey_questions.csv', csv, 'utf8');

    console.log("Extraction complete!");
}

main().catch(console.error);
