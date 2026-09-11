(function(){'use strict';
const installed=new WeakSet();
function getScriptPath(){try{return new URL('./chapter-completion.js',document.currentScript?.src||location.href).href}catch(_){return ''}}
function showScience(id){const c=window.CHAPTERS?.find?.(x=>Number(x.id)===Number(id));if(!c)return;const pct=Number(window.Progress?.data?.best?.[id]||100),total=Array.isArray(c.challenge)?c.challenge.length:0,score=total?Math.round(pct*total/100):'';const run=()=>{if(window.ChapterCompletion){window.ChapterCompletion.show({subject:'science',chapterId:id,title:c.title,score,total,pct});return true}return false};if(run())return;let tries=0;const wait=()=>{if(run()||tries++>=30)return;setTimeout(wait,50)};wait()}
function showEnglish(score,total,pct){if(!window.EnglishApp)return;const id=Math.max(1,Number(new URLSearchParams(location.search).get('chapter'))||1),c=window.EnglishApp.getChapter?.(id),run=()=>{if(window.ChapterCompletion){window.ChapterCompletion.show({subject:'english',chapterId:id,title:c?.title||`Chapter ${id}`,score,total,pct});return true}return false};if(run())return;let tries=0;const wait=()=>{if(run()||tries++>=30)return;setTimeout(wait,50)};wait()}
function install(){
  if(window.Progress&&!installed.has(window.Progress)&&typeof window.Progress.complete==='function'){
    const p=window.Progress,original=p.complete.bind(p);p.complete=function(id){const newly=original(id);if(newly)showScience(id);return newly};installed.add(p);
  }
  if(window.EnglishProgress&&!installed.has(window.EnglishProgress)&&typeof window.EnglishProgress.record==='function'){
    const p=window.EnglishProgress,original=p.record.bind(p);p.record=function(kind,score,total,label){const result=original(kind,score,total,label);const pct=total?Math.round(Number(score||0)/Number(total||1)*100):0;if(kind==='Chapter Practice'&&pct>=75)showEnglish(score,total,pct);return result};installed.add(p);
  }
  if(window.__chapterCompletionBridgeReady)return;
  window.__chapterCompletionBridgeReady=true;
  document.addEventListener('chapter:completed',e=>{const d=e.detail||{};const run=()=>window.ChapterCompletion?.show(d);if(!run())setTimeout(run,75)});
}
function ensureLoader(){
  const src=getScriptPath();if(!src)return;
  const existing=document.querySelector('script[data-chapter-completion]');
  if(!existing){const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute('data-chapter-completion','true');(document.head||document.documentElement).appendChild(s)}
}
ensureLoader();
let tries=0;function tick(){install();if((window.Progress&&window.Progress.complete)||(window.EnglishProgress&&window.EnglishProgress.record)||tries>160)return;tries++;setTimeout(tick,125)}
tick();

// Safe visual QA mode: only activates when explicitly requested in the URL.
(function(){
  const q=new URLSearchParams(location.search);
  if(q.get('demoChapterCompletion')!=='1')return;
  const run=()=>{
    const c=window.CHAPTERS?.find?.(x=>Number(x.id)===Number(window.currentChapter))||window.CHAPTERS?.[0];
    if(c&&window.ChapterCompletion)window.ChapterCompletion.show({subject:'science-demo',chapterId:c.id,title:c.title,score:'—',total:'—',pct:100,force:true});
  };
  let n=0;const wait=()=>{if(window.ChapterCompletion){run();return}if(n++<30)setTimeout(wait,50)};wait();
})();
})();