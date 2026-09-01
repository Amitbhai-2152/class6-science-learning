(function(){
'use strict';

// Safety/QA layer for the dedicated Maths Practice Bank.
// It validates answer indexes and corrects a known answer-key mismatch.
const bankCandidates=[window.mathsPracticeBank,window.MathsPracticeBank,window.practiceBank,window.mathsPracticeQuestions];
const bank=bankCandidates.find(x=>Array.isArray(x));
if(!bank)return;

// Known correction: a=3, b=5 => 2a+b = 11, which is option index 1.
const known=bank.find(q=>q && q.question==='a = 3 और b = 5 हों तो 2a + b का मान क्या है?');
if(known){
  known.answer=1;
  known.explanation='2a + b = 2×3 + 5 = 6 + 5 = 11।';
}

// Runtime structural validation: invalid keys are removed from the usable pool.
for(let i=bank.length-1;i>=0;i--){
  const q=bank[i];
  const valid=q && Array.isArray(q.options) && q.options.length>1 && Number.isInteger(q.answer) && q.answer>=0 && q.answer<q.options.length && typeof q.question==='string' && q.question.trim();
  if(!valid)bank.splice(i,1);
}
window.mathsPracticeBankValidated=true;
})();
