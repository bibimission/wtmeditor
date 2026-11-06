import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import path from 'path'
import os from 'os'
import FolderTool from './services/folderTool';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

const folderTool = new FolderTool('packsBK');

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1400,
    height: 900,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

const handlers = {
  'girls:list': () => folderTool.listGirls(),
  'girls:create': (girl) => folderTool.createGirl(girl),
  'girls:load': (girl) => folderTool.loadGirl(girl),
  'girls:save-infos': (girl, infos) => folderTool.saveInfos(girl, infos),
  'media:retag': (girl, rel, base, batch) => folderTool.retag(girl, rel, base, batch),
  'media:convert': (girl, rel, batch) => folderTool.convert(girl, rel, batch),
  'media:delete': (girl, rel, batch) => folderTool.deleteMedia(girl, rel, batch),
  'history:undo': (girl) => folderTool.undo(girl)
}

for (const [channel, handler] of Object.entries(handlers)) {
  ipcMain.handle(channel, async (e, ...args) => {
    try {
      return { ok: true, data: await handler(...args) }
    } catch (error) {
      console.error(channel, error)
      return { ok: false, error: error.message }
    }
  })
}
