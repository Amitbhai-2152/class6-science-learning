(function(){if(!window.XPSystem){document.write('<script src="../../js/xp-system.js?v=5"><\/script>')}document.write('<script src="../../js/xp-unify-bridge-v2.js?v=3"><\/script>')})();
(function(){
'use strict';
const KEY='class6GKProgressV1';
function ensureChapterCompletion(){
  if(!document.querySelector('link[data-chapter-completion-style]')){const l=document.createElement('link');l.rel='stylesheet';l.href=new URL('../../css/chapter-completion.css?v=1',location.href).href;l.setAttribute('data-chapter-completion-style','true');document.head.appendChild(l)}
  if(!window.ChapterCompletion&&!document.querySelector('script[data-chapter-completion-script]')){const s=document.createElement('script');s.src=new URL('../../js/chapter-completion.js?v=1',location.href).href;s.setAttribute('data-chapter-completion-script','true');document.head.appendChild(s)}
}
function maybeCelebrate(topic,score,total,pct){ensureChapterCompletion();const id=Math.max(1,Math.min(7,Number(new URLSearchParams(location.search).get('topic'))||1)),run=()=>window.ChapterCompletion?.show({subject:'gk',chapterId:id,title:topic||`GK Topic ${id}`,score,total,pct});if(window.ChapterCompletion)run();else setTimeout(run,60)}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{"xp":0,"attempts":0,"best":0,"topics":{},"badges":[]}')}catch(_){return {xp:0,attempts:0,best:0,topics:{},badges:[]}}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x));return x}
function record(kind,score,total,topic){const x=read(),pct=total?Math.round(score/total*100):0;x.attempts++;x.best=Math.max(x.best,pct);x.xp+=Math.max(5,Math.round(score*2));if(topic)x.topics[topic]=Math.max(Number(x.topics[topic]||0),pct);const b=new Set(x.badges||[]);if(x.attempts>=1)b.add('पहला प्रयास');if(x.best>=80)b.add('80% क्लब');if(x.xp>=100)b.add('100 XP');if(Object.keys(x.topics).length>=7)b.add('GK खोजी');x.badges=[...b];const saved=save(x);if(kind==='topic'&&pct>=80)maybeCelebrate(topic,score,total,pct);return saved}
window.GKProgressHI={read,record};
})();
