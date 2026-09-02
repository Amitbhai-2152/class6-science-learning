(function(){
'use strict';
function install(){
  const hub=window.FlashcardRevision;
  if(!hub||typeof hub.open!=='function')return false;
  window.openUnifiedRevision=function(){hub.open()};
  window.openRevision=window.openUnifiedRevision;
  document.querySelectorAll('[onclick="openRevision()"]')
    .forEach(el=>el.setAttribute('onclick','openUnifiedRevision()'));
  return true;
}
if(!install()){
  [50,150,300,700,1200].forEach(ms=>setTimeout(install,ms));
}
})();
