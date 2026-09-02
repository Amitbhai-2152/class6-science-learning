(function(){
'use strict';
/* Final entry shim: keeps the flashcard hub authoritative and removes any stale legacy route. */
function install(){
  const hub=window.FlashcardRevision;
  if(!hub||typeof hub.open!=='function')return false;
  window.openUnifiedRevision=function(){hub.open()};
  window.openRevision=window.openUnifiedRevision;
  document.querySelectorAll('[onclick="openRevision()"]')
    .forEach(el=>el.setAttribute('onclick','openUnifiedRevision()'));
  return true;
}
function polish(){
  const host=document.getElementById('revisionContent');
  if(!host)return;
  const success=host.querySelector('.rf-success');
  if(success){
    const p=Array.from(success.querySelectorAll('p')).find(x=>x.textContent.includes('revision reward'));
    if(p)p.innerHTML='<b>Revision complete!</b> अब इस chapter को दोबारा <b>Smart Revision</b> schedule में रखो।';
  }
}
if(!install())[50,150,300,700,1200].forEach(ms=>setTimeout(install,ms));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{install();polish()},{once:true});
else polish();
new MutationObserver(polish).observe(document.getElementById('revisionContent')||document.body,{childList:true,subtree:true});
})();
