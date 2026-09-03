(function(){
'use strict';
const lines=[
'🌱 हर दिन थोड़ा सीखो — छोटी progress भी बड़ी जीत बनती है।',
'🚀 आज का एक छोटा कदम, कल की बड़ी सफलता की शुरुआत है।',
'🧠 समझकर पढ़ो, सिर्फ याद मत करो — यही असली learning है।',
'🎯 आज एक concept पूरा करो और अपनी streak को आगे बढ़ाओ।',
'💡 सवाल पूछना कमजोरी नहीं, smart learner की पहचान है।',
'⚡ Consistency तुम्हारी superpower है — आज की पढ़ाई मत छोड़ो।',
'🏆 हर सही answer तुम्हें तुम्हारे अगले level के करीब ले जाता है।'
];
function sciencePct(){
  try{
    const h=JSON.parse(localStorage.getItem('class6ScienceProgressV9')||'null');
    const completed=Array.isArray(h?.completed)?h.completed.length:0;
    return Math.max(0,Math.min(100,Math.round(completed/12*100)));
  }catch(_){return 0}
}
function addMotivationSizing(){
  if(document.getElementById('daily-motivation-size-fix'))return;
  const s=document.createElement('style');
  s.id='daily-motivation-size-fix';
  s.textContent='#homeView .home-motivation{padding:18px 19px;min-height:84px;gap:16px}#homeView .home-motivation-icon{flex-basis:48px;width:48px;height:48px;font-size:24px}#homeView .home-motivation small{font-size:12px}#homeView .home-motivation b{font-size:16px;line-height:1.55}@media(max-width:650px){#homeView .home-motivation{padding:16px 14px;min-height:82px;gap:13px}#homeView .home-motivation-icon{flex-basis:44px;width:44px;height:44px;font-size:22px}#homeView .home-motivation b{font-size:15px}}';
  document.head.appendChild(s);
}
function syncCurrentSubjectProgress(){
  const pct=sciencePct();
  const el=document.getElementById('homeSciencePct');
  if(el)el.textContent=pct+'%';
}
function render(){
  addMotivationSizing();
  const el=document.getElementById('dailyMotivation');
  if(el){
    const d=new Date(),idx=(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000|0)%lines.length;
    el.textContent=lines[(idx+lines.length)%lines.length];
  }
  syncCurrentSubjectProgress();
}
window.addEventListener('DOMContentLoaded',render);
window.addEventListener('load',render);
['storage','science:xp','xp:earned'].forEach(ev=>window.addEventListener(ev,syncCurrentSubjectProgress));
})();
