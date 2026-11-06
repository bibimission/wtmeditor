import fs from "node:fs";
import path from "node:path";
import { splitFilename } from "../../src/shared/tagCodec.js";
import { classify, conversionFor, CONVERT_TO_IMAGE, CONVERT_TO_VIDEO } from "../../src/shared/mediaFormats.js";
import { decode, readIdentity, updateIdentity } from "./iniTool.js";
import HistoryTool from "./historyTool.js";
import ImageTool from "./imageTool.js";

const INI_NAME = "_BK.ini";

function removeForbidden(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "");
}

class FolderTool {
  constructor(baseDir) {
    this.baseDir = path.resolve(baseDir);
    this.urlBase = path.basename(this.baseDir);
    this.history = new HistoryTool(this.baseDir);
    this.conversions = Promise.resolve();
    fs.mkdirSync(this.baseDir, { recursive: true });
  }

  // --------- PACKS

  listGirls() {
    return fs
      .readdirSync(this.baseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  }

  girlDir(girl) {
    if (!girl || girl !== path.basename(girl) || girl.startsWith(".")) {
      throw new Error(`Invalid pack name: ${girl}`);
    }
    return path.join(this.baseDir, girl);
  }

  createGirl(girl) {
    const name = (girl ?? "").trim();
    if (name !== removeForbidden(name)) throw new Error("This name contains forbidden characters");
    // The game skips folders starting with "_" and treats "#" as a container.
    if (/^[_#]/.test(name)) throw new Error('The game ignores a pack whose name starts with "_" or "#"');
    fs.mkdirSync(this.girlDir(name), { recursive: true });
    return name;
  }

  loadGirl(girl) {
    const dir = this.girlDir(girl);
    if (!fs.existsSync(dir)) throw new Error(`The pack ${girl} does not exist`);

    const files = [];
    const ignored = [];
    for (const rel of this.listFiles(dir)) {
      if (path.posix.basename(rel) === INI_NAME) continue;
      const described = this.describe(girl, rel);
      if (described) files.push(described);
      else ignored.push(rel);
    }
    return { name: girl, files, ignored, infos: this.readInfos(girl), undoCount: this.history.count(girl) };
  }

  // Folders starting with "_" are ignored by the game.
  listFiles(dir, prefix = "") {
    const found = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix + entry.name;
      if (!entry.isDirectory()) found.push(rel);
      else if (!entry.name.startsWith("_")) found.push(...this.listFiles(path.join(dir, entry.name), `${rel}/`));
    }
    return found;
  }

  describe(girl, rel) {
    const extension = path.extname(rel);
    const kind = classify(extension);
    if (!kind) return null;

    const animatedWebp =
      extension.toLowerCase() === ".webp" && ImageTool.isAnimatedWebp(path.join(this.girlDir(girl), rel));
    const url = [this.urlBase, girl, ...rel.split("/")].map(encodeURIComponent).join("/");
    return {
      rel,
      name: path.posix.basename(rel),
      url,
      kind,
      needsConversion: animatedWebp || conversionFor(extension) !== null,
    };
  }

  // --------- _BK.ini

  readInfos(girl) {
    const file = path.join(this.girlDir(girl), INI_NAME);
    return readIdentity(fs.existsSync(file) ? decode(fs.readFileSync(file)) : "");
  }

  saveInfos(girl, infos) {
    const file = path.join(this.girlDir(girl), INI_NAME);
    const exists = fs.existsSync(file);
    const before = exists ? decode(fs.readFileSync(file)) : "";
    const after = updateIdentity(before, infos);

    if (after !== before) {
      const backup = exists ? this.history.backup(girl, file) : null;
      const temporary = `${file}.tmp`;
      fs.writeFileSync(temporary, after);
      fs.renameSync(temporary, file);
      this.history.push(girl, { op: "file", file: INI_NAME, backup });
    }
    return { infos: this.readInfos(girl), undoCount: this.history.count(girl) };
  }

  // --------- MEDIA

  // First free "<base> (n)<extension>": an existing file is never replaced.
  freePath(dir, base, extension) {
    const prefix = base ? `${base} ` : "";
    for (let number = 0; ; number++) {
      const candidate = path.join(dir, `${prefix}(${number})${extension}`);
      if (!fs.existsSync(candidate)) return candidate;
    }
  }

  relative(girl, file) {
    return path.relative(this.girlDir(girl), file).split(path.sep).join("/");
  }

  result(girl, rel) {
    return { file: this.describe(girl, rel), undoCount: this.history.count(girl) };
  }

  retag(girl, rel, base, batch) {
    const source = path.join(this.girlDir(girl), rel);
    if (!fs.existsSync(source)) throw new Error(`${rel} no longer exists`);

    const cleanBase = removeForbidden(base).replace(/\s+/g, " ").trim();
    const current = splitFilename(path.basename(rel));
    if (current.base === `${cleanBase} ` && current.number) return this.result(girl, rel);

    const target = this.freePath(path.dirname(source), cleanBase, path.extname(rel));
    fs.renameSync(source, target);
    const targetRel = this.relative(girl, target);
    this.history.push(girl, { op: "rename", from: rel, to: targetRel, batch });
    return this.result(girl, targetRel);
  }

  async convertFile(source, workDir) {
    const extension = path.extname(source).toLowerCase();
    if (extension === ".webp") return ImageTool.animatedWebpToWebm(source, workDir);
    if (extension === ".gif") {
      const animated = (await ImageTool.frameCount(source)) > 1;
      return animated ? ImageTool.toWebm(source, workDir) : ImageTool.toWebp(source, workDir);
    }
    const conversion = conversionFor(extension);
    if (conversion === CONVERT_TO_VIDEO) return ImageTool.toWebm(source, workDir);
    if (conversion === CONVERT_TO_IMAGE) return ImageTool.toWebp(source, workDir);
    throw new Error(`The game reads ${extension} files directly`);
  }

  // The original only goes to the trash once the new file has been checked.
  async runConversion(girl, rel, batch) {
    const source = path.join(this.girlDir(girl), rel);
    if (!fs.existsSync(source)) throw new Error(`${rel} no longer exists`);
    if (!this.describe(girl, rel)?.needsConversion) throw new Error(`${rel} does not need a conversion`);

    fs.mkdirSync(this.history.dir(girl), { recursive: true });
    const workDir = fs.mkdtempSync(path.join(this.history.dir(girl), "convert-"));
    try {
      const output = await this.convertFile(source, workDir);
      const base = splitFilename(path.basename(rel)).base.trim();
      const target = this.freePath(path.dirname(source), base, path.extname(output));
      fs.renameSync(output, target);
      const trashed = this.history.trash(girl, source);
      const targetRel = this.relative(girl, target);
      this.history.push(girl, { op: "convert", from: rel, to: targetRel, trashed, batch });
      return this.result(girl, targetRel);
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }

  // One at a time: ffmpeg already uses every core.
  convert(girl, rel, batch) {
    const task = this.conversions.then(() => this.runConversion(girl, rel, batch));
    this.conversions = task.catch(() => {});
    return task;
  }

  // The file goes to the trash, so the deletion can be undone.
  deleteMedia(girl, rel, batch) {
    const source = path.join(this.girlDir(girl), rel);
    if (!fs.existsSync(source)) throw new Error(`${rel} no longer exists`);
    const trashed = this.history.trash(girl, source);
    this.history.push(girl, { op: "delete", from: rel, trashed, batch });
    return { undoCount: this.history.count(girl) };
  }

  // --------- HISTORY

  undo(girl) {
    const { restored } = this.history.undo(girl, this.girlDir(girl));
    return { restored, pack: this.loadGirl(girl) };
  }
}

export default FolderTool;
