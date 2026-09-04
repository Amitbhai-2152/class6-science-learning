(function(){
'use strict';
function dayKey(value){
  const d=value instanceof Date?value:new Date(value);
  if(Number.isNaN(d.getTime()))return null;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getEvents(){
  try{
    const state=window.XPSystem?.read?.();
    return Array.isArray(state?.events)?state.events:[];
  }catch(_){return[]}
}
function getEventStreak(){
  const days=new Set(getEvents().map(e=>dayKey(e?.at)).filter(Boolean));
  let cursor=new Date();
  if(!days.has(dayKey(cursor)))return 0;
  let streak=0;
  while(days.has(dayKey(cursor))){
    streak++;
    cursor.setDate(cursor.getDate()-1);
  }
  return streak;
}
function getScienceProgressStreak(){
  try{
    const p=window.Progress?.data;
    if(!p?.lastActive||dayKey(p.lastActive)!==dayKey(new Date()))return 0;
    return Math.max(0,Number(p.streak)||0);
  }catch(_){return 0}
}
function getStreak(){
  return Math.max(getEventStreak(),getScienceProgressStreak());
}
function refresh(){
  const streak=getStreak();
  const mini=document.getElementById('streakMini');
  if(mini)mini.textContent=String(streak);
  const home=document.getElementById('homeStreak');
  if(home)home.textContent=String(streak);
}
function watchDisplays(){
  if(!window.MutationObserver||document.documentElement.dataset.streakWatch==='1')return;
  const targets=['streakMini','homeStreak'].map(id=>document.getElementById(id)).filter(Boolean);
  if(!targets.length)return;
  document.documentElement.dataset.streakWatch='1';
  const observer=new MutationObserver(()=>{
    const expected=String(getStreak());
    targets.forEach(el=>{if(el.textContent!==expected)el.textContent=expected});
  });
  targets.forEach(el=>observer.observe(el,{childList:true,characterData:true,subtree:true}));
  refresh();
}
window.HomeStreak={refresh,getStreak};
window.addEventListener('DOMContentLoaded',()=>{refresh();watchDisplays()},{once:true});
window.addEventListener('load',()=>{refresh();watchDisplays()},{once:true});
window.addEventListener('xp:earned',refresh);
window.addEventListener('science:xp',refresh);
window.addEventListener('storage',refresh);
})();
