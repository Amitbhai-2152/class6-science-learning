(function(){
  'use strict';
  function refreshTutorSafeStyle(){
    if(document.querySelector('link[data-tutor-safe-v2]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='css/tutor-fab-safe.css?v=2';
    link.dataset.tutorSafeV2='true';
    document.head.appendChild(link);
  }
  function route(){
    refreshTutorSafeStyle();
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
