const Progress={
 key:'class6ScienceProgressV5',data:null,
 load(){try{const d=JSON.parse(localStorage.getItem(this.key)||'null');if(d&&Array.isArray(d.completed)&&d.best&&typeof d.best==='object')return {...d,section:d.section&&typeof d.section==='object'?d.section:{},history:Array.isArray(d.history)?d.history:[]}}catch(e){}return {completed:[],best:{},section:{},history:[]}},
 init(){this.data=this.load()},
 complete(id){id=Number(id);if(!this.data.completed.includes(id))this.data.completed.push(id);this.data.completed.sort((a,b)=>a-b);this.save()},
 setBest(id,s){id=Number(id);s=Math.max(0,Math.min(100,Number(s)||0));this.data.best[id]=Math.max(Number(this.data.best[id]||0),s);this.save()},
 setSection(id,part){id=Number(id);part=Math.max(0,Number(part)||0);this.data.section[id]=part;this.save()},
 addAttempt(id,score,total,type='challenge'){id=Number(id);const pct=Math.round(score/Math.max(total,1)*100);this.data.history.unshift({id,score,total,pct,type,time:new Date().toISOString()});this.data.history=this.data.history.slice(0,30);this.save()},
 average(){const a=this.data.history;if(!a.length)return 0;return Math.round(a.reduce((s,x)=>s+x.pct,0)/a.length)},
 strongest(){return Object.entries(this.data.best).sort((a,b)=>b[1]-a[1])[0]||null},
 weakest(){const attempted=Object.entries(this.data.best);if(!attempted.length)return null;return attempted.sort((a,b)=>a[1]-b[1])[0]},
 reset(){this.data={completed:[],best:{},section:{},history:[]};this.save();localStorage.removeItem('scienceCurrentChapter')},
 save(){localStorage.setItem(this.key,JSON.stringify(this.data))}
};Progress.init();