import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (message) => { throw new Error(`[weekly-exam] ${message}`); };

const planSource = read('tests/weekly-exam-plan.js');
const indexSource = read('tests/index.html');
const gateSource = read('tests/weekly-exam.js');
const plannerSource = read('tests/planner.html');

const expected = [
  '2026-09-13','2026-09-27','2026-10-11','2026-10-25','2026-11-08','2026-11-22',
  '2026-12-06','2026-12-20','2027-01-03','2027-01-17','2027-01-31','2027-02-14','2027-02-28'
];

const dates = [...planSource.matchAll(/examDate:\s*'([^']+)'/g)].map(m => m[1]);
if (JSON.stringify(dates) !== JSON.stringify(expected)) fail(`unexpected exam date sequence: ${dates.join(', ')}`);
if (!planSource.includes("finalDate: '2027-02-28'")) fail('finalDate is not 2027-02-28');
if (!planSource.includes("timeZone: 'Asia/Kolkata'")) fail('Asia/Kolkata schedule timezone missing');
if (!planSource.includes('gap !== 14')) fail('14-day spacing validation missing');
if (!planSource.includes('getExamId')) fail('Exam ID contract missing');
if (!indexSource.includes('<script src="./weekly-exam.js"></script>')) fail('All Tests page is missing weekly gate script');
if (!gateSource.includes("script.src = './weekly-exam-plan.js'")) fail('weekly gate cannot load centralized plan');
if (!gateSource.includes('Candidate examination is not open today.')) fail('strict exam-open guard missing');
if (!gateSource.includes('window.__weeklyDeterministicBuilder')) fail('deterministic paper guard missing');
if (!plannerSource.includes('<script src="./weekly-exam-plan.js"></script>')) fail('planner does not load centralized plan');

for (const required of ['tests/index.html','tests/planner.html','tests/weekly-exam.js','tests/weekly-exam-plan.js']) {
  if (!fs.existsSync(path.join(root, required))) fail(`missing required file: ${required}`);
}

console.log(`Weekly exam smoke-check passed: ${dates.length} exams, final ${dates.at(-1)}, timezone Asia/Kolkata.`);
