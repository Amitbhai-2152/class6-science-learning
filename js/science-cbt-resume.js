(function(){
  'use strict';
  function restore(){
    try{
      if(window.ScienceCBT?.restore && window.ScienceCBT.restore()){
        const view=document.getElementById('cbtView');
        if(view){
          document.querySelectorAll('.view').forEach(v=>{if(v.id!=='cbtView')v.classList.add('hidden')});
          view.classList.remove('hidden');
        }
        window.ScienceCBT.renderExam();
        window.ScienceCBT.startTimer();
      }
    }catch(err){
      console.error('Science CBT resume failed:',err);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(restore,0),{once:true});
  else setTimeout(restore,0);
})();
