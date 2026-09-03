(function(){
'use strict';
const GOAL=25;
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function sync(){
  if(!window.XPSystem)return;
  const data=window.XPSystem.read();
  const earned=data.daily&&data.daily.date===today()?Math.max(0,Number(data.daily.earned)||0):0;
  const done=Math.min(GOAL,earned);
  const pct=Math.round(done/GOAL*100);
  const bar=$('dailyMissionBar');
  const value=$('dailyMissionValue');
  const note=$('dailyMissionNote');
  const card=$('dailyMission');
  if(!bar||!value||!note||!card)return;
  bar.style.width=`${pct}%`;
  value.textContent=`${done} / ${GOAL} XP`;
  card.classList.toggle('is-complete',done>=GOAL);
  note.textContent=done>=GOAL?'Mission complete! आज का target पूरा हो गया।':`${GOAL-done} XP और कमाने हैं — पढ़ाई जारी रखो।`;
}
function bind(){sync();window.addEventListener('xp:earned',sync);window.addEventListener('storage',sync);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
