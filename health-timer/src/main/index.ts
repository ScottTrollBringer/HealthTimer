import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { windowConfig } from './windowConfig'

let win: BrowserWindow | null = null

function createWindow(): void {
  win = new BrowserWindow(windowConfig)

  win.on('closed', () => {
    win = null
  })

  win.on('ready-to-show', () => {
    win!.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.on('set-always-on-top', (_event, enabled: boolean) => {
    if (typeof enabled !== 'boolean') return
    win?.setAlwaysOnTop(enabled)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
