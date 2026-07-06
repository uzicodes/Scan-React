const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');

const execPromise = util.promisify(exec);
const app = express();

app.use(cors());
app.use(express.json());

// A simple health check route
app.get('/', (req, res) => {
    res.json({ status: 'ScanReact Execution Engine is online' });
});

app.post('/api/scan', async (req, res) => {
    const { githubUrl } = req.body;

    if (!githubUrl || !githubUrl.includes('github.com')) {
        return res.status(400).json({ error: 'Please provide a valid public GitHub URL.' });
    }

    // --- 1. GitHub API Size Gate (Pre-flight Check) ---
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/i);
    if (!match) {
        return res.status(400).json({ error: 'Please provide a valid public GitHub repository URL.' });
    }
    const owner = match[1];
    const repo = match[2].replace(/\.git$/i, '');

    try {
        console.log(`[Pre-flight Check] Checking repository size for ${owner}/${repo}...`);
        const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'User-Agent': 'ScanReact-Execution-Engine',
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (apiRes.ok) {
            const repoData = await apiRes.json();
            console.log(`[Pre-flight Check] Repository size: ${repoData.size} KB (~${(repoData.size / 1024).toFixed(2)} MB)`);
            if (repoData.size > 50000) {
                console.log(`[Pre-flight Check] Aborted: Repository size (${repoData.size} KB) exceeds 50,000 KB limit.`);
                return res.status(400).json({ error: 'Repository is too large for the free-tier analysis engine (Max 50MB).' });
            }
        } else {
            console.warn(`[Pre-flight Check] GitHub API returned status ${apiRes.status}. Proceeding with clone...`);
        }
    } catch (apiError) {
        console.warn(`[Pre-flight Check] Failed to query GitHub API (${apiError.message}). Proceeding with clone...`);
    }

    // Create a dedicated temp-scans folder inside the backend directory
    const tempScansDir = path.join(__dirname, 'temp-scans');
    if (!fs.existsSync(tempScansDir)) {
        fs.mkdirSync(tempScansDir);
    }

    const uniqueId = Date.now();
    const targetDir = path.join(tempScansDir, `scan-${uniqueId}`);

    try {
        console.log(`\n--- NEW SCAN INITIATED ---`);
        console.log(`[1/3] Cloning ${githubUrl} into Windows file system...`);
        // --depth 1 ensures we only download the latest code, saving massive time
        await execPromise(`git clone --depth 1 ${githubUrl} "${targetDir}"`);

        console.log(`[2/3] Running react-doctor programmatic analysis via native API...`);
        const { diagnose } = await import('react-doctor/api');

        let diagnoseResult = null;
        try {
            diagnoseResult = await diagnose(targetDir, { verbose: true });
        } catch (linterError) {
            // If react-doctor throws an error object containing diagnostics/result
            if (linterError.diagnostics || linterError.result) {
                diagnoseResult = linterError.result || linterError;
            } else {
                throw linterError;
            }
        }

        // ── Map API result to frontend schema ──
        const parsedData = formatDiagnoseResult(diagnoseResult, targetDir);

        console.log(`[3/3] Analysis complete. Wiping temp directory...`);
        // Native Windows/Node method to safely delete the folder
        await fs.promises.rm(targetDir, { recursive: true, force: true });

        console.log(`--- SCAN COMPLETE (score: ${parsedData.score}, issues: ${parsedData.diagnostics.length}) ---\n`);
        return res.json({ success: true, data: parsedData });

    } catch (error) {
        console.error('Critical Engine Failure:', error);

        // Emergency cleanup: if something breaks halfway, ensure the folder is deleted
        if (fs.existsSync(targetDir)) {
            try {
                await fs.promises.rm(targetDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Emergency cleanup failed:', cleanupError);
            }
        }

        return res.status(500).json({
            error: 'The engine failed to process this repository.',
            details: error.message
        });
    }
});

/**
 * Map the structured result from react-doctor's native diagnose() API
 * directly into our frontend JSON response schema.
 */
function formatDiagnoseResult(result, targetDir) {
    if (!result || typeof result !== 'object') {
        return { score: 100, diagnostics: [] };
    }

    const rawDiagnostics = Array.isArray(result.diagnostics) ? result.diagnostics : [];

    // Group diagnostics by rule to maintain clean frontend scorecard structure
    const ruleGroups = new Map();

    for (const d of rawDiagnostics) {
        const ruleKey = d.rule || d.title || 'general';
        
        // Clean up file path to be relative to the repository root and use forward slashes
        let fileRel = 'unknown';
        if (d.filePath) {
            fileRel = path.isAbsolute(d.filePath)
                ? path.relative(targetDir, d.filePath)
                : d.filePath;
            fileRel = fileRel.replace(/\\/g, '/');
        }

        const fileLoc = {
            file: fileRel,
            line: typeof d.line === 'number' ? d.line : 0
        };

        if (!ruleGroups.has(ruleKey)) {
            ruleGroups.set(ruleKey, {
                severity: (d.severity === 'error' || d.severity === 'warning') ? d.severity : 'warning',
                category: d.category || 'General',
                rule: d.title || d.rule || 'React Best Practices',
                count: 1,
                message: d.message || 'Potential improvement identified in code structure.',
                solution: d.help || '',
                learnMore: d.url || '',
                files: [fileLoc]
            });
        } else {
            const group = ruleGroups.get(ruleKey);
            group.count += 1;
            // Avoid duplicate file+line combinations in the affected files list
            if (!group.files.some(f => f.file === fileLoc.file && f.line === fileLoc.line)) {
                group.files.push(fileLoc);
            }
        }
    }

    const diagnostics = Array.from(ruleGroups.values()).map((g, i) => ({
        id: `diag-${i + 1}`,
        ...g
    }));

    // Extract score number from result
    let score = null;
    if (result.score && typeof result.score.score === 'number') {
        score = result.score.score;
    } else if (typeof result.score === 'number') {
        score = result.score;
    }

    // ── Resilient Score Fallback Logic ──
    if (score === null || isNaN(score)) {
        score = diagnostics.length === 0 ? 100 : 0;
    } else if (diagnostics.length === 0 && score === 0) {
        score = 100;
    }

    return { score, diagnostics };
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ScanReact Backend running natively on http://localhost:${PORT}`));