import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase payload limit for files

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The root directory for projects is now a 'projects' folder next to the server.js file
const PROJECTS_ROOT = path.resolve(__dirname, 'projects'); 

fs.ensureDirSync(PROJECTS_ROOT);

// Helper function to recursively read directory structure
async function readDirectory(dirPath, projectRoot) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const structure = [];
    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(projectRoot, entryPath).replace(/\\/g, '/'); // Normalize slashes
        
        if (entry.isDirectory()) {
            structure.push({
                name: entry.name,
                type: 'folder',
                path: relativePath,
                children: await readDirectory(entryPath, projectRoot),
            });
        } else {
            structure.push({
                name: entry.name,
                type: 'file',
                path: relativePath,
            });
        }
    }
    return structure.sort((a,b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
}

// LIST FILES AND FOLDERS
app.get('/api/files', async (req, res) => {
    const projectName = req.query.project || 'default-project';
    const projectPath = path.join(PROJECTS_ROOT, projectName);
    try {
        await fs.ensureDir(projectPath);
        const structure = await readDirectory(projectPath, projectPath);
        res.json({ name: projectName, type: 'folder', children: structure });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read project directory.' });
    }
});

// GET FILE CONTENT
app.get('/api/file-content', async (req, res) => {
    const { project, file } = req.query;
    const filePath = path.join(PROJECTS_ROOT, project, file);
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        res.json({ content });
    } catch (error) {
        console.error('[API] 404 File not found:', filePath, '| Project:', project, '| File param:', file);
        res.status(404).json({ error: 'File not found.' });
    }
});

// SAVE FILE CONTENT
app.post('/api/save-file', async (req, res) => {
    const { project, file, content } = req.body;
    const filePath = path.join(PROJECTS_ROOT, project, file);
    try {
        await fs.outputFile(filePath, content);
        res.json({ success: true, message: `File saved: ${file}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save file.' });
    }
});

// CREATE FOLDER
app.post('/api/create-folder', async (req, res) => {
    const { project, path: newPath } = req.body;
    const folderPath = path.join(PROJECTS_ROOT, project, newPath);
    try {
        await fs.ensureDir(folderPath);
        res.json({ success: true, message: `Folder created: ${newPath}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create folder.' });
    }
});

// CREATE FILE
app.post('/api/create-file', async (req, res) => {
    const { project, path: newPath } = req.body;
    const defaultContent = `// New file: ${path.basename(newPath)}\n\nspatula want_a_new_duck() {\n    twinkie_wiener_sandwich 27;\n}`;
    const filePath = path.join(PROJECTS_ROOT, project, newPath);
    try {
        await fs.outputFile(filePath, defaultContent);
        res.json({ success: true, message: `File created: ${newPath}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create file.' });
    }
});

// DELETE FILE
app.delete('/api/delete-file', async (req, res) => {
    const { project, file } = req.body;
    if (!project || !file) {
        return res.status(400).json({ error: 'Missing project or file parameter.' });
    }
    const filePath = path.join(PROJECTS_ROOT, project, file);
    try {
        await fs.remove(filePath);
        res.json({ success: true, message: `File deleted: ${file}` });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Failed to delete file.', details: error.message });
    }
});

// DELETE FOLDER
app.delete('/api/delete-folder', async (req, res) => {
    const { project, folder } = req.body;
    if (!project || !folder) {
        return res.status(400).json({ error: 'Missing project or folder parameter.' });
    }
    const folderPath = path.join(PROJECTS_ROOT, project, folder);
    try {
        await fs.remove(folderPath);
        res.json({ success: true, message: `Folder deleted: ${folder}` });
    } catch (error) {
        console.error('Delete folder error:', error);
        res.status(500).json({ error: 'Failed to delete folder.', details: error.message });
    }
});

// --- Run Terminal Command (DEV ONLY) ---
// Persistent cwd per session
const sessionCwds = {};
const DEFAULT_CWD = PROJECTS_ROOT;
function getSessionId(req) {
    // Try header, body, or generate new
    return req.body.sessionId || req.headers['x-session-id'] || null;
}
function generateSessionId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

app.post('/api/exec', async (req, res) => {
    let { command, sessionId } = req.body;
    if (!command || typeof command !== 'string') {
        return res.status(400).json({ error: 'No command provided.' });
    }
    // Only allow in dev mode for safety
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Terminal command execution is disabled in production.' });
    }
    // Basic validation: disallow some dangerous commands
    const forbidden = ['rm ', 'shutdown', 'reboot', 'init ', 'halt', 'mkfs', 'dd ', '>:'];
    if (forbidden.some(f => command.includes(f))) {
        return res.status(403).json({ error: 'Forbidden command.' });
    }
    // Session ID logic
    if (!sessionId) {
        sessionId = generateSessionId();
    }
    if (!sessionCwds[sessionId]) {
        sessionCwds[sessionId] = DEFAULT_CWD;
    }
    let cwd = sessionCwds[sessionId];
    // Handle 'cd' commands
    const cdMatch = command.match(/^\s*cd\s+(.+)$/);
    if (cdMatch) {
        let newPath = cdMatch[1].trim();
        // Remove surrounding quotes if present
        if ((newPath.startsWith('"') && newPath.endsWith('"')) || (newPath.startsWith("'") && newPath.endsWith("'"))) {
            newPath = newPath.slice(1, -1);
        }
        if (!path.isAbsolute(newPath)) {
            newPath = path.resolve(cwd, newPath);
        }
        if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
            sessionCwds[sessionId] = newPath;
            cwd = newPath;
            return res.json({ stdout: '', stderr: '', cwd, sessionId });
        } else {
            return res.json({ stdout: '', stderr: `cd: no such directory: ${cdMatch[1]}`, cwd, sessionId });
        }
    }
    // Handle 'cd ... && ...' or other commands
    // If command starts with 'cd ... &&', update cwd before running rest
    const cdAndCmd = command.match(/^\s*cd\s+([^&]+)\s*&&\s*(.+)$/);
    if (cdAndCmd) {
        let newPath = cdAndCmd[1].trim();
        // Remove surrounding quotes if present
        if ((newPath.startsWith('"') && newPath.endsWith('"')) || (newPath.startsWith("'") && newPath.endsWith("'"))) {
            newPath = newPath.slice(1, -1);
        }
        let restCmd = cdAndCmd[2];
        if (!path.isAbsolute(newPath)) {
            newPath = path.resolve(cwd, newPath);
        }
        if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
            sessionCwds[sessionId] = newPath;
            cwd = newPath;
            command = restCmd;
        } else {
            return res.json({ stdout: '', stderr: `cd: no such directory: ${cdAndCmd[1]}`, cwd, sessionId });
        }
    }
    exec(command, { cwd, timeout: 10000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
            return res.json({ stdout, stderr: stderr + (err.message ? ('\n' + err.message) : ''), cwd, sessionId });
        }
        res.json({ stdout, stderr, cwd, sessionId });
    });
});

app.listen(PORT, () => {
    console.log(`The Accordion Backend is playing on http://localhost:${PORT}`);
    console.log(`Serving projects from: ${PROJECTS_ROOT}`);
});
