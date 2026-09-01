(function(){
'use strict';
const KEY='class6HindiProgressV1';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{"xp":0,"attempts":0,"best":0,"topics":{},"badges":[],"last":null}')}catch(_){return {xp:0,attempts:0,best:0,topics:{},badges:[],last:null}}}
function save(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(_){}return x}
function record(kind,score,total,topic){const x=read(),pct=total?Math.round(score/total*100):0;x.attempts++;x.best=Math.max(x.best,pct);x.xp+=Math.max(5,Math.round(score*2));if(topic)x.topics[topic]=Math.max(Number(x.topics[topic]||0),pct);x.last={kind,score,total,pct,topic:topic||'',time:Date.now()};const b=new Set(x.badges||[]);if(x.attempts>=1)b.add('पहला प्रयास');if(x.best>=80)b.add('80% क्लब');if(x.xp>=100)b.add('100 XP');if(Object.keys(x.topics).length>=5)b.add('हिंदी खोजी');x.badges=[...b];return save(x)}
function recordPractice(score,total,topic){return record('practice',score,total,topic)}
function recordTest(score,total){return record('full-test',score,total,'Full Test')}
window.HindiProgress={read,record,recordPractice,recordTest};
})();
