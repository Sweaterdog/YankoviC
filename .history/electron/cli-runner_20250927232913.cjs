const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

console.log('[TRACE] cli-runner.cjs: Script started.');

let server;
let serverPort;

function startLocalServer() {
    return new Promise((resolve, reject) => {
        console.log('[TRACE] startLocalServer: Starting...');
        const distPath = path.join(__dirname, '..', 'frontend', 'dist');
        
        server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url);
            let pathname = path.join(distPath, parsedUrl.pathname);
            
            if (!pathname.startsWith(distPath)) {
                res.writeHead(403);
                res.end('Forbidden');
                return;
            }
            
            if (fs.statSync(pathname).isDirectory()) {
                pathname = path.join(pathname, 'index.html');
            }
            
            fs.readFile(pathname, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not found');
                    return;
                }
                
                const ext = path.extname(pathname);
                const contentType = {
                    '.js': 'application/javascript',
                    '.html': 'text/html',
                    '.css': 'text/css',
                }[ext] || 'text/plain';
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        });
        
        server.listen(0, 'localhost', () => {
            serverPort = server.address().port;
            console.log(`[TRACE] startLocalServer: Server started on http://localhost:${serverPort}`);
            resolve(serverPort);
        });
        
        server.on('error', reject);
    });
}

function createWindow() {
    console.log('[TRACE] createWindow: Function started.');
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'YankoviC Application',
        webPreferences: {
            preload: path.join(__dirname, 'cli-preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'cli-runner.html'));

    mainWindow.on('close', () => {
        console.log('[TRACE] createWindow: mainWindow is closing.');
    });

    mainWindow.webContents.on('did-finish-load', async () => {
        console.log('[TRACE] did-finish-load: Event triggered.');
        const code = process.env.YANKOVIC_CLI_CODE;
        console.log(`[TRACE] did-finish-load: YANKOVIC_CLI_CODE length is ${code ? code.length : 'undefined'}.`);
        
        try {
            await startLocalServer();
            const rendererURL = `http://localhost:${serverPort}/assets/cli-renderer.js`;
            
            if (code) {
                console.log('[TRACE] did-finish-load: Sending "run-code" IPC to renderer.');
                mainWindow.webContents.send('run-code', { code, rendererURL });
            } else {
                console.error('[TRACE] did-finish-load: ERROR - No code found in environment variable. Quitting.');
                app.quit(1);
            }
        } catch (error) {
            console.error('[TRACE] did-finish-load: ERROR - Failed to start local server. Quitting.', error);
            app.quit(1);
        }
    });

    ipcMain.handle('cli-set-window', (event, { width, height, title }) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            if (width && height) win.setSize(width, height, true);
            if (title) win.setTitle(title);
        }
    });
}

ipcMain.on('fatal-error', (event, { message, stack }) => {
    console.log('[TRACE] ipcMain: "fatal-error" event received.');
    console.error(`
/================================================================\\
|              💥 FATAL WORD CRIME IN UHF  WINDOW 💥              |
\\================================================================/
`);
    console.error(message);
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window && !window.isDestroyed()) {
        window.close();
    }
    app.quit(1); 
});

ipcMain.on('program-finished', () => {
    console.log('[TRACE] ipcMain: "program-finished" event received.');
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.close();
    }
    app.quit(0);
});

app.whenReady().then(() => {
    console.log('[TRACE] app.whenReady: App is ready, calling createWindow.');
    createWindow();
});

app.on('window-all-closed', () => {
    console.log('[TRACE] app: window-all-closed event.');
    if (server) {
        server.close();
    }
    app.quit();
});