const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('uhfAPI', {
  // Renderer to Main (Invoke)
  startTheShow: (args) => ipcRenderer.invoke('UHF:start_the_show', args),
  cancelTheShow: () => ipcRenderer.invoke('UHF:cancel_the_show'),
  startGameLoop: (fps) => ipcRenderer.invoke('UHF:start_game_loop', fps),
  
  // THIS IS THE NEW BATCHED COMMAND
  executeDrawBuffer: (buffer) => ipcRenderer.invoke('UHF:execute_draw_buffer', buffer),

  // Check if the show is over (window closed)
  isTheShowOver: () => ipcRenderer.invoke('UHF:is_the_show_over'),
  
  // Get current UI state
  getUIState: () => ipcRenderer.invoke('UHF:get_ui_state'),

  // Main to Renderer (Receive)
  on: (channel, callback) => {
    const validChannels = ['UHF:run_frame', 'UHF:show-is-over', 'UHF:ui-state-update'];
    if (validChannels.includes(channel)) {
      // No wrapper function, pass callback directly
      ipcRenderer.on(channel, callback);
    }
  },
  
  // Exposed so we can clean up listeners
  removeListener: (channel, callback) => {
    const validChannels = ['UHF:run_frame', 'UHF:show-is-over', 'UHF:ui-state-update'];
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