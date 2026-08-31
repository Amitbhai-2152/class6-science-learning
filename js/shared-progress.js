(function(){
'use strict';
const KEY='class6SharedProgressV1';
const safe=(v,f)=>{try{return v()}catch(_){return f}};
function science(){return safe(()=>window.Progress?.data||null,null)}
function mathsHistory(){return safe(()=>{const x=JSON.parse(localStorage.getItem('mathsExamHistory')||'[]');return Array.isArray(x)?x:[]},[])}
function mathsStats(){
 const h=mathsHistory();
 const attempts=h.length;
 const questions=h.reduce((s,x)=>s+Number(x.total||0),0);
 const score=h.reduce((s,x)=>s+Number(x.score||0),0);
 const pct=questions?Math.round(score/questions*100):0;
 const xp=h.reduce((s,x)=>s+10+(Number(x.score)||0)*2,0);
 const best=h.length?Math.max(...h.map(x=>Number(x.pct)||0)):0;
 return {attempts,questions,score,pct,xp,best,last:h[0]||null};
}
function combined(){
 const s=science()||{xp:0,history:[],completed:[]};
 const m=mathsStats();
 return {scienceXP:Number(s.xp)||0,mathsXP:m.xp,totalXP:(Number(s.xp)||0)+m.xp,scienceAttempts:Array.isArray(s.history)?s.history.length:0,mathsAttempts:m.attempts,scienceCompleted:Array.isArray(s.completed)?s.completed.length:0,mathsBest:m.best};
}
function ensureStyles(){
 if(document.getElementById('shared-progress-style'))return;
 const st=document.createElement('style');st.id='shared-progress-style';st.textContent='.shared-subjects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}.shared-subject{border:1px solid #e2e8f0;border-radius:16px;padding:16px;background:#fff}.shared-subject h3{margin:0 0 4px}.shared-subject p{margin:0;color:#64748b}.shared-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}.shared-kpis div{padding:10px;border-radius:12px;background:#f8fafc;text-align:center}.shared-kpis b{display:block;font-size:20px}.shared-kpis span{font-size:12px;color:#64748b}@media(max-width:620px){.shared-subjects{grid-template-columns:1fr}.shared-kpis{grid-template-columns:1fr 1fr}}';document.head.appendChild(st);
}
function cardHtml(){
 const c=combined(),m=mathsStats();
 return `<section class="card shared-progress-card"><div class="section-title"><h2>🌐 मेरी संयुक्त प्रगति</h2><span class="tag">Science + Maths</span></div><div class="shared-kpis"><div><b>${c.totalXP}</b><span>Total XP</span></div><div><b>${c.scienceCompleted}</b><span>Science chapters</span></div><div><b>${c.mathsAttempts}</b><span>Maths tests</span></div></div><div class="shared-subjects"><article class="shared-subject"><h3>🔬 Science</h3><p>${c.scienceCompleted}/12 chapters mastered • ${c.scienceAttempts} attempts</p></article><article class="shared-subject"><h3>➗ Maths</h3><p>${m.attempts?`${m.pct}% average • best ${m.best}%`:'अभी Maths test attempt नहीं किया'}</p></article></div></section>`;
}
function refresh(){
 ensureStyles();
 document.querySelectorAll('.shared-progress-card').forEach(x=>x.remove());
 const home=document.getElementById('homeView');
 if(home){const anchor=home.querySelector('.card.reward-card');if(anchor)anchor.insertAdjacentHTML('afterend',cardHtml())}
 const progress=document.getElementById('progressView');
 if(progress){const first=progress.querySelector('.card.lesson-head');if(first)first.insertAdjacentHTML('afterend',cardHtml())}
}
window.SharedProgress={mathsStats,combined,refresh};
window.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,0));
window.addEventListener('storage',e=>{if(e.key==='mathsExamHistory'||e.key==='class6ScienceProgressV9')refresh()});
setInterval(()=>{if(document.visibilityState==='visible')refresh()},3000);
})();
