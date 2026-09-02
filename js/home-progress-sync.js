(function(){
'use strict';
function readJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x&&typeof x==='object'?x:fallback}catch(_){return fallback}}
function mathsStats(){const h=readJson('mathsExamHistory',[]);if(!Array.isArray(h)||!h.length)return {pct:0,xp:0};const total=h.reduce((s,x)=>s+Number(x.total||0),0),score=h.reduce((s,x)=>s+Number(x.score||0),0);return {pct:total?Math.round(score/total*100):0,xp:h.reduce((s,x)=>s+10+(Number(x.score)||0)*2,0)}}
function hindiStats(){const h=readJson('class6HindiProgressV2',{}),topics=Object.values(h.topics||{});return {pct:topics.length?Math.round(topics.reduce((a,b)=>a+Number(b||0),0)/topics.length):Number(h.best)||0,xp:Number(h.xp)||0,badges:Array.isArray(h.badges)?h.badges.length:0,streak:Number(h.streak)||0}}
function sstStats(){const h=readJson('socialScienceProgressV3',{}),cs=Object.values(h.chapters||{});return {pct:cs.length?Math.round(cs.reduce((s,c)=>s+Number(c.progress||0),0)/14):0,xp:Number(h.xp)||0,badges:Array.isArray(h.badges)?h.badges.length:0,streak:Number(h.streak)||0,chapters:cs.length,completed:cs.filter(c=>Number(c.progress||0)>=100).length}}
function englishStats(){const h=readJson('class6EnglishProgressV1',{});const pct=Number.isFinite(Number(h.average))?Number(h.average):0;return {pct:Math.max(0,Math.min(100,Math.round(pct))),xp:Number(h.xp)||0,badges:Array.isArray(h.badges)?h.badges.length:0,streak:0}}
function gkStats(){const h=readJson('class6GKProgressV1',{}),q=Number(h.totalQuestions)||0,s=Number(h.totalScore)||0;return {pct:q?Math.max(0,Math.min(100,Math.round(s/q*100))):Math.max(0,Math.min(100,Number(h.best)||0)),xp:Number(h.xp)||0,badges:Array.isArray(h.badges)?h.badges.length:0,streak:0}}
function scienceStats(){const h=readJson('class6ScienceProgressV9',{}),completed=Array.isArray(h.completed)?h.completed.length:0;return {pct:Math.round((completed/12)*100),completed,xp:Number(h.xp)||0,badges:Array.isArray(h.badges)?h.badges.length:0,streak:Number(h.streak)||0}}
function sync(){
 const root=document.querySelector('.home-continue .home-card:nth-child(2)');
 if(!root)return;
 const m=mathsStats(),h=hindiStats(),ss=sstStats(),e=englishStats(),g=gkStats(),sci=scienceStats();
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
 const width=(id,v)=>{const el=document.getElementById(id);if(el)el.style.width=Math.max(0,Math.min(100,Number(v)||0))+'%'};
 const sciencePct=Math.max(0,Math.min(100,sci.pct));set('homeSciencePct2',sciencePct+'%');width('homeScienceBar',sciencePct);
 const scienceRow=document.getElementById('homeScienceBar')?.closest('.home-bar-row');if(scienceRow){scienceRow.dataset.progressSubject='science';let meta=scienceRow.querySelector('small');if(!meta){meta=document.createElement('small');scienceRow.appendChild(meta)}meta.textContent=`${sci.completed}/12 chapters`}
 const mathsRow=document.getElementById('homeMathsBar')?.closest('.home-bar-row');if(mathsRow)mathsRow.dataset.progressSubject='maths';set('homeMathsPct',m.pct+'%');width('homeMathsBar',m.pct);if(mathsRow){let meta=mathsRow.querySelector('small');if(!meta){meta=document.createElement('small');mathsRow.appendChild(meta)}meta.textContent=m.pct>0?'Current subject progress':'Not attempted yet'}
 const makeRow=(id,label,pct)=>{let row=document.getElementById(id);if(!row){row=document.createElement('div');row.id=id;row.className='home-bar-row';row.innerHTML='<div class="home-bar-top"><span></span><span></span></div><div class="home-bar"><i></i></div><small></small>';const anchor=document.getElementById(id==='homeEnglishProgressRow'?'homeMathsBar':'homeEnglishProgressRow')?.closest('.home-bar-row');if(anchor)anchor.after(row);else root.appendChild(row)}row.querySelector('.home-bar-top span').textContent=label;const p=Math.max(0,Math.min(100,Math.round(Number(pct)||0)));row.querySelector('.home-bar-top span+span').textContent=p+'%';row.querySelector('.home-bar i').style.width=p+'%';return row};
 const er=makeRow('homeEnglishProgressRow','📘 English',e.pct);er.querySelector('small').textContent=e.pct>0?'Current subject progress':'Not attempted yet';
 const hr=makeRow('homeHindiProgressRow','🪔 Hindi',h.pct);hr.querySelector('small').textContent=h.pct>0?'Current subject progress':'Not attempted yet';
 const gr=makeRow('homeGKProgressRow','🧠 GK + Reasoning',g.pct);gr.querySelector('small').textContent=g.pct>0?'Current subject progress':'Not attempted yet';
 const sr=makeRow('homeSstProgressRow','🌏 Social Science',ss.pct);sr.querySelector('small').textContent=`${ss.completed}/14 chapters`;
 const combined=window.SharedProgress?.combined?.();set('homeTotalXP',String(combined?.totalXP??(sci.xp+m.xp+e.xp+h.xp+g.xp+ss.xp)));set('homeStreak',String(Math.max(sci.streak,h.streak,ss.streak)));set('badgeHome',String(sci.badges+e.badges+h.badges+g.badges+ss.badges));
}
window.HomeProgressSync={refresh:sync};
function boot(){setTimeout(sync,0)}
window.addEventListener('DOMContentLoaded',boot);window.addEventListener('load',boot);window.addEventListener('storage',sync);window.addEventListener('science:xp',sync);window.addEventListener('hindi:progress',sync);window.addEventListener('sst:progress',sync);
})();
