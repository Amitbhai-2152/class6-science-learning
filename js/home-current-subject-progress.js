(function(){
'use strict';
const KEY='class6CurrentSubject';
const SUBJECTS={
  science:{label:'Science',icon:'🔬',pct(){const h=readJson('class6ScienceProgressV9',{}),done=Array.isArray(h.completed)?h.completed.length:0;return done/12*100}},
  maths:{label:'Maths',icon:'➗',pct(){const h=readJson('mathsExamHistory',[]);if(!Array.isArray(h)||!h.length)return 0;const total=h.reduce((s,x)=>s+Number(x.total||0),0),score=h.reduce((s,x)=>s+Number(x.score||0),0);return total?score/total*100:0}},
  english:{label:'English',icon:'📘',pct(){const h=readJson('class6EnglishProgressV1',{});return Number(h.average)||0}},
  hindi:{label:'Hindi',icon:'🪔',pct(){const h=readJson('class6HindiProgressV2',{}),v=Object.values(h.topics||{});return v.length?v.reduce((a,b)=>a+Number(b||0),0)/v.length:Number(h.best)||0}},
  gk:{label:'GK + Reasoning',icon:'🧠',pct(){const h=readJson('class6GKProgressV1',{}),q=Number(h.totalQuestions)||0,s=Number(h.totalScore)||0;return q?s/q*100:0}},
  social:{label:'Social Science',icon:'🌏',pct(){const h=readJson('socialScienceProgressV3',{}),cs=Object.values(h.chapters||{});return cs.length?cs.reduce((a,c)=>a+Number(c.progress||0),0)/14:0}}
};
function readJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x&&typeof x==='object'?x:fallback}catch(_){return fallback}}
function clamp(v){return Math.max(0,Math.min(100,Math.round(Number(v)||0)))}
function currentSubject(){
  const params=new URLSearchParams(location.search);
  if(params.get('view')==='science'){
    try{localStorage.setItem(KEY,'science')}catch(_){ }
    return 'science';
  }
  try{const saved=localStorage.getItem(KEY);if(SUBJECTS[saved])return saved}catch(_){ }
  return 'science';
}
function sync(){
  const id=currentSubject(),meta=SUBJECTS[id]||SUBJECTS.science,pct=clamp(meta.pct());
  const value=document.getElementById('homeSciencePct');
  const label=value?.previousElementSibling;
  if(label)label.textContent=meta.icon+' '+meta.label+' subject progress';
  if(value)value.textContent=pct+'%';
}
window.HomeCurrentSubjectProgress={set:function(subject){if(!SUBJECTS[subject])return;try{localStorage.setItem(KEY,subject)}catch(_){ }sync()},refresh:sync};
window.addEventListener('DOMContentLoaded',sync);
window.addEventListener('load',sync);
['storage','science:xp','xp:earned'].forEach(ev=>window.addEventListener(ev,sync));
})();
