import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import webpBinary from "webp-converter/src/cwebp.js";
import FolderTool from "../src-electron/services/folderTool.js";

const FAKE_IMAGE = "image";

function setup() {
  const base = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "bk-editor-")), "packsBK");
  const tool = new FolderTool(base);
  tool.createGirl("Test Girl");
  const dir = path.join(base, "Test Girl");
  return { tool, dir, write: (name, content = FAKE_IMAGE) => fs.writeFileSync(path.join(dir, name), content) };
}

const ffmpeg = (...args) => execFileSync(ffmpegInstaller.path, ["-hide_banner", "-loglevel", "error", "-y", ...args]);

function makeGif(file, frames) {
  ffmpeg("-f", "lavfi", "-i", "testsrc=size=63x47:rate=5", "-frames:v", String(frames), file);
}

function makeAnimatedWebp(dir, file) {
  const a = path.join(dir, "frame a.png");
  const b = path.join(dir, "frame b.png");
  ffmpeg("-f", "lavfi", "-i", "color=red:size=64x48", "-frames:v", "1", a);
  ffmpeg("-f", "lavfi", "-i", "color=blue:size=64x48", "-frames:v", "1", b);
  const img2webp = path.join(path.dirname(webpBinary()), "img2webp.exe");
  execFileSync(img2webp, ["-loop", "0", "-d", "200", a, b, "-o", file]);
  fs.rmSync(a);
  fs.rmSync(b);
}

test("listing: pack names, media only, game formats respected", () => {
  const { tool, write, dir } = setup();
  write("_BK.ini", "");
  write("readme.txt");
  write("a (0).jpg");
  write("b (0).jpeg");
  write("c (0).JPG");
  write("d (0).mp4");
  write("e (0).webm");
  fs.mkdirSync(path.join(dir, "_story"));
  fs.writeFileSync(path.join(dir, "_story", "x (0).jpg"), FAKE_IMAGE);

  const pack = tool.loadGirl("Test Girl");
  const byName = Object.fromEntries(pack.files.map((f) => [f.name, f]));
  assert.deepEqual(Object.keys(byName).sort(), ["a (0).jpg", "b (0).jpeg", "c (0).JPG", "d (0).mp4", "e (0).webm"]);
  assert.deepEqual(pack.ignored, ["readme.txt"]);
  assert.equal(byName["a (0).jpg"].needsConversion, false);
  assert.equal(byName["e (0).webm"].needsConversion, false);
  assert.equal(byName["d (0).mp4"].needsConversion, true);
  assert.equal(byName["a (0).jpg"].url, "packsBK/Test%20Girl/a%20(0).jpg");
  assert.deepEqual(tool.listGirls(), ["Test Girl"]);
});

test("a load writes nothing, even without _BK.ini", () => {
  const { tool, dir } = setup();
  tool.loadGirl("Test Girl");
  assert.deepEqual(fs.readdirSync(dir), []);
});

test("a pack name the game would ignore is refused", () => {
  const { tool } = setup();
  assert.throws(() => tool.createGirl("_hidden"), /ignores/);
  assert.throws(() => tool.createGirl("#mix"), /ignores/);
  assert.throws(() => tool.createGirl("../outside"), /forbidden/);
  assert.throws(() => tool.loadGirl("../outside"), /Invalid/);
});

test("retag never replaces an existing file", () => {
  const { tool, write, dir } = setup();
  write("a.jpg", "first");
  write("b.jpg", "second");
  assert.equal(tool.retag("Test Girl", "a.jpg", "anal cowgirl").file.name, "anal cowgirl (0).jpg");
  assert.equal(tool.retag("Test Girl", "b.jpg", "anal cowgirl").file.name, "anal cowgirl (1).jpg");
  assert.equal(fs.readFileSync(path.join(dir, "anal cowgirl (0).jpg"), "utf8"), "first");
  assert.equal(fs.readFileSync(path.join(dir, "anal cowgirl (1).jpg"), "utf8"), "second");
});

