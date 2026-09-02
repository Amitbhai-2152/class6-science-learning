import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const planPath = path.join(root, 'tests/weekly-exam-plan.js');
const source = fs.readFileSync(planPath, 'utf8');
const fail = (message) => { throw new Error(`[final-syllabus] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const options = ['Option A','Option B','Option C','Option D'];
const normalized = (subject, chapterId, index, topic = '') => ({
  subject, topic, question:`${subject} ${topic || `chapter ${chapterId}`} synthetic question ${index}`,
  options, answer:0, explanation:'synthetic explanation', example:'synthetic example', chapterId
});
const norm = (q, subject, extra = {}) => ({
  subject,
  topic: extra.topic || q.cat || q.t || q.type || '',
  question: q.question || q.q || q.prompt || '',
  options: Array.isArray(q.options) ? q.options : q.o,
  answer: Number.isInteger(q.answer) ? q.answer : Number.isInteger(q.a) ? q.a : -1,
  explanation: q.explanation || q.e || 'test explanation',
  example: q.example || q.hint || '',
  chapterId: q.chapterId ?? q.c ?? extra.chapterId ?? '',
  difficulty: q.difficulty || q.level || ''
});

const poolFor = (key) => {
  if (key === 'science' || key === 'socialScience') {
    const subject = key === 'science' ? 'Science' : 'Social Science';
    return Array.from({length:14}, (_,c) => Array.from({length:5}, (_,i) => normalized(subject,c+1,i+1))).flat();
  }
  if (key === 'hindi') {
    return ['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'].flatMap((topic,t) => Array.from({length:5}, (_,i) => normalized('Hindi','',t*5+i+1,topic)));
  }
  return [];
};

const englishChapters = [1,3,1,4,4,5,5,6,2,3,3,2,4,7,8,8,8,7,4,2,8,8,8,5];
const gkTopics = [1,2,3].map(id => ({id,title:`GK Topic ${id}`,questions:Array.from({length:20}, (_,i) => [`GK topic ${id} question ${i+1}`,options,0])}));
const reasoningQuestions = Array.from({length:30}, (_,i) => [`Reasoning synthetic question ${i+1}`,options,0]);
const window = {};
window.MathsPracticeBank = Array.from({length:8}, (_,c) => Array.from({length:5}, (_,i) => ({chapterId:c+1,question:`Maths chapter ${c+1} question ${i+1}`,options,answer:0,difficulty:['EASY','EASY','MEDIUM','HARD','HARD'][i]}))).flat();
window.ENGLISH_PRACTICE_BANK = englishChapters.map((chapterId,i) => ({q:`English chapter ${chapterId} synthetic question ${i+1}`,o:options,a:0}));
const document = {readyState:'loading',body:null,addEventListener(){},getElementById(){return null;},querySelector(){return null;}};
const sandbox = {window,document,Intl,Date,Math,Set,Object,String,Number,Array,Error,console,norm,poolFor,GK_HI_TOPICS:gkTopics,REASONING_HI:reasoningQuestions,MutationObserver:undefined,setTimeout(){},setInterval(){}};
window.window = window;
vm.runInNewContext(source, sandbox, {filename:planPath,timeout:2000});

const expected = {
  science:[1,2,3,4,5,6,7,8,9,10,11,12],
  maths:[1,2,3,4,5,6,7,8],
  english:[1,2,3,4,5,6,7,8],
  hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],
  gk:[1,2,3],
  reasoning:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
  socialScience:[1,2,3,4,5,6,7,8,9,10,11,12,13,14]
};

const stable = value => JSON.stringify(value);
const syllabus = window.WEEKLY_EXAM_SYLLABUS;
const contract = window.WEEKLY_EXAM_FINAL_SYLLABUS;
assert(contract && syllabus, 'Final syllabus contracts were not initialized.');
assert(stable(contract[12]) === stable(expected), 'T12 final syllabus contract does not match the approved full-syllabus scope.');
assert(stable(contract[13]) === stable(expected), 'T13 final syllabus contract does not match the approved full-syllabus scope.');
assert(stable(syllabus[12]) === stable(expected), 'T12 production syllabus entry does not match the final contract.');
assert(stable(syllabus[13]) === stable(expected), 'T13 production syllabus entry does not match the final contract.');
assert(window.validateWeeklySyllabus() === true, 'Production syllabus validator rejected the final T12/T13 contract.');

for (const n of [12,13]) {
  const exam = window.WEEKLY_EXAM_CONFIG.exams[n-1];
  const paper = window.buildScopedWeeklyExam(exam);
  assert(Array.isArray(paper) && paper.length === 60, `T${n} generated paper must contain exactly 60 questions.`);
  const expectedCounts = {Science:10,Mathematics:10,English:10,Hindi:10,'GK + Reasoning':10,'Social Science':10};
  const counts = Object.fromEntries(Object.keys(expectedCounts).map(key => [key,0]));
  for (const q of paper) {
    counts[q.subject]++;
    if (q.subject === 'Science') assert(expected.science.includes(Number(q.chapterId)), `T${n} Science question escaped explicit final scope.`);
    if (q.subject === 'Mathematics') assert(expected.maths.includes(Number(q.chapterId)), `T${n} Mathematics question escaped explicit final scope.`);
    if (q.subject === 'English') assert(expected.english.includes(Number(q.chapterId)), `T${n} English question escaped explicit final scope.`);
    if (q.subject === 'Hindi') assert(expected.hindi.includes(q.topic), `T${n} Hindi question escaped explicit final topic scope.`);
    if (q.subject === 'Social Science') assert(expected.socialScience.includes(Number(q.chapterId)), `T${n} Social Science question escaped explicit final scope.`);
    if (q.subject === 'GK + Reasoning' && q.topic === 'Reasoning') assert(expected.reasoning.includes(Number(q.chapterId)), `T${n} Reasoning question escaped explicit final scope.`);
    if (q.subject === 'GK + Reasoning' && q.topic !== 'Reasoning') assert(expected.gk.includes(Number(q.chapterId)), `T${n} GK question escaped explicit final scope.`);
  }
  for (const [subject,count] of Object.entries(expectedCounts)) assert(counts[subject] === count, `T${n} ${subject} count was ${counts[subject]}; expected ${count}.`);
  assert(paper.filter(q => q.subject === 'GK + Reasoning' && q.topic === 'Reasoning').length === 5, `T${n} reasoning split changed.`);
  assert(paper.filter(q => q.subject === 'GK + Reasoning' && q.topic !== 'Reasoning').length === 5, `T${n} GK split changed.`);
}

console.log('Final syllabus contract check PASSED: T12 and T13 explicitly declare the complete Class 6 syllabus and production paper generation remains within those exact chapter/topic scopes.');
