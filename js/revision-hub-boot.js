(function(){
  'use strict';
  /* Compatibility shim: never overwrite the final flashcard Revision owner. */
  function handoff(){
    if(window.FlashcardRevision && typeof window.FlashcardRevision.open==='function'){
      window.openUnifiedRevision=window.FlashcardRevision.open;
      window.openRevision=window.FlashcardRevision.open;
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',handoff,{once:true});
  else handoff();
})();
