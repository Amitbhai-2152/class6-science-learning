(function(){
'use strict';
function esc(s){return window.escapeHtml?window.escapeHtml(s):String(s).replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]))}
function clamp(v){return Math.max(0,Math.min(100,Number(v)||0))}
function render(){
  const root=document.getElementById('progressContent');
  if(!root||!window.Progress)return;
  const stats=window.SharedProgress?.subjectStats?.()||{};
  const subjects=Object.values(stats);
  const d=Progress.data||{};
  const avg=Number(Progress.average?.()||0);
  const scienceMastered=Math.round((Number(d.completed?.length)||0)/12*100);
  const attempts=Array.isArray(d.history)?d.history.length:0;
  const totalXP=Number(window.SharedProgress?.combined?.().totalXP??d.xp)||0;
  const badges=Array.isArray(d.badges)?d.badges:[];
  const streak=Number(d.streak)||0;
  let history='';
  if(attempts){
    const name=id=>esc((window.CHAPTERS||[]).find(c=>c.id===Number(id))?.title||`Chapter ${id}`);
    history='<section class="progress-block"><div class="progress-block-head"><h3>🕘 Recent attempts</h3><span>Your latest practice activity</span></div>'+d.history.slice(0,8).map(a=>`<div class="progress-history-row"><span>${name(a.id)}</span><span>${esc(a.type||'Quiz')}</span><b>${Number(a.score)||0}/${Number(a.total)||0}</b></div>`).join('')+'</section>';
  }
  root.innerHTML=`
    <div class="progress-dashboard">
      <div class="dashboard-stats">
        <div class="stat"><b>${scienceMastered}%</b><span>Science mastered</span></div>
        <div class="stat"><b>${avg}%</b><span>Science average</span></div>
        <div class="stat"><b>${attempts}</b><span>Science attempts</span></div>
      </div>
      <div class="reward-stats">
        <div><b>${totalXP}</b><span>⚡ Total XP</span></div>
        <div><b>${streak}</b><span>🔥 Streak</span></div>
        <div><b>${badges.length}</b><span>🏅 Badges</span></div>
      </div>
      <section class="progress-block subject-progress-block">
        <div class="progress-block-head"><h3>📚 Subject Progress</h3><span>All six learning subjects at a glance</span></div>
        <div class="progress-subject-grid">${subjects.map(x=>{
          const p=clamp(x.progress),best=clamp(x.best);
          return `<article class="progress-subject-card"><div class="progress-subject-top"><h4>${esc(x.name)}</h4><b>${p}%</b></div><div class="progress-subject-meta">${esc(x.meta)} • ${Number(x.attempts)||0} attempts • ${Number(x.xp)||0} XP</div><div class="progress-subject-bar"><i style="width:${p}%"></i></div><div class="progress-subject-foot"><span>Progress / score</span>${best!==p?`<span>Best ${best}%</span>`:'<span>On track</span>'}</div></article>`;
        }).join('')}</div>
      </section>
      <section class="progress-block">
        <div class="progress-block-head"><h3>🏅 Badges</h3><span>Your learning milestones</span></div>
        <div class="badge-strip">${badges.length?badges.map(x=>`<span class="badge-pill">${esc(x)}</span>`).join(''):'<span class="muted">अभी कोई badge unlock नहीं हुआ।</span>'}</div>
      </section>
      ${history}
    </div>`;
}
window.openProgress=function(){
  document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));
  const target=document.getElementById('progressView');
  if(!target)return;
  target.classList.remove('hidden');
  target.querySelectorAll('.shared-progress-card').forEach(x=>x.remove());
  render();
  window.scrollTo({top:0,behavior:'smooth'});
};
function ensureStyles(){
  if(document.getElementById('subject-progress-view-style'))return;
  const st=document.createElement('style');st.id='subject-progress-view-style';
  st.textContent=`
    #progressView{padding-bottom:28px}
    #progressView>.lesson-head{margin-top:12px;margin-bottom:16px}
    #progressContent.progress-dashboard{margin-top:0;padding:18px}
    #progressContent .dashboard-stats,#progressContent .reward-stats{margin-bottom:18px}
    #progressContent .progress-block{margin-top:20px;padding-top:4px}
    #progressContent .progress-block-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:12px}
    #progressContent .progress-block-head h3{margin:0;font-size:19px}
    #progressContent .progress-block-head span{color:var(--muted);font-size:11px}
    .progress-subject-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .progress-subject-card{padding:15px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(135deg,#f8fbff,#fff)}
    .progress-subject-top{display:flex;justify-content:space-between;gap:10px;align-items:center}
    .progress-subject-top h4{margin:0;font-size:16px}
    .progress-subject-top b{font-size:20px;color:var(--p)}
    .progress-subject-meta{margin-top:7px;color:var(--muted);font-size:11px;line-height:1.55}
    .progress-subject-bar{height:9px;background:#e7eef7;border-radius:99px;overflow:hidden;margin:12px 0 7px}
    .progress-subject-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--p),var(--p2));border-radius:99px}
    .progress-subject-foot{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:var(--muted)}
    .progress-history-row{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line);font-size:13px}
    .progress-history-row span:nth-child(2){color:var(--muted);font-size:11px}
    .progress-history-row b{color:var(--p)}
    body.dark .progress-subject-card{background:linear-gradient(135deg,#14263c,#122238)}
    @media(max-width:700px){.progress-subject-grid{grid-template-columns:1fr}#progressContent.progress-dashboard{padding:14px}#progressContent .progress-block-head{align-items:flex-start;flex-direction:column;gap:4px}}
  `;document.head.appendChild(st);
}
ensureStyles();
window.addEventListener('DOMContentLoaded',()=>setTimeout(render,0));
window.addEventListener('science:xp',render);
window.addEventListener('storage',render);
window.addEventListener('hindi:progress',render);
window.addEventListener('sst:progress',render);
})();