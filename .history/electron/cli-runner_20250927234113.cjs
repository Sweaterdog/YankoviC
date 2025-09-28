const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

let server;
let serverPort;

function startLocalServer() {
    return new Promise((resolve, reject) => {
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
            resolve(serverPort);
        });
        
        server.on('error', reject);
    });
}

function createWindow() {
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
    });

    mainWindow.webContents.on('did-finish-load', async () => {
        const code = process.env.YANKOVIC_CLI_CODE;
        
        try {
            await startLocalServer();
            const rendererURL = `http://localhost:${serverPort}/assets/cli-renderer.js`;
            
            if (code) {
                mainWindow.webContents.send('run-code', { code, rendererURL });
            } else {
                app.quit(1);
            }
        } catch (error) {
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

ipcMain.handle('UHF:cancel_the_show', (event) => {
  // The program has finished cleanly. Just close the window.
  // The 'close' event on the electronProcess in cli.js will handle quitting.
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window && !window.isDestroyed()) {
      window.close();
  }
  return true;
});

ipcMain.on('fatal-error', (event, { message, stack }) => {
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
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.close();
    }
    app.quit(0);
});

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (server) {
        server.close();
    }
    app.quit();
});