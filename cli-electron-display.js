#!/usr/bin/env node
// Electron Window Display for YankoviC CLI - UHF Channel 62
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let frameData = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'YankoviC UHF Channel 62',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'frontend/public/vite.svg')
  });

  // Load the HTML file that will display our frames
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>YankoviC UHF Channel 62</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #000;
            color: #fff;
            font-family: 'Courier New', monospace;
            text-align: center;
        }
        #header {
            margin-bottom: 20px;
            border: 2px solid #fff;
            padding: 10px;
            background: #333;
        }
        #canvas {
            border: 2px solid #fff;
            background: #000;
        }
        #status {
            margin-top: 10px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div id="header">
        <h1>📺 UHF Channel 62 - Standard Display Mode</h1>
        <p>YankoviC Program Output</p>
    </div>
    <canvas id="canvas" width="800" height="600"></canvas>
    <div id="status">Ready to receive frames...</div>
    
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const status = document.getElementById('status');
        let frameCount = 0;
        
        // Listen for frame data from the main process
        window.addEventListener('message', (event) => {
            if (event.data.type === 'frame') {
                const img = new Image();
                img.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    frameCount++;
                    status.textContent = \`Frame \${frameCount} - \${new Date().toLocaleTimeString()}\`;
                };
                img.src = event.data.imageData;
            }
        });
        
        // Initial display
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for YankoviC program...', canvas.width/2, canvas.height/2);
    </script>
</body>
</html>`;

  // Write the HTML to a temporary file and load it
  const tempHtmlPath = path.join(__dirname, 'cli_output', 'uhf_channel_62.html');
  fs.writeFileSync(tempHtmlPath, htmlContent);
  mainWindow.loadFile(tempHtmlPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for receiving frame data
ipcMain.handle('display-frame', (event, imageData) => {
  if (mainWindow) {
    mainWindow.webContents.postMessage('frame', { type: 'frame', imageData });
  }
});

// Handle command line arguments for frame directory
const frameDir = process.argv[2] || './cli_output';
console.log(`[UHF Channel 62] Monitoring for frames in: ${frameDir}`);

// Ensure output directory exists only when needed
if (channel === UHF_CHANNELS.PNG || channel === UHF_CHANNELS.ELECTRON) {
  if (!fs.existsSync(frameDir)) {
    fs.mkdirSync(frameDir, { recursive: true });
  }
}

// Watch for new PNG files and display them
if (fs.existsSync(frameDir)) {
  fs.watch(frameDir, (eventType, filename) => {
    if (filename && filename.endsWith('.png') && filename.startsWith('frame_')) {
      const framePath = path.join(frameDir, filename);
      if (fs.existsSync(framePath)) {
        // Convert PNG to base64 data URL
        const imageBuffer = fs.readFileSync(framePath);
        const imageData = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        
        if (mainWindow) {
          mainWindow.webContents.postMessage('frame', { type: 'frame', imageData });
        }
      }
    }
  });
}