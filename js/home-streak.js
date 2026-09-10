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
function getActivityDays(){
  const days=new Set();
  getEvents().forEach(e=>{const d=dayKey(e?.at);if(d)days.add(d)});
  try{
    const xpDays=window.XPSystem?.read?.()?.activeDays;
    if(Array.isArray(xpDays))xpDays.forEach(d=>{const key=dayKey(d);if(key)days.add(key)});
  }catch(_){ }
  return days;
}
function getCalendarStreak(){
  const days=getActivityDays();
  if(!days.size)return 0;
  let cursor=new Date();
  let streak=0;
  while(days.has(dayKey(cursor))){
    streak++;
    cursor.setDate(cursor.getDate()-1);
  }
  return streak;
}
function getScienceProgressStreak(){
  try{
    const persisted=localStorage.getItem('class6ScienceProgressV9');
    const p=persisted?JSON.parse(persisted):null;
    const last=p?.lastActive;
    const today=dayKey(new Date());
    if(!last||dayKey(last)!==today)return 0;
    return Math.max(0,Number(p.streak)||0);
  }catch(_){return 0}
}
function getCloudStreak(){
  try{
    const state=window.XPSystem?.read?.()||{};
    return Math.max(0,Number(state.streakState?.streak)||0);
  }catch(_){return 0}
}
function getStreak(){
  return Math.max(getCalendarStreak(),getScienceProgressStreak(),getCloudStreak());
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
window.HomeStreak={refresh,getStreak,getActivityDays};
window.addEventListener('DOMContentLoaded',()=>{refresh();watchDisplays()},{once:true});
window.addEventListener('load',()=>{refresh();watchDisplays()},{once:true});
window.addEventListener('xp:earned',refresh);
window.addEventListener('xp:activity',refresh);
window.addEventListener('science:xp',refresh);
window.addEventListener('class6:streak-cloud-synced',refresh);
window.addEventListener('storage',refresh);
})();