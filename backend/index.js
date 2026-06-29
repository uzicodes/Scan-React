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

        console.log(`[2/3] Running react-doctor analysis...`);
        
        let rawOutput = "";
        try {
            // Run the tool. If the code is perfectly clean, it exits normally.
            const { stdout } = await execPromise(`npx react-doctor --json`, { cwd: targetDir });
            rawOutput = stdout;
        } catch (linterError) {
            // If react-doctor finds errors, it exits with an error code. 
            // We capture the output here because finding errors is the goal!
            rawOutput = linterError.stdout;
        }

        console.log(`[3/3] Analysis complete. Wiping temp directory...`);
        // Native Windows/Node method to safely delete the folder
        await fs.promises.rm(targetDir, { recursive: true, force: true });

        // Parse the results. If the tool fails to output JSON for some reason, fallback safely.
        let parsedData;
        try {
            parsedData = JSON.parse(rawOutput);
        } catch (parseError) {
            console.log("Warning: Could not parse JSON. Returning raw text.");
            parsedData = { rawText: rawOutput };
        }

        console.log(`--- SCAN COMPLETE ---\n`);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ScanReact Backend running natively on http://localhost:${PORT}`));