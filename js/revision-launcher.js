(function(){
'use strict';
/* Revision launcher: guarantees every homepage Revision entry point opens the final all-subject hub. */
function loadFinal(done){
  if(window.RevisionFinal&&typeof window.RevisionFinal.open==='function'){done();return;}
  var existing=document.querySelector('script[data-revision-final-loader]');
  if(existing){existing.addEventListener('load',done,{once:true});return;}
  var s=document.createElement('script');
  s.src='js/revision-final.js?v=5&cb='+Date.now();
  s.async=false;
  s.dataset.revisionFinalLoader='1';
  s.onload=done;
  s.onerror=function(){console.error('RevisionFinal failed to load');};
  document.head.appendChild(s);
}
function openRevisionHub(){
  loadFinal(function(){
    if(window.RevisionFinal&&typeof window.RevisionFinal.open==='function'){
      window.RevisionFinal.open();
    }else{
      var v=document.getElementById('revisionView');
      if(v){document.querySelectorAll('.view').forEach(function(x){x.classList.add('hidden')});v.classList.remove('hidden');}
      console.error('RevisionFinal.open is unavailable');
    }
  });
}
window.openAllSubjectRevision=openRevisionHub;
window.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('[data-open-revision]').forEach(function(el){el.addEventListener('click',function(e){e.preventDefault();openRevisionHub()})});
});
})();
