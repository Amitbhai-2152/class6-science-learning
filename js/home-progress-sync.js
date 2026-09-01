(function(){
  'use strict';
  function mathsStats(){
    try{
      const h=JSON.parse(localStorage.getItem('mathsExamHistory')||'[]');
      if(!Array.isArray(h)||!h.length)return {pct:0,xp:0,attempts:0,best:0};
      const total=h.reduce((s,x)=>s+Number(x.total||0),0);
      const score=h.reduce((s,x)=>s+Number(x.score||0),0);
      const pct=total?Math.round(score/total*100):0;
      const xp=h.reduce((s,x)=>s+10+(Number(x.score)||0)*2,0);
      const best=Math.max(...h.map(x=>Number(x.pct)||0));
      return {pct,xp,attempts:h.length,best};
    }catch(_){return {pct:0,xp:0,attempts:0,best:0};}
  }
  function sync(){
    const m=mathsStats();
    const pct=document.getElementById('homeMathsPct');
    const bar=document.getElementById('homeMathsBar');
    if(pct)pct.textContent=m.pct+'%';
    if(bar)bar.style.width=m.pct+'%';
    const total=document.getElementById('homeTotalXP');
    try{
      const sci=Number(JSON.parse(localStorage.getItem('class6ScienceProgressV9')||'{}').xp||0);
      if(total)total.textContent=sci+m.xp;
    }catch(_){/* keep existing total */}
  }
  window.HomeProgressSync={refresh:sync};
  window.addEventListener('DOMContentLoaded',()=>setTimeout(sync,50));
  window.addEventListener('storage',e=>{if(e.key==='mathsExamHistory')sync();});
  setInterval(()=>{if(document.visibilityState==='visible')sync();},2000);
})();
