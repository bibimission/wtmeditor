// File name <-> tags, following Picture.make_tags_from_filename (BKclasses.rpy).
// Pure module: used by the interface, the Electron process and the tests.
import { TAG_DICT } from "./gameData.generated.js";

const KEYS_BY_LENGTH = Object.keys(TAG_DICT).sort((a, b) => b.length - a.length);
const KEYS_WITH_SPACE = KEYS_BY_LENGTH.filter((key) => key.includes(" "));
const NUMBER_AND_EXTENSION = /(\(\d*\))?((?:\.\w{3,4})+)$/;

function scanKeys(text, keys, found) {
  for (const key of keys) {
    const next = text.split(key).join(" ");
    if (next.length !== text.length) {
      found.push(...TAG_DICT[key]);
      text = next;
    }
  }
  return text;
}

function scanName(name) {
  const tags = [];
  const remaining = scanKeys(name.toLowerCase(), KEYS_WITH_SPACE, tags);
  const notFound = [];
  for (const part of remaining.split(" ")) {
    if (part.trim() === "") continue;
    if (TAG_DICT[part]) tags.push(...TAG_DICT[part]);
    else notFound.push(part);
  }
  if (notFound.length > 0) scanKeys(notFound.join(" "), KEYS_BY_LENGTH, tags);
  return tags;
}

export function splitFilename(filename) {
  const match = filename.match(NUMBER_AND_EXTENSION);
  if (!match) return { base: filename, number: "", extension: "" };
  return {
    base: filename.slice(0, match.index),
    number: match[1] || "",
    extension: match[2],
  };
}

function withImpliedTags(tags) {
  if (tags.includes("group") && tags.includes("bisexual")) tags.push("orgy");
  const nonHuman = ["beast", "monster", "machine", "group"];
  if (tags.includes("double") && !nonHuman.some((tag) => tags.includes(tag))) tags.push("group");
  return [...new Set(tags)];
}

// The tags the game gives to this file.
export function gameTags(filename) {
  return withImpliedTags(scanName(splitFilename(filename).base));
}

const tokenCache = new Map();

export function tokenTags(token) {
  if (!tokenCache.has(token)) tokenCache.set(token, [...new Set(scanName(token))]);
  return tokenCache.get(token);
}

// Same result as gameTags, from the words of a name.
export function tagsOfTokens(tokens) {
  return withImpliedTags(tokens.flatMap(tokenTags));
}

// Words of the name. Keys containing a space stay in one token.
export function tokenize(base) {
  const tokens = [];
  let text = base;
  for (const key of KEYS_WITH_SPACE) {
    let index = text.toLowerCase().indexOf(key);
    while (index >= 0) {
      tokens.push(text.slice(index, index + key.length));
      text = text.slice(0, index) + " " + text.slice(index + key.length);
      index = text.toLowerCase().indexOf(key);
    }
  }
  return [...tokens, ...text.split(/\s+/).filter(Boolean)];
}

export function parseName(filename) {
  return tokenize(splitFilename(filename).base);
}

// Words without any game tag are kept (they are the user's), except
// identifiers such as "48976651_011_aa9a" left by a download.
function isNoise(token) {
  return /\d/.test(token) && tokenTags(token).length === 0;
}

export function buildBase(tokens) {
  const seen = new Set();
  return tokens
    .filter((token) => {
      const key = token.toLowerCase();
      if (seen.has(key) || isNoise(token)) return false;
      seen.add(key);
      return true;
    })
    .join(" ");
}

export function hasTag(tokens, tag) {
  return tokens.some((token) => tokenTags(token).includes(tag));
}

export function removeTag(tokens, tag) {
  return tokens.filter((token) => !tokenTags(token).includes(tag));
}

export function unknownTokens(tokens) {
  return tokens.filter((token) => tokenTags(token).length === 0);
}
