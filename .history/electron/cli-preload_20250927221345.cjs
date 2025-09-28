const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cliAPI', {
    // Renderer to Main
    setWindow: (args) => ipcRenderer.invoke('cli-set-window', args),
    prompt: (promptText) => ipcRenderer.invoke('prompt-input', promptText),

    // Main to Renderer
    onRunCode: (callback) => {
        // Pass both parameters from the main process to the callback
        ipcRenderer.on('run-code', (event, { code, rendererURL }) => callback(code, rendererURL));
    },
    reportError: (errorInfo) => ipcRenderer.send('fatal-error', errorInfo),
    programFinished: () => ipcRenderer.send('program-finished')
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