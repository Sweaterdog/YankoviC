const { contextBridge, ipcRenderer } = require('electron');

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
    // ---> NEW: Add the new channel to the valid list
    const validChannels = ['UHF:run_frame', 'UHF:show-is-over', 'UHF:ui-state-update', 'run-cli-file'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  
  removeListener: (channel, callback) => {
    const validChannels = ['UHF:run_frame', 'UHF:show-is-over', 'UHF:ui-state-update', 'run-cli-file'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  onUIStateUpdate: (callback) => {
    ipcRenderer.on('UHF:ui-state-update', (event, state) => callback(state));
  }
});