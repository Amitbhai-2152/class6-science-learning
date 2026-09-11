(function(){
'use strict';
if(window.__chapterStatusLoaded)return;
window.__chapterStatusLoaded=true;
const KEY_PREFIX='class6ChapterClearedV1:';
const DATE_PREFIX='class6ChapterCompletedAtV1:';
const scoreKey=(subject,id)=>`class6ChapterScoreV1:${String(subject).toLowerCase()}:${String(id)}`;
function installStyle(){
  if(document.getElementById('chapterStatusStyle'))return;
  const s=document.createElement('style');s.id='chapterStatusStyle';
  s.textContent='.chapter-status-badge{display:block;width:max-content;max-width:100%;margin-bottom:8px;padding:5px 8px;border-radius:999px;background:#ecfdf3;color:#15803d;border:1px solid #bbf7d0;font-size:10px;font-weight:900;line-height:1.25}.chapter-status-current{margin:10px 0 0;padding:9px 11px;border:1px solid #bbf7d0;border-radius:11px;background:#f0fdf4;color:#166534;font-size:12px;font-weight:800;line-height:1.5}.dark .chapter-status-badge,.dark .chapter-status-current{background:#123523;color:#86efac;border-color:#276749}';
  (document.head||document.documentElement).appendChild(s);
}
function subjectFromPath(){const p=location.pathname;if(p.includes('/maths/'))return'maths';if(p.includes('/english/'))return'english';if(p.includes('/hindi/'))return'hindi';if(p.includes('/gk/'))return'gk';if(p.includes('/social-science/'))return'social-science';if(p.includes('/science/'))return'science';return''}
function getStatus(subject,id){try{if(localStorage.getItem(KEY_PREFIX+subject+':'+id)!=='1')return null;return{completed:true,at:Number(localStorage.getItem(DATE_PREFIX+subject+':'+id)||0),score:localStorage.getItem(scoreKey(subject,id))||''}}catch(_){return null}}
function formatDate(ts){if(!ts)return'✅ पहले पूरा किया गया';try{return`✅ पहले पूरा किया • ${new Date(ts).toLocaleDateString('hi-IN',{day:'numeric',month:'short',year:'numeric'})}`}catch(_){return'✅ पहले पूरा किया'}}
function currentId(){const q=new URLSearchParams(location.search);const m=location.pathname.match(/(?:chapter|topic(?:-hi)?)\.html$/i);if(!m)return'';return q.get('chapter')||q.get('topic')||''}
function decorateCurrent(){const subject=subjectFromPath(),id=currentId();if(!subject||!id)return;const status=getStatus(subject,id);if(!status||document.querySelector('[data-current-chapter-status]'))return;const note=document.createElement('div');note.className='chapter-status-current';note.setAttribute('data-current-chapter-status','1');note.textContent=status.at?`✓ आपने यह अध्याय पहले पूरा किया था • ${new Date(status.at).toLocaleDateString('hi-IN',{day:'numeric',month:'short',year:'numeric'})}${status.score?` • ${status.score}`:''}`:'✓ आपने यह अध्याय पहले पूरा किया था';const heading=document.querySelector('header h1,.top h1,h1');if(heading?.parentElement)heading.insertAdjacentElement('afterend',note);else if(document.body.firstElementChild)document.body.insertBefore(note,document.body.firstElementChild.nextSibling)}
function decorate(root=document){const subject=subjectFromPath();if(!subject)return;installStyle();root.querySelectorAll('a[href]').forEach(a=>{if(a.dataset.chapterStatusApplied==='1')return;const href=a.getAttribute('href')||'',m=href.match(/(?:chapter\.html\?chapter=|topic(?:-hi)?\.html\?topic=)([^&#]+)/i);if(!m)return;const id=decodeURIComponent(m[1]),status=getStatus(subject,id);if(!status)return;a.dataset.chapterStatusApplied='1';const badge=document.createElement('span');badge.className='chapter-status-badge';badge.textContent=formatDate(status.at);badge.title=status.score?`Cleared score: ${status.score}`:'Chapter previously completed';const go=a.querySelector('.go');if(go){go.textContent='✓ अध्याय पहले पूरा किया गया • दोबारा खोलें →';go.style.color='var(--ok,#15803d)'}a.insertBefore(badge,a.firstChild)})}
function observe(){decorate(document);decorateCurrent();if(!document.body)return;const mo=new MutationObserver(()=>{decorate(document);decorateCurrent()});mo.observe(document.body,{childList:true,subtree:true});window.addEventListener('storage',()=>{decorate(document);decorateCurrent()});window.addEventListener('chapter:completed',()=>setTimeout(()=>{decorate(document);decorateCurrent()},0))}
function recordCompletion(data){try{const subject=String(data?.subject||'').toLowerCase(),id=String(data?.chapterId??'').trim();if(!subject||!id)return;localStorage.setItem(DATE_PREFIX+subject+':'+id,String(Date.now()));if(data?.score!==undefined&&data?.total!==undefined)localStorage.setItem(scoreKey(subject,id),`${data.score}/${data.total} (${data.pct??''}%)`)}catch(_) {}}
document.addEventListener('chapter:completed',e=>recordCompletion(e.detail||{}));
window.addEventListener('DOMContentLoaded',observe,{once:true});
window.ChapterStatus={getStatus,decorate,recordCompletion};
})();
