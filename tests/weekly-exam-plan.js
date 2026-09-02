'use strict';

/* Single source of truth for the Class 6 Sunday examination cycle. */
window.WEEKLY_EXAM_CONFIG = Object.freeze({
  timeZone: 'Asia/Kolkata',
  previewLeadDays: 7,
  questionCount: 60,
  marks: 60,
  durationMinutes: 90,
  finalDate: '2027-02-28',
  exams: Object.freeze([
    Object.freeze({ n: 1, examDate: '2026-09-13', type: 'Foundation 1', focus: 'Initial chapters + core basics' }),
    Object.freeze({ n: 2, examDate: '2026-09-27', type: 'Foundation 2', focus: 'New chapters + Test 1 revision' }),
    Object.freeze({ n: 3, examDate: '2026-10-11', type: 'Foundation 3', focus: 'New chapters + cumulative revision' }),
    Object.freeze({ n: 4, examDate: '2026-10-25', type: 'Progress 1', focus: 'New learning + mixed practice' }),
    Object.freeze({ n: 5, examDate: '2026-11-08', type: 'Progress 2', focus: 'New learning + previous revision' }),
    Object.freeze({ n: 6, examDate: '2026-11-22', type: 'Monthly Test', focus: 'November syllabus + cumulative revision' }),
    Object.freeze({ n: 7, examDate: '2026-12-06', type: 'Progress 3', focus: 'New learning + weak-topic revision' }),
    Object.freeze({ n: 8, examDate: '2026-12-20', type: 'Half-Yearly Grand', focus: 'Large cumulative syllabus' }),
    Object.freeze({ n: 9, examDate: '2027-01-03', type: 'Progress 4', focus: 'New learning + cumulative revision' }),
    Object.freeze({ n: 10, examDate: '2027-01-17', type: 'Progress 5', focus: 'New learning + mixed practice' }),
    Object.freeze({ n: 11, examDate: '2027-01-31', type: 'Monthly Test', focus: 'January syllabus + cumulative revision' }),
    Object.freeze({ n: 12, examDate: '2027-02-14', type: 'Pre-Final Grand', focus: 'Almost complete syllabus + weak areas' }),
    Object.freeze({ n: 13, examDate: '2027-02-28', type: 'FINAL EXAM', focus: 'Complete Class 6 syllabus' })
  ]),
  previewTitle: 'Sunday Preview + Syllabus',
  examTitle: 'Sunday Candidate Examination'
});

window.WEEKLY_EXAM_UTILS = Object.freeze({
  parseDateKey(key) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key));
    if (!match) throw new Error(`Invalid date key: ${key}`);
    const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    if (Number.isNaN(d.getTime())) throw new Error(`Invalid date key: ${key}`);
    return d;
  },
  addDays(key, days) {
    const d = this.parseDateKey(key);
    d.setUTCDate(d.getUTCDate() + Number(days));
    return d.toISOString().slice(0, 10);
  },
  formatKey(key) {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric'
    }).format(this.parseDateKey(key));
  },
  todayKey() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: window.WEEKLY_EXAM_CONFIG.timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const out = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return `${out.year}-${out.month}-${out.day}`;
  },
  validate() {
    const cfg = window.WEEKLY_EXAM_CONFIG;
    const exams = cfg.exams;
    if (!Array.isArray(exams) || exams.length !== 13) throw new Error('Weekly exam plan must contain exactly 13 exams.');
    if (exams.at(-1).examDate !== cfg.finalDate) throw new Error('Final exam date does not match finalDate.');
    const seen = new Set();
    exams.forEach((exam, index) => {
      if (exam.n !== index + 1) throw new Error(`Exam numbering error at T${index + 1}.`);
      if (seen.has(exam.examDate)) throw new Error(`Duplicate exam date: ${exam.examDate}`);
      seen.add(exam.examDate);
      const d = this.parseDateKey(exam.examDate);
      if (d.getUTCDay() !== 0) throw new Error(`Exam T${exam.n} is not scheduled on Sunday.`);
      const preview = this.addDays(exam.examDate, -cfg.previewLeadDays);
      const pd = this.parseDateKey(preview);
      if (pd.getUTCDay() !== 0) throw new Error(`Preview for T${exam.n} is not scheduled on Sunday.`);
      if (index > 0) {
        const previous = exams[index - 1].examDate;
        const gap = (d.getTime() - this.parseDateKey(previous).getTime()) / 86400000;
        if (gap !== 14) throw new Error(`T${exam.n} must be exactly 14 days after the previous exam.`);
      }
    });
    return true;
  },
  getState(today = this.todayKey()) {
    const cfg = window.WEEKLY_EXAM_CONFIG;
    if (!this.validate()) return { mode: 'invalid', exam: cfg.exams[0] };
    const exam = cfg.exams.find(x => x.examDate === today);
    if (exam) return { mode: 'exam', exam };
    const preview = cfg.exams.find(x => this.addDays(x.examDate, -cfg.previewLeadDays) === today);
    if (preview) return { mode: 'preview', exam: preview };
    const upcoming = cfg.exams.find(x => x.examDate > today);
    return upcoming ? { mode: 'prep', exam: upcoming } : { mode: 'closed', exam: cfg.exams.at(-1) };
  },
  getExamId(exam) {
    return `CLASS6-WEEK-${exam.examDate}`;
  }
});

