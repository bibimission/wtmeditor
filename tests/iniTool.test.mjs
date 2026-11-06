import test from "node:test";
import assert from "node:assert/strict";
import { decode, pythonString, readIdentity, updateIdentity } from "../src-electron/services/iniTool.js";

const TEMPLATE = [
  "#### Girl ####",
  "## first_name is mentioned in this comment",
  "[identity]",
  "",
  'first_name = "Chastity" ; If absent or empty, first name will be randomized',
  'last_name = "Lynn" ; If absent or empty, no last name will be used',
  "",
  "[base skills]",
  "beauty = 5",
  "",
  "[cloning options]",
  "keep_first_name = False ; If True, clones will keep the same first name",
  "keep_last_name = True",
  "",
].join("\n");

test("reads the name, not keep_first_name nor a comment", () => {
  assert.deepEqual(readIdentity(TEMPLATE), { first_name: "Chastity", last_name: "Lynn", needsRepair: false });
});

test("only changes the identity lines and keeps their comments", () => {
  const result = updateIdentity(TEMPLATE, { first_name: "Anna", last_name: "Lynn" });
  const expected = TEMPLATE.replace('"Chastity"', '"Anna"');
  assert.equal(result, expected);
});

test("keeps CRLF line endings", () => {
  const crlf = TEMPLATE.split("\n").join("\r\n");
  const result = updateIdentity(crlf, { first_name: "Anna", last_name: "Lynn" });
  assert.equal(result, crlf.replace('"Chastity"', '"Anna"'));
});

test("unquoted values are read and flagged, then repaired by a save", () => {
  const text = "[identity]\nfirst_name = Carter\nlast_name = Cruise\n";
  const read = readIdentity(text);
  assert.deepEqual(read, { first_name: "Carter", last_name: "Cruise", needsRepair: true });
  const repaired = updateIdentity(text, read);
  assert.equal(repaired, '[identity]\nfirst_name = "Carter"\nlast_name = "Cruise"\n');
  assert.equal(readIdentity(repaired).needsRepair, false);
});

test("creates the section in an empty file, without the empty fields", () => {
  assert.equal(updateIdentity("", { first_name: "Anna", last_name: "" }), '[identity]\nfirst_name = "Anna"\n');
  assert.equal(updateIdentity("", { first_name: "", last_name: "" }), "");
});

test("adds a missing section before the others", () => {
  const result = updateIdentity("[base skills]\nbeauty = 5\n", { first_name: "Anna" });
  assert.equal(result, '[identity]\nfirst_name = "Anna"\n\n[base skills]\nbeauty = 5\n');
});

test("emptying a field keeps a valid line", () => {
  const result = updateIdentity(TEMPLATE, { first_name: "", last_name: "Lynn" });
  assert.match(result, /^first_name = "" ; If absent/m);
});

test("removes a BOM, which the game could not parse", () => {
  const result = updateIdentity("﻿[identity]\n", { first_name: "Anna" });
  assert.equal(result, '[identity]\nfirst_name = "Anna"\n');
});

test("special characters survive a round trip", () => {
  for (const name of ['O"Neil', "D'Arc", "Zoé", "100%", "A # B", "A ; B", "back\\slash", "雪", "😀"]) {
    const text = updateIdentity("", { first_name: name });
    assert.equal(readIdentity(text).first_name, name);
    assert.match(text, /^[\x00-\x7f]*$/, "only ASCII reaches the file");
  }
});

test("pythonString escapes what the game's parser would misread", () => {
  assert.equal(pythonString("A#B;C%D"), '"A\\x23B\\x3bC\\x25D"');
  assert.equal(pythonString("é"), '"\\xe9"');
});

test("decode falls back to latin1 instead of corrupting the file", () => {
  assert.equal(decode(Buffer.from([0x5a, 0x6f, 0xe9])), "Zoé");
  assert.equal(decode(Buffer.from("Zoé", "utf8")), "Zoé");
});
