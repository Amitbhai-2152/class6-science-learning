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
window.HomeStreak={refresh,getStreak};
window.addEventListener('DOMContentLoaded',refresh);
window.addEventListener('load',refresh);
window.addEventListener('xp:earned',refresh);
window.addEventListener('science:xp',refresh);
window.addEventListener('storage',refresh);
})();
