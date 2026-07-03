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

        console.log(`[2/3] Running react-doctor --verbose analysis...`);

        let rawOutput = "";
        try {
            // Run the tool in verbose mode for score + solutions
            const { stdout } = await execPromise(`npx react-doctor@latest --verbose`, { cwd: targetDir });
            rawOutput = stdout;
        } catch (linterError) {
            // If react-doctor finds errors, it exits with a non-zero code.
            // We capture the output here because finding errors is the goal!
            rawOutput = linterError.stdout || "";
        }

        console.log(`[3/3] Analysis complete. Wiping temp directory...`);
        // Native Windows/Node method to safely delete the folder
        await fs.promises.rm(targetDir, { recursive: true, force: true });

        // ── Parse verbose output ──
        const parsedData = parseVerboseOutput(rawOutput);

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
 * Parse the raw verbose output from react-doctor into structured data.
 *
 * Actual react-doctor --verbose output format (v0.6.x):
 *
 *   ⚠ Bugs: useSearchParams without Suspense
 *     Learn more: https://react.doctor/docs/rules/...
 *     <ClientPage> uses useSearchParams() outside <Suspense>, so
 *     this page falls back to client-side rendering.
 *     → Wrap the component using `useSearchParams` in
 *     `<Suspense>` so the rest of the page can stay statically
 *     rendered.
 *
 *     app/login/page.tsx:16
 *
 *   ────────────────────────────────────────────────────────────
 *   All 6 issues
 *   Bugs › 1 warning
 *   ...
 *   ┌─────┐  81 / 100 Needs work
 *   │ ◠ ◠ │  ████████████████████░░░░░░░░░
 *   │  ▽  │  React Doctor (https://react.doctor)
 */
function parseVerboseOutput(raw) {
    if (!raw || typeof raw !== 'string') {
        return { score: 0, diagnostics: [] };
    }

    // Strip ANSI escape codes (color, bold, etc.)
    const clean = raw.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
    const lines = clean.split('\n');

    let score = 0;
    const groups = [];
    let current = null;

    // Phase tracks where we are inside a diagnostic block:
    //   idle → header found → meta (learn more) → description → solution → files
    let phase = 'idle';
    let pastSeparator = false;

    // ── Regex patterns matching actual react-doctor verbose format ──
    // Header:  "  ⚠ Bugs: useSearchParams without Suspense"  or with "×2"
    const headerRe = /^\s*[⚠✖]\s+([^:]+?):\s*(.+?)(?:\s*×(\d+))?\s*$/;
    // Learn more URL
    const learnMoreRe = /^\s*Learn more:\s*(https?:\/\/\S+)/;
    // Solution start:  "    → Wrap the component..."
    const solutionRe = /^\s*→\s*(.+)/;
    // File location:   "    app/login/page.tsx:16"  or  "    src/actions/getNavData.ts"
    const fileLocRe = /^\s{4,}([\w@./-]+\.\w{1,10})(?::(\d+))?\s*$/;
    // Separator line:  "  ────────────────────────"
    const separatorRe = /^\s*[─━]{4,}/;
    // Score:  "81 / 100 Needs work"
    const scoreRe = /(\d{1,3})\s*\/\s*100/;

    for (const line of lines) {
        const trimmed = line.trim();

        // ── Separator ends all diagnostic blocks ──
        if (separatorRe.test(trimmed)) {
            if (current) {
                groups.push(current);
                current = null;
            }
            pastSeparator = true;
            phase = 'idle';
            continue;
        }

        // ── Score extraction (usually in the summary section after separator) ──
        if (scoreRe.test(trimmed)) {
            score = parseInt(trimmed.match(scoreRe)[1], 10);
            continue;
        }

        // Skip everything after the separator (summary lines, ASCII art, etc.)
        if (pastSeparator) continue;

        // ── New diagnostic group header ──
        const headerMatch = trimmed.match(headerRe);
        if (headerMatch) {
            // Flush any previous group
            if (current) groups.push(current);
            current = {
                severity: line.includes('✖') ? 'error' : 'warning',
                category: headerMatch[1].trim(),
                rule: headerMatch[2].trim(),
                count: headerMatch[3] ? parseInt(headerMatch[3], 10) : 1,
                learnMore: '',
                message: '',
                solution: '',
                files: [],
            };
            phase = 'meta';
            continue;
        }

        // Everything below requires an active group
        if (!current) continue;

        // ── Blank line handling ──
        if (!trimmed) {
            // After solution text, blank line transitions us to file-locations phase
            if (phase === 'solution') {
                phase = 'files';
            }
            continue;
        }

        // ── Learn more URL (appears right after header) ──
        if (phase === 'meta') {
            const lmMatch = trimmed.match(learnMoreRe);
            if (lmMatch) {
                current.learnMore = lmMatch[1];
                phase = 'description';
                continue;
            }
            // No "Learn more" line — fall through to description
            phase = 'description';
        }

        // ── Solution start (→ line) ──
        const solMatch = line.match(solutionRe);
        if (solMatch) {
            current.solution = solMatch[1].trim();
            phase = 'solution';
            continue;
        }

        // ── Solution continuation (indented lines after →) ──
        if (phase === 'solution') {
            current.solution += ' ' + trimmed;
            continue;
        }

        // ── File locations (after solution + blank line) ──
        if (phase === 'files') {
            const fileMatch = line.match(fileLocRe);
            if (fileMatch) {
                current.files.push({
                    file: fileMatch[1],
                    line: fileMatch[2] ? parseInt(fileMatch[2], 10) : 0,
                });
            }
            continue;
        }

        // ── Description text (multi-line, before → line) ──
        if (phase === 'description') {
            current.message += (current.message ? ' ' : '') + trimmed;
            continue;
        }
    }

    // Flush last group
    if (current) groups.push(current);

    // ── Build final diagnostics array (one entry per rule group) ──
    const diagnostics = groups.map((g, i) => ({
        id: `diag-${i + 1}`,
        severity: g.severity,
        category: g.category,
        rule: g.rule,
        count: g.count,
        message: g.message,
        solution: g.solution,
        learnMore: g.learnMore,
        files: g.files,
    }));

    // Fallback: if we got nothing useful, return raw text for debugging
    if (diagnostics.length === 0 && score === 0) {
        console.log("Warning: Verbose parser yielded no diagnostics. Returning raw text.");
        return { score: 0, diagnostics: [], rawText: raw };
    }

    return { score, diagnostics };
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ScanReact Backend running natively on http://localhost:${PORT}`));