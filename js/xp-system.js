(function(){
'use strict';
const KEY='class6XPSystemV1';
const SUBJECTS=['science','maths','english','hindi','gk','social','revision'];
const DAILY_CAP=200;
const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number(n)||0));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const defaults=()=>({version:1,total:0,subjects:{science:0,maths:0,english:0,hindi:0,gk:0,social:0,revision:0},events:[],daily:{date:today(),earned:0},legacySeeded:false});
function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&x.version===1)return Object.assign(defaults(),x,{subjects:Object.assign(defaults().subjects,x.subjects||{}),events:Array.isArray(x.events)?x.events:[],daily:x.daily&&typeof x.daily==='object'?x.daily:defaults().daily});}catch(_){}return defaults()}
let state=read();
function save(){localStorage.setItem(KEY,JSON.stringify(state));return state}
function resetDaily(){const d=today();if(state.daily?.date!==d)state.daily={date:d,earned:0}}
function legacyValue(key){try{const x=JSON.parse(localStorage.getItem(key)||'null');if(!x)return 0;if(Array.isArray(x)){return x.reduce((s,v)=>s+10+(Number(v.score)||0)*2,0)}return Math.max(0,Number(x.xp)||0)}catch(_){return 0}}
function legacySnapshot(){return{science:legacyValue('class6ScienceProgressV9'),maths:legacyValue('mathsExamHistory'),english:legacyValue('class6EnglishProgressV1'),hindi:legacyValue('class6HindiProgressV2'),gk:legacyValue('class6GKProgressV1'),social:legacyValue('socialScienceProgressV3'),revision:legacyValue('class6RevisionProgressV1')}}
function seedLegacy(){if(state.legacySeeded)return;const legacy=legacySnapshot();state.total=0;Object.keys(state.subjects).forEach(s=>{const v=Math.max(0,Math.round(legacy[s]||0));state.subjects[s]=v;state.total+=v});state.legacySeeded=true;state.daily={date:today(),earned:0};save()}
function reconcileLegacy(){const legacy=legacySnapshot();let changed=false;Object.keys(state.subjects).forEach(s=>{const v=Math.max(0,Math.round(legacy[s]||0));if(v>Number(state.subjects[s]||0)){state.subjects[s]=v;changed=true}});if(changed){state.total=Object.values(state.subjects).reduce((sum,v)=>sum+Math.max(0,Number(v)||0),0);save()}return changed}
seedLegacy();
reconcileLegacy();
function multiplier(subject,content){const n=state.events.filter(e=>e.subject===subject&&e.content===String(content||'')).length;return n===0?1:n===1?.6:n===2?.3:.1}
function attemptXP(pct){return 5+Math.round(clamp(pct)*.25)}
function award(subject,action,content,points,meta={}){subject=SUBJECTS.includes(subject)?subject:null;if(!subject)return{awarded:0,total:state.total,subjectTotal:0,reason:'invalid-subject'};resetDaily();const key=`${subject}|${action}|${String(content||'')}`;if(state.events.some(e=>e.key===key&&meta.once!==false))return{awarded:0,total:state.total,subjectTotal:state.subjects[subject],reason:'duplicate'};let base=Math.max(0,Math.round(Number(points)||0));if(meta.diminishing!==false)base=Math.round(base*multiplier(subject,content));const remaining=Math.max(0,DAILY_CAP-(Number(state.daily.earned)||0));const value=Math.min(base,remaining);if(value<=0)return{awarded:0,total:state.total,subjectTotal:state.subjects[subject],reason:'daily-cap'};state.subjects[subject]+=value;state.total+=value;state.daily.earned+=value;state.events.unshift({key,subject,action,content:String(content||''),points:value,at:new Date().toISOString()});state.events=state.events.slice(0,500);save();window.dispatchEvent(new CustomEvent('xp:earned',{detail:{subject,action,points:value,total:state.total,subjectTotal:state.subjects[subject],dailyEarned:state.daily.earned}}));return{awarded:value,total:state.total,subjectTotal:state.subjects[subject],reason:'awarded'}}
function score(subject,content,pct,kind='attempt'){return award(subject,kind,content,attemptXP(pct),{diminishing:true,once:false})}
function level(xp=state.total){let level=1,need=100;while(xp>=need){xp-=need;level++;need=100+((level-1)*50)}return{level,xpIntoLevel:xp,nextLevelXP:need,title:level>=10?'Master':level>=7?'Achiever':level>=5?'Scholar':level>=3?'Explorer':'Learner'}}
function snapshot(){return{total:state.total,subjects:Object.assign({},state.subjects),daily:Object.assign({},state.daily),events:state.events.length,level:level()}}
window.XPSystem={KEY,DAILY_CAP,read:()=>state,save,seedLegacy,reconcileLegacy,award,score,attemptXP,level,snapshot};
})();