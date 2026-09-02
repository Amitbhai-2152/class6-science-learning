import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const planPath = path.join(root, 'tests/weekly-exam-plan.js');
const source = fs.readFileSync(planPath, 'utf8');
const fail = (message) => { throw new Error(`[weekly-exam-runtime] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

// Minimal browser shim plus deterministic synthetic question banks. The production
// weekly-exam-plan.js is executed unchanged, so this test exercises its real builder,
// syllabus filtering and difficulty selection without depending on live DOM content.
const document = {
  readyState: 'loading',
  body: null,
  addEventListener() {},
  getElementById() { return null; },
  querySelector() { return null; }
};
const window = {};
const norm = (q, subject, extra = {}) => {
  if (!q || (!Array.isArray(q.options) && !Array.isArray(q.o))) return null;
  const options = Array.isArray(q.options) ? q.options : q.o;
  const answer = Number.isInteger(q.answer) ? q.answer : Number.isInteger(q.a) ? q.a : -1;
  return {
    subject,
    topic: extra.topic || q.cat || q.t || q.type || '',
    question: q.question || q.q || q.prompt || '',
    options,
    answer,
    explanation: q.explanation || q.e || 'test explanation',
    example: q.example || q.hint || '',
    chapterId: q.chapterId ?? q.c ?? extra.chapterId ?? '',
    difficulty: q.difficulty || q.level || ''
  };
};
const options = ['Option A','Option B','Option C','Option D'];
const normalized = (subject, chapterId, index, topic = '') => ({subject, topic, question:`${subject} chapter ${chapterId} synthetic question ${index}`, options, answer:0, explanation:'synthetic explanation', example:'synthetic example', chapterId});

const poolByKey = {
  science: Array.from({length:14}, (_,c) => Array.from({length:5}, (_,i) => normalized('Science', c+1, i+1))).flat(),
  socialScience: Array.from({length:14}, (_,c) => Array.from({length:5}, (_,i) => normalized('Social Science', c+1, i+1))).flat(),
  hindi: ['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'].flatMap((topic,ti) => Array.from({length:5}, (_,i) => normalized('Hindi','',ti*5+i+1,topic))),
};

// Preserve the real Maths metadata shape: two EASY + one MEDIUM + one HARD + one HOTS
// per chapter, matching the repository's existing editorial structure.
window.MathsPracticeBank = Array.from({length:8}, (_,c) => [
  {chapterId:c+1, question:`Maths chapter ${c+1} easy 1`, options, answer:0, difficulty:'EASY'},
  {chapterId:c+1, question:`Maths chapter ${c+1} easy 2`, options, answer:0, difficulty:'EASY'},
  {chapterId:c+1, question:`Maths chapter ${c+1} medium 1`, options, answer:0, difficulty:'MEDIUM'},
  {chapterId:c+1, question:`Maths chapter ${c+1} hard 1`, options, answer:0, difficulty:'HARD'},
  {chapterId:c+1, question:`Maths chapter ${c+1} hots 1`, options, answer:0, difficulty:'HOTS'}
]).flat();

// The real English bank has a 24-question chapter map. Synthetic records follow
// that same map so every production English syllabus scope can be exercised.
const englishChapters = [1,3,1,4,4,5,5,6,2,3,3,2,4,7,8,8,8,7,4,2,8,8,8,5];
window.ENGLISH_PRACTICE_BANK = englishChapters.map((chapterId,i) => ({q:`English chapter ${chapterId} synthetic question ${i+1}`,o:options,a:0}));
const gkTopics = [1,2,3].map(id => ({id,title:`GK Topic ${id}`,questions:Array.from({length:20}, (_,i) => [`GK topic ${id} question ${i+1}`,options,0])}));
const reasoningQuestions = Array.from({length:30}, (_,i) => [`Reasoning synthetic question ${i+1}`,options,0]);

const poolFor = (key) => poolByKey[key] || [];
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
  norm,
  poolFor,
  GK_HI_TOPICS: gkTopics,
  REASONING_HI: reasoningQuestions,
  MutationObserver: undefined,
  setTimeout() {},
  setInterval() {}
};
window.window = window;
vm.runInNewContext(source, sandbox, { filename: planPath });

const cfg = window.WEEKLY_EXAM_CONFIG;
const utils = window.WEEKLY_EXAM_UTILS;
const syllabus = window.WEEKLY_EXAM_SYLLABUS;
const difficulty = window.WEEKLY_DIFFICULTY_CONTRACT;
assert(cfg && utils && syllabus && difficulty, 'Production weekly-exam-plan.js did not initialize its public contracts.');
assert(utils.validate() === true, 'Production schedule validator did not pass at runtime.');
assert(difficulty.validate() === true, 'Production difficulty blueprint validator did not pass at runtime.');
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

for (let i = 0; i < cfg.exams.length; i += 1) {
  const exam = cfg.exams[i];
  const previewKey = addDays(exam.examDate, -7);
  assert(utcDate(exam.examDate).getUTCDay() === 0, `T${exam.n} is not on Sunday.`);
  assert(utcDate(previewKey).getUTCDay() === 0, `T${exam.n} preview is not on Sunday.`);
  if (i > 0) assert(addDays(cfg.exams[i - 1].examDate, 14) === exam.examDate, `T${exam.n} is not exactly 14 days after T${exam.n - 1}.`);
  assert(utils.getExamId(exam) === `CLASS6-WEEK-${exam.examDate}`, `T${exam.n} has an unstable Exam ID.`);
}

for (const exam of cfg.exams) {
  const previewKey = addDays(exam.examDate, -7);
  const preview = utils.getState(previewKey);
  assert(preview.mode === 'preview' && preview.exam.n === exam.n, `Production state machine failed for T${exam.n} preview ${previewKey}.`);
  const examState = utils.getState(exam.examDate);
  assert(examState.mode === 'exam' && examState.exam.n === exam.n, `Production state machine failed for T${exam.n} exam day ${exam.examDate}.`);
}

const firstPreview = addDays(expected[0], -7);
const firstPrep = utils.getState('2026-09-02');
assert(firstPrep.mode === 'prep' && firstPrep.exam.n === 1, '2 Sep 2026 should be the T1 preparation window.');
assert(utils.getState(firstPreview).mode === 'preview', 'T1 preview Sunday was not recognized.');
const afterFirstExam = utils.getState('2026-09-14');
assert(afterFirstExam.mode === 'prep' && afterFirstExam.exam.n === 2, 'Post-T1 window should prepare for T2.');
assert(utils.getState('2027-03-01').mode === 'closed', 'Post-final date should be closed.');

const syllabusKeys = ['science','maths','english','hindi','gk','reasoning','socialScience'];
assert(Object.keys(syllabus).length === 13, 'Runtime syllabus table does not contain T1–T13.');
for (let n = 1; n <= 13; n += 1) {
  const entry = syllabus[n];
  assert(entry, `Runtime syllabus entry T${n} is missing.`);
  for (const key of syllabusKeys) assert(Array.isArray(entry[key]), `Runtime syllabus T${n} ${key} is not an array.`);
}

const blueprint = difficulty.blueprint;
assert(Object.keys(blueprint).length === 7, 'Difficulty blueprint must cover seven subject banks.');
for (const exam of cfg.exams) {
  const paper = window.buildScopedWeeklyExam(exam);
  assert(Array.isArray(paper) && paper.length === 60, `T${exam.n} generated paper must contain exactly 60 questions.`);
  const subjectCounts = {};
  const difficultyCounts = {};
  const stems = new Set();
  for (const q of paper) {
    assert(q && q.question && Array.isArray(q.options) && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `T${exam.n} contains an invalid generated question.`);
    const stem = String(q.question).trim().toLocaleLowerCase();
    assert(!stems.has(stem), `T${exam.n} contains duplicate generated stem: ${q.question}`);
    stems.add(stem);
    subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    const difficultyKey = q.subject === 'Science' ? 'science'
      : q.subject === 'Mathematics' ? 'maths'
      : q.subject === 'English' ? 'english'
      : q.subject === 'Hindi' ? 'hindi'
      : q.subject === 'Social Science' ? 'socialScience'
      : q.topic === 'Reasoning' ? 'reasoning' : 'gk';
    difficultyCounts[difficultyKey] ||= {EASY:0,MEDIUM:0,HARD:0};
    assert(['EASY','MEDIUM','HARD'].includes(q.difficulty), `T${exam.n} question has no resolved difficulty.`);
    difficultyCounts[difficultyKey][q.difficulty] += 1;

    const s = syllabus[exam.n];
    if (q.subject === 'Science') assert(s.science.length === 0 || s.science.includes(Number(q.chapterId)), `T${exam.n} Science question escaped syllabus scope.`);
    if (q.subject === 'Mathematics') assert(s.maths.length === 0 || s.maths.includes(Number(q.chapterId)), `T${exam.n} Mathematics question escaped syllabus scope.`);
    if (q.subject === 'English') assert(s.english.length === 0 || s.english.includes(Number(q.chapterId)), `T${exam.n} English question escaped syllabus scope.`);
    if (q.subject === 'Hindi') assert(s.hindi.length === 0 || s.hindi.includes(q.topic), `T${exam.n} Hindi question escaped topic scope.`);
    if (q.subject === 'Social Science') assert(s.socialScience.length === 0 || s.socialScience.includes(Number(q.chapterId)), `T${exam.n} Social Science question escaped syllabus scope.`);
    if (q.subject === 'GK + Reasoning') {
      if (q.topic === 'Reasoning') assert(s.reasoning.length === 0 || s.reasoning.includes(Number(q.chapterId)), `T${exam.n} Reasoning question escaped syllabus scope.`);
      else assert(s.gk.length === 0 || s.gk.includes(Number(q.chapterId)), `T${exam.n} GK question escaped syllabus scope.`);
    }
  }
  for (const [subject,count] of Object.entries({Science:10,Mathematics:10,English:10,Hindi:10,'Social Science':10,'GK + Reasoning':10})) {
    assert(subjectCounts[subject] === count, `T${exam.n} ${subject} count was ${subjectCounts[subject] || 0}; expected ${count}.`);
  }
  assert(paper.filter(q => q.subject === 'GK + Reasoning' && q.topic === 'Reasoning').length === 5, `T${exam.n} must contain exactly 5 Reasoning questions.`);
  assert(paper.filter(q => q.subject === 'GK + Reasoning' && q.topic !== 'Reasoning').length === 5, `T${exam.n} must contain exactly 5 GK questions.`);
  for (const [subject,target] of Object.entries(blueprint)) {
    const actual = difficultyCounts[subject] || {EASY:0,MEDIUM:0,HARD:0};
    assert(actual.EASY === target.easy && actual.MEDIUM === target.medium && actual.HARD === target.hard, `T${exam.n} ${subject} difficulty balance ${JSON.stringify(actual)} does not match ${JSON.stringify(target)}.`);
  }
}

console.log('Weekly exam runtime test PASSED: production schedule executed successfully; all 13 schedule/state contracts plus live paper generation, 60-question distribution, syllabus scoping, duplicate protection and seven-subject difficulty blueprints verified.');