window.WEEKLY_EXAM_UTILS.validate();

/* Exact syllabus contract: [] means every published item in that subject. */
const WEEKLY_SYLLABUS = Object.freeze({
  1: Object.freeze({science:[1,2],maths:[1,2],english:[1,2,3,4],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[1,2],socialScience:[1,2]}),
  2: Object.freeze({science:[3,4],maths:[3,4],english:[5,6,7,8],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[2,3],socialScience:[3,4]}),
  3: Object.freeze({science:[5,6],maths:[5,6],english:[1,2,3,4,5],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[1,2,3],socialScience:[5,6]}),
  4: Object.freeze({science:[7,8],maths:[7,8],english:[4,5,6,7,8],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[2,3],socialScience:[7,8]}),
  5: Object.freeze({science:[9,10],maths:[1,2,3,4],english:[1,2,3,4,5,6],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[1,2,3],socialScience:[9,10]}),
  6: Object.freeze({science:[11,12],maths:[5,6,7,8],english:[3,4,5,6,7,8],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[1,2,3],socialScience:[11,12]}),
  7: Object.freeze({science:[1,2,3,4,5,6],maths:[1,2,3,4,5,6,7,8],english:[1,2,3,4,5,6,7,8],hindi:[],gk:[1,2,3],socialScience:[1,2,3,4,5,6,7,8]}),
  8: Object.freeze({science:[7,8,9,10,11,12],maths:[1,2,3,4,5,6,7,8],english:[1,2,3,4,5,6,7,8],hindi:[],gk:[1,2,3],socialScience:[7,8,9,10,11,12,13,14]}),
  9: Object.freeze({science:[1,2,3,4,5,6,7,8],maths:[1,2,3,4,5,6,7,8],english:[1,2,3,4,5,6,7,8],hindi:[],gk:[1,2,3],socialScience:[1,2,3,4,5,6,7,8,9,10]}),
 10: Object.freeze({science:[1,2,3,4,5,6,7,8,9,10],maths:[1,2,3,4,5,6,7,8],english:[1,2,3,4,5,6,7,8],hindi:[],gk:[],socialScience:[1,2,3,4,5,6,7,8,9,10,11,12]}),
 11: Object.freeze({science:[1,2,3,4,5,6,7,8,9,10,11,12],maths:[1,2,3,4,5,6,7,8],english:[1,2,3,4,5,6,7,8],hindi:[],gk:[],socialScience:[1,2,3,4,5,6,7,8,9,10,11,12,13,14]}),
 12: Object.freeze({science:[],maths:[],english:[],hindi:[],gk:[],socialScience:[]}),
 13: Object.freeze({science:[],maths:[],english:[],hindi:[],gk:[],socialScience:[]})
});
window.WEEKLY_EXAM_SYLLABUS = WEEKLY_SYLLABUS;

/* English practice bank is flat; this verified chapter map assigns each of its 24
   published questions to the corresponding lesson chapter. */
