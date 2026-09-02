import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const planPath = path.join(root, 'tests/weekly-exam-plan.js');
const allTestsPath = path.join(root, 'tests/weekly-exam.js');
const planSource = fs.readFileSync(planPath, 'utf8');
const allTestsSource = fs.readFileSync(allTestsPath, 'utf8');
const fail = (message) => { throw new Error(`[all-tests-validation] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const document = {
  readyState: 'loading',
  addEventListener() {},
  getElementById() { return null; },
  querySelector() { return null; }
};
const window = {};
const sandbox = {
  window,
  document,
  Intl,
  Date,
  Math,
  Set,
  Object,
  String,
  Number,
  Array,
  Error,
  console,
  setTimeout() {},
  setInterval() {},
  MutationObserver: undefined
};
window.window = window;
vm.runInNewContext(planSource, sandbox, { filename: planPath });

const utils = window.WEEKLY_EXAM_UTILS;
assert(utils && typeof utils.parseDateKey === 'function', 'Production weekly date utilities did not initialize.');
assert(utils.parseDateKey('2027-02-28').toISOString().slice(0, 10) === '2027-02-28', 'Valid final-exam date was rejected or altered.');
for (const invalid of ['2027-02-29', '2027-02-31', '2027-04-31', '2027-13-01', '2027-00-10']) {
  let threw = false;
  try { utils.parseDateKey(invalid); } catch (_) { threw = true; }
  assert(threw, `Invalid calendar date ${invalid} was accepted.`);
}

assert(allTestsSource.includes("const chapterValue = q.subject === 'Hindi' ? q.topic : q.chapterId;"), 'All Tests validator is missing the unified scope metadata lookup.');
assert(allTestsSource.includes('is missing required ${field} metadata for its declared syllabus scope.'), 'All Tests validator is missing the required metadata hard-fail.');
assert(allTestsSource.includes('has invalid chapterId metadata for its declared syllabus scope.'), 'All Tests validator is missing invalid chapterId rejection.');
assert(!allTestsSource.includes("Array.isArray(allowed) && allowed.length && q.chapterId !== '' && q.chapterId !== undefined && q.chapterId !== null"), 'The old optional chapterId validation bypass is still present.');

console.log('All Tests validation check PASSED: invalid calendar dates are rejected by the production helper, and explicit syllabus scopes now reject missing/invalid question metadata.');
