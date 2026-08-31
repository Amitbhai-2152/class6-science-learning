const Progress={
 key:'class6ScienceProgressV6',data:null,
 load(){try{const d=JSON.parse(localStorage.getItem(this.key)||'null');if(d&&Array.isArray(d.completed)&&d.best&&typeof d.best==='object')return {...d,section:d.section&&typeof d.section==='object'?d.section:{},history:Array.isArray(d.history)?d.history:[],xp:Number(d.xp)||0,badges:Array.isArray(d.badges)?d.badges:[],streak:Number(d.streak)||0,lastActive:d.lastActive||null}}catch(e){}return {completed:[],best:{},section:{},history:[],xp:0,badges:[],streak:0,lastActive:null}},
 init(){this.data=this.load()},
 markActive(){const today=new Date();const key=today.toISOString().slice(0,10);if(this.data.lastActive===key)return;const prev=new Date(today);prev.setDate(prev.getDate()-1);const pkey=prev.toISOString().slice(0,10);this.data.streak=this.data.lastActive===pkey?Math.max(1,this.data.streak+1):1;this.data.lastActive=key;this.save()},
 addXP(points){this.markActive();this.data.xp=Math.max(0,this.data.xp+Math.max(0,Number(points)||0));this.evaluateBadges();this.save()},
 complete(id){id=Number(id);this.markActive();if(!this.data.completed.includes(id))this.data.completed.push(id);this.data.completed.sort((a,b)=>a-b);this.addXP(50);this.save()},
 setBest(id,s){id=Number(id);s=Math.max(0,Math.min(100,Number(s)||0));this.data.best[id]=Math.max(Number(this.data.best[id]||0),s);this.save()},
 setSection(id,part){id=Number(id);part=Math.max(0,Number(part)||0);this.data.section[id]=part;this.save()},
 addAttempt(id,score,total,type='challenge'){id=Number(id);const pct=Math.round(score/Math.max(total,1)*100);this.markActive();this.data.history.unshift({id,score,total,pct,type,time:new Date().toISOString()});this.data.history=this.data.history.slice(0,30);this.addXP(10+score*2);this.save()},
 evaluateBadges(){const add=(name)=>{if(!this.data.badges.includes(name))this.data.badges.push(name)};if(this.data.xp>=100)add('🌱 First Steps');if(this.data.xp>=300)add('🚀 Science Explorer');if(this.data.completed.length>=1)add('🏅 Chapter Starter');if(this.data.completed.length>=5)add('🔥 Science Streak');if(this.data.completed.length>=12)add('🏆 Science Master');if(this.data.streak>=3)add('⚡ 3-Day Streak')},
 average(){const a=this.data.history;if(!a.length)return 0;return Math.round(a.reduce((s,x)=>s+x.pct,0)/a.length)},
 strongest(){return Object.entries(this.data.best).sort((a,b)=>b[1]-a[1])[0]||null},
 weakest(){const attempted=Object.entries(this.data.best);if(!attempted.length)return null;return attempted.sort((a,b)=>a[1]-b[1])[0]},
 reset(){this.data={completed:[],best:{},section:{},history:[],xp:0,badges:[],streak:0,lastActive:null};this.save();localStorage.removeItem('scienceCurrentChapter')},
 save(){localStorage.setItem(this.key,JSON.stringify(this.data))}
};Progress.init();