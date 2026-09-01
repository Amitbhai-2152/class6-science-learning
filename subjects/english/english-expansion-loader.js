(function(){
'use strict';
if(!window.ENGLISH_EXPANSION||!Array.isArray(window.ENGLISH_CHAPTERS))return;
window.ENGLISH_CHAPTERS.forEach(function(ch){
  const extra=window.ENGLISH_EXPANSION[ch.id];
  if(!extra)return;
  ch.sections=Array.isArray(ch.sections)?ch.sections:[];
  ch.practice=Array.isArray(ch.practice)?ch.practice:[];
  ch.sections.push(...(extra.lessons||[]));
  ch.practice.push(...(extra.practice||[]));
});
window.ENGLISH_CONTENT_EXPANDED=true;
})();