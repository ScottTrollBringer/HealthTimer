import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  setAlwaysOnTop: (enabled: boolean) => ipcRenderer.send('set-always-on-top', enabled)
})
