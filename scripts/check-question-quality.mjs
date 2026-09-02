import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const IGNORE = new Set(['node_modules', '.git']);
const QUESTION_START = /\{\s*(?:question|q)\s*:/g;
const fail = (message) => { throw new Error(`[question-quality] ${message}`); };
const warnings = [];
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:js|html)$/i.test(entry.name)) files.push(full);
  }
}

function quoted(source, start) {
  const quote = source[start];
  let value = '';
  for (let i = start + 1; i < source.length; i++) {
    const ch = source[i];
    if (ch === '\\') { value += ch + (source[i + 1] ?? ''); i++; continue; }
    if (ch === quote) return value;
    value += ch;
  }
  return null;
}

function balancedObject(source, start) {
  let depth = 0, quote = null, escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '\'' || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function fieldString(objectSource, label) {
  const re = new RegExp(`${label}\\s*:\\s*(['"])`);
  const m = re.exec(objectSource);
  return m ? quoted(objectSource, m.index + m[0].length - 1) : null;
}

function arrayBody(objectSource) {
  const m = /options\s*:\s*\[/.exec(objectSource);
  if (!m) return null;
  const start = m.index + m[0].length - 1;
  let depth = 0, quote = null, escaped = false;
  for (let i = start; i < objectSource.length; i++) {
    const ch = objectSource[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '\'' || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return objectSource.slice(start + 1, i);
    }
  }
  return null;
}

function splitTopLevel(text) {
  const out = [];
  let start = 0, depth = 0, quote = null, escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '\'' || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '[' || ch === '{' || ch === '(') depth++;
    else if (ch === ']' || ch === '}' || ch === ')') depth--;
    else if (ch === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  const last = text.slice(start).trim();
  if (last) out.push(last);
  return out;
}

function tokenValue(token) {
  const t = token.trim();
  if (/^['"`]/.test(t)) return quoted(t, 0) ?? t;
  return t;
}

function inspect(relative, source) {
  let count = 0;
  for (const match of source.matchAll(QUESTION_START)) {
    const objectSource = balancedObject(source, match.index);
    if (!objectSource) fail(`${relative}: unterminated question object near character ${match.index}.`);
    count++;
    const question = fieldString(objectSource, 'question') ?? fieldString(objectSource, 'q');
    if (!question?.trim()) fail(`${relative}: question ${count} is empty.`);

    const body = arrayBody(objectSource);
    if (body === null) {
      warnings.push(`${relative}: question ${count} is not an MCQ object with an options array.`);
      continue;
    }
    const options = splitTopLevel(body).map(tokenValue).filter(Boolean);
    if (options.length < 4) fail(`${relative}: question ${count} has ${options.length} options; MCQ items require at least 4.`);
    const normalized = options.map(x => x.replace(/\s+/g, ' ').trim().toLocaleLowerCase());
    if (new Set(normalized).size !== normalized.length) fail(`${relative}: question ${count} contains duplicate options.`);

    const answerMatch = /answer\s*:\s*(-?\d+)/.exec(objectSource);
    if (!answerMatch) fail(`${relative}: question ${count} is missing a numeric answer index.`);
    const answer = Number(answerMatch[1]);
    if (answer < 0 || answer >= options.length) fail(`${relative}: question ${count} answer ${answer} is outside 0..${options.length - 1}.`);

    if (!/explanation\s*:/.test(objectSource)) warnings.push(`${relative}: question ${count} has no explicit explanation; review fallback will be used.`);
  }
  return count;
}

walk(root);
let totalQuestions = 0;
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  totalQuestions += inspect(relative, source);
}

if (totalQuestions < 60) fail(`Only ${totalQuestions} object-format questions were detected; expected a substantial multi-subject question corpus.`);
console.log(`Question quality audit PASSED: ${totalQuestions} object-format questions inspected across ${files.length} JS/HTML files. Structural checks: non-empty stems, 4+ unique options, valid answer indexes. Explicit-explanation warnings: ${warnings.length}.`);
if (warnings.length) {
  console.log('Non-blocking warnings:');
  for (const warning of warnings.slice(0, 25)) console.log(`- ${warning}`);
  if (warnings.length > 25) console.log(`- ... ${warnings.length - 25} more warnings`);
}
