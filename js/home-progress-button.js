(function(){
'use strict';
function bind(){
  const btn=document.getElementById('progressBtn');
  if(!btn||btn.dataset.progressBound==='1')return;
  btn.dataset.progressBound='1';
  btn.addEventListener('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    if(typeof window.openProgress==='function'){
      window.openProgress();
      return;
    }
    try{location.hash='progress'}catch(_){}
  });
}
window.addEventListener('DOMContentLoaded',bind);
window.addEventListener('load',bind);
})();
