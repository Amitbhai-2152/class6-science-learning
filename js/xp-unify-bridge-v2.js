(function(){
'use strict';
/* Canonical delegation contract: XPSystem.score / XPSystem.award are the authoritative XP paths. */
const X=()=>window.XPSystem;
function wrap(obj,name,handler){if(!obj||typeof obj[name]!=='function'||obj[name].__xpUnifiedV3)return;const original=obj[name];const wrapped=function(){return handler.call(this,original,arguments)};wrapped.__xpUnifiedV3=true;obj[name]=wrapped}
function pct(score,total){return Math.round(Number(score||0)/Math.max(1,Number(total||0))*100)}
function watchMathsHistory(x){
 try{
  const proto=Storage.prototype;
  if(proto.__xpMathsHistoryV3)return;
  proto.__xpMathsHistoryV3=true;
  const original=proto.setItem;
  let last='';
  try{const h=JSON.parse(localStorage.getItem('mathsExamHistory')||'[]');if(Array.isArray(h)&&h[0])last=JSON.stringify(h[0])}catch(_){ }
  proto.setItem=function(key,value){
   const result=original.apply(this,arguments);
   if(key==='mathsExamHistory'&&this===localStorage){
    try{
     const h=JSON.parse(value||'[]');const item=Array.isArray(h)?h[0]:null,stamp=item?JSON.stringify(item):'';
     if(item&&stamp&&stamp!==last){last=stamp;const mode=item.mode==='CBT'?'cbt':'practice';x.score('maths',mode,pct(item.score,item.total),mode)}
    }catch(_){ }
   }
   return result;
  };
 }catch(_){ }
}
function install(){const x=X();if(!x)return false;
 watchMathsHistory(x);
 function subjectRecord(obj,subject,legacyKey,evt){wrap(obj,'record',function(original,args){const out=original.apply(this,args);const score=Number(args[1])||0,total=Number(args[2])||1,r=x.score(subject,String(args[3]||args[0]||'practice'),pct(score,total),String(args[0]||'practice'));if(out&&typeof out==='object'){out.xp=Number(r.subjectTotal??out.xp??0);try{localStorage.setItem(legacyKey,JSON.stringify(out))}catch(_){}}if(evt)window.dispatchEvent(new CustomEvent(evt,{detail:out}));return out})}
 if(window.EnglishProgress)subjectRecord(window.EnglishProgress,'english','class6EnglishProgressV1');
 if(window.HindiProgress)subjectRecord(window.HindiProgress,'hindi','class6HindiProgressV2','hindi:progress');
 if(window.GKProgressHI)subjectRecord(window.GKProgressHI,'gk','class6GKProgressV1');
 if(window.SocialScienceProgress){
  const s=window.SocialScienceProgress;
  wrap(s,'practice',function(original,args){const out=original.apply(this,args),r=x.score('social',`practice:${Number(args[0])||0}`,pct(args[1],args[2]),'practice');this.state.xp=Number(r.subjectTotal??this.state.xp);this.save();return out});
  wrap(s,'test',function(original,args){const out=original.apply(this,args),r=x.score('social',`test:${Number(args[0])||0}`,pct(args[1],args[2]),'test');this.state.xp=Number(r.subjectTotal??this.state.xp);this.save();return out});
  wrap(s,'fullTest',function(original,args){const out=original.apply(this,args),r=x.score('social','full-cbt',pct(args[1],args[2]),'full-cbt');this.state.xp=Number(r.subjectTotal??this.state.xp);this.save();return out});
  wrap(s,'xp',function(original,args){const r=x.award('social','manual',`manual-${Date.now()}-${Math.random()}`,Math.max(0,Number(args[0])||0),{once:false,diminishing:false});this.state.xp=Number(r.subjectTotal??this.state.xp);this.save();return r.awarded});
  wrap(s,'markSection',function(original,args){const id=Number(args[0]),before=Number(this.state?.chapters?.[id]?.sections)||0,total=Number(args[2])||1,out=original.apply(this,args),after=Number(this.state?.chapters?.[id]?.sections)||0;if(after>before){for(let n=before+1;n<=Math.min(after,total);n++)x.award('social','section-complete',`chapter-${id}-section-${n}`,3,{diminishing:false})}this.state.xp=Number(x.read().subjects.social||0);this.save();return out});
 }
 return true}
window.XPUnifyV2={install};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>install(),{once:true});else install();
})();
