(function(){
'use strict';
function readJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x&&typeof x==='object'?x:fallback}catch(_){return fallback}}
function mathsStats(){const h=readJson('mathsExamHistory',[]);if(!Array.isArray(h)||!h.length)return {pct:0,xp:0};const total=h.reduce((s,x)=>s+Number(x.total||0),0),score=h.reduce((s,x)=>s+Number(x.score||0),0);return {pct:total?Math.round(score/total*100):0,xp:h.reduce((s,x)=>s+10+(Number(x.score)||0)*2,0)}}
function hindiStats(){const h=readJson('class6HindiProgressV2',{}),topics=Object.values(h.topics||{});return {pct:topics.length?Math.round(topics.reduce((a,b)=>a+Number(b||0),0)/topics.length):Number(h.best)||0,xp:Number(h.xp)||0,badges:Array.isArray(h.badges)?h.badges.length:0,streak:Number(h.streak)||0}}
function sstStats(){const h=readJson('socialScienceProgressV3',{}),cs=Object.values(h.chapters||{});return {pct:cs.length?Math.round(cs.reduce((s,c)=>s+Number(c.progress||0),0)/14):0,xp:Number(h.xp)||0,badges:Array.isArray(h.badges)?h.badges.length:0,streak:Number(h.streak)||0}}
function englishStats(){const h=readJson('class6EnglishProgressV1',{});let pct=Number(h.average)||0;if(!Number.isFinite(pct)||pct<0){pct=0}return {pct:Math.max(0,Math.min(100,Math.round(pct))),xp:Number(h.xp)||0,badges:Array.isArray(h.badges)?h.badges.length:0,streak:0}}
function gkStats(){const h=readJson('class6GKProgressV1',{}),q=Number(h.totalQuestions)||0,s=Number(h.totalScore)||0;return {pct:q?Math.round(s/q*100):Number(h.best)||0,xp:Number(h.xp)||0,badges:Array.isArray(h.badges)?h.badges.length:0,streak:0}}
function scienceStats(){const h=readJson('class6ScienceProgressV9',{}),completed=Array.isArray(h.completed)?h.completed.length:0;return {pct:Math.round((completed/12)*100),xp:Number(h.xp)||0,badges:Array.isArray(h.badges)?h.badges.length:0,streak:Number(h.streak)||0}}
function sync(){
 const m=mathsStats(),h=hindiStats(),ss=sstStats(),e=englishStats(),g=gkStats(),sci=scienceStats();
 const rows=[
  {id:'homeMathsProgressRow',label:'➗ Maths',pctId:'homeMathsPct',barId:'homeMathsBar',metaId:'homeMathsMeta',data:m,after:null},
  {id:'homeEnglishProgressRow',label:'📘 English',pctId:'homeEnglishPct',barId:'homeEnglishBar',metaId:'homeEnglishMeta',data:e,after:'homeMathsProgressRow'},
  {id:'homeHindiProgressRow',label:'🪔 Hindi',pctId:'homeHindiPct',barId:'homeHindiBar',metaId:'homeHindiMeta',data:h,after:'homeEnglishProgressRow'},
  {id:'homeGKProgressRow',label:'🧠 GK + Reasoning',pctId:'homeGKPct',barId:'homeGKBar',metaId:'homeGKMeta',data:g,after:'homeHindiProgressRow'},
  {id:'homeSstProgressRow',label:'🌏 Social Science',pctId:'homeSSPct',barId:'homeSSBar',metaId:'homeSSMeta',data:ss,after:'homeGKProgressRow'}
 ];
 const root=document.querySelector('#dashboardProgressCard')||document.querySelector('.home-continue .home-card:nth-child(2)');
 if(!root)return;
 const anchorFor=row=>row.after?document.getElementById(row.after):root.querySelector('.home-bar-row');
 rows.forEach(row=>{
  let el=document.getElementById(row.id);
  if(!el){el=document.createElement('div');el.id=row.id;el.className='home-bar-row';el.innerHTML='<div class="home-bar-top"><span></span><span></span></div><div class="home-bar"><i></i></div><small></small>';const anchor=anchorFor(row);if(anchor)anchor.after(el);else root.appendChild(el)}
  const vals=el.querySelectorAll('.home-bar-top span');if(vals[0])vals[0].textContent=row.label;const p=Math.max(0,Math.min(100,Number(row.data.pct)||0));if(vals[1])vals[1].textContent=p+'%';const bar=el.querySelector('.home-bar i');if(bar)bar.style.width=p+'%';const small=el.querySelector('small');if(small){if(row.label.includes('Science')&&!row.label.includes('Social'))small.textContent=`${sci.completed||0}/12 chapters`;else if(row.label.includes('Social'))small.textContent=`${Object.keys(readJson('socialScienceProgressV3',{}).chapters||{}).length}/14 chapters`;else if(row.data.pct>0)small.textContent='Current subject progress';else small.textContent='Not attempted yet'}});
 const sciencePct=Math.round((sci.completed/12)*100);const sp=document.getElementById('homeSciencePct2'),sb=document.getElementById('homeScienceBar');if(sp)sp.textContent=sciencePct+'%';if(sb)sb.style.width=sciencePct+'%';
 const combined=window.SharedProgress?.combined?.();const total=document.getElementById('homeTotalXP');if(total)total.textContent=String(combined?.totalXP??(sci.xp+m.xp+h.xp+ss.xp+e.xp+g.xp));
 const streak=document.getElementById('homeStreak');if(streak)streak.textContent=String(Math.max(sci.streak,h.streak,ss.streak));
 const badge=document.getElementById('badgeHome');if(badge)badge.textContent=String(sci.badges+h.badges+ss.badges+e.badges+g.badges);
}
window.HomeProgressSync={refresh:sync};
function boot(){setTimeout(()=>{sync();window.HomeDashboard?.refresh?.()},0)}
window.addEventListener('DOMContentLoaded',boot);window.addEventListener('load',boot);window.addEventListener('storage',sync);window.addEventListener('science:xp',sync);window.addEventListener('hindi:progress',sync);window.addEventListener('sst:progress',sync);
})();
