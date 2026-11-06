// Reads and updates the [identity] section of a _BK.ini without touching the rest.
//
// The game reads a value with parser.get() then ast.literal_eval(), so a name must
// be a quoted Python string. The file is opened with the system encoding and
// "%", "#" and ";" mean something to the parser: those characters are escaped.

const SECTION = "identity";
export const IDENTITY_KEYS = ["first_name", "last_name"];

export function decode(buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return Buffer.from(buffer).toString("latin1");
  }
}

export function pythonString(value) {
  let out = '"';
  for (const char of value) {
    const code = char.codePointAt(0);
    if (char === '"' || char === "\\") out += "\\" + char;
    else if (code < 0x20 || code === 0x7f || "#;%".includes(char) || (code >= 0x80 && code <= 0xff)) {
      out += "\\x" + code.toString(16).padStart(2, "0");
    } else if (code < 0x80) out += char;
    else if (code <= 0xffff) out += "\\u" + code.toString(16).padStart(4, "0");
    else out += "\\U" + code.toString(16).padStart(8, "0");
  }
  return out + '"';
}

const SIMPLE_ESCAPES = { n: "\n", t: "\t", r: "\r", "\\": "\\", '"': '"', "'": "'" };

function unescapePython(text) {
  return text.replace(/\\(x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8}|.)/g, (match, code) => {
    if (code.length > 1) return String.fromCodePoint(parseInt(code.slice(1), 16));
    return SIMPLE_ESCAPES[code] ?? match;
  });
}

// Separates the value from a same-line comment, without looking inside quotes.
function splitComment(text) {
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if ((char === "#" || char === ";") && (i === 0 || /\s/.test(text[i - 1]))) {
      const end = text.slice(0, i).trimEnd().length;
      return [text.slice(0, end), text.slice(end)];
    }
  }
  return [text.trimEnd(), ""];
}

function sectionBounds(lines) {
  const header = /^\s*\[([^\]]+)\]/;
  const start = lines.findIndex((line) => line.match(header)?.[1] === SECTION);
  if (start < 0) return null;
  const next = lines.findIndex((line, i) => i > start && header.test(line));
  return { start, end: next < 0 ? lines.length : next };
}

function findKey(lines, bounds, key) {
  const pattern = new RegExp(`^(\\s*${key}\\s*[=:]\\s*)(.*)$`, "i");
  for (let i = bounds.start + 1; i < bounds.end; i++) {
    const match = lines[i].match(pattern);
    if (match) return { index: i, prefix: match[1], rest: match[2] };
  }
  return null;
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

// needsRepair is true when a value is present but the game would ignore it.
export function readIdentity(text) {
  const lines = stripBom(text).split(/\r?\n/);
  const identity = { first_name: "", last_name: "", needsRepair: false };
  const bounds = sectionBounds(lines);
  if (!bounds) return identity;

  for (const key of IDENTITY_KEYS) {
    const found = findKey(lines, bounds, key);
    if (!found) continue;
    const [raw] = splitComment(found.rest);
    const quoted = raw.match(/^(["'])(.*)\1$/);
    if (quoted) identity[key] = unescapePython(quoted[2]);
    else if (raw) {
      identity[key] = raw;
      identity.needsRepair = true;
    }
  }
  return identity;
}

// Only the wanted lines change; comments, other sections and line endings stay.
export function updateIdentity(text, values) {
  const clean = stripBom(text);
  const eol = clean.includes("\r\n") ? "\r\n" : "\n";
  const lines = clean.split(/\r?\n/);
  const wanted = IDENTITY_KEYS.filter((key) => (values[key] ?? "").trim() !== "");
  let bounds = sectionBounds(lines);

  if (!bounds) {
    if (wanted.length === 0) return clean;
    const added = [`[${SECTION}]`, ...wanted.map((key) => `${key} = ${pythonString(values[key].trim())}`), ""];
    const rest = clean.trim() === "" ? [] : lines;
    return [...added, ...rest].join(eol);
  }

  for (const key of IDENTITY_KEYS) {
    const value = (values[key] ?? "").trim();
    const found = findKey(lines, bounds, key);
    if (found) {
      const [, comment] = splitComment(found.rest);
      lines[found.index] = found.prefix + pythonString(value) + comment;
    } else if (value) {
      lines.splice(bounds.start + 1, 0, `${key} = ${pythonString(value)}`);
      bounds = sectionBounds(lines);
    }
  }
  return lines.join(eol);
}
