(function(){
'use strict';
/* Compatibility entry only: the real Revision experience lives in revision.html. */
function open(){
  window.location.href='revision.html';
}
window.openUnifiedRevision=open;
window.openRevision=open;
window.RevisionFinal={open:open};
})();
