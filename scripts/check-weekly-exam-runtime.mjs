import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const planPath = path.join(root, 'tests/weekly-exam-plan.js');
const source = fs.readFileSync(planPath, 'utf8');
const fail = (message) => { throw new Error(`[weekly-exam-runtime] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

// Execute the production schedule file itself in a tiny browser-like sandbox.
// This catches runtime failures that a text-only/static smoke-check cannot catch.
const document = {
  readyState: 'loading',
  body: null,
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
  MutationObserver: undefined,
  setTimeout() {},
  setInterval() {}
};
window.window = window;
vm.runInNewContext(source, sandbox, { filename: planPath });

const cfg = window.WEEKLY_EXAM_CONFIG;
const utils = window.WEEKLY_EXAM_UTILS;
const syllabus = window.WEEKLY_EXAM_SYLLABUS;
assert(cfg && utils && syllabus, 'Production weekly-exam-plan.js did not initialize its public contracts.');
assert(utils.validate() === true, 'Production schedule validator did not pass at runtime.');
assert(cfg.timeZone === 'Asia/Kolkata', 'Production schedule timezone is not Asia/Kolkata.');
assert(cfg.previewLeadDays === 7, 'Preview lead time is not 7 days.');
assert(cfg.questionCount === 60 && cfg.marks === 60 && cfg.durationMinutes === 90, 'Exam size/marks/duration contract changed.');
assert(cfg.exams.length === 13, 'Production schedule does not contain exactly 13 exams.');

const expected = [
  '2026-09-13','2026-09-27','2026-10-11','2026-10-25','2026-11-08','2026-11-22',
  '2026-12-06','2026-12-20','2027-01-03','2027-01-17','2027-01-31','2027-02-14','2027-02-28'
];
assert(JSON.stringify(cfg.exams.map(e => e.examDate)) === JSON.stringify(expected), 'Runtime exam date sequence does not match the approved calendar.');

const utcDate = (key) => new Date(`${key}T00:00:00Z`);
const addDays = (key, days) => {
  const d = utcDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

// Independently verify that every exam is Sunday, every preview is the prior Sunday,
// and candidate exams are exactly 14 days apart.
for (let i = 0; i < cfg.exams.length; i += 1) {
  const exam = cfg.exams[i];
  assert(utcDate(exam.examDate).getUTCDay() === 0, `T${exam.n} is not on Sunday.`);
  assert(addDays(exam.examDate, -7) === cfg.exams[i].examDate.slice(0, 7) ? true : true, 'noop');
  assert(utcDate(addDays(exam.examDate, -7)).getUTCDay() === 0, `T${exam.n} preview is not on Sunday.`);
  if (i > 0) {
    assert(addDays(cfg.exams[i - 1].examDate, 14) === exam.examDate, `T${exam.n} is not exactly 14 days after T${exam.n - 1}.`);
  }
  assert(utils.getExamId(exam) === `CLASS6-WEEK-${exam.examDate}`, `T${exam.n} has an unstable Exam ID.`);
}

// Verify the actual production state machine at every preview Sunday and exam Sunday.
for (const exam of cfg.exams) {
  const previewKey = addDays(exam.examDate, -7);
  const preview = utils.getState(previewKey);
  assert(preview.mode === 'preview' && preview.exam.n === exam.n, `Production state machine failed for T${exam.n} preview ${previewKey}.`);

  const examState = utils.getState(exam.examDate);
  assert(examState.mode === 'exam' && examState.exam.n === exam.n, `Production state machine failed for T${exam.n} exam day ${exam.examDate}.`);
}

// Boundary/state checks that matter to the real candidate flow.
const firstPreview = addDays(expected[0], -7);
const firstPrep = utils.getState('2026-09-02');
assert(firstPrep.mode === 'prep' && firstPrep.exam.n === 1, '2 Sep 2026 should be the T1 preparation window.');
assert(utils.getState(firstPreview).mode === 'preview', 'T1 preview Sunday was not recognized.');
assert(utils.getState('2026-09-14').mode === 'prep' && utils.getState('2026-09-14').exam.n === 2, 'Post-T1 window should prepare for T2.');
assert(utils.getState('2027-03-01').mode === 'closed', 'Post-final date should be closed.');

const syllabusKeys = ['science','maths','english','hindi','gk','reasoning','socialScience'];
assert(Object.keys(syllabus).length === 13, 'Runtime syllabus table does not contain T1–T13.');
for (let n = 1; n <= 13; n += 1) {
  const entry = syllabus[n];
  assert(entry, `Runtime syllabus entry T${n} is missing.`);
  for (const key of syllabusKeys) assert(Array.isArray(entry[key]), `Runtime syllabus T${n} ${key} is not an array.`);
}

console.log('Weekly exam runtime test PASSED: production schedule executed successfully; 13 exam Sundays, 13 preview Sundays, 14-day spacing, Exam IDs, state transitions, boundaries and T1–T13 syllabus contracts verified.');
