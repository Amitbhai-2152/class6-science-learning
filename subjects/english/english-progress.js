(function(){'use strict';
const KEY='class6EnglishProgressV1';
const defaults=()=>({xp:0,attempts:0,best:0,totalQuestions:0,totalScore:0,categories:{},history:[],badges:[]});
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return Object.assign(defaults(),x&&typeof x==='object'?x:{})}catch(_){return defaults()}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x));return x}
function badges(x){const b=new Set(Array.isArray(x.badges)?x.badges:[]);if(x.attempts>=1)b.add('पहला English प्रयास');if(x.best>=80)b.add('Grammar Star');if(x.xp>=100)b.add('English XP 100');if(x.categories.Translation>=80)b.add('Translation Pro');if(x.categories['Error Correction']>=80)b.add('Error Detective');return [...b]}
function record(kind,score,total,label){const x=read(),pct=total?Math.round(score/total*100):0;x.attempts++;x.totalQuestions+=Number(total)||0;x.totalScore+=Number(score)||0;x.xp+=Math.max(5,10+Math.round((Number(score)||0)*1.5));x.best=Math.max(x.best,pct);x.categories[kind]=Math.max(Number(x.categories[kind]||0),pct);x.history.unshift({kind,score:Number(score)||0,total:Number(total)||0,pct,label:label||kind,at:Date.now()});x.history=x.history.slice(0,30);x.badges=badges(x);return save(x)}
function summary(){const x=read();return Object.assign(x,{average:x.totalQuestions?Math.round(x.totalScore/x.totalQuestions*100):0,badges:badges(x)})}
function reset(){return save(defaults())}
window.EnglishProgress={read,save,record,summary,reset};
})();
