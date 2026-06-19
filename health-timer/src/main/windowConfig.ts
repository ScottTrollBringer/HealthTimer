import { join } from 'path'
import { BrowserWindowConstructorOptions } from 'electron'

export const windowConfig: BrowserWindowConstructorOptions = {
  width: 384,
  height: 216,
  minWidth: 384,
  minHeight: 216,
  resizable: false,
  backgroundColor: '#1a1a1a',
  alwaysOnTop: false,
  show: false,
  autoHideMenuBar: true,
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    sandbox: false
  }
}
