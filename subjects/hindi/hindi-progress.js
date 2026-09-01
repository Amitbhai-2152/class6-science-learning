(function(){
'use strict';
const KEY='class6HindiProgressV2';
const defaults=()=>({xp:0,attempts:0,best:0,topics:{},badges:[],streak:0,lastActive:null,history:[]});
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return {...defaults(),...(x&&typeof x==='object'?x:{ }),topics:x?.topics&&typeof x.topics==='object'?x.topics:{},badges:Array.isArray(x?.badges)?x.badges:[],history:Array.isArray(x?.history)?x.history:[]}}catch(_){return defaults()}}
function save(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(_){}window.dispatchEvent(new CustomEvent('hindi:progress',{detail:x}));return x}
function dayKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function active(x){const now=new Date(),k=dayKey(now);if(x.lastActive===k)return;x.streak=x.lastActive===dayKey(new Date(now.getFullYear(),now.getMonth(),now.getDate()-1))?Math.max(1,x.streak+1):1;x.lastActive=k}
function badges(x){const b=new Set(x.badges);if(x.attempts>=1)b.add('🌱 पहला प्रयास');if(x.best>=80)b.add('🎯 80% क्लब');if(x.xp>=100)b.add('⚡ 100 XP');if(Object.keys(x.topics).length>=5)b.add('🪔 हिंदी खोजी');if(x.streak>=3)b.add('🔥 3-Day Streak');if(x.attempts>=10)b.add('🏆 नियमित अभ्यास');x.badges=[...b]}
function record(kind,score,total,topic){const x=read(),t=Math.max(1,Number(total)||1),s=Math.max(0,Number(score)||0),pct=Math.round(s/t*100);active(x);x.attempts++;x.best=Math.max(x.best,pct);x.xp+=Math.max(5,Math.round(s*2+5));if(topic)x.topics[topic]=Math.max(Number(x.topics[topic]||0),pct);x.history.unshift({kind,score:s,total:t,pct,topic:topic||'',time:Date.now()});x.history=x.history.slice(0,30);badges(x);return save(x)}
function recordPractice(score,total,topic){return record('practice',score,total,topic)}
function recordTest(score,total){return record('full-test',score,total,'Full Test')}
function recordChapter(chapter,score,total){return record('chapter',score,total,chapter)}
window.HindiProgress={read,record,recordPractice,recordTest,recordChapter};
})();
