const { contextBridge, ipcRenderer } = require('electron');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Format the error to be consistent with our other error reports
  const errorInfo = {
    message: `💥 FATAL WORD CRIME: Unhandled Promise Rejection 💥\n\nAl says: "Something went horribly wrong in an async operation!"\n\nReason: ${reason.message || reason}`,
    stack: reason.stack || 'No stack trace available.'
  };

  // Use the existing IPC channel to send the fatal error to the main process.
  ipcRenderer.send('fatal-error', errorInfo);
});

contextBridge.exposeInMainWorld('cliAPI', {
    setWindow: (args) => ipcRenderer.invoke('cli-set-window', args),
    prompt: (promptText) => ipcRenderer.invoke('prompt-input', promptText),
    reportError: (errorInfo) => ipcRenderer.send('fatal-error', errorInfo),
    programFinished: () => ipcRenderer.send('program-finished'),
    onRunCode: (callback) => {
        ipcRenderer.on('run-code', (event, { code, rendererURL }) => callback(code, rendererURL));
    },
});

// Expose UHF API for graphics programs
contextBridge.exposeInMainWorld('uhfAPI', {
  // Renderer to Main (Invoke)
  startTheShow: (args) => ipcRenderer.invoke('UHF:start_the_show', args),
  cancelTheShow: () => ipcRenderer.invoke('UHF:cancel_the_show'),
  startGameLoop: (fps) => ipcRenderer.invoke('UHF:start_game_loop', fps),
  executeDrawBuffer: (buffer) => ipcRenderer.invoke('UHF:execute_draw_buffer', buffer),
  isTheShowOver: () => ipcRenderer.invoke('UHF:is_the_show_over'),
  getUIState: () => ipcRenderer.invoke('UHF:get_ui_state'),

  // Main to Renderer (Receive)
  on: (channel, callback) => {
    const validChannels = ['UHF:run_frame', 'UHF:show-is-over', 'UHF:ui-state-update'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  
  removeListener: (channel, callback) => {
    const validChannels = ['UHF:run_frame', 'UHF:show-is-over', 'UHF:ui-state-update'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  }
});