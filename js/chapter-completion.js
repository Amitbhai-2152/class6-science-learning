(function(){'use strict';
const KEY_PREFIX='class6ChapterClearedV1:';
function safe(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function storageKey(subject,id){return KEY_PREFIX+String(subject||'general').trim().toLowerCase()+':'+String(id)}
function hasCleared(subject,id){try{return localStorage.getItem(storageKey(subject,id))==='1'}catch(_){return false}}
function markCleared(subject,id){try{localStorage.setItem(storageKey(subject,id),'1');return true}catch(_){return false}}
function particles(root,count=22){const wrap=document.createElement('div');wrap.className='chapter-completion-particles';for(let i=0;i<count;i++){const p=document.createElement('i');p.className='chapter-completion-particle';const a=(Math.PI*2*i/count)+(Math.random()-.5)*.25,r=90+Math.random()*95;p.style.setProperty('--dx',Math.cos(a)*r+'px');p.style.setProperty('--dy',Math.sin(a)*r+'px');p.style.setProperty('--rot',(Math.random()*420-210)+'deg');p.style.animationDelay=(Math.random()*.12)+'s';wrap.appendChild(p)}root.appendChild(wrap)}
function close(){const o=document.getElementById('chapterCompletionOverlay');if(!o)return;o.classList.remove('show');setTimeout(()=>o.remove(),220)}
function show({subject='general',chapterId,title='Chapter',score=0,total=0,pct=100,force=false}={}){
  const id=String(chapterId??'').trim();if(!id)return false;
  if(!force&&hasCleared(subject,id))return false;
  markCleared(subject,id);
  try{localStorage.setItem(`class6ChapterCompletedAtV1:${String(subject).toLowerCase()}:${id}`,String(Date.now()));localStorage.setItem(`class6ChapterScoreV1:${String(subject).toLowerCase()}:${id}`,`${score}/${total} (${pct}%)`)}catch(_){}
  const detail={subject:String(subject).toLowerCase(),chapterId:id,title,score,total,pct};
  try{document.dispatchEvent(new CustomEvent('chapter:completed',{detail}))}catch(_){}
  document.getElementById('chapterCompletionOverlay')?.remove();
  const o=document.createElement('div');o.id='chapterCompletionOverlay';
  o.innerHTML=`<div class="chapter-completion-card" role="dialog" aria-modal="true" aria-labelledby="chapterCompletionTitle"><div class="chapter-completion-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="chapter-completion-track" cx="60" cy="60" r="54"></circle><circle class="chapter-completion-progress" cx="60" cy="60" r="54"></circle></svg><div class="chapter-completion-check">✓</div></div><div class="chapter-completion-kicker">CHAPTER COMPLETE</div><h2 id="chapterCompletionTitle">🎉 Chapter Cleared!</h2><p class="chapter-completion-title">${safe(title)}</p><p class="chapter-completion-score">Score: <b>${safe(score)}/${safe(total)}</b> · ${safe(pct)}%</p><button type="button" class="chapter-completion-continue">Continue learning →</button></div>`;
  document.body.appendChild(o);particles(o.querySelector('.chapter-completion-card'));o.querySelector('.chapter-completion-continue').addEventListener('click',close);o.addEventListener('click',e=>{if(e.target===o)close()});requestAnimationFrame(()=>o.classList.add('show'));return true
}
window.ChapterCompletion={show,close,hasCleared,markCleared};
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();
