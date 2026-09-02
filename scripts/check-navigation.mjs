import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['.git', 'node_modules']);
const HTML_EXT = '.html';
const hrefRe = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const issues = [];
const checked = [];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !IGNORE_DIRS.has(entry.name)) out.push(...walk(path.join(dir, entry.name)));
    else if (entry.isFile() && entry.name.endsWith(HTML_EXT)) out.push(path.join(dir, entry.name));
  }
  return out;
}

function isExternal(value) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|data:|javascript:)/i.test(value);
}
function cleanTarget(value) {
  return value.split('#')[0].split('?')[0];
}
function resolveTarget(sourceFile, target) {
  const clean = cleanTarget(target);
  if (!clean) return null;
  const absolute = clean.startsWith('/')
    ? path.join(ROOT, clean.replace(/^\/+/, ''))
    : path.resolve(path.dirname(sourceFile), clean);
  return absolute;
}

for (const file of walk(ROOT)) {
  const html = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = hrefRe.exec(html))) {
    const raw = match[1].trim();
    if (!raw || isExternal(raw) || raw === '#') continue;
    const target = resolveTarget(file, raw);
    if (!target) continue;
    checked.push({ file: path.relative(ROOT, file), raw });
    if (!fs.existsSync(target)) {
      issues.push(`${path.relative(ROOT, file)} -> ${raw}`);
    }
  }
}

// Stable route contracts that are intentionally handled by the homepage router.
const routeContracts = [
  ['index.html?view=science', 'js/home-routing.js'],
  ['index.html?view=science-practice', 'js/home-routing.js'],
  ['index.html?view=science-cbt', 'js/home-routing.js'],
  ['revision-v2.html?subject=science', 'js/revision-quality.js'],
  ['revision-v2.html?subject=maths', 'js/revision-quality.js'],
  ['revision-v2.html?subject=english', 'js/revision-quality.js'],
  ['revision-v2.html?subject=hindi', 'js/revision-quality.js'],
  ['revision-v2.html?subject=gk', 'js/revision-quality.js'],
  ['revision-v2.html?subject=social', 'js/revision-quality.js']
];
for (const [route, owner] of routeContracts) {
  const page = route.split('?')[0];
  if (!fs.existsSync(path.join(ROOT, page))) issues.push(`missing route page: ${route}`);
  if (!fs.existsSync(path.join(ROOT, owner))) issues.push(`missing route owner: ${owner}`);
}

console.log(`Navigation audit: ${checked.length} internal resource links checked.`);
console.log(`Navigation audit: ${routeContracts.length} dynamic route contracts checked.`);
if (issues.length) {
  console.error(`Navigation audit FAILED: ${issues.length} issue(s)`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log('Navigation audit PASSED: no broken literal internal links or missing route contracts detected.');