test("retag with the same tags keeps the file and its number", () => {
  const { tool, write } = setup();
  write("sex (7).jpg");
  const result = tool.retag("Test Girl", "sex (7).jpg", "sex");
  assert.equal(result.file.name, "sex (7).jpg");
  assert.equal(result.undoCount, 0);
});

test("undo restores renames, last one first", () => {
  const { tool, write, dir } = setup();
  write("a.jpg");
  const first = tool.retag("Test Girl", "a.jpg", "sex");
  tool.retag("Test Girl", first.file.rel, "anal");
  assert.equal(tool.undo("Test Girl").restored[0], "sex (0).jpg");
  assert.equal(tool.undo("Test Girl").restored[0], "a.jpg");
  assert.deepEqual(fs.readdirSync(dir), ["a.jpg"]);
  assert.throws(() => tool.undo("Test Girl"), /Nothing to undo/);
});

test("a deleted media goes to the trash and undo restores it", () => {
  const { tool, write, dir } = setup();
  write("sex (3).jpg", "content");
  assert.equal(tool.deleteMedia("Test Girl", "sex (3).jpg").undoCount, 1);
  assert.deepEqual(fs.readdirSync(dir), []);
  assert.equal(fs.readdirSync(tool.history.trashDir("Test Girl")).length, 1);

  assert.equal(tool.undo("Test Girl").restored[0], "sex (3).jpg");
  assert.equal(fs.readFileSync(path.join(dir, "sex (3).jpg"), "utf8"), "content");
  assert.throws(() => tool.deleteMedia("Test Girl", "missing.jpg"), /no longer exists/);
});

test("an action on several files is one undo step", async () => {
  const { tool, write, dir } = setup();
  write("a (0).jpg");
  write("b (0).jpg");
  write("c (0).jpg");
  tool.retag("Test Girl", "c (0).jpg", "sex");
  tool.retag("Test Girl", "a (0).jpg", "maid", "batch-1");
  tool.retag("Test Girl", "b (0).jpg", "maid", "batch-1");
  assert.equal(tool.history.count("Test Girl"), 2);

  const undone = tool.undo("Test Girl");
  assert.deepEqual(undone.restored.sort(), ["a (0).jpg", "b (0).jpg"]);
  assert.equal(undone.pack.undoCount, 1);
  assert.deepEqual(fs.readdirSync(dir).sort(), ["a (0).jpg", "b (0).jpg", "sex (0).jpg"]);
});

test("a batch undone halfway keeps only what could not be cancelled", () => {
  const { tool, write } = setup();
  write("a (0).jpg");
  write("b (0).jpg");
  tool.retag("Test Girl", "a (0).jpg", "maid", "batch-1");
  tool.retag("Test Girl", "b (0).jpg", "maid", "batch-1");
  write("a (0).jpg", "new file");
  assert.throws(() => tool.undo("Test Girl"), /already exists/);
  assert.equal(tool.history.entries("Test Girl").length, 1);
  assert.equal(tool.history.entries("Test Girl")[0].from, "a (0).jpg");
});

test("the journal survives a restart", () => {
  const { tool, write } = setup();
  write("a.jpg");
  tool.retag("Test Girl", "a.jpg", "sex");
  const reopened = new FolderTool(tool.baseDir);
  assert.equal(reopened.loadGirl("Test Girl").undoCount, 1);
  assert.equal(reopened.undo("Test Girl").restored[0], "a.jpg");
});

test("a failed undo keeps its entry", () => {
  const { tool, write, dir } = setup();
  write("a.jpg");
  tool.retag("Test Girl", "a.jpg", "sex");
  write("a.jpg", "new file");
  assert.throws(() => tool.undo("Test Girl"), /already exists/);
  assert.equal(tool.loadGirl("Test Girl").undoCount, 1);
  assert.ok(fs.existsSync(path.join(dir, "sex (0).jpg")));
});

