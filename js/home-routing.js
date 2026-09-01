(function(){
  'use strict';
  function route(){
    try{
      const view=new URLSearchParams(location.search).get('view');
      if(view==='science' && typeof window.openChapter==='function'){
        window.openChapter(1,0);
        return;
      }
      if(view==='science-practice' && window.FullScienceTest?.start){
        window.FullScienceTest.start(4);
        return;
      }
      if(view==='science-cbt' && window.ScienceCBT?.open){
        window.ScienceCBT.open();
        return;
      }
    }catch(_){/* keep homepage usable if routing fails */}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',route,{once:true});
  else route();
})();
