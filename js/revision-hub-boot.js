(function(){
  'use strict';
  /* Final boot layer: Revision must win over the legacy Science-only revision. */
  function activateRevision(){
    const hub=window.UnifiedRevision;
    if(!hub||typeof hub.render!=='function') return false;
    window.openRevision=function(){
      document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
      const view=document.getElementById('revisionView');
      if(!view) return;
      view.classList.remove('hidden');
      hub.render();
      window.scrollTo({top:0,behavior:'smooth'});
    };
    return true;
  }
  function boot(){
    if(activateRevision()) return;
    setTimeout(activateRevision,100);
    setTimeout(activateRevision,500);
    setTimeout(activateRevision,1200);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
