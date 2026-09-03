(function(){
'use strict';
const X=()=>window.XPSystem;
function wrap(obj,name,handler){if(!obj||typeof obj[name]!=='function'||obj[name].__xpUnifiedV2)return;const original=obj[name];const wrapped=function(){return handler.call(this,original,arguments)};wrapped.__xpUnifiedV2=true;obj[name]=wrapped}
function setLocal(obj,result){if(obj&&result)obj.xp=Number(result.subjectTotal??obj.xp??0)}
function pct(score,total){return Math.round(Number(score||0)/Math.max(1,Number(total||0))*100)}
function install(){const x=X();if(!x)return false;
 if(window.Progress){
  wrap(window.Progress,'complete',function(original,args){const id=Number(args[0]);const before=this.data?.completed?.includes(id),old=this.addXP;this.addXP=function(){};let out;try{out=original.apply(this,args)}finally{this.addXP=old}if(!before&&out!==false){const r=x.award('science','chapter-complete',`chapter-${id}`,30,{diminishing:false});setLocal(this.data,r);this.save()}return out});
  wrap(window.Progress,'addAttempt',function(original,args){const id=Number(args[0]),score=Number(args[1])||0,total=Number(args[2])||1,type=args[3]||'challenge',old=this.addXP;this.addXP=function(){};let out;try{out=original.apply(this,args)}finally{this.addXP=old}const r=x.score('science',`${type}:${id}`,pct(score,total),type);setLocal(this.data,r);this.save();return out});
  wrap(window.Progress,'recordCompositeTest',function(original,args){const score=Number(args[0])||0,total=Number(args[1])||1,type=args[2]||'composite-test',old=this.addXP;this.addXP=function(){};let out;try{out=original.apply(this,args)}finally{this.addXP=old}const r=x.score('science',`composite:${type}`,pct(score,total),type);setLocal(this.data,r);this.save();return out});
  wrap(window.Progress,'addXP',function(original,args){const points=Math.max(0,Number(args[0])||0),r=x.award('science','manual',`manual-${Date.now()}-${Math.random()}`,points,{once:false,diminishing:false});setLocal(this.data,r);this.save();window.dispatchEvent(new CustomEvent('science:xp',{detail:{points:r.awarded,total:this.data.xp}}));return r.awarded});
 }
 function subjectRecord(obj,key,subject,legacyKey,evt){wrap(obj,'record',function(original,args){const before=Number(this.read?.()?.xp??0),out=original.apply(this,args);if(out&&typeof out==='object')out.xp=before;const score=Number(args[1])||0,total=Number(args[2])||1,r=x.score(subject,String(args[3]||args[0]||'practice'),pct(score,total),String(args[0]||'practice'));if(out&&typeof out==='object'){out.xp=Number(r.subjectTotal??out.xp);localStorage.setItem(legacyKey,JSON.stringify(out));}if(evt)window.dispatchEvent(new CustomEvent(evt,{detail:out}));return out})}
 if(window.EnglishProgress)subjectRecord(window.EnglishProgress,'record','english','class6EnglishProgressV1');
 if(window.HindiProgress)subjectRecord(window.HindiProgress,'record','hindi','class6HindiProgressV2','hindi:progress');
 if(window.GKProgressHI)subjectRecord(window.GKProgressHI,'record','gk','class6GKProgressV1');
 if(window.SocialScienceProgress){
  const s=window.SocialScienceProgress;
  wrap(s,'practice',function(original,args){const before=Number(this.state?.xp)||0,out=original.apply(this,args);this.state.xp=before;const r=x.score('social',`practice:${Number(args[0])||0}`,pct(args[1],args[2]),'practice');this.state.xp=Number(r.subjectTotal??this.state.xp);this.save();return out});
  wrap(s,'test',function(original,args){const before=Number(this.state?.xp)||0,out=original.apply(this,args);this.state.xp=before;const r=x.score('social',`test:${Number(args[0])||0}`,pct(args[1],args[2]),'test');this.state.xp=Number(r.subjectTotal??this.state.xp);this.save();return out});
  wrap(s,'fullTest',function(original,args){const before=Number(this.state?.xp)||0,out=original.apply(this,args);this.state.xp=before;const r=x.score('social','full-cbt',pct(args[1],args[2]),'full-cbt');this.state.xp=Number(r.subjectTotal??this.state.xp);this.save();return out});
  wrap(s,'xp',function(original,args){const r=x.award('social','manual',`manual-${Date.now()}-${Math.random()}`,Math.max(0,Number(args[0])||0),{once:false,diminishing:false});this.state.xp=Number(r.subjectTotal??this.state.xp);this.save();return r.awarded});
  wrap(s,'markSection',function(original,args){const id=Number(args[0]),before=Number(this.state?.chapters?.[id]?.sections)||0,total=Number(args[2])||1,out=original.apply(this,args),after=Number(this.state?.chapters?.[id]?.sections)||0;this.state.xp=this.state.xp; if(after>before){for(let n=before+1;n<=Math.min(after,total);n++)x.award('social','section-complete',`chapter-${id}-section-${n}`,3,{diminishing:false})}this.state.xp=Number(x.read().subjects.social||0);this.save();return out});
 }
 return true}
window.XPUnifyV2={install};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>install(),{once:true});else install();
})();
