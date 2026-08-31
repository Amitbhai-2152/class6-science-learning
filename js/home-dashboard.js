(function(){'use strict';
function pctFromMaths(){try{const h=JSON.parse(localStorage.getItem('mathsExamHistory')||'[]');if(!Array.isArray(h)||!h.length)return 0;return Math.max(...h.map(x=>Number(x.pct)||0))}catch(e){return 0}}
function refresh(){
 const sci=window.Progress?.data||{completed:[],section:{},xp:0,streak:0,badges:[]};
 const sciencePct=Math.round((sci.completed.length/12)*100);const mathsPct=pctFromMaths();
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 const width=(id,v)=>{const e=document.getElementById(id);if(e)e.style.width=Math.max(0,Math.min(100,v))+'%'};
 set('homeSciencePct',sciencePct+'%');set('homeSciencePct2',sciencePct+'%');set('homeMathsPct',mathsPct+'%');set('homeTotalXP',String(sci.xp||0));set('homeStreak',String(sci.streak||0));
 width('homeScienceBar',sciencePct);width('homeMathsBar',mathsPct);
 const last=Math.max(1,Number(window.currentChapter)||1),ch=window.CHAPTERS?.[last-1];
 if(ch){set('continueTitle',ch.title);set('continueMeta',sciencePct?`अध्याय ${last} • जहाँ छोड़ा था वहाँ से जारी रखो`:'अध्याय 1 से शुरुआत करो');}
 const saved=Number(sci.section?.[last]||0),total=ch?.sections?.length||1;set('continuePercent',Math.round(Math.min(saved,total)/total*100)+'%');width('continueBar',Math.round(Math.min(saved,total)/total*100));
}
window.addEventListener('load',()=>setTimeout(refresh,0));window.addEventListener('science:xp',refresh);window.addEventListener('storage',refresh);window.HomeDashboard={refresh};
})();