test("_BK.ini: a save keeps the rest of the file and can be undone", () => {
  const { tool, write, dir } = setup();
  const original = '[identity]\nfirst_name = "A"\n\n[base skills]\nbeauty = 5\n';
  write("_BK.ini", original);
  const saved = tool.saveInfos("Test Girl", { first_name: "Anna", last_name: "Lee" });
  assert.equal(saved.infos.first_name, "Anna");
  const content = fs.readFileSync(path.join(dir, "_BK.ini"), "utf8");
  assert.match(content, /beauty = 5/);
  assert.match(content, /last_name = "Lee"/);
  tool.undo("Test Girl");
  assert.equal(fs.readFileSync(path.join(dir, "_BK.ini"), "utf8"), original);
});

test("_BK.ini: an identical save writes nothing, a first save can be undone", () => {
  const { tool, dir } = setup();
  assert.equal(tool.saveInfos("Test Girl", { first_name: "", last_name: "" }).undoCount, 0);
  assert.deepEqual(fs.readdirSync(dir), []);
  tool.saveInfos("Test Girl", { first_name: "Anna", last_name: "" });
  assert.ok(fs.existsSync(path.join(dir, "_BK.ini")));
  tool.undo("Test Girl");
  assert.deepEqual(fs.readdirSync(dir), []);
});

test("conversion refuses a format the game reads", async () => {
  const { tool, write, dir } = setup();
  write("a (0).jpg");
  await assert.rejects(tool.convert("Test Girl", "a (0).jpg"), /does not need/);
  assert.ok(fs.existsSync(path.join(dir, "a (0).jpg")));
});

test("a failed conversion keeps the original", async () => {
  const { tool, write, dir } = setup();
  write("broken (0).gif", "this is not a gif");
  await assert.rejects(tool.convert("Test Girl", "broken (0).gif"));
  assert.deepEqual(fs.readdirSync(dir), ["broken (0).gif"]);
  assert.equal(tool.loadGirl("Test Girl").undoCount, 0);
});

test("animated gif becomes a webm, with its tags, and undo restores it", async () => {
  const { tool, dir } = setup();
  makeGif(path.join(dir, "sex doggy (5).gif"), 5);
  const result = await tool.convert("Test Girl", "sex doggy (5).gif");
  assert.equal(result.file.name, "sex doggy (0).webm");
  assert.equal(result.file.needsConversion, false);
  assert.deepEqual(fs.readdirSync(dir), ["sex doggy (0).webm"]);

  assert.equal(tool.undo("Test Girl").restored[0], "sex doggy (5).gif");
  assert.deepEqual(fs.readdirSync(dir), ["sex doggy (5).gif"]);
});

test("a one-frame gif becomes a webp", async () => {
  const { tool, dir } = setup();
  makeGif(path.join(dir, "naked (0).gif"), 1);
  const result = await tool.convert("Test Girl", "naked (0).gif");
  assert.equal(result.file.name, "naked (0).webp");
});

test("animated webp is detected and becomes a webm, static webp is left alone", async () => {
  const { tool, write, dir } = setup();
  const animated = path.join(dir, "anal spoon (2).webp");
  makeAnimatedWebp(dir, animated);
  ffmpeg("-f", "lavfi", "-i", "color=red:size=64x48", "-frames:v", "1", path.join(dir, "static (0).webp"));

  const pack = tool.loadGirl("Test Girl");
  const byName = Object.fromEntries(pack.files.map((f) => [f.name, f]));
  assert.equal(byName["anal spoon (2).webp"].needsConversion, true);
  assert.equal(byName["static (0).webp"].needsConversion, false);

  const result = await tool.convert("Test Girl", "anal spoon (2).webp");
  assert.equal(result.file.name, "anal spoon (0).webm");
  assert.ok(!fs.existsSync(animated));
});

test("conversions run one after the other", async () => {
  const { tool, dir } = setup();
  makeGif(path.join(dir, "a (0).gif"), 3);
  makeGif(path.join(dir, "b (0).gif"), 3);
  const results = await Promise.all([tool.convert("Test Girl", "a (0).gif"), tool.convert("Test Girl", "b (0).gif")]);
  assert.deepEqual(results.map((r) => r.file.name), ["a (0).webm", "b (0).webm"]);
});
