import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const report = [];
const seen = new Map();
const SOURCES = [
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

const normalize = (value) => String(value ?? '')
  .normalize('NFKC')
  .toLocaleLowerCase()
  .replace(/[“”"'’‘`.,!?;:()[\]{}]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokens = (value) => new Set(
  normalize(value)
    .split(/\s+/)
    .filter(x => x.length > 1 || /^[a-z0-9]$/i.test(x))
);
const similarity = (a, b) => {
  const A = tokens(a), B = tokens(b);
  if (A.size < 5 || B.size < 5) return 0;
  let common = 0;
  for (const token of A) if (B.has(token)) common++;
  return common / (A.size + B.size - common);
};

function addQuestion(source, index, question, options = [], answer = -1, explanation = '', { legacyTuple = false } = {}) {
  const stem = normalize(question);
  if (!stem) return;
  const key = `${source}#${index}`;
  const previous = seen.get(stem);
  if (previous) {
    report.push(`[DUPLICATE] ${key} repeats ${previous.source}#${previous.index}: ${question}`);
  } else {
    seen.set(stem, { source, index, question });
  }

  const normalizedOptions = options.map(normalize);
  if (new Set(normalizedOptions).size !== normalizedOptions.length) {
    report.push(`[DUPLICATE-OPTION] ${key} contains duplicate option text.`);
  }
  if (answer >= 0 && answer < normalizedOptions.length) {
    const correct = normalizedOptions[answer];
    for (let i = 0; i < normalizedOptions.length; i++) {
      if (i === answer) continue;
      if (normalizedOptions[i] && normalizedOptions[i] === correct) {
        report.push(`[DISTRACTOR] ${key} repeats the correct answer as an option.`);
      }
      // Do not treat ordinary morphology or compound words as defective overlap.
      const correctTokens = tokens(correct);
      const distractorTokens = tokens(normalizedOptions[i]);
      if (correctTokens.size >= 2 && distractorTokens.size >= 2) {
        let shared = 0;
        for (const token of correctTokens) if (distractorTokens.has(token)) shared++;
        if (shared >= 2 && shared / Math.min(correctTokens.size, distractorTokens.size) >= 0.8) {
          report.push(`[DISTRACTOR-OVERLAP] ${key} has a distractor with unusually high phrase overlap.`);
        }
      }
    }
  }
  if (!legacyTuple && (!explanation || normalize(explanation).length < 12)) {
    report.push(`[EXPLANATION] ${key} has no sufficiently specific explanation.`);
  }
}

function extractObjects(source, relative) {
  const re = /\{\s*(?:question|q)\s*:/g;
  let index = 0;
  for (const match of source.matchAll(re)) {
    let depth = 0, quote = null, escaped = false, end = -1;
    for (let i = match.index; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '\'' || ch === '"' || ch === '`') { quote = ch; continue; }
      if (ch === '{') depth++;
      if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    if (end < 0) continue;
    const object = source.slice(match.index, end);
    const q = /(?:question|q)\s*:\s*(['"])((?:\\.|(?!\1).)*)\1/.exec(object)?.[2] ?? '';
    const optionMatch = /options\s*:\s*\[([\s\S]*?)\]/.exec(object);
    const options = optionMatch ? [...optionMatch[1].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g)].map(m => m[2]) : [];
    const answer = Number(/(?:answer|a)\s*:\s*(-?\d+)/.exec(object)?.[1] ?? -1);
    const explanation = /(?:explanation|e)\s*:\s*(['"])((?:\\.|(?!\1).)*)\1/.exec(object)?.[2] ?? '';
    index++;
    addQuestion(relative, index, q, options, answer, explanation);
  }
}

function extractTuples(source, relative) {
  const re = /\[\s*(['"])((?:\\.|(?!\1).)*)\1\s*,\s*\[([^\]]+)\]\s*,\s*(-?\d+)\s*\]/g;
  let index = 0;
  for (const match of source.matchAll(re)) {
    const options = [...match[3].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g)].map(m => m[2]);
    index++;
    addQuestion(relative, `tuple-${index}`, match[2], options, Number(match[4]), '', { legacyTuple: true });
  }
}

for (const relative of SOURCES) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full)) throw new Error(`[corpus-audit] Missing source: ${relative}`);
  const source = fs.readFileSync(full, 'utf8');
  extractObjects(source, relative);
  if (relative.includes('gk-hi-content.js') || relative.includes('gk-hi-reasoning.js')) extractTuples(source, relative);
}

const all = [...seen.values()];
const near = [];
for (let i = 0; i < all.length; i++) {
  for (let j = i + 1; j < all.length; j++) {
    const score = similarity(all[i].question, all[j].question);
    if (score >= 0.82) near.push(`[NEAR-DUPLICATE ${(score * 100).toFixed(0)}%] ${all[i].source}#${all[i].index} ↔ ${all[j].source}#${all[j].index}`);
  }
}
report.push(...near);

const counts = SOURCES.map(source => `${source}: ${all.filter(x => x.source === source).length}`).join('\n');
console.log(`Corpus educational audit inspected ${all.length} question stems across ${SOURCES.length} authoritative sources.`);
console.log(`Per-source counts:\n${counts}`);
if (report.length) {
  console.log(`Findings: ${report.length}`);
  for (const item of report.slice(0, 200)) console.log(`- ${item}`);
  if (report.length > 200) console.log(`- ... ${report.length - 200} additional findings`);
} else {
  console.log('Findings: 0');
}

// This is intentionally a reporting audit, not a blocking structural gate.
// Educational similarity and distractor quality require editorial judgement; the
// existing structural/runtime gates remain the hard safety net for exam generation.
