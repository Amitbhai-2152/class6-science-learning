'use strict';

/* Canonical Class 6 Sunday examination schedule + exact syllabus contract. */
const EXAMS = [
  [1,'2026-09-13','Foundation 1','Initial chapters + core basics'],
  [2,'2026-09-27','Foundation 2','New chapters + T1 revision'],
  [3,'2026-10-11','Foundation 3','New chapters + cumulative revision'],
  [4,'2026-10-25','Progress 1','New learning + mixed practice'],
  [5,'2026-11-08','Progress 2','New learning + previous revision'],
  [6,'2026-11-22','Monthly Test','November syllabus + cumulative revision'],
  [7,'2026-12-06','Progress 3','New learning + weak-topic revision'],
  [8,'2026-12-20','Half-Yearly Grand','Large cumulative syllabus'],
  [9,'2027-01-03','Progress 4','New learning + cumulative revision'],
  [10,'2027-01-17','Progress 5','New learning + mixed practice'],
  [11,'2027-01-31','Monthly Test','January syllabus + cumulative revision'],
  [12,'2027-02-14','Pre-Final Grand','Almost complete syllabus + weak areas'],
  [13,'2027-02-28','FINAL EXAM','Complete Class 6 syllabus']
];
window.WEEKLY_EXAM_CONFIG = Object.freeze({
  timeZone:'Asia/Kolkata', previewLeadDays:7, questionCount:60, marks:60, durationMinutes:90, finalDate:'2027-02-28',
  exams:Object.freeze(EXAMS.map(x=>Object.freeze({n:x[0],examDate:x[1],type:x[2],focus:x[3]}))),
  previewTitle:'Sunday Preview + Syllabus', examTitle:'Sunday Candidate Examination'
});

