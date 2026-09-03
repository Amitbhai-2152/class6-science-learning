(function(){
  'use strict';
  function refreshTutorSafeStyle(){
    if(document.querySelector('link[data-tutor-safe-v2]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='css/tutor-fab-safe.css?v=2';
    link.dataset.tutorSafeV2='true';
    document.head.appendChild(link);
  }
  function installTestInstructionGuards(){
    const ti=window.TestInstructions;
    if(!ti)return;
    if(window.QuizEngine?.run && !window.QuizEngine.__candidateInstructions){
      const originalRun=window.QuizEngine.run;
      window.QuizEngine.run=function(questions,box,callback){
        return ti.open({title:'Chapter Challenge शुरू करने से पहले',subtitle:'पहले instructions पढ़ो, फिर अपने answers carefully attempt करो।',items:['हर question को ध्यान से पढ़कर सबसे सही option चुनो.','इस challenge में हर सही उत्तर पर 1 mark मिलेगा; गलत/छोड़े हुए answer पर 0 mark.','Answer चुनने के बाद आगे बढ़ो और जरूरत हो तो questions दोबारा check करो.','Submit के बाद score और हर question का explanation देखना मत भूलो.'],startLabel:'Instructions पढ़ लीं — Challenge शुरू करें 🚀'},()=>originalRun.call(window.QuizEngine,questions,box,callback));
      };
      window.QuizEngine.__candidateInstructions=true;
    }
    if(window.ScienceCBT?.start && !window.ScienceCBT.__candidateInstructions){
      const originalStart=window.ScienceCBT.start;
      window.ScienceCBT.start=function(){
        const fields=['cbtName','cbtFather','cbtMother','cbtPlace'];
        if(fields.some(id=>!document.getElementById(id)?.value.trim()))return originalStart.call(window.ScienceCBT);
        return ti.open({title:'2-Hour Science CBT शुरू करने से पहले',subtitle:'Candidate details save करने से पहले exam rules ध्यान से पढ़ो।',items:['कुल 60 तक Science questions और 120 minutes का exam flow है.','सही उत्तर = +1 mark; गलत और unattempted = 0; negative marking नहीं.','Question palette से किसी भी question पर जा सकते हो और ⭐ Mark for Review लगा सकते हो.','Timer चलने के दौरान page को अनावश्यक रूप से बंद/refresh मत करो.','Final submit से पहले answered, unanswered और review-marked questions check करो.','Submit के बाद हर question का answer, correct answer और explanation review कर सकते हो.'],startLabel:'Instructions पढ़ लीं — CBT शुरू करें 🚀'},()=>originalStart.call(window.ScienceCBT));
      };
      window.ScienceCBT.__candidateInstructions=true;
    }
  }
  function loadLevelBanner(){
    if(document.querySelector('script[data-level-banner]'))return;
    const script=document.createElement('script');
    script.src='js/level-banner.js?v=1';
    script.dataset.levelBanner='true';
    document.head.appendChild(script);
  }
  function route(){
    refreshTutorSafeStyle();
    installTestInstructionGuards();
    setTimeout(loadLevelBanner,0);
    try{
      const params=new URLSearchParams(location.search);
      const view=params.get('view');
      const chapter=Number(params.get('chapter'))||0;

      if(view==='science' && !chapter){
        location.replace('subjects/science/index.html');
        return;
      }

      if(view==='science' && chapter && typeof window.openChapter==='function'){
        window.openChapter(chapter,0);
        window.goHome=function(){
          location.href='subjects/science/index.html';
        };
        return;
      }

      if(view==='science-practice' && window.FullScienceTest?.start){
        window.FullScienceTest.start(4);
        return;
      }
      if(view==='science-cbt' && window.ScienceCBT?.open){
        window.ScienceCBT.open();
        return;
      }
    }catch(_){/* keep homepage usable if routing fails */}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',route,{once:true});
  else route();
})();
