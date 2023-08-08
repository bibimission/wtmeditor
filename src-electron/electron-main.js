import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import path from 'path'
import os from 'os'
import FolderTool from './services/folderTool';
import ImageTool from './services/imageTool';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

const folderTool = new FolderTool();

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
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

ipcMain.on('girl:infos:write', (e, data) => {
  folderTool.writeGirlInfoFile(data.name, data.girl);
})

ipcMain.handle('folder:load', async (e, data) => {
  return await folderTool.readGirlFolder(data.name);
})
ipcMain.handle('folder:create', async (e, data) => {
  return folderTool.createGirlFolder(data.name);
})
ipcMain.handle('img:convert:webp', async (e, data) => {
  return await ImageTool.convertImageToWebp(data.img)
})
ipcMain.handle('img:convert:webm', async (e, data) => {
  return await ImageTool.convertGifToWebm(data.img)
})
ipcMain.handle('webm:resize', async (e, data) => {
  return await ImageTool.resizeWebm(data.img)
})
ipcMain.handle('img:getFrames', async (e, data) => {
  return await ImageTool.convertWebpToWebm(data.img);
})
ipcMain.handle('file:read', async (e, data) => {
  return await folderTool.readFile(data.path);
})
ipcMain.on('img:rename', (e, data) => {
  folderTool.renameFile(data.oldPath, data.newPath)
})
ipcMain.on('file:write', (e, data) => {
  folderTool.writeFile(data.path, data.text)
})
ipcMain.on('img:upload', (e, data) => {
  folderTool.uploadFile(data.path, data.buffer);
})
