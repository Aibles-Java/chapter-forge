/**
 * Minimal YAML parser, with NO external package dependencies.
 *
 * Supports only the subset needed for `graph/sdlc-graph.yaml`:
 *   - indentation-based mapping (`key: value`)
 *   - block sequence (`- item`)
 *   - flow mapping (`{k: v, k2: v2}`) and flow sequence (`[a, b, c]`)
 *   - quoted/unquoted strings, numbers, booleans, null
 *   - `#` comments (ignored, respecting quotes)
 *
 * Not supported: anchors/aliases, multiline block scalars (| >), multi-document files.
 * If the graph evolves beyond this subset, consider bringing back the `yaml` package.
 */

export type YamlValue = string | number | boolean | null | YamlValue[] | { [k: string]: YamlValue };

interface Line {
  indent: number;
  content: string;
}

/** Strip comments that are outside quotes. */
function stripComment(raw: string): string {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === "#" && !inSingle && !inDouble) {
      // A comment only counts at the start of a line or when preceded by whitespace.
      if (i === 0 || raw[i - 1] === " " || raw[i - 1] === "\t") {
        return raw.slice(0, i);
      }
    }
  }
  return raw;
}

function toLines(text: string): Line[] {
  const out: Line[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const noComment = stripComment(rawLine);
    if (noComment.trim() === "") continue;
    const indent = noComment.length - noComment.trimStart().length;
    out.push({ indent, content: noComment.trimEnd().slice(indent) });
  }
  return out;
}

function parseScalar(raw: string): YamlValue {
  const s = raw.trim();
  if (s === "") return null;
  if (s.startsWith("[") || s.startsWith("{")) return parseFlow(s);
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (s === "null" || s === "~") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d*\.\d+$/.test(s)) return parseFloat(s);
  return s;
}

/** Split the top-level elements of a flow collection, respecting nesting + quotes. */
function splitFlow(inner: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let start = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (ch === "[" || ch === "{") depth++;
      else if (ch === "]" || ch === "}") depth--;
      else if (ch === "," && depth === 0) {
        parts.push(inner.slice(start, i));
        start = i + 1;
      }
    }
  }
  const last = inner.slice(start);
  if (last.trim() !== "") parts.push(last);
  return parts;
}

function parseFlow(raw: string): YamlValue {
  const s = raw.trim();
  if (s.startsWith("[") && s.endsWith("]")) {
    const inner = s.slice(1, -1).trim();
    if (inner === "") return [];
    return splitFlow(inner).map((p) => parseScalar(p));
  }
  if (s.startsWith("{") && s.endsWith("}")) {
    const inner = s.slice(1, -1).trim();
    const obj: { [k: string]: YamlValue } = {};
    if (inner === "") return obj;
    for (const part of splitFlow(inner)) {
      const idx = part.indexOf(":");
      if (idx === -1) continue;
      const key = part.slice(0, idx).trim().replace(/^["']|["']$/g, "");
      obj[key] = parseScalar(part.slice(idx + 1));
    }
    return obj;
  }
  return parseScalar(s);
}

/** Parse a block starting at lines[i] with indentation >= minIndent. */
function parseBlock(lines: Line[], start: number, minIndent: number): [YamlValue, number] {
  if (start >= lines.length) return [null, start];
  const first = lines[start];

  // Sequence?
  if (first.content.startsWith("- ") || first.content === "-") {
    const arr: YamlValue[] = [];
    let i = start;
    while (i < lines.length && lines[i].indent === first.indent && (lines[i].content.startsWith("- ") || lines[i].content === "-")) {
      const itemContent = lines[i].content === "-" ? "" : lines[i].content.slice(2);
      if (itemContent.trim() === "") {
        // The value is on the more-deeply-indented child lines.
        const [val, next] = parseBlock(lines, i + 1, first.indent + 1);
        arr.push(val);
        i = next;
      } else if (isInlineMapEntry(itemContent) && !itemContent.trim().startsWith("{")) {
        // `- key: value` → the element is a mapping; merge the following keys at a "virtual" indent.
        const pseudoIndent = first.indent + 2;
        const rebuilt: Line[] = [{ indent: pseudoIndent, content: itemContent }];
        let j = i + 1;
        while (j < lines.length && lines[j].indent >= pseudoIndent) {
          rebuilt.push(lines[j]);
          j++;
        }
        const [val] = parseBlock(rebuilt, 0, pseudoIndent);
        arr.push(val);
        i = j;
      } else {
        arr.push(parseScalar(itemContent));
        i++;
      }
    }
    return [arr, i];
  }

  // Mapping.
  const obj: { [k: string]: YamlValue } = {};
  let i = start;
  while (i < lines.length && lines[i].indent === first.indent) {
    const line = lines[i];
    if (line.content.startsWith("- ")) break; // belongs to the parent sequence
    const colon = findKeyColon(line.content);
    if (colon === -1) {
      i++;
      continue;
    }
    const key = line.content.slice(0, colon).trim().replace(/^["']|["']$/g, "");
    const rest = line.content.slice(colon + 1).trim();
    if (rest === "") {
      // The value is nested on child lines.
      const [val, next] = parseBlock(lines, i + 1, line.indent + 1);
      obj[key] = next > i + 1 ? val : null;
      i = next;
    } else {
      obj[key] = parseScalar(rest);
      i++;
    }
  }
  return [obj, i];
}

function isInlineMapEntry(content: string): boolean {
  return findKeyColon(content) !== -1;
}

/** Find the position of the ':' that separates the key (ignoring ':' inside quotes / flow). */
function findKeyColon(content: string): number {
  let inSingle = false;
  let inDouble = false;
  let depth = 0;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (ch === "[" || ch === "{") depth++;
      else if (ch === "]" || ch === "}") depth--;
      else if (ch === ":" && depth === 0 && (i + 1 >= content.length || content[i + 1] === " ")) {
        return i;
      }
    }
  }
  return -1;
}

export function parseYaml(text: string): YamlValue {
  const lines = toLines(text);
  if (lines.length === 0) return null;
  const [value] = parseBlock(lines, 0, 0);
  return value;
}
