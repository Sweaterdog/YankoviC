const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

let uhfWindow = null;
let gameLoopInterval = null;
let uiState = { mouse: {}, keys: {}, buttons: {}, textBoxes: {}, checkboxes: {}, sliders: {} };

let server;
let serverPort;

function startLocalServer() {
    return new Promise((resolve, reject) => {
        const distPath = path.join(__dirname, '..', 'frontend', 'dist');
        
        server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url);
            let pathname = path.join(distPath, parsedUrl.pathname);
            
            // Security check to prevent directory traversal
            if (!pathname.startsWith(distPath)) {
                res.writeHead(403);
                res.end('Forbidden');
                return;
            }
            
            // If it's a directory, serve index.html
            if (fs.statSync(pathname).isDirectory()) {
                pathname = path.join(pathname, 'index.html');
            }
            
            fs.readFile(pathname, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not found');
                    return;
                }
                
                // Set appropriate content type
                const ext = path.extname(pathname);
                const contentType = {
                    '.js': 'application/javascript',
                    '.html': 'text/html',
                    '.css': 'text/css',
                    '.json': 'application/json'
                }[ext] || 'text/plain';
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        });
        
        server.listen(0, 'localhost', () => {
            serverPort = server.address().port;
            console.log(`[CLI-RUNNER] Local server started on http://localhost:${serverPort}`);
            resolve(serverPort);
        });
        
        server.on('error', reject);
    });
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800, // Default width
        height: 600, // Default height
        title: 'YankoviC Application',
        webPreferences: {
            preload: path.join(__dirname, 'cli-preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Load the dedicated HTML file for the CLI runner
    mainWindow.loadFile(path.join(__dirname, 'cli-runner.html'));

    // Prevent window from closing immediately
    mainWindow.on('close', (event) => {
        console.log('[CLI-RUNNER] Window attempting to close');
        // Uncomment the next line to prevent closing for debugging
        // event.preventDefault();
    });

    // Once the window is ready, get the code and serve the renderer via HTTP
    mainWindow.webContents.on('did-finish-load', async () => {
        const code = process.env.YANKOVIC_CLI_CODE;
        
        try {
            // Start local server to serve the dist files
            await startLocalServer();
            
            // The renderer URL is now served via HTTP
            const rendererURL = `http://localhost:${serverPort}/assets/cli-renderer.js`;
            
            console.log('[CLI-RUNNER] Sending code and renderer URL:', {
                codeLength: code ? code.length : 0,
                rendererURL
            });
            
            if (code) {
                // Send both the code to run and the HTTP URL to the script
                mainWindow.webContents.send('run-code', { code, rendererURL });
            } else {
                console.error('[CLI-RUNNER] No code found in environment variable YANKOVIC_CLI_CODE');
                app.quit();
            }
        } catch (error) {
            console.error('[CLI-RUNNER] Failed to start local server:', error);
            app.quit();
        }
    });

    // IPC to allow renderer to change window properties
    ipcMain.handle('cli-set-window', (event, { width, height, title }) => {
        if (width && height) mainWindow.setSize(width, height, true);
        if (title) mainWindow.setTitle(title);
    });
}

// --- UHF IPC Handlers (copied from main.cjs) ---

ipcMain.handle('UHF:start_the_show', (event, { width, height, title }) => {
  console.log('[CLI Runner] UHF:start_the_show called with:', { width, height, title });
  if (uhfWindow) { 
    console.log('[CLI Runner] Closing existing UHF window');
    uhfWindow.close(); 
  }
  
  console.log('[CLI Runner] Creating new UHF window');
  uhfWindow = new BrowserWindow({
    width, height, title,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  console.log('[CLI Runner] Loading UHF window HTML');
  uhfWindow.loadFile(path.join(__dirname, 'uhfWindow.html'));
  
  uhfWindow.on('closed', () => { uhfWindow = null; });
  
  return 27; // Success
});

ipcMain.handle('UHF:start_game_loop', (event, fps) => {
  console.log('[CLI Runner] Starting game loop at', fps, 'FPS');
  if (gameLoopInterval) clearInterval(gameLoopInterval);
  
  gameLoopInterval = setInterval(() => {
    if (uhfWindow) {
      uhfWindow.webContents.send('UHF:run_frame');
    }
  }, 1000 / (fps || 60));
  
  return 27;
});

ipcMain.handle('UHF:cancel_the_show', () => {
  console.log('[CLI Runner] Canceling the show');
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
  if (uhfWindow) {
    uhfWindow.close();
    uhfWindow = null;
  }
  return 27;
});

ipcMain.handle('UHF:execute_draw_buffer', (event, buffer) => {
  console.log('[CLI Runner] Executing draw buffer with', buffer.length, 'commands');
  if (uhfWindow) {
    uhfWindow.webContents.send('UHF:draw-on-canvas', buffer);
  }
  return 27;
});

ipcMain.handle('UHF:is_the_show_over', () => {
  return uhfWindow === null;
});

ipcMain.on('UHF:ui-state', (event, newUiState) => {
  uiState = { ...uiState, ...newUiState };
});

ipcMain.handle('UHF:get_ui_state', () => {
  return uiState;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (server) {
        server.close();
    }
    app.quit();
});