(function(){
'use strict';

function getStreak(){
  try{return Math.max(0,Number(window.XPSystem?.currentStreak?.())||0)}catch(_){return 0}
}
function getActivityDays(){
  try{return Array.isArray(window.XPSystem?.activityDays?.())?window.XPSystem.activityDays():[]}catch(_){return[]}
}
function refresh(){
  const streak=getStreak();
  const mini=document.getElementById('streakMini');
  if(mini)mini.textContent=String(streak);
  const home=document.getElementById('homeStreak');
  if(home)home.textContent=String(streak);
}
function watchDisplays(){
  if(!window.MutationObserver||document.documentElement.dataset.streakWatchV2==='1')return;
  const targets=['streakMini','homeStreak'].map(id=>document.getElementById(id)).filter(Boolean);
  if(!targets.length)return;
  document.documentElement.dataset.streakWatchV2='1';
  const observer=new MutationObserver(()=>{
    const expected=String(getStreak());
    targets.forEach(el=>{if(el.textContent!==expected)el.textContent=expected});
  });
  targets.forEach(el=>observer.observe(el,{childList:true,characterData:true,subtree:true}));
  refresh();
}
window.HomeStreak={refresh,getStreak,getActivityDays};
window.addEventListener('DOMContentLoaded',()=>{refresh();watchDisplays()},{once:true});
window.addEventListener('load',()=>{refresh();watchDisplays()},{once:true});
window.addEventListener('xp:earned',refresh);
window.addEventListener('xp:activity',refresh);
window.addEventListener('class6:streak-cloud-synced',refresh);
window.addEventListener('storage',refresh);
})();