// Undo journal and trash of a pack, kept in <packs>/.wtm/<pack>/.
// They stay outside the pack folder, so the game never reads them.
import fs from "node:fs";
import path from "node:path";

class HistoryTool {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.counter = 0;
  }

  dir(girl) {
    return path.join(this.baseDir, ".wtm", girl);
  }

  journalPath(girl) {
    return path.join(this.dir(girl), "journal.jsonl");
  }

  trashDir(girl) {
    return path.join(this.dir(girl), "trash");
  }

  entries(girl) {
    const file = this.journalPath(girl);
    if (!fs.existsSync(file)) return [];
    return fs
      .readFileSync(file, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }

  // Entries sharing a batch are one action for the user.
  count(girl) {
    return this.entries(girl).filter((entry, i, all) => !entry.batch || entry.batch !== all[i - 1]?.batch).length;
  }

  push(girl, entry) {
    fs.mkdirSync(this.dir(girl), { recursive: true });
    fs.appendFileSync(this.journalPath(girl), JSON.stringify({ ...entry, at: Date.now() }) + "\n");
  }

  uniqueTrashName(girl, file) {
    fs.mkdirSync(this.trashDir(girl), { recursive: true });
    return `${Date.now()}-${this.counter++}-${path.basename(file)}`;
  }

  // Moves the file: nothing is really deleted by the editor.
  trash(girl, file) {
    const name = this.uniqueTrashName(girl, file);
    fs.renameSync(file, path.join(this.trashDir(girl), name));
    return name;
  }

  backup(girl, file) {
    const name = this.uniqueTrashName(girl, file);
    fs.copyFileSync(file, path.join(this.trashDir(girl), name));
    return name;
  }

  restoreRename(girlDir, entry) {
    const from = path.join(girlDir, entry.from);
    const to = path.join(girlDir, entry.to);
    if (fs.existsSync(from)) throw new Error(`${entry.from} already exists`);
    if (!fs.existsSync(to)) throw new Error(`${entry.to} no longer exists`);
    fs.renameSync(to, from);
    return entry.from;
  }

  restoreConvert(girl, girlDir, entry) {
    const original = path.join(girlDir, entry.from);
    const converted = path.join(girlDir, entry.to);
    if (fs.existsSync(original)) throw new Error(`${entry.from} already exists`);
    fs.renameSync(path.join(this.trashDir(girl), entry.trashed), original);
    if (fs.existsSync(converted)) this.trash(girl, converted);
    return entry.from;
  }

  restoreDeleted(girl, girlDir, entry) {
    const original = path.join(girlDir, entry.from);
    if (fs.existsSync(original)) throw new Error(`${entry.from} already exists`);
    fs.renameSync(path.join(this.trashDir(girl), entry.trashed), original);
    return entry.from;
  }

  restoreFile(girl, girlDir, entry) {
    const target = path.join(girlDir, entry.file);
    if (entry.backup) {
      fs.copyFileSync(path.join(this.trashDir(girl), entry.backup), target);
    } else if (fs.existsSync(target)) {
      this.trash(girl, target);
    }
    return null;
  }

  rewrite(girl, entries) {
    const file = this.journalPath(girl);
    const temporary = `${file}.tmp`;
    fs.writeFileSync(temporary, entries.map((entry) => JSON.stringify(entry) + "\n").join(""));
    fs.renameSync(temporary, file);
  }

  restore(girl, girlDir, entry) {
    const restorers = {
      rename: () => this.restoreRename(girlDir, entry),
      convert: () => this.restoreConvert(girl, girlDir, entry),
      delete: () => this.restoreDeleted(girl, girlDir, entry),
      file: () => this.restoreFile(girl, girlDir, entry),
    };
    return restorers[entry.op]();
  }

  // Cancels the last action, with every entry of its batch.
  // An entry stays in the journal when it cannot be cancelled.
  undo(girl, girlDir) {
    const entries = this.entries(girl);
    const last = entries[entries.length - 1];
    if (!last) throw new Error("Nothing to undo");

    const restored = [];
    try {
      do {
        restored.push(this.restore(girl, girlDir, entries[entries.length - 1]));
        entries.pop();
      } while (last.batch && entries[entries.length - 1]?.batch === last.batch);
    } finally {
      this.rewrite(girl, entries);
    }
    return { restored: restored.filter(Boolean) };
  }
}

export default HistoryTool;
