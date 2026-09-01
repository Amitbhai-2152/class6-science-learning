(function(){'use strict';
const KEY='class6GKProgressV1';
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x));}
function addAttempt(kind,total,score,label){const p=read();p.attempts=Number(p.attempts)||0;p.xp=Number(p.xp)||0;p.totalQuestions=Number(p.totalQuestions)||0;p.totalScore=Number(p.totalScore)||0;p.best=Number(p.best)||0;p.attempts++;p.totalQuestions+=Number(total)||0;p.totalScore+=Number(score)||0;p.xp += 10 + (Number(score)||0)*2;const pct=total?Math.round(score/total*100):0;p.best=Math.max(p.best,pct);p.last={kind,total:Number(total)||0,score:Number(score)||0,pct,label:label||'',at:Date.now()};if(!Array.isArray(p.history))p.history=[];p.history.unshift(p.last);p.history=p.history.slice(0,30);save(p);return p;}
function completeTopic(id,pct){const p=read();if(!Array.isArray(p.completedTopics))p.completedTopics=[];const n=Number(id);if(pct>=80&&!p.completedTopics.includes(n))p.completedTopics.push(n);if(pct>=80)p.xp=(Number(p.xp)||0)+5;save(p);return p;}
function badges(){const p=read(),a=Number(p.attempts)||0,b=Number(p.best)||0,x=Number(p.xp)||0,r=[];if(a>=1)r.push('पहला प्रयास');if(a>=5)r.push('लगातार अभ्यास');if(b>=80)r.push('GK स्टार');if(x>=100)r.push('XP चैंपियन');if((p.completedTopics||[]).length>=7)r.push('GK एक्सप्लोरर');return r;}
function summary(){const p=read();const q=Number(p.totalQuestions)||0,s=Number(p.totalScore)||0;return {...p,avg:q?Math.round(s/q*100):0,badges:badges()};}
window.GKProgress={read,addAttempt,completeTopic,summary,badges};
})();