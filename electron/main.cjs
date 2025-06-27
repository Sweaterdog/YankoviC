const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let uhfWindow = null;
let gameLoopInterval = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadURL('http://localhost:5173');
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.on('ready', createMainWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createMainWindow(); });

// --- IPC Handlers ---

ipcMain.handle('UHF:start_the_show', (event, { width, height, title }) => {
  if (uhfWindow) { uhfWindow.close(); }
  if (gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
  
  uhfWindow = new BrowserWindow({
    width, height, title, parent: mainWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  uhfWindow.loadFile(path.join(__dirname, 'uhfWindow.html'));

  uhfWindow.on('close', () => {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = null;
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('UHF:show-is-over');
    }
    uhfWindow = null;
  });
  return true;
});

// THIS IS THE CRITICAL FIX FOR THE FPS
// This handler now properly respects the polka speed.
ipcMain.handle('UHF:start_game_loop', (event, fps) => {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    
    // We calculate the delay from the frames per second
    // So your animations are smooth, and not a big mess.
    const frameTime = 1000 / fps;
    
    gameLoopInterval = setInterval(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            // Every tick of our new, controlled clock
            // We tell the IDE it's time to polka-rock.
            mainWindow.webContents.send('UHF:run_frame');
        } else {
            clearInterval(gameLoopInterval);
            gameLoopInterval = null;
        }
    }, frameTime);
    return true;
});

ipcMain.handle('UHF:cancel_the_show', () => {
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
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('UHF:ui-state-update', newUiState);
    }
});