const ENGLISH_BANK_CHAPTERS = Object.freeze([1,3,1,4,4,5,5,6,2,3,3,2,4,7,8,8,8,7,4,2,8,8,8,5]);
const SUBJECT_KEYS = Object.freeze(['science','maths','english','hindi','gk','socialScience']);
const chapterMatch = (value,scope) => scope.length === 0 || scope.includes(Number(value));
const seededRandom = seed => () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
function hashSeed(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return h>>>0;}
function seededShuffle(items,seedText){const out=[...items],rnd=seededRandom(hashSeed(seedText));for(let i=out.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out;}
function exactSyllabus(examNumber){const s=WEEKLY_SYLLABUS[examNumber];if(!s)throw new Error(`Missing weekly syllabus for T${examNumber}.`);return s;}
function englishScoped(scope){
  const bank=window.ENGLISH_PRACTICE_BANK;
  if(!Array.isArray(bank)||bank.length!==ENGLISH_BANK_CHAPTERS.length)throw new Error('English practice bank/chapter contract is invalid.');
  return bank.map((q,i)=>norm(q,'English',{chapterId:ENGLISH_BANK_CHAPTERS[i]})).filter((q)=>q&&chapterMatch(q.chapterId,scope)&&q.question&&q.answer>=0);
}
function gkScoped(scope){
  const all=[];
  if(typeof GK_HI_TOPICS!=='undefined'&&Array.isArray(GK_HI_TOPICS)){
    GK_HI_TOPICS.forEach(topic=>{
      if(scope.length===0||scope.includes(Number(topic.id))) topic.questions.forEach(q=>all.push(norm({q:q[0],o:q[1],a:q[2]},'GK + Reasoning',{topic:topic.title})));
    });
  }
  if(typeof REASONING_HI!=='undefined'&&Array.isArray(REASONING_HI)) REASONING_HI.forEach(q=>all.push(norm({q:q[0],o:q[1],a:q[2]},'GK + Reasoning',{topic:'Reasoning'})));
  return all.filter(q=>q&&q.question&&q.answer>=0);
}
function scopedPool(subjectKey,scope){
  if(subjectKey==='english') return englishScoped(scope);
  if(subjectKey==='gk') return gkScoped(scope);
  const pool=poolFor(subjectKey);
  return (scope.length===0?pool:pool.filter(q=>chapterMatch(q.chapterId,scope))).filter(q=>q&&q.question&&q.answer>=0);
}
function exactSyllabusSummary(examNumber){
  const s=exactSyllabus(examNumber),range=k=>s[k].length?`Ch ${s[k].join(', ')}`:'All';
  return {science:range('science'),maths:range('maths'),english:range('english'),hindi:s.hindi.length?s.hindi.join(' • '):'All published topics',gk:s.gk.length?`Topics ${s.gk.join(', ')} + Reasoning`:'All GK topics + Reasoning',socialScience:range('socialScience')};
}
function validateSyllabus(){
  Object.keys(WEEKLY_SYLLABUS).forEach(k=>{const s=WEEKLY_SYLLABUS[k];SUBJECT_KEYS.forEach(key=>{if(!Array.isArray(s[key]))throw new Error(`T${k} ${key} syllabus must be an array.`);if(new Set(s[key]).size!==s[key].length)throw new Error(`T${k} ${key} syllabus contains duplicates.`);});});
  [1,2,3,4,5,6,7,8,9,10,11,12,13].forEach(n=>{const s=WEEKLY_SYLLABUS[n];SUBJECT_KEYS.forEach(key=>{if(!s[key])throw new Error(`Missing ${key} syllabus for T${n}.`)});});
  return true;
}
window.validateWeeklySyllabus=validateSyllabus;
validateSyllabus();

/* Build the official paper from the declared syllabus only. Fail closed when any
   subject cannot supply its required 10 questions instead of expanding scope. */
window.buildScopedWeeklyExam = function(exam){
  const s=exactSyllabus(exam.n);const all=[];
  SUBJECT_KEYS.forEach(key=>{
    const p=scopedPool(key,s[key]);
    if(p.length<10) throw new Error(`T${exam.n} ${key} syllabus provides only ${p.length} usable questions; need 10.`);
    const picked=seededShuffle(p,`${window.WEEKLY_EXAM_UTILS.getExamId(exam)}:${key}`).slice(0,10);
    all.push(...picked);
  });
  return seededShuffle(all,`${window.WEEKLY_EXAM_UTILS.getExamId(exam)}:paper`);
};

/* Replace the generic builder once the All Tests page has defined its normalizer/pools. */
(function installBuilder(){
  if(typeof window.buildExam==='function'){
    window.buildExam=function(){const st=window.WEEKLY_EXAM_UTILS.getState();if(st.mode!=='exam')throw new Error('Candidate examination is not open today.');return window.buildScopedWeeklyExam(st.exam);};
  } else setTimeout(installBuilder,25);
})();

/* Exact syllabus display for planner/All Tests without duplicating the schedule. */
function decoratePlanner(){
  const body=document.getElementById('plannerBody');if(!body||!body.rows.length)return;
  [...body.rows].forEach((row,i)=>{if(!WEEKLY_SYLLABUS[i+1])return;const summary=exactSyllabusSummary(i+1);const cell=row.cells[4];if(cell){cell.textContent=`Science: ${summary.science} | Maths: ${summary.maths} | English: ${summary.english} | Hindi: ${summary.hindi} | GK: ${summary.gk} | SST: ${summary.socialScience}`;}});
}
function decorateWeeklyBanner(){
  const banner=document.getElementById('weeklyExamBanner');if(!banner)return;
  const st=window.WEEKLY_EXAM_UTILS.getState(),s=st.exam;if(!s)return;
  const box=banner.querySelector('.weekly-syllabus');if(!box)return;
  const summary=exactSyllabusSummary(s.n);
  const cards=[['🔬 Science',summary.science],['➗ Mathematics',summary.maths],['🇬🇧 English',summary.english],['🪔 Hindi',summary.hindi],['🧠 GK + Reasoning',summary.gk],['🌍 Social Science',summary.socialScience]];
  const key=`T${s.n}`;
  if(box.dataset.syllabusKey===key)return;
  box.dataset.syllabusKey=key;
  box.innerHTML=cards.map(x=>`<div class="ws"><b>${x[0]}</b>${x[1]}</div>`).join('');
}
if(typeof MutationObserver!=='undefined'){
  document.addEventListener('DOMContentLoaded',()=>{
    const planner=document.getElementById('plannerBody');if(planner)new MutationObserver(decoratePlanner).observe(planner,{childList:true,subtree:true});
    const observer=new MutationObserver(decorateWeeklyBanner);observer.observe(document.body,{childList:true,subtree:true});
    decoratePlanner();decorateWeeklyBanner();
  },{once:true});
}
