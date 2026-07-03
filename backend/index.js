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

        // ── Parse verbose output line-by-line ──
        const parsedData = parseVerboseOutput(rawOutput);

        console.log(`--- SCAN COMPLETE (score: ${parsedData.score}) ---\n`);
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
 * Expected patterns in the verbose terminal output:
 *   Score line:       "81 / 100 Needs work"  or  "95 / 100 Great"
 *   File header:      "src/components/App.tsx"
 *   Diagnostic line:  "  Line 42  warning  [bugs] Mutating a variable ..."
 *                     "  Line 42  error    [accessibility] Missing alt ..."
 *   Code context:     "    > 42 | const x = props.y; x.z = 1;"
 *   Solution line:    "  → Move the hook call to the top level of your component."
 */
function parseVerboseOutput(raw) {
    if (!raw || typeof raw !== 'string') {
        return { score: 0, diagnostics: [] };
    }

    const lines = raw.split('\n');
    let score = 0;
    const diagnostics = [];

    // Regex patterns
    const scoreRegex = /(\d{1,3})\s*\/\s*100/;
    const diagnosticRegex = /^\s*Line\s+(\d+)\s+(warning|error)\s+\[([^\]]+)\]\s+(.+)/i;
    const filePathRegex = /^([^\s].*\.(tsx?|jsx?|mjs|cjs))$/;
    const solutionRegex = /^\s*→\s*(.+)/;
    const contextRegex = /^\s*>?\s*\d+\s*\|/;

    let currentFile = '';
    let currentDiagnostic = null;
    let diagnosticCounter = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip empty lines
        if (!trimmed) continue;

        // 1. Extract score from "NN / 100" pattern
        const scoreMatch = trimmed.match(scoreRegex);
        if (scoreMatch && !currentDiagnostic) {
            score = parseInt(scoreMatch[1], 10);
            continue;
        }

        // 2. Detect file path headers (e.g. "src/components/App.tsx")
        const fileMatch = trimmed.match(filePathRegex);
        if (fileMatch) {
            // Flush any in-progress diagnostic before switching files
            if (currentDiagnostic) {
                diagnostics.push(currentDiagnostic);
                currentDiagnostic = null;
            }
            currentFile = fileMatch[1];
            continue;
        }

        // 3. Detect diagnostic lines: "Line 42  warning  [bugs] Some message"
        const diagMatch = line.match(diagnosticRegex);
        if (diagMatch) {
            // Flush previous diagnostic
            if (currentDiagnostic) {
                diagnostics.push(currentDiagnostic);
            }
            diagnosticCounter++;
            currentDiagnostic = {
                id: `diag-${diagnosticCounter}`,
                file: currentFile,
                line: parseInt(diagMatch[1], 10),
                severity: diagMatch[2].toLowerCase(),
                category: diagMatch[3].trim().toLowerCase(),
                message: diagMatch[4].trim(),
                context: '',
                solution: '',
            };
            continue;
        }

        // 4. Capture solution lines starting with →
        const solMatch = line.match(solutionRegex);
        if (solMatch && currentDiagnostic) {
            currentDiagnostic.solution = currentDiagnostic.solution
                ? currentDiagnostic.solution + ' ' + solMatch[1].trim()
                : solMatch[1].trim();
            continue;
        }

        // 5. Capture code context lines (lines with "> NN |" or "  NN |")
        if (contextRegex.test(line) && currentDiagnostic) {
            currentDiagnostic.context = currentDiagnostic.context
                ? currentDiagnostic.context + '\n' + line
                : line;
            continue;
        }
    }

    // Flush the last diagnostic if still pending
    if (currentDiagnostic) {
        diagnostics.push(currentDiagnostic);
    }

    // Fallback: if we got nothing useful, return raw text for debugging
    if (diagnostics.length === 0 && score === 0) {
        console.log("Warning: Verbose parser yielded no diagnostics. Returning raw text.");
        return { score: 0, diagnostics: [], rawText: raw };
    }

    return { score, diagnostics };
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ScanReact Backend running natively on http://localhost:${PORT}`));