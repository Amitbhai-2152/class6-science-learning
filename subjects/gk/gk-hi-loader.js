(function(){
  'use strict';

  if(!window.GK_HI_LESSONS_DEPTH){
    document.write('<script src="gk-hi-lessons-depth.js?v=1"><\\/script>');
  }

  if(!Array.isArray(window.GK_HI_TOPICS)||!Array.isArray(window.GK_HI_LESSONS)) return;

  // Keep topic/lesson lookup stable even if a data file changes its array order.
  window.GK_HI_TOPICS.sort(function(a,b){return Number(a.id)-Number(b.id);});
  window.GK_HI_LESSONS.sort(function(a,b){return Number(a.id)-Number(b.id);});

  window.GK_HI_TOPICS.forEach(function(t){
    var base=window.GK_TOPICS&&window.GK_TOPICS.find(function(x){return Number(x.id)===Number(t.id);});
    if(base) t.icon=base.icon;
  });

  window.GK_HI_READY=true;
})();
