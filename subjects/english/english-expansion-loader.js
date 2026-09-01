(function(){
'use strict';
const expansion=(typeof ENGLISH_EXPANSION!=='undefined')?ENGLISH_EXPANSION:(window.ENGLISH_EXPANSION||null);
if(!expansion||!Array.isArray(window.ENGLISH_CHAPTERS))return;
window.ENGLISH_CHAPTERS.forEach(function(ch){
  const extra=expansion[ch.id];
  if(!extra)return;
  ch.sections=Array.isArray(ch.sections)?ch.sections:[];
  ch.practice=Array.isArray(ch.practice)?ch.practice:[];
  ch.sections.push(...(extra.lessons||[]));
  ch.practice.push(...(extra.practice||[]));
});
window.ENGLISH_CONTENT_EXPANDED=true;
})();
