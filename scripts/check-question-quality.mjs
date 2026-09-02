import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const IGNORE = new Set(['node_modules', '.git']);
const QUESTION_START = /\{\s*(?:question|q)\s*:/g;

const fail = (message) => { throw new Error(`[question-quality] ${message}`); };
const warn = [];
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:js|html)$/i.test(entry.name)) files.push(full);
  }
}

function readQuoted(source, start) {
  const quote = source[start];
  let out = '';
  for (let i = start + 1; i < source.length; i++) {
    const ch = source[i];
    if (ch === '\\') { out += ch + (source[i + 1] ?? ''); i++; continue; }
    if (ch === quote) return { value: out, end: i + 1 };
    out += ch;
  }
  return null;
}

function findBalancedObject(source, start) {
  let depth = 0;
  let quote = null;
  let escaped = false;
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

function parseStringAfter(label, objectSource) {
  const re = new RegExp(`${label}\\s*:\\s*(['"])");
  const m = re.exec(objectSource);
  if (!m) return null;
  return readQuoted(objectSource, m.index + m[0].length - 1)?.value ?? null;
}

function parseArrayLiteral(objectSource) {
  const m = /options\s*:\s*\[/.exec(objectSource);
  if (!m) return null;
  const start = m.index + m[0].length - 1;
  let depth = 0;
  let quote = null;
  let escaped = false;
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

function splitTopLevelArrayItems(text) {
  const items = [];
  let last = 0, depth = 0, quote = null, escaped = false;
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
    else if (ch === ',' && depth === 0) { items.push(text.slice(last, i).trim()); last = i + 1; }
  }
  const tail = text.slice(last).trim();
  if (tail) items.push(tail);
  return items;
}

function decodeSimpleString(token) {
  const t = token.trim();
  if (!/^['"`]/.test(t)) return t;
  const parsed = readQuoted(t, 0);
  return parsed?.value ?? t;
}

function inspectObjectQuestions(relative, source) {
  let count = 0;
  let index = 0;
  for (const m of source.matchAll(QUESTION_START)) {
    const start = m.index;
    const objectSource = findBalancedObject(source, start);
    if (!objectSource) fail(`${relative}: unterminated question object near character ${start}.`);
    index++;
    count++;

    const question = parseStringAfter('question', objectSource) ?? parseStringAfter('q', objectSource) ?? '';
    if (!question.trim()) fail(`${relative}: question object ${index} has an empty question.`);

    const optionsSource = parseArrayLiteral(objectSource);
    if (optionsSource === null) {
      warn.push(`${relative}: question ${index} has no options array.`);
      continue;
    }
    const options = splitTopLevelArrayItems(optionsSource).map(decodeSimpleString).filter(Boolean);
    if (options.length < 4) fail(`${relative}: question ${index} has ${options.length} options; class-test MCQ banks require at least 4.`);
    const normalized = options.map(x => x.replace(/\s+/g, ' ').trim().toLowerCase());
    if (new Set(normalized).size !== normalized.length) fail(`${relative}: question ${index} contains duplicate answer options.`);

    const answerMatch = /answer\s*:\s*(-?\d+)/.exec(objectSource);
    if (!answerMatch) fail(`${relative}: question ${index} is missing numeric answer index.`);
    const answer = Number(answerMatch[1]);
    if (answer < 0 || answer >= options.length) fail(`${relative}: question ${index} answer index ${answer} is outside 0..${options.length - 1}.`);

    if (!/explanation\s*:/.test(objectSource)) warn.push(`${relative}: question ${index} has no explicit explanation; review fallback will be used.`);
  }
  return count;
}

function inspectTupleBanks(relative, source) {
  const tupleBank = /(?:REASONING_HI|GK_HI_TOPICS)\s*=|(?:REASONING|GK)[^=]*=/.test(source);
  if (!tupleBank) return 0;
  const nums = [...source.matchAll(/\[\s*(['"`])([\s\S]*?)\1\s*,\s*\[/g)];
  return nums.length;
}

walk(root);
let objectQuestions = 0;
let htmlQuestionHits = 0;
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  objectQuestions += inspectObjectQuestions(relative, source);
  if (/question|questions|quiz/i.test(source) && /options|answer/i.test(source)) htmlQuestionHits++;
  inspectTupleBanks(relative, source);
}

if (objectQuestions === 0) fail('No object-format question records were detected; audit configuration is likely broken.');

console.log(`Question quality audit PASSED: ${objectQuestions} object-format questions inspected across ${files.length} JS/HTML files; ${warn.length} non-blocking explanation warnings; ${htmlQuestionHits} question-bearing HTML/JS files detected.`);
if (warn.length) {
  console.log('Warnings (non-blocking):');
  for (const message of warn.slice(0, 25)) console.log(`- ${message}`);
  if (warn.length > 25) console.log(`- ... ${warn.length - 25} more warnings`);
}
