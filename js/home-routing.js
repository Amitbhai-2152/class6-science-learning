(function(){
  'use strict';
  function route(){
    try{
      const params=new URLSearchParams(location.search);
      const view=params.get('view');
      const chapter=Number(params.get('chapter'))||0;

      if(view==='science' && !chapter){
        location.replace('subjects/science/index.html');
        return;
      }

      if(view==='science' && chapter && typeof window.openChapter==='function'){
        window.openChapter(chapter,0);
        window.goHome=function(){
          location.href='subjects/science/index.html';
        };
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
