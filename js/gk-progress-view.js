(function(){'use strict';
function renderGKProgress(){
  const root=document.getElementById('progressContent');
  if(!root||!window.GKProgressHI)return;
  const p=window.GKProgressHI.read();
  const topics=p.topics||{};
  const topicNames=['भारत और नागरिक शास्त्र','भूगोल और पर्यावरण','आसपास का विज्ञान','इतिहास और संस्कृति','विश्व ज्ञान','खेल और खेल-कूद','GK कौशल और सामान्य जागरूकता'];
  const completed=Object.keys(topics).filter(k=>Number(topics[k])>=80).length;
  const rows=topicNames.map((name,i)=>{const s=Number(topics[name]||0);return `<div style="padding:10px 0;border-bottom:1px solid #e5e7eb"><div style="display:flex;justify-content:space-between;gap:8px"><b>${name}</b><span>${s}%</span></div><div style="height:7px;background:#eef2f7;border-radius:999px;margin-top:6px;overflow:hidden"><i style="display:block;height:100%;width:${Math.max(0,Math.min(100,s))}%;background:#5b4bdc;border-radius:999px"></i></div></div>`}).join('');
  root.insertAdjacentHTML('beforeend',`<section id="gkProgressCard" class="card" style="margin-top:14px"><div class="section-title"><h2>🧠 GK + Reasoning Progress</h2><span class="tag">Hindi</span></div><div class="dashboard-stats"><div class="stat"><b>${Number(p.xp)||0}</b><span>GK XP</span></div><div class="stat"><b>${Number(p.attempts)||0}</b><span>Attempts</span></div><div class="stat"><b>${Number(p.best)||0}%</b><span>Best</span></div></div><div class="reward-stats"><div><b>${completed}/7</b><span>Topics mastered</span></div><div><b>${p.badges?.length||0}</b><span>Badges</span></div><div><b>${p.last?.pct||0}%</b><span>Last score</span></div></div><h3>📚 Topic mastery</h3>${rows}<h3 style="margin-top:16px">🏅 Badges</h3><div class="badge-strip">${p.badges?.length?p.badges.map(x=>`<span class="badge-pill">${x}</span>`).join(''):'<span class="muted">अभी कोई GK badge unlock नहीं हुआ।</span>'}</div></section>`);
}
const oldOpen=window.openProgress;
window.openProgress=function(){if(typeof oldOpen==='function')oldOpen();setTimeout(()=>{document.getElementById('gkProgressCard')?.remove();renderGKProgress()},0)};
window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{if(!document.getElementById('gkProgressCard')&&document.getElementById('progressView')&&!document.getElementById('progressView').classList.contains('hidden'))renderGKProgress()},0));
window.addEventListener('storage',e=>{if(e.key==='class6GKProgressV1'&&document.getElementById('progressView')&&!document.getElementById('progressView').classList.contains('hidden')){document.getElementById('gkProgressCard')?.remove();renderGKProgress()}});
})();
