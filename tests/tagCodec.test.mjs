import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TAG_DICT } from "../src/shared/gameData.generated.js";
import { TAG_GROUPS, OTHER_TAGS, missingTags } from "../src/shared/tagSchema.js";
import {
  buildBase, gameTags, parseName, removeTag, splitFilename, tagsOfTokens, tokenize, tokenTags, unknownTokens,
} from "../src/shared/tagCodec.js";

const GAME_DIR = process.env.BK_GAME_DIR || "D:/Jeux/Flash/BrothelKing/Brothel_King-pc-0.3t.2/Brothel_King-pc/game";
const sorted = (list) => [...list].sort();

function listNames(dir, names = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) listNames(path.join(dir, entry.name), names);
    else if (/\.(jpe?g|png|gif|webp|webm|avi|mkv|mpe?g|bmp|avif)$/i.test(entry.name)) names.push(entry.name);
  }
  return names;
}

test("splitFilename follows the game's ending pattern", () => {
  assert.deepEqual(splitFilename("anal cowgirl (12).webm"), { base: "anal cowgirl ", number: "(12)", extension: ".webm" });
  assert.deepEqual(splitFilename("anal cowgirl.jpg"), { base: "anal cowgirl", number: "", extension: ".jpg" });
  assert.equal(splitFilename("x (12)1.webm").base, "x (12)1");
});

test("gameTags reads names like the game does", () => {
  assert.deepEqual(sorted(gameTags("bis service lesbian oral (0).jpg")), ["bisexual", "lesbian", "oral", "service"]);
  assert.deepEqual(sorted(gameTags("bisexual (0).jpg")), ["bisexual"]);
  assert.deepEqual(sorted(gameTags("masseuse naked (1618).jpg")), ["masseuse", "naked"]);
  assert.deepEqual(sorted(gameTags("double (0).jpg")), ["double", "group"]);
  assert.deepEqual(sorted(gameTags("double beast (0).jpg")), ["beast", "double"]);
  assert.ok(gameTags("group bisexual (0).jpg").includes("orgy"));
  assert.deepEqual(sorted(gameTags("anal penis w (1).jpg")), ["anal", "handjob"]);
});

test("a token with a space in its key is not cut", () => {
  assert.deepEqual(tokenize("anal penis w"), ["penis w", "anal"]);
});

test("unknown words are kept, download identifiers are dropped", () => {
  assert.equal(buildBase(parseName("big piledriver anal missionary (0).jpg")), "big piledriver anal missionary");
  assert.equal(buildBase(parseName("48976651_011_aa9a.jpg")), "");
  assert.deepEqual(unknownTokens(parseName("sex missionary (1).jpg")), ["missionary"]);
});

test("names are clean: no double space, no duplicate", () => {
  assert.equal(buildBase(parseName(" anal  cowgirl anal (3).jpg")), "anal cowgirl");
});

test("removing a tag removes every alias of it", () => {
  assert.equal(buildBase(removeTag(parseName("les bis anal (0).jpg"), "bisexual")), "anal");
  assert.equal(buildBase(removeTag(parseName("hand handjob sex (0).jpg"), "handjob")), "sex");
});

test("every option of the schema gives the expected tag", () => {
  for (const group of TAG_GROUPS) {
    for (const { tag, word } of group.options) {
      assert.ok(tokenTags(word).includes(tag), `${word} should give ${tag}, got ${tokenTags(word)}`);
    }
  }
});

test("the icons of the schema exist", () => {
  for (const group of TAG_GROUPS) {
    for (const { icon } of group.options) {
      if (icon) assert.ok(fs.existsSync(path.join("public", icon)), `missing ${icon}`);
    }
  }
});

test("every game tag has a place in the interface", () => {
  assert.deepEqual(OTHER_TAGS, []);
  assert.ok(Object.keys(TAG_DICT).length > 100);
});

test("missingTags lists absent tags, without the frequency group", () => {
  const groups = missingTags(["profile", "portrait", "market", "model", "gallery"]);
  const ids = groups.map((g) => g.id);
  assert.ok(!ids.includes("type"), "a complete group disappears");
  assert.ok(!ids.includes("frequency"));
  assert.ok(ids.includes("job"));

  const partial = missingTags(["profile"]).find((g) => g.id === "type");
  assert.deepEqual(partial.options.map((o) => o.tag), ["portrait", "market", "model", "gallery"]);

  const everything = TAG_GROUPS.flatMap((g) => g.options.map((o) => o.tag));
  assert.deepEqual(missingTags(everything), []);
});

test("rewriting a name never loses a tag, on every picture of the game", { skip: !fs.existsSync(GAME_DIR) }, () => {
  const names = listNames(path.join(GAME_DIR, "girls"));
  const failures = [];
  for (const name of names) {
    const rebuilt = `${buildBase(parseName(name))} (0).jpg`;
    const lost = gameTags(name).filter((tag) => !gameTags(rebuilt).includes(tag));
    if (lost.length > 0) failures.push(`${name} => ${rebuilt} lost ${lost}`);
    const fromTokens = sorted(tagsOfTokens(parseName(name)));
    if (fromTokens.join() !== sorted(gameTags(name)).join()) failures.push(`${name}: tokens give ${fromTokens}`);
  }
  assert.ok(names.length > 20000);
  assert.deepEqual(failures.slice(0, 20), []);
});
