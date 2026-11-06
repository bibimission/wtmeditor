/**
 * The interface only reaches the Electron process through window.editor.
 * Every call resolves with its result, or rejects with a readable error.
 */
const { contextBridge, ipcRenderer } = require('electron')

async function call(channel, ...args) {
  const answer = await ipcRenderer.invoke(channel, ...args)
  if (!answer.ok) {
    throw new Error(answer.error)
  }
  return answer.data
}

contextBridge.exposeInMainWorld('editor', {
  listGirls: () => call('girls:list'),
  createGirl: (girl) => call('girls:create', girl),
  loadGirl: (girl) => call('girls:load', girl),
  saveInfos: (girl, infos) => call('girls:save-infos', girl, infos),
  retag: (girl, rel, base, batch) => call('media:retag', girl, rel, base, batch),
  convert: (girl, rel, batch) => call('media:convert', girl, rel, batch),
  deleteMedia: (girl, rel, batch) => call('media:delete', girl, rel, batch),
  undo: (girl) => call('history:undo', girl)
})
