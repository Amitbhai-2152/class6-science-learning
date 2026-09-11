(function(){'use strict';
if(window.__universalChapterCompletionBridgeLoaded)return;
window.__universalChapterCompletionBridgeLoaded=true;
const BRIDGE_SRC=document.currentScript?.src||'';
const installed=new WeakSet();
function getScriptPath(){try{return BRIDGE_SRC?new URL('./chapter-completion.js',BRIDGE_SRC).href:new URL('js/chapter-completion.js',location.origin+'/').href}catch(_){return ''}}
function showWhenReady(data){let tries=0;const run=()=>{if(window.ChapterCompletion?.show){window.ChapterCompletion.show(data);return true}return false};if(run())return;const timer=setInterval(()=>{if(run()||tries++>=80)clearInterval(timer)},50)}
function pctOf(score,total){return total?Math.round(Number(score||0)/Math.max(1,Number(total||1))*100):0}
function showScience(id){const c=window.CHAPTERS?.find?.(x=>Number(x.id)===Number(id));if(!c)return;const pct=Number(window.Progress?.data?.best?.[id]||100),total=Array.isArray(c.challenge)?c.challenge.length:0,score=total?Math.round(pct*total/100):'';showWhenReady({subject:'science',chapterId:id,title:c.title,score,total,pct})}
function showEnglish(score,total,pct){if(!window.EnglishApp)return;const id=Math.max(1,Number(new URLSearchParams(location.search).get('chapter'))||1),c=window.EnglishApp.getChapter?.(id);showWhenReady({subject:'english',chapterId:id,title:c?.title||`Chapter ${id}`,score,total,pct})}
function showHindi(chapter,score,total,pct){const id=Math.max(1,Number(new URLSearchParams(location.search).get('chapter'))||1);showWhenReady({subject:'hindi',chapterId:id,title:chapter||`अध्याय ${id}`,score,total,pct})}
function showGK(topic,score,total,pct){const id=Math.max(1,Math.min(7,Number(new URLSearchParams(location.search).get('topic'))||1));showWhenReady({subject:'gk',chapterId:id,title:topic||`GK Topic ${id}`,score,total,pct})}
function showSocialScience(id,score,total,pct){id=Number(id)||1;const c=window.SOCIAL_SCIENCE_CHAPTERS?.find?.(x=>Number(x.id)===id);showWhenReady({subject:'social-science',chapterId:id,title:c?.title||`सामाजिक विज्ञान अध्याय ${id}`,score,total,pct})}
function install(){
  if(window.Progress&&!installed.has(window.Progress)&&typeof window.Progress.complete==='function'){
    const p=window.Progress,original=p.complete.bind(p);p.complete=function(id){const newly=original(id);if(newly)showScience(id);return newly};installed.add(p);
  }
  if(window.EnglishProgress&&!installed.has(window.EnglishProgress)&&typeof window.EnglishProgress.record==='function'){
    const p=window.EnglishProgress,original=p.record.bind(p);p.record=function(kind,score,total,label){const result=original(kind,score,total,label);const pct=pctOf(score,total);if(kind==='Chapter Practice'&&pct>=75)showEnglish(score,total,pct);return result};installed.add(p);
  }
  if(window.HindiProgress&&!installed.has(window.HindiProgress)&&typeof window.HindiProgress.record==='function'){
    const p=window.HindiProgress,original=p.record.bind(p);p.record=function(kind,score,total,topic){const result=original(kind,score,total,topic);const pct=pctOf(score,total);if(kind==='chapter'&&pct>=75)showHindi(topic,score,total,pct);return result};installed.add(p);
  }
  if(window.GKProgressHI&&!installed.has(window.GKProgressHI)&&typeof window.GKProgressHI.record==='function'){
    const p=window.GKProgressHI,original=p.record.bind(p);p.record=function(kind,score,total,topic){const result=original(kind,score,total,topic);const pct=pctOf(score,total);if(kind==='topic'&&pct>=80)showGK(topic,score,total,pct);return result};installed.add(p);
  }
  if(window.SocialScienceProgress&&!installed.has(window.SocialScienceProgress)){
    const p=window.SocialScienceProgress;let wrapped=false;
    if(typeof p.practice==='function'){const original=p.practice.bind(p);p.practice=function(id,score,total){const result=original(id,score,total);const pct=pctOf(score,total);if(pct>=75)showSocialScience(id,score,total,pct);return result};wrapped=true}
    if(typeof p.test==='function'){const original=p.test.bind(p);p.test=function(id,score,total,type){const result=original(id,score,total,type);const pct=pctOf(score,total);if(pct>=75)showSocialScience(id,score,total,pct);return result};wrapped=true}
    if(wrapped)installed.add(p);
  }
  if(window.__chapterCompletionBridgeReady)return;
  window.__chapterCompletionBridgeReady=true;
  document.addEventListener('chapter:completed',e=>showWhenReady(e.detail||{}));
}
function ensureLoader(){
  const src=getScriptPath();if(!src)return;
  if(!document.querySelector('link[href*="chapter-completion.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href=new URL('../css/chapter-completion.css?v=2',src).href;l.setAttribute('data-universal-chapter-completion-style','true');document.head?.appendChild(l)}
  if(!document.querySelector('script[src*="chapter-completion.js"]')){const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute('data-chapter-completion','true');(document.head||document.documentElement).appendChild(s)}
}
ensureLoader();
let tries=0;function tick(){install();if(tries++>160)return;setTimeout(tick,125)}tick();
(function(){const q=new URLSearchParams(location.search);if(q.get('demoChapterCompletion')!=='1')return;showWhenReady({subject:'demo',chapterId:q.get('chapter')||q.get('topic')||'1',title:'Chapter Completion Demo',score:'—',total:'—',pct:100,force:true})})();
})();