function parseDateKey(key){
  const m=/^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(String(key));
  if(!m)throw new Error(`Invalid date key: ${key}`);
  const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));
  if(Number.isNaN(d.getTime()))throw new Error(`Invalid date key: ${key}`);
  return d;
}
function addDays(key,days){const d=parseDateKey(key);d.setUTCDate(d.getUTCDate()+Number(days));return d.toISOString().slice(0,10);}
function formatKey(key){return new Intl.DateTimeFormat('en-IN',{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'}).format(parseDateKey(key));}
function todayKey(){
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:window.WEEKLY_EXAM_CONFIG.timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const o=Object.fromEntries(p.map(x=>[x.type,x.value])); return `${o.year}-${o.month}-${o.day}`;
}
function validateSchedule(){
  const cfg=window.WEEKLY_EXAM_CONFIG, seen=new Set();
  if(cfg.exams.length!==13||cfg.finalDate!==cfg.exams.at(-1).examDate)throw new Error('Weekly exam count/final date contract failed.');
  cfg.exams.forEach((e,i)=>{if(e.n!==i+1||seen.has(e.examDate))throw new Error('Weekly exam numbering/date uniqueness failed.');seen.add(e.examDate);if(parseDateKey(e.examDate).getUTCDay()!==0)throw new Error(`T${e.n} must be Sunday.`);if(parseDateKey(addDays(e.examDate,-7)).getUTCDay()!==0)throw new Error(`T${e.n} preview must be Sunday.`);if(i&&(parseDateKey(e.examDate)-parseDateKey(cfg.exams[i-1].examDate))!==14*86400000)throw new Error(`T${e.n} spacing must be 14 days.`);});
  return true;
}
window.WEEKLY_EXAM_UTILS=Object.freeze({parseDateKey,addDays,formatKey,todayKey,validate:validateSchedule,getState(today=todayKey()){const cfg=window.WEEKLY_EXAM_CONFIG;if(!validateSchedule())return{mode:'invalid',exam:cfg.exams[0]};const exam=cfg.exams.find(x=>x.examDate===today);if(exam)return{mode:'exam',exam};const preview=cfg.exams.find(x=>addDays(x.examDate,-7)===today);if(preview)return{mode:'preview',exam:preview};const upcoming=cfg.exams.find(x=>x.examDate>today);return upcoming?{mode:'prep',exam:upcoming}:{mode:'closed',exam:cfg.exams.at(-1)};},getExamId(exam){return `CLASS6-WEEK-${exam.examDate}`;}});
validateSchedule();

/* Exact syllabus: chapter arrays are exact chapter numbers; empty arrays mean all published material. */
const SYLLABUS={
  1:{science:[1,2],maths:[1,2],english:[1,2,3,4],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[1,2],reasoning:[1,2,3,4,5,6,7,8,9,10],socialScience:[1,2]},
  2:{science:[3,4],maths:[3,4],english:[5,6,7,8],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[2,3],reasoning:[11,12,13,14,15,16,17,18,19,20],socialScience:[3,4]},
  3:{science:[5,6],maths:[5,6],english:[1,2,3,4,5],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[1,2,3],reasoning:[21,22,23,24,25,26,27,28,29,30],socialScience:[5,6]},
  4:{science:[7,8],maths:[7,8],english:[4,5,6,7,8],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[2,3],reasoning:[],socialScience:[7,8]},
  5:{science:[9,10],maths:[1,2,3,4],english:[1,2,3,4,5,6],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[1,2,3],reasoning:[],socialScience:[9,10]},
  6:{science:[11,12],maths:[5,6,7,8],english:[3,4,5,6,7,8],hindi:['संज्ञा','सर्वनाम','विशेषण','क्रिया-काल'],gk:[1,2,3],reasoning:[],socialScience:[11,12]},
  7:{science:[1,2,3,4,5,6],maths:[1,2,3,4,5,6,7,8],english:[1,2,3,4,5,6,7,8],hindi:[],gk:[1,2,3],reasoning:[],socialScience:[1,2,3,4,5,6,7,8]},
  8:{science:[7,8,9,10,11,12],maths:[1,2,3,4,5,6,7,8],english:[1,2,3,4,5,6,7,8],hindi:[],gk:[1,2,3],reasoning:[],socialScience:[7,8,9,10,11,12,13,14]},
  9:{science:[1,2,3,4,5,6,7,8],maths:[1,2,3,4,5,6,7,8],english:[1,2,3,4,5,6,7,8],hindi:[],gk:[1,2,3],reasoning:[],socialScience:[1,2,3,4,5,6,7,8,9,10]},
  10:{science:[1,2,3,4,5,6,7,8,9,10],maths:[1,2,3,4,5,6,7,8],english:[1,2,3,4,5,6,7,8],hindi:[],gk:[],reasoning:[],socialScience:[1,2,3,4,5,6,7,8,9,10,11,12]},
  11:{science:[1,2,3,4,5,6,7,8,9,10,11,12],maths:[1,2,3,4,5,6,7,8],english:[1,2,3,4,5,6,7,8],hindi:[],gk:[],reasoning:[],socialScience:[1,2,3,4,5,6,7,8,9,10,11,12,13,14]},
  12:{science:[],maths:[],english:[],hindi:[],gk:[],reasoning:[],socialScience:[]},
  13:{science:[],maths:[],english:[],hindi:[],gk:[],reasoning:[],socialScience:[]}
};
window.WEEKLY_EXAM_SYLLABUS=Object.freeze(SYLLABUS);

const SUBJECT_KEYS=['science','maths','english','hindi','gk','socialScience'];
const ENGLISH_BANK_CHAPTERS=Object.freeze([1,3,1,4,4,5,5,6,2,3,3,2,4,7,8,8,8,7,4,2,8,8,8,5]);
function validateSyllabus(){
  if(Object.keys(SYLLABUS).length!==13)throw new Error('Exactly 13 syllabus entries are required.');
  Object.entries(SYLLABUS).forEach(([n,s])=>{[...SUBJECT_KEYS,'reasoning'].forEach(k=>{if(!Array.isArray(s[k]))throw new Error(`T${n} ${k} scope must be an array.`);if(new Set(s[k]).size!==s[k].length)throw new Error(`T${n} ${k} scope contains duplicates.`);});if(s.reasoning.some(i=>i<1||i>30))throw new Error(`T${n} reasoning scope out of range.`);});
  if(ENGLISH_BANK_CHAPTERS.length!==24||ENGLISH_BANK_CHAPTERS.some(i=>i<1||i>8))throw new Error('English bank chapter map contract failed.');
  return true;
}
window.validateWeeklySyllabus=validateSyllabus;validateSyllabus();

const hashSeed=text=>{let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return h>>>0;};
const shuffleSeeded=(items,text)=>{let seed=hashSeed(text),out=[...items];const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let i=out.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
const inScope=(value,scope)=>scope.length===0||scope.includes(Number(value));
function englishPool(scope){
  const bank=window.ENGLISH_PRACTICE_BANK;if(!Array.isArray(bank)||bank.length!==ENGLISH_BANK_CHAPTERS.length)throw new Error('English practice bank/chapter map mismatch.');
  return bank.map((q,i)=>norm(q,'English',{chapterId:ENGLISH_BANK_CHAPTERS[i]})).filter(q=>q&&q.question&&q.answer>=0&&inScope(q.chapterId,scope));
}
function gkPool(scope){const out=[];if(typeof GK_HI_TOPICS!=='undefined'&&Array.isArray(GK_HI_TOPICS))GK_HI_TOPICS.forEach(t=>{if(inScope(t.id,scope))t.questions.forEach(q=>out.push(norm({q:q[0],o:q[1],a:q[2]},'GK + Reasoning',{topic:t.title})))});return out.filter(q=>q&&q.question&&q.answer>=0);}
function reasoningPool(scope){const bank=typeof REASONING_HI!=='undefined'&&Array.isArray(REASONING_HI)?REASONING_HI:[];if(bank.length!==30)throw new Error('Reasoning bank must contain exactly 30 questions.');const chosen=scope.length?scope.map(i=>bank[i-1]).filter(Boolean):bank;return chosen.map(q=>norm({q:q[0],o:q[1],a:q[2]},'GK + Reasoning',{topic:'Reasoning'})).filter(q=>q&&q.question&&q.answer>=0);}
function scopedPool(key,scope){if(key==='english')return englishPool(scope);if(key==='gk')return gkPool(scope);const pool=poolFor(key);return pool.filter(q=>q&&q.question&&q.answer>=0&&(scope.length===0||inScope(q.chapterId,scope)));}
function buildScopedWeeklyExam(exam){
  const s=SYLLABUS[exam.n],all=[];SUBJECT_KEYS.forEach(key=>{if(key==='gk'){const gp=scopedPool('gk',s.gk),rp=reasoningPool(s.reasoning);if(gp.length<5)throw new Error(`T${exam.n} GK scope has ${gp.length} usable questions; need 5.`);if(rp.length<5)throw new Error(`T${exam.n} reasoning scope has ${rp.length} usable questions; need 5.`);all.push(...shuffleSeeded(gp,`${exam.examDate}:gk`).slice(0,5),...shuffleSeeded(rp,`${exam.examDate}:reasoning`).slice(0,5));return;}const pool=scopedPool(key,s[key]);if(pool.length<10)throw new Error(`T${exam.n} ${key} scope has ${pool.length} usable questions; need 10.`);all.push(...shuffleSeeded(pool,`${exam.examDate}:${key}`).slice(0,10));});if(all.length!==60)throw new Error(`T${exam.n} generated ${all.length} questions; expected 60.`);return shuffleSeeded(all,`${exam.date||exam.examDate}:paper`);}
window.buildScopedWeeklyExam=buildScopedWeeklyExam;

/* Install an exact scoped builder over the old generic builder when the exam page defines its pools. */
(function installBuilder(){if(typeof window.buildExam==='function'){window.buildExam=function(){const st=window.WEEKLY_EXAM_UTILS.getState();if(st.mode!=='exam')throw new Error('Candidate examination is not open today.');return buildScopedWeeklyExam(st.exam);};}else setTimeout(installBuilder,25);})();

function summary(n){const s=SYLLABUS[n],range=k=>s[k].length?`Ch ${s[k].join(',')}`:'All';return{science:range('science'),maths:range('maths'),english:range('english'),hindi:s.hindi.length?s.hindi.join(' • '):'All published topics',gk:s.gk.length?`Topics ${s.gk.join(',')}`:'All GK topics',reasoning:s.reasoning.length?`Q${s.reasoning[0]}–Q${s.reasoning.at(-1)}`:'All 30 Q',socialScience:range('socialScience')};}
function decoratePlanner(){const body=document.getElementById('plannerBody');if(!body||!body.rows.length)return;[...body.rows].forEach((row,i)=>{const x=summary(i+1);if(row.cells[4])row.cells[4].textContent=`Sci ${x.science} • Math ${x.maths} • Eng ${x.english} • Hindi ${x.hindi} • GK ${x.gk} • Reasoning ${x.reasoning} • SST ${x.socialScience}`;});}
function decorateBanner(){const banner=document.getElementById('weeklyExamBanner');if(!banner)return;const st=window.WEEKLY_EXAM_UTILS.getState();const x=summary(st.exam.n),box=banner.querySelector('.weekly-syllabus');if(!box)return;const cards=[['🔬 Science',x.science],['➗ Mathematics',x.maths],['🇬🇧 English',x.english],['🪔 Hindi',x.hindi],['🧠 GK + Reasoning',`${x.gk} • ${x.reasoning}`],['🌍 Social Science',x.socialScience]],key=`T${st.exam.n}`;if(box.dataset.syllabusKey===key)return;box.dataset.syllabusKey=key;box.innerHTML=cards.map(v=>`<div class="ws"><b>${v[0]}</b>${v[1]}</div>`).join('');}
function decorate(){decoratePlanner();decorateBanner();if(typeof MutationObserver==='undefined')return;const p=document.getElementById('plannerBody');if(p&&!p.dataset.weeklyObserved){p.dataset.weeklyObserved='1';new MutationObserver(decoratePlanner).observe(p,{childList:true,subtree:true});}if(document.body&&!document.body.dataset.weeklyBannerObserved){document.body.dataset.weeklyBannerObserved='1';new MutationObserver(decorateBanner).observe(document.body,{childList:true,subtree:true});}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});else decorate();
