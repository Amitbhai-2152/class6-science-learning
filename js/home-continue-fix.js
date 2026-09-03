(function(){
'use strict';
function readProgress(){
  try{
    const raw=JSON.parse(localStorage.getItem('class6ScienceProgressV9')||'null');
    return raw&&typeof raw==='object'?raw:{};
  }catch(_){return {}}
}
function clamp(v){return Math.max(0,Math.min(100,Math.round(Number(v)||0)))}
function getState(){
  const h=readProgress();
  const completed=Array.isArray(h.completed)?h.completed.map(Number):[];
  const section=h.section&&typeof h.section==='object'?h.section:{};
  let chapter=Number(localStorage.getItem('scienceCurrentChapter')||window.currentChapter||1);
  if(!Number.isFinite(chapter)||chapter<1)chapter=1;
  if(window.CHAPTERS?.length)chapter=Math.min(chapter,window.CHAPTERS.length);
  if(completed.includes(chapter)){
    const next=(window.CHAPTERS||[]).find(c=>!completed.includes(Number(c.id)));
    if(next)chapter=Number(next.id);
  }
  let part=Number(section[chapter]||0);
  if(!Number.isFinite(part)||part<0)part=0;
  const c=window.CHAPTERS?.find(x=>Number(x.id)===chapter);
  if(c?.sections?.length)part=Math.min(part,c.sections.length);
  const pct=completed.length/(window.CHAPTERS?.length||12)*100;
  return{chapter,part,c,pct,completed}
}
function refresh(){
  const card=document.querySelector('.home-continue .home-card:first-child');
  if(!card)return;
  const state=getState();
  const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
  const bar=document.getElementById('continueBar');
  set('continueTitle',state.c?.title||'Science');
  set('continuePercent',clamp(state.pct)+'%');
  if(state.c){
    const total=(state.c.sections?.length||0)+1;
    const label=state.part>=state.c.sections.length?'Chapter Challenge':`भाग ${Math.min(state.part+1,state.c.sections.length)}/${state.c.sections.length}`;
    set('continueMeta',`${state.c.title} • ${label}`);
    if(bar)bar.style.width=clamp(state.pct)+'%';
  }else{
    set('continueMeta','अध्याय 1 से शुरुआत करो');
    if(bar)bar.style.width=clamp(state.pct)+'%';
  }
  const button=card.querySelector('.home-btn.primary');
  if(button&&!button.dataset.continueBound){
    button.dataset.continueBound='true';
    button.removeAttribute('onclick');
    button.addEventListener('click',function(){
      const s=getState();
      if(typeof window.openChapter==='function')window.openChapter(s.chapter,s.part);
    });
  }
}
window.HomeContinueFix={refresh};
window.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,0));
window.addEventListener('load',()=>setTimeout(refresh,0));
['storage','science:xp','xp:earned'].forEach(ev=>window.addEventListener(ev,refresh));
})();
