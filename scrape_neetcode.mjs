/**
 * Standalone Scraper for NeetCode DSA & System Design Question Banks
 * Run: node scrape_neetcode.mjs
 */
import https from 'https';
import fs from 'fs';

function httpGet(urlStr) {
    return new Promise((resolve, reject) => {
        https.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function callFirebase(functionName, payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ data: payload });
        const options = {
            hostname: 'us-central1-neetcode-dd170.cloudfunctions.net',
            path: `/${functionName}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'User-Agent': 'Mozilla/5.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    resolve(data);
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function extractDSA() {
    console.log("Fetching NeetCode main bundle for DSA problems...");
    const html = await httpGet('https://neetcode.io/practice');
    const mainScriptMatch = html.match(/src=["'](main\.[a-f0-9]+\.js)["']/);
    if (!mainScriptMatch) throw new Error("Could not find main bundle");

    const mainCode = await httpGet(`https://neetcode.io/${mainScriptMatch[1]}`);
    const arrayStart = mainCode.indexOf('j=[{problem:');
    if (arrayStart === -1) throw new Error("Could not find problem array in main bundle");

    let depth = 0, arrayEnd = -1, inString = false, quoteChar = '', isEscape = false;
    for (let i = arrayStart + 2; i < mainCode.length; i++) {
        const char = mainCode[i];
        if (inString) {
            if (isEscape) isEscape = false;
            else if (char === '\\') isEscape = true;
            else if (char === quoteChar) inString = false;
        } else {
            if (char === '"' || char === "'") { inString = true; quoteChar = char; }
            else if (char === '[') depth++;
            else if (char === ']') {
                depth--;
                if (depth === 0) { arrayEnd = i; break; }
            }
        }
    }

    const arrayContent = mainCode.substring(arrayStart + 2, arrayEnd + 1);
    fs.writeFileSync('.temp_dsa.mjs', `export const problems = ${arrayContent};`);
    const { problems } = await import('./.temp_dsa.mjs');
    fs.unlinkSync('.temp_dsa.mjs');

    console.log(`Extracted ${problems.length} DSA problems.`);
    return problems;
}

async function extractSystemDesign() {
    console.log("Fetching System Design course details from NeetCode API...");
    const courses = [
        'system-design-interview',
        'ood-interview',
        'design-patterns',
        'system-design-for-beginners'
    ];

    const results = [];
    for (const c of courses) {
        const res = await callFirebase('callableFunctionHttp', {
            functionId: 'getCourseDetails',
            courseId: c
        });
        if (res.data) {
            results.push({
                courseId: c,
                courseName: res.data.name,
                sections: res.data.sections || []
            });
        }
    }
    return results;
}

async function main() {
    const [problems, sysdesCourses] = await Promise.all([extractDSA(), extractSystemDesign()]);

    // 1. Save DSA
    const dsaCategories = {};
    for (const p of problems) {
        const cat = p.pattern || 'Uncategorized';
        if (!dsaCategories[cat]) dsaCategories[cat] = [];
        dsaCategories[cat].push({
            title: p.problem,
            category: cat,
            difficulty: p.difficulty,
            neetcode150: !!p.neetcode150,
            blind75: !!p.blind75,
            neetcode250: !!p.neetcode250,
            isPro: !!p.pro,
            neetcodeUrl: p.ncLink ? `https://neetcode.io/problems/${p.ncLink.replace(/\/$/, '')}` : null,
            leetcodeUrl: p.link ? `https://leetcode.com/problems/${p.link.replace(/\/$/, '')}` : null,
            youtubeSolution: p.video ? `https://www.youtube.com/watch?v=${p.video}` : null
        });
    }

    fs.writeFileSync('neetcode_dsa_questions.json', JSON.stringify({
        totalProblems: problems.length,
        categories: dsaCategories
    }, null, 2), 'utf8');

    // 2. Save System Design
    fs.writeFileSync('neetcode_system_design.json', JSON.stringify(sysdesCourses, null, 2), 'utf8');
    console.log("NeetCode extraction complete!");
}

main().catch(console.error);
