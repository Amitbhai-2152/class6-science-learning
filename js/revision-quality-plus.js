(function(){
'use strict';
const host=document.getElementById('revisionQualityApp');
if(!host)return;
const subject=document.body.dataset.revisionSubject||'revision';
const storageKey='class6-revision-complete-'+subject;
const icon={science:'🔬',maths:'➗',english:'📖',hindi:'🪔',gk:'🧠',social:'🌍'}[subject]||'📚';
let ready=false;
function boot(){
 if(ready)return;
 const chapters=[...host.querySelectorAll('details.chapter')];
 if(!chapters.length)return;
 ready=true;
 let state={};try{state=JSON.parse(localStorage.getItem(storageKey)||'{}')||{}}catch(_){state={};}
 const style=document.createElement('style');
 style.textContent='.rqplus{margin:0 0 14px;padding:14px;border:1px solid #dfe5eb;border-radius:16px;background:#fff;box-shadow:0 6px 18px #1420330b}.rqplus-top{display:flex;justify-content:space-between;gap:12px;align-items:center}.rqplus-title{font-weight:900}.rqplus-sub{color:#667085;font-size:12px;margin-top:3px}.rqplus-bar{height:8px;background:#e7ecf1;border-radius:99px;overflow:hidden;margin-top:10px}.rqplus-bar i{display:block;height:100%;background:#20252b;width:0}.rqplus-tools{display:flex;gap:8px;margin-top:11px;flex-wrap:wrap}.rqplus-search{flex:1;min-width:220px;min-height:44px;border:1px solid #dfe5eb;border-radius:12px;padding:10px 12px;font:inherit}.rqplus-btn{min-height:44px;border:1px solid #dfe5eb;border-radius:12px;padding:9px 12px;background:#f4f6f8;font:inherit;font-weight:800;cursor:pointer}.rqplus-mark{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-top:1px solid #eef1f4;background:#fafbfd}.rqplus-mark button{min-height:40px;border:0;border-radius:11px;padding:8px 12px;font:inherit;font-weight:800;cursor:pointer;background:#20252b;color:#fff}.rqplus-hide{display:none!important}@media(max-width:600px){.rqplus-top{align-items:flex-start}.rqplus-search{min-width:100%}.rqplus-tools .rqplus-btn{flex:1}}';
 document.head.appendChild(style);
 const panel=document.createElement('section');panel.className='rqplus';panel.setAttribute('aria-label','Revision study tools');
 panel.innerHTML='<div class="rqplus-top"><div><div class="rqplus-title">'+icon+' Smart Study Tracker</div><div class="rqplus-sub">Chapter पढ़ो, पूरा mark करो और अपनी revision progress बची रहेगी।</div></div><strong id="rqplusPct">0%</strong></div><div class="rqplus-bar"><i id="rqplusBar"></i></div><div class="rqplus-tools"><input id="rqplusSearch" class="rqplus-search" type="search" placeholder="Chapter खोजें…" aria-label="Chapter खोजें"><button id="rqplusOpen" class="rqplus-btn" type="button">सभी chapters खोलें</button><button id="rqplusClose" class="rqplus-btn" type="button">सभी बंद करें</button></div></section>';
 host.prepend(panel);
 const pctEl=panel.querySelector('#rqplusPct'),bar=panel.querySelector('#rqplusBar'),search=panel.querySelector('#rqplusSearch');
 function save(){localStorage.setItem(storageKey,JSON.stringify(state));}
 function update(){const n=chapters.length,c=chapters.filter((_,i)=>!!state[i]).length,p=n?Math.round(c/n*100):0;pctEl.textContent=p+'%';bar.style.width=p+'%';chapters.forEach((ch,i)=>{const summary=ch.querySelector('summary');if(!summary)return;let row=ch.querySelector('.rqplus-mark');if(!row){row=document.createElement('div');row.className='rqplus-mark';ch.appendChild(row);}row.innerHTML='<span>'+(state[i]?'✅ Chapter revised':'📘 Complete all 8 cards, then mark revised')+'</span><button type="button">'+(state[i]?'Mark again':'✓ Mark revised')+'</button>';row.querySelector('button').onclick=()=>{state[i]=!state[i];save();update();};});}
 panel.querySelector('#rqplusOpen').onclick=()=>chapters.forEach(c=>c.open=true);
 panel.querySelector('#rqplusClose').onclick=()=>chapters.forEach(c=>c.open=false);
 search.oninput=()=>{const q=search.value.trim().toLowerCase();chapters.forEach(c=>{const t=(c.innerText||'').toLowerCase();c.classList.toggle('rqplus-hide',q&&!t.includes(q));if(q&&t.includes(q))c.open=true;});};
 update();
}
const observer=new MutationObserver(boot);observer.observe(host,{childList:true,subtree:true});boot();
setTimeout(boot,500);setTimeout(boot,1500);
})();
