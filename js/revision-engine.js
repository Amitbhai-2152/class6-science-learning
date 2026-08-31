const RevisionEngine={
 daysForScore(pct){if(pct<60)return 0;if(pct<75)return 2;if(pct<90)return 5;return 10},
 rebuild(){const h=Progress.data.history||[],by={};h.forEach(a=>{if(!by[a.id])by[a.id]=[];by[a.id].push(a)});const now=Date.now();return Object.entries(by).map(([id,arr])=>{arr.sort((a,b)=>new Date(b.time)-new Date(a.time));const last=arr[0],days=this.daysForScore(last.pct),due=new Date(new Date(last.time).getTime()+days*86400000);return{id:Number(id),lastScore:last.pct,attempts:arr.length,due,overdue:days===0||due.getTime()<=now}})} ,
 due(){return this.rebuild().filter(x=>x.overdue)},
 recommendations(){const weak=this.rebuild().sort((a,b)=>a.lastScore-b.lastScore||b.attempts-a.attempts);return weak.slice(0,3).map(x=>({...x,reason:x.lastScore<60?'कम score — अभी revise करो':x.lastScore<75?'कुछ concepts फिर से देखो':x.lastScore<90?'जल्द review करो':'maintenance review'}))},
 summary(){const due=this.due(),rec=this.recommendations();return{due,recommendations:rec,hasPlan:!!(due.length||rec.length)}}
};