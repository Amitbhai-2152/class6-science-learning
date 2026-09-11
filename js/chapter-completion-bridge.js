(function(){'use strict';
const installed=new WeakSet();
function getScriptPath(){try{return new URL('./chapter-completion.js',document.currentScript?.src||location.href).href}catch(_){return ''}}
function showScience(){const c=window.CHAPTERS?.find?.(x=>Number(x.id)===Number(window.currentChapter));if(!c||!window.ChapterCompletion)return;window.ChapterCompletion.show({subject:'science',chapterId:c.id,title:c.title,score:arguments[0]??'',total:arguments[1]??'',pct:arguments[2]??100});}
function showEnglish(score,total,pct){if(!window.ChapterCompletion||!window.EnglishApp)return;const id=Math.max(1,Number(new URLSearchParams(location.search).get('chapter'))||1),c=window.EnglishApp.getChapter?.(id);window.ChapterCompletion.show({subject:'english',chapterId:id,title:c?.title||`Chapter ${id}`,score,total,pct});}
function install(){
  if(window.Progress&&!installed.has(window.Progress)&&typeof window.Progress.complete==='function'){
    const p=window.Progress,original=p.complete.bind(p);p.complete=function(id){const before=original(id);if(before){const c=window.CHAPTERS?.find?.(x=>Number(x.id)===Number(id));if(c)window.ChapterCompletion?.show({subject:'science',chapterId:id,title:c.title});}return before};installed.add(p);
  }
  if(window.EnglishProgress&&!installed.has(window.EnglishProgress)&&typeof window.EnglishProgress.record==='function'){
    const p=window.EnglishProgress,original=p.record.bind(p);p.record=function(kind,score,total,label){const result=original(kind,score,total,label);const pct=total?Math.round(Number(score||0)/Number(total||1)*100):0;if(kind==='Chapter Practice'&&pct>=75)showEnglish(score,total,pct);return result};installed.add(p);
  }
  if(window.__chapterCompletionBridgeReady)return;
  window.__chapterCompletionBridgeReady=true;
  document.addEventListener('chapter:completed',e=>{const d=e.detail||{};window.ChapterCompletion?.show(d)});
}
function ensureLoader(){
  const src=getScriptPath();if(!src)return;
  const existing=document.querySelector('script[data-chapter-completion]');
  if(!existing){const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute('data-chapter-completion','true');(document.head||document.documentElement).appendChild(s)}
}
ensureLoader();
let tries=0;function tick(){install();if((window.Progress&&window.Progress.complete)||(window.EnglishProgress&&window.EnglishProgress.record)||tries>160)return;tries++;setTimeout(tick,125)}
tick();
})();