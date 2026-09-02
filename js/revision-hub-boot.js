(function(){
  'use strict';
  /* Single Revision entry point. Legacy Science-only openRevision is no longer the UI route. */
  function activateRevision(){
    const hub=window.UnifiedRevision;
    if(!hub||typeof hub.render!=='function') return false;
    function openUnifiedRevision(){
      document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
      const view=document.getElementById('revisionView');
      if(!view) return;
      view.classList.remove('hidden');
      hub.render();
      window.scrollTo({top:0,behavior:'smooth'});
    }
    window.openUnifiedRevision=openUnifiedRevision;
    /* Keep old callers safe, but make them resolve to the unified hub. */
    window.openRevision=openUnifiedRevision;
    document.querySelectorAll('[onclick="openRevision()"]')
      .forEach(el=>el.setAttribute('onclick','openUnifiedRevision()'));
    return true;
  }
  function boot(){
    if(activateRevision()) return;
    setTimeout(activateRevision,100);
    setTimeout(activateRevision,500);
    setTimeout(activateRevision,1200);
    setTimeout(activateRevision,2500);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
