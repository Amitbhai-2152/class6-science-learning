(function(){
  'use strict';
  function route(){
    try{
      const view=new URLSearchParams(location.search).get('view');
      if(view==='science' && typeof window.openChapter==='function'){
        window.openChapter(1,0);
      }
    }catch(_){/* keep homepage usable if routing fails */}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',route,{once:true});
  else route();
})();
