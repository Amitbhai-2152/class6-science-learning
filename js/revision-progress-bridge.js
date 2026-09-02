(function(){
'use strict';

const ROOT='class6RevisionProgressV1';
const XP_PER_CHAPTER=20;
const SUBJECT_META={
 science:{name:'विज्ञान',count:12},
 maths:{name:'गणित',count:8},
 english:{name:'अंग्रेज़ी',count:8},
 hindi:{name:'हिंदी',count:8},
 gk:{name:'GK + Reasoning',count:8},
 social:{name:'सामाजिक विज्ञान',count:14}
};

function read(){
  try{
    const x=JSON.parse(localStorage.getItem(ROOT)||'{}');
    return x&&typeof x==='object'?x:{};
  }catch(_){return {};}
}
function write(x){localStorage.setItem(ROOT,JSON.stringify(x));}
function today(){return new Date().toISOString().slice(0,10);}
function normalize(x){
  x.version=1;
  x.xp=Number(x.xp)||0;
  x.streak=Number(x.streak)||0;
  x.lastStudyDate=x.lastStudyDate||'';
  x.completed=Number(x.completed)||0;
  x.awarded=x.awarded&&typeof x.awarded==='object'?x.awarded:{};
  x.subjects=x.subjects&&typeof x.subjects==='object'?x.subjects:{};
  Object.keys(SUBJECT_META).forEach(id=>{
    const s=x.subjects[id]&&typeof x.subjects[id]==='object'?x.subjects[id]:{};
    s.name=SUBJECT_META[id].name;s.count=SUBJECT_META[id].count;s.completed=Number(s.completed)||0;s.lastChapter=Number(s.lastChapter)||0;
    x.subjects[id]=s;
  });
  return x;
}
function updateStreak(x){
  const d=today();
  if(x.lastStudyDate===d)return;
  if(x.lastStudyDate){
    const a=new Date(x.lastStudyDate+'T00:00:00Z').getTime();
    const b=new Date(d+'T00:00:00Z').getTime();
    const days=Math.round((b-a)/86400000);
    x.streak=days===1?(x.streak||0)+1:1;
  }else x.streak=1;
  x.lastStudyDate=d;
}
function snapshot(){
  const x=normalize(read());
  return {xp:x.xp,streak:x.streak,completed:x.completed,subjects:x.subjects};
}
function renderBadge(){
  const x=normalize(read());
  const old=document.getElementById('revisionBridgeBadge');
  if(old)old.remove();
  const host=document.querySelector('.rq-top');
  if(!host)return;
  const b=document.createElement('span');
  b.id='revisionBridgeBadge';
  b.className='rq-badge';
  b.textContent=`⚡ ${x.xp} XP • 🔥 ${x.streak}`;
  host.appendChild(b);
}

function award(subject,index){
  const x=normalize(read());
  const id=subject+'-'+index;
  if(x.awarded[id])return;
  x.awarded[id]=true;
  x.xp+=XP_PER_CHAPTER;
  x.completed+=1;
  const s=x.subjects[subject];
  s.completed=Math.min(s.count,s.completed+1);
  s.lastChapter=index+1;
  updateStreak(x);
  write(x);
  renderBadge();
  window.dispatchEvent(new StorageEvent('storage',{key:ROOT,newValue:JSON.stringify(x)}));
}

function syncCurrent(){
  const body=document.body;
  const subject=body&&body.dataset?body.dataset.revisionSubject:'';
  if(!SUBJECT_META[subject])return;
  const x=normalize(read());
  const d=new Date();
  const day=d.toISOString().slice(0,10);
  const marker='revision-v3-'+subject+'-done';
  let done={};
  try{done=JSON.parse(localStorage.getItem(marker)||'{}')}catch(_){done={};}
  const s=x.subjects[subject];
  s.completed=Object.values(done).filter(Boolean).length;
  x.completed=Object.values(x.subjects).reduce((n,v)=>n+Number(v.completed||0),0);
  const currentIndex=Number(new URLSearchParams(location.search).get('chapter'))||0;
  if(currentIndex>0)s.lastChapter=currentIndex;
  if(Object.keys(done).some(k=>done[k]))x.lastStudyDate=x.lastStudyDate||day;
  write(x);
  renderBadge();
}

document.addEventListener('click',function(e){
  const btn=e.target.closest&&e.target.closest('[data-complete]');
  if(!btn)return;
  const subject=document.body.dataset.revisionSubject;
  if(!SUBJECT_META[subject])return;
  const index=Number(btn.dataset.complete);
  let done={};
  try{done=JSON.parse(localStorage.getItem('revision-v3-'+subject+'-done')||'{}')}catch(_){done={};}
  const wasDone=!!done[index];
  if(wasDone)return;
  setTimeout(()=>award(subject,index),80);
},true);

window.RevisionProgress={snapshot,refresh:syncCurrent};
window.addEventListener('DOMContentLoaded',()=>setTimeout(syncCurrent,0));
})();
