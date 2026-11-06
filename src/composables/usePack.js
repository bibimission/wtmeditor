// Single source of truth of the loaded pack.
// The interface only shows a file path once the Electron process has confirmed it.
import { computed, reactive } from 'vue'
import { Notify } from 'quasar'
import { buildBase, hasTag, parseName, removeTag } from 'src/shared/tagCodec'

const SAVE_DELAY = 400
const RECENT_TAGS = 6

const emptyInfos = () => ({ first_name: '', last_name: '', needsRepair: false })

const state = reactive({
  girls: [],
  girl: null,
  files: [],
  ignored: [],
  infos: emptyInfos(),
  undoCount: 0,
  selectedIds: [],
  recentOptions: [],
  converting: 0
})

const selectedIdSet = computed(() => new Set(state.selectedIds))
const selectedFiles = computed(() => state.files.filter((file) => selectedIdSet.value.has(file.id)))

const timers = new Map()
let nextId = 0
let nextBatch = 0
let saves = Promise.resolve()
let dismissDeleteNotice = null

function newBatch() {
  return `${Date.now()}-${nextBatch++}`
}

function showError(error) {
  Notify.create({ type: 'negative', message: error.message, timeout: 6000 })
}

function toFile(file) {
  return { ...file, id: nextId++, tokens: parseName(file.name), busy: false, batch: null }
}

function applyPack(pack, selectedRels = []) {
  state.girl = pack.name
  state.files = pack.files.map(toFile)
  state.ignored = pack.ignored
  state.infos = pack.infos
  state.undoCount = pack.undoCount
  state.selectedIds = state.files.filter((file) => selectedRels.includes(file.rel)).map((file) => file.id)
}

function applyFile(file, result) {
  Object.assign(file, result.file)
  state.undoCount = result.undoCount
  if (!timers.has(file.id)) {
    file.tokens = parseName(file.name)
  }
}

async function saveTokens(file) {
  try {
    applyFile(file, await window.editor.retag(state.girl, file.rel, buildBase(file.tokens), file.batch))
  } catch (error) {
    showError(error)
    file.tokens = parseName(file.name)
  }
}

function flushFile(file) {
  clearTimeout(timers.get(file.id))
  timers.delete(file.id)
  saves = saves.then(() => saveTokens(file))
  return saves
}

// Saves are chained: each one starts from the path confirmed by the previous one.
function setTokens(file, tokens, batch) {
  file.tokens = tokens
  file.batch = batch
  clearTimeout(timers.get(file.id))
  timers.set(file.id, setTimeout(() => flushFile(file), SAVE_DELAY))
}

function flush() {
  for (const id of [...timers.keys()]) {
    const file = state.files.find((f) => f.id === id)
    if (file) {
      flushFile(file)
    }
  }
  return saves
}

function rememberOption(option) {
  const others = state.recentOptions.filter((o) => o.tag !== option.tag)
  state.recentOptions = [option, ...others].slice(0, RECENT_TAGS)
}

// Removes the tag if every file has it, otherwise adds it to those without it.
function toggleTag(files, option) {
  const targets = files.filter((file) => !file.busy)
  const everyFileHasIt = targets.every((file) => hasTag(file.tokens, option.tag))
  const batch = newBatch()
  for (const file of targets) {
    if (everyFileHasIt) {
      setTokens(file, removeTag(file.tokens, option.tag), batch)
    } else if (!hasTag(file.tokens, option.tag)) {
      setTokens(file, [...file.tokens, option.word], batch)
    }
  }
  rememberOption(option)
}

async function refreshGirls() {
  try {
    state.girls = await window.editor.listGirls()
  } catch (error) {
    showError(error)
  }
}

async function load(girl) {
  try {
    await flush()
    applyPack(await window.editor.loadGirl(girl))
  } catch (error) {
    showError(error)
  }
}

async function create(girl) {
  try {
    await flush()
    const name = await window.editor.createGirl(girl)
    await refreshGirls()
    applyPack(await window.editor.loadGirl(name))
    return true
  } catch (error) {
    showError(error)
    return false
  }
}

async function saveInfos(infos) {
  try {
    const result = await window.editor.saveInfos(state.girl, infos)
    state.infos = result.infos
    state.undoCount = result.undoCount
  } catch (error) {
    showError(error)
  }
}

async function convert(file, batch = newBatch()) {
  if (file.busy) {
    return
  }
  file.busy = true
  state.converting++
  try {
    await flushFile(file)
    applyFile(file, await window.editor.convert(state.girl, file.rel, batch))
  } catch (error) {
    showError(error)
  } finally {
    file.busy = false
    state.converting--
  }
}

async function convertFiles(files) {
  const batch = newBatch()
  for (const file of files.filter((f) => f.needsConversion)) {
    await convert(file, batch)
  }
}

function convertAll() {
  return convertFiles(state.files)
}

async function removeFiles(files) {
  const targets = files.filter((file) => !file.busy)
  if (targets.length === 0) {
    return
  }
  const batch = newBatch()
  try {
    await flush()
    for (const file of targets) {
      const result = await window.editor.deleteMedia(state.girl, file.rel, batch)
      state.files.splice(state.files.indexOf(file), 1)
      state.selectedIds = state.selectedIds.filter((id) => id !== file.id)
      state.undoCount = result.undoCount
    }
    dismissDeleteNotice?.()
    dismissDeleteNotice = Notify.create({
      message: targets.length === 1 ? `${targets[0].name} moved to the trash` : `${targets.length} media moved to the trash`,
      actions: [{ label: 'Undo', color: 'white', handler: undo }]
    })
  } catch (error) {
    showError(error)
  }
}

async function undo() {
  if (!state.girl || state.undoCount === 0 || state.converting > 0) {
    return
  }
  dismissDeleteNotice?.()
  dismissDeleteNotice = null
  try {
    await flush()
    const result = await window.editor.undo(state.girl)
    applyPack(result.pack, result.restored)
  } catch (error) {
    showError(error)
    await load(state.girl)
  }
}

export function usePack() {
  return {
    state,
    selectedIdSet,
    selectedFiles,
    refreshGirls,
    load,
    create,
    saveInfos,
    setTokens,
    toggleTag,
    convert,
    convertFiles,
    convertAll,
    removeFiles,
    undo
  }
}
