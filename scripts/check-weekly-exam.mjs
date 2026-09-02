import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { throw new Error(`[weekly-exam] ${message}`); };

const planSource = read('tests/weekly-exam-plan.js');
const indexSource = read('tests/index.html');
const gateSource = read('tests/weekly-exam.js');
const plannerSource = read('tests/planner.html');
const workflowSource = read('.github/workflows/weekly-exam-schedule.yml');

const expected = [
  '2026-09-13','2026-09-27','2026-10-11','2026-10-25','2026-11-08','2026-11-22',
  '2026-12-06','2026-12-20','2027-01-03','2027-01-17','2027-01-31','2027-02-14','2027-02-28'
];

const dates = [...planSource.matchAll(/\[\d+,\s*'([^']+)'/g)].map(m => m[1]);
if (JSON.stringify(dates) !== JSON.stringify(expected)) fail(`unexpected exam date sequence: ${dates.join(', ')}`);
if (!planSource.includes("finalDate:'2027-02-28'")) fail('finalDate is not 2027-02-28');
if (!planSource.includes("timeZone:'Asia/Kolkata'")) fail('Asia/Kolkata schedule timezone missing');
if (!planSource.includes('14*86400000')) fail('14-day spacing validation missing');
if (!planSource.includes('getExamId(exam)')) fail('Exam ID contract missing');
if (!planSource.includes('const SYLLABUS={')) fail('Exact syllabus table missing');
const syllabusEntries = [...planSource.matchAll(/\n\s*(\d+):\{/g)].map(m => Number(m[1]));
if (JSON.stringify(syllabusEntries) !== JSON.stringify([...Array(13)].map((_, i) => i + 1))) fail('Syllabus must define exactly T1–T13 in order.');
if (!planSource.includes('ENGLISH_BANK_CHAPTERS.length!==24')) fail('English bank chapter map contract missing');
if (!planSource.includes('bank.length!==30')) fail('Reasoning bank count contract missing');
if (!planSource.includes('slice(0,5)')) fail('Strict 5+5 GK/Reasoning split missing');
if (!planSource.includes('scope.length===0')) fail('All-material scope contract missing');
if (!planSource.includes('buildScopedWeeklyExam')) fail('Scoped weekly builder missing');
if (planSource.includes('स सर्वनाम')) fail('Corrupted Hindi syllabus token detected');
if (!indexSource.includes('<script src="./weekly-exam.js"></script>')) fail('All Tests page is missing weekly gate script');
if (!gateSource.includes("script.src = './weekly-exam-plan.js'")) fail('weekly gate cannot load centralized plan');
if (!gateSource.includes('Candidate examination is not open today.')) fail('strict exam-open guard missing');
if (!gateSource.includes('validateGeneratedPaper')) fail('generated-paper quality gate missing');
if (!gateSource.includes('duplicate question stem')) fail('duplicate-stem protection missing from generated-paper gate');
if (!gateSource.includes("'GK + Reasoning': 10")) fail('GK + Reasoning section count contract missing');
if (!gateSource.includes('reasoning !== 5')) fail('strict 5-question reasoning split missing from generated-paper gate');
if (!gateSource.includes('window.__weeklyQualityBuilder')) fail('quality builder guard missing');
if (!plannerSource.includes('<script src="./weekly-exam-plan.js"></script>')) fail('planner does not load centralized plan');
if (!workflowSource.includes('scripts/check-question-quality.mjs')) fail('CI is missing the question-quality audit path filter');
if (!workflowSource.includes('npm run check:question-quality')) fail('CI is missing the question-quality audit step');

for (const required of ['tests/index.html','tests/planner.html','tests/weekly-exam.js','tests/weekly-exam-plan.js','scripts/check-question-quality.mjs']) {
  if (!fs.existsSync(path.join(root, required))) fail(`missing required file: ${required}`);
}

console.log(`Weekly exam smoke-check contract passed: ${dates.length} exams, final ${dates.at(-1)}, exact T1–T13 syllabus, generated-paper quality gate and CI quality-audit integration present.`);
