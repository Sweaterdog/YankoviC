const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs'); // ---> NEW: Need fs to read the file

let mainWindow;
let uhfWindow = null;
let gameLoopInterval = null;
let uiState = { mouse: {}, keys: {}, buttons: {}, textBoxes: {}, checkboxes: {}, sliders: {} };

// ---> NEW: Function to run the file passed from the CLI
function runCliFile(filePath) {
    console.log(`[Main Process] CLI Mode: Running file -> ${filePath}`);
    try {
        const code = fs.readFileSync(filePath, 'utf-8');
        // The main window's renderer process will run the code once it's ready.
        // We'll send it over via IPC.
        mainWindow.webContents.on('did-finish-load', () => {
            console.log(`[Main Process] Sending 'run-cli-file' with code to renderer.`);
            mainWindow.webContents.send('run-cli-file', code);
        });
    } catch (error) {
        console.error(`[Main Process] Error reading CLI file: ${error.message}`);
        app.quit();
    }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // ---> NEW: Check for the CLI environment variable
  const cliFile = process.env.YANKOVIC_CLI_FILE;
  if (cliFile) {
    // If running from CLI, don't show the whole IDE.
    // Just load the renderer and we'll tell it to run the file.
    mainWindow.loadFile(path.join(__dirname, '../frontend/index.html')); // Load the app's HTML directly
    runCliFile(cliFile);
  } else {
    // Normal IDE mode
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.on('ready', createMainWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createMainWindow(); });

// --- IPC Handlers --- (Rest of the file is unchanged)

ipcMain.handle('UHF:start_the_show', (event, { width, height, title }) => {
  console.log('[Main Process] UHF:start_the_show called with:', { width, height, title });
  if (uhfWindow) { 
    console.log('[Main Process] Closing existing UHF window');
    uhfWindow.close(); 
  }
  
  console.log('[Main Process] Creating new UHF window');
  uhfWindow = new BrowserWindow({
    width, height, title, parent: mainWindow,
    webPreferences: {
      nodeIntegration: true, // Required for the renderer script
      contextIsolation: false // Simpler for this dedicated window
    }
  });

  // Load the dedicated HTML file for the canvas
  console.log('[Main Process] Loading UHF window HTML');
  uhfWindow.loadFile(path.join(__dirname, 'uhfWindow.html'));
  uhfWindow.webContents.openDevTools(); // ADD THIS LINE

  uhfWindow.on('close', () => {
      console.log('[Main Process] UHF window closed by user.');
      // Notify the frontend that the show is over.
      if (gameLoopInterval) clearInterval(gameLoopInterval);
      gameLoopInterval = null;
      if (mainWindow && !mainWindow.isDestroyed()) {
          console.log('[Main Process] Sending show-is-over to main window');
          mainWindow.webContents.send('UHF:show-is-over');
      }
      uhfWindow = null;
  });
  console.log('[Main Process] UHF window setup complete');
  return true;
});

ipcMain.handle('UHF:start_game_loop', (event, fps) => {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    const frameTime = 1000 / fps;
    gameLoopInterval = setInterval(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('UHF:run_frame');
        } else {
            // If main window is gone, stop the loop
            clearInterval(gameLoopInterval);
            gameLoopInterval = null;
        }
    }, frameTime);
    return true;
});

ipcMain.handle('UHF:cancel_the_show', () => {
    console.log('[Main Process] Received cancel_the_show.');
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (uhfWindow) uhfWindow.close();
    gameLoopInterval = null;
    uhfWindow = null;
    return true;
});

ipcMain.handle('UHF:execute_draw_buffer', (event, buffer) => {
    if (uhfWindow && !uhfWindow.isDestroyed()) {
        uhfWindow.webContents.send('UHF:draw-on-canvas', buffer);
    }
});

ipcMain.handle('UHF:is_the_show_over', () => {
    return !uhfWindow || uhfWindow.isDestroyed();
});

ipcMain.on('UHF:ui-state', (event, newUiState) => {
    uiState = { ...uiState, ...newUiState };
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('UHF:ui-state-update', uiState);
    }
});

ipcMain.handle('UHF:get_ui_state', () => {
    return uiState;
});