import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

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


app.listen(PORT, () => {
    console.log(`The Accordion Backend is playing on http://localhost:${PORT}`);
    console.log(`Serving projects from: ${PROJECTS_ROOT}`);
});
