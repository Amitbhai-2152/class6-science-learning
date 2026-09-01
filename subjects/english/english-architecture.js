(function(){
'use strict';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function chapters(){
  if(!Array.isArray(window.ENGLISH_CHAPTERS)) return [];
  return window.ENGLISH_CHAPTERS.map(c=>({
    ...c,
    sections:Array.isArray(c.sections)?c.sections:[],
    practice:Array.isArray(c.practice)?c.practice:[]
  }));
}
function getChapter(id){
  const list=chapters();
  const n=clamp(Number(id)||1,1,Math.max(1,list.length));
  return list[n-1]||null;
}
function validateChapter(c){
  const errors=[];
  if(!c||!c.id) errors.push('missing id');
  if(!c?.title) errors.push('missing title');
  if(!c?.summary) errors.push('missing summary');
  if(!Array.isArray(c?.sections)||!c.sections.length) errors.push('no lessons');
  if(!Array.isArray(c?.practice)||!c.practice.length) errors.push('no practice');
  (c?.sections||[]).forEach((s,i)=>{if(!Array.isArray(s)||s.length<3)errors.push(`lesson ${i+1} incomplete`);});
  (c?.practice||[]).forEach((q,i)=>{if(!Array.isArray(q)||q.length<3||!Array.isArray(q[1])||q[2]<0||q[2]>=q[1].length)errors.push(`question ${i+1} invalid`);});
  return {ok:!errors.length,errors};
}
function grade(c,answers){
  let score=0,answered=0;
  (c?.practice||[]).forEach((q,i)=>{const a=answers?.[i];if(a!==null&&a!==undefined&&a!=='') {answered++;if(Number(a)===Number(q[2]))score++;}});
  const total=c?.practice?.length||0;
  return {score,total,answered,unanswered:Math.max(0,total-answered),pct:total?Math.round(score/total*100):0};
}
function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail}));}
function chapterSummary(c){return `${c?.sections?.length||0} lessons • ${c?.practice?.length||0} practice questions`;}
window.EnglishApp={chapters,getChapter,validateChapter,grade,emit,chapterSummary,version:'1.0'};
window.EnglishAppValidation=chapters().map(c=>({id:c.id,title:c.title,...validateChapter(c)}));
})();
