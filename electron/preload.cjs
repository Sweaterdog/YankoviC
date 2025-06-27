const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('uhfAPI', {
  // Renderer to Main (Invoke)
  startTheShow: (args) => ipcRenderer.invoke('UHF:start_the_show', args),
  cancelTheShow: () => ipcRenderer.invoke('UHF:cancel_the_show'),
  startGameLoop: (fps) => ipcRenderer.invoke('UHF:start_game_loop', fps),
  
  executeDrawBuffer: (buffer) => ipcRenderer.invoke('UHF:execute_draw_buffer', buffer),

  // Check if the show is over (window closed)
  isTheShowOver: () => ipcRenderer.invoke('UHF:is_the_show_over'),

  // Main to Renderer (Receive)
  on: (channel, callback) => {
    // We must add our new channel to the list of things it's allowed to hear.
    // It's like adding a new song to the polka medley.
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