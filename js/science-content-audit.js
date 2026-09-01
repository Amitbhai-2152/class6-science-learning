(function(){'use strict';
const MIN_SECTIONS=10,MIN_QUESTIONS=15;
function chapterList(){return Array.from({length:12},(_,i)=>window['chapter'+String(i+1).padStart(2,'0')]).filter(Boolean)}
function inspect(ch){
  const sections=Array.isArray(ch?.sections)?ch.sections:[];
  const qs=Array.isArray(ch?.questions)?ch.questions:(Array.isArray(ch?.quiz)?ch.quiz:[]);
  const issues=[];
  if(sections.length<MIN_SECTIONS)issues.push(`less than ${MIN_SECTIONS} lessons`);
  if(qs.length<MIN_QUESTIONS)issues.push(`less than ${MIN_QUESTIONS} quiz questions`);
  sections.forEach((s,i)=>{if(!s||typeof s!=='object'||!s.title||!s.body)issues.push(`lesson ${i+1} incomplete`)})
  qs.forEach((q,i)=>{if(!q||!q.question||!Array.isArray(q.options)||q.options.length<2||typeof q.answer!=='number')issues.push(`question ${i+1} invalid`)})
  return {id:ch?.id,title:ch?.title,lessons:sections.length,questions:qs.length,ok:issues.length===0,issues};
}
function run(){const report=chapterList().map(inspect);window.ScienceContentAuditReport=report;return report}
window.ScienceContentAudit={run,inspect,minimums:{lessons:MIN_SECTIONS,questions:MIN_QUESTIONS}};
window.addEventListener('load',run,{once:true});
})();
