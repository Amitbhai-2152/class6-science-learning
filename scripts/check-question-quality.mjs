import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const IGNORE = new Set(['node_modules', '.git']);
const QUESTION_START = /\{\s*(?:question|q)\s*:/g;
const TUPLE_QUESTION = /\[\s*(['"])((?:\\.|(?!\1).)*)\1\s*,\s*\[([^\]]+)\]\s*,\s*(-?\d+)\s*\]/g;
const REQUIRED_BANKS = [
  ...Array.from({ length: 12 }, (_, i) => `chapters/chapter-${String(i + 1).padStart(2, '0')}.js`),
  'subjects/maths/practice-bank.js',
  'subjects/english/english-practice-bank.js',
  'subjects/english/translation-bank.js',
  'subjects/english/error-correction-bank.js',
  'subjects/hindi/hindi-practice-bank.js',
  'subjects/gk/gk-hi-content.js',
  'subjects/gk/gk-hi-reasoning.js',
  'subjects/social-science/social-science-practice-bank.js'
];
const fail = (message) => { throw new Error(`[question-quality] ${message}`); };
const warnings = [];
const files = [];
const globalStems = new Map();
const metrics = {
  total: 0,
  explicitExplanation: 0,
  exampleOrHint: 0,
  difficultyMetadata: 0,
  skillMetadata: 0,
  shortStems: 0,
  fallbackExplanations: 0,
  tupleQuestions: 0,
  objectQuestions: 0
};

function normalizeText(value) {
  return String(value ?? '')
    .replace(/[“”"'’‘`.,!?;:()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}

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

function fieldPresent(objectSource, label) {
  return new RegExp(`\\b${label}\\s*:`).test(objectSource);
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

function registerStem(relative, index, question) {
  const stem = normalizeText(question);
  if (!stem) fail(`${relative}: question ${index} is empty.`);
  if (stem.length < 15) metrics.shortStems++;
  const previous = globalStems.get(stem);
  if (previous) {
    if (previous.file === relative) fail(`${relative}: duplicate question stem detected between questions ${previous.index} and ${index}.`);
    warnings.push(`${relative}: question ${index} repeats an exact normalized stem from ${previous.file} question ${previous.index}.`);
  } else {
    globalStems.set(stem, { file: relative, index });
  }
  return stem;
}

function validateOptions(relative, index, options, answer) {
  if (!Array.isArray(options) || options.length < 4) fail(`${relative}: question ${index} has ${options?.length ?? 0} options; MCQ items require at least 4.`);
  const normalized = options.map(x => normalizeText(x));
  if (normalized.some(x => !x)) fail(`${relative}: question ${index} contains an empty option.`);
  if (new Set(normalized).size !== normalized.length) fail(`${relative}: question ${index} contains duplicate options.`);
  if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) fail(`${relative}: question ${index} answer ${answer} is outside 0..${options.length - 1}.`);
}

function inspectObjectQuestions(relative, source) {
  let count = 0;
  for (const match of source.matchAll(QUESTION_START)) {
    const objectSource = balancedObject(source, match.index);
    if (!objectSource) fail(`${relative}: unterminated question object near character ${match.index}.`);
    count++;
    metrics.total++;
    metrics.objectQuestions++;
    const question = fieldString(objectSource, 'question') ?? fieldString(objectSource, 'q');
    registerStem(relative, count, question);

    const body = arrayBody(objectSource);
    if (body === null) {
      warnings.push(`${relative}: question ${count} is not an MCQ object with an options array.`);
      continue;
    }
    const options = splitTopLevel(body).map(tokenValue).filter(Boolean);
    const answerMatch = /answer\s*:\s*(-?\d+)/.exec(objectSource);
    const answer = answerMatch ? Number(answerMatch[1]) : NaN;
    if (!answerMatch) fail(`${relative}: question ${count} is missing a numeric answer index.`);
    validateOptions(relative, count, options, answer);

    const explanation = fieldString(objectSource, 'explanation') ?? fieldString(objectSource, 'e');
    if (explanation?.trim()) {
      metrics.explicitExplanation++;
      if (normalizeText(explanation).includes('सही विकल्प दिए गए concept के अनुसार')) metrics.fallbackExplanations++;
    } else {
      warnings.push(`${relative}: question ${count} has no explicit explanation; review fallback may be used.`);
    }
    if (fieldPresent(objectSource, 'example') || fieldPresent(objectSource, 'hint')) metrics.exampleOrHint++;
    if (fieldPresent(objectSource, 'difficulty')) metrics.difficultyMetadata++;
    if (fieldPresent(objectSource, 'skill') || fieldPresent(objectSource, 'cognitive')) metrics.skillMetadata++;
  }
  return count;
}

function inspectTupleQuestions(relative, source) {
  let count = 0;
  for (const match of source.matchAll(TUPLE_QUESTION)) {
    count++;
    metrics.total++;
    metrics.tupleQuestions++;
    const question = match[2];
    registerStem(relative, count, question);
    const options = splitTopLevel(match[3]).map(tokenValue).filter(Boolean);
    validateOptions(relative, count, options, Number(match[4]));
  }
  return count;
}

walk(root);

for (const required of REQUIRED_BANKS) {
  if (!fs.existsSync(path.join(root, required))) fail(`required question bank file is missing: ${required}`);
}

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  inspectObjectQuestions(relative, source);
  if (relative === 'subjects/gk/gk-hi-content.js' || relative === 'subjects/gk/gk-hi-reasoning.js') {
    inspectTupleQuestions(relative, source);
  }
}

if (metrics.total < 100) fail(`Only ${metrics.total} validated question items were detected; expected a substantial Class 6 multi-subject corpus.`);
if (metrics.tupleQuestions < 30) fail(`GK/Reasoning tuple audit detected only ${metrics.tupleQuestions} items; expected at least 30.`);
if (metrics.fallbackExplanations > 0) warnings.push(`${metrics.fallbackExplanations} inspected questions contain the generic fallback explanation text rather than a fully specific explanation.`);
if (metrics.difficultyMetadata === 0) warnings.push('No explicit difficulty metadata was found in the inspected question objects; difficulty balancing is therefore not yet authoritative.');
if (metrics.skillMetadata === 0) warnings.push('No explicit skill/cognitive metadata was found in the inspected question objects; cognitive-level balancing is therefore not yet authoritative.');

const fileCount = REQUIRED_BANKS.length;
console.log(`Question quality audit PASSED: ${metrics.total} question items validated (${metrics.objectQuestions} object-form + ${metrics.tupleQuestions} tuple-form) across required Class 6 banks. Structural checks: non-empty stems, unique stems within each source file, 4+ unique options, valid answer indexes, bank presence. Explicit explanations: ${metrics.explicitExplanation}; examples/hints: ${metrics.exampleOrHint}; warnings: ${warnings.length}. Difficulty metadata: ${metrics.difficultyMetadata}; skill/cognitive metadata: ${metrics.skillMetadata}. Required banks checked: ${fileCount}.`);
if (warnings.length) {
  console.log('Non-blocking quality findings:');
  for (const warning of warnings.slice(0, 40)) console.log(`- ${warning}`);
  if (warnings.length > 40) console.log(`- ... ${warnings.length - 40} more findings`);
}
