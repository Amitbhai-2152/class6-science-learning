(function(){
'use strict';

/* Final Revision owner: subject -> chapter -> focused flashcards. */
const META=[
 {id:'science',icon:'🔬',hi:'विज्ञान',name:'Science',count:12},
 {id:'maths',icon:'➗',hi:'गणित',name:'Maths',count:8},
 {id:'english',icon:'📖',hi:'अंग्रेज़ी',name:'English',count:8},
 {id:'hindi',icon:'🪔',hi:'हिंदी',name:'Hindi',count:8},
 {id:'gk',icon:'🧠',hi:'सामान्य ज्ञान + तर्क',name:'GK + Reasoning',count:8},
 {id:'social',icon:'🌍',hi:'सामाजिक विज्ञान',name:'Social Science',count:14}
];

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const units=()=>META.map(m=>{
  const src=window.UnifiedRevision?.subjects?.find?.(x=>x.id===m.id);
  return Object.assign({},m,{units:Array.isArray(src?.units)?src.units:[]});
});

function styles(){
 if(document.getElementById('revisionFinalCSS'))return;
 const s=document.createElement('style');
 s.id='revisionFinalCSS';
 s.textContent=`
 #revisionView .revision-page{display:block;width:min(1180px,calc(100% - 32px));margin:24px auto 48px;box-sizing:border-box}
 #revisionView .revision-page-head{display:block;width:100%;margin:0 0 18px}
 #revisionView #revisionPlan,#revisionView #revisionContent{width:100%;min-width:0}
 #revisionView .rf{display:grid;gap:18px;width:100%;min-width:0}
 .rf-hero{border-radius:22px;padding:22px;background:linear-gradient(135deg,#20252b,#59636e);color:#fff;box-sizing:border-box}
 .rf-hero h2{margin:0 0 7px;font-size:clamp(22px,4vw,30px);line-height:1.25}
 .rf-hero p{margin:0;color:#e6ebef;line-height:1.65}
 .rf-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}
 .rf-stat{border:1px solid #ffffff22;background:#ffffff12;border-radius:14px;padding:12px}
 .rf-stat b{display:block;font-size:21px}.rf-stat span{font-size:11px;color:#d7dde3}
 .rf-tools{display:flex;gap:10px;flex-wrap:wrap}
 .rf-search{flex:1 1 280px;min-width:0;border:1px solid #d9dee5;border-radius:13px;padding:12px 14px;font:inherit;box-sizing:border-box}
 .rf-filter{border:1px solid #d9dee5;border-radius:13px;padding:11px;font:inherit;background:#fff}
 .rf-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
 .rf-subject{border:1px solid #e0e5eb;border-radius:20px;background:#fff;padding:19px;display:flex;flex-direction:column;gap:11px;box-shadow:0 8px 24px rgba(20,30,50,.07);min-width:0}
 .rf-subject-top{display:flex;align-items:center;gap:12px}.rf-icon{font-size:36px}.rf-subject h3{margin:0;font-size:18px;line-height:1.35}
 .rf-muted{color:#667085;font-size:12px;line-height:1.5}.rf-count{font-weight:800;font-size:13px}
 .rf-btn{border:0;border-radius:12px;padding:11px 14px;background:#20252b;color:#fff;font:inherit;font-weight:900;cursor:pointer;min-height:44px}
 .rf-btn:focus-visible{outline:3px solid currentColor;outline-offset:2px}.rf-back{background:#eef2f5;color:#20252b}
 .rf-chapters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
 .rf-ch{border:1px solid #e0e5eb;border-radius:16px;background:#fff;padding:15px;display:flex;align-items:center;gap:11px;min-width:0;box-shadow:0 5px 18px rgba(20,30,50,.05)}
 .rf-ch-main{flex:1;min-width:0}.rf-ch-main b{display:block;font-size:14px;line-height:1.45}.rf-ch-main small{display:block;color:#667085;line-height:1.5;margin-top:4px}
 .rf-deck{max-width:760px;margin:0 auto;width:100%;display:grid;gap:14px}.rf-card{min-height:330px;perspective:1100px}
 .rf-face{height:330px;position:relative;transform-style:preserve-3d;transition:transform .5s;cursor:pointer}.rf-face.flipped{transform:rotateY(180deg)}
 .rf-side{position:absolute;inset:0;backface-visibility:hidden;border:1px solid #d9dee5;border-radius:24px;padding:30px;box-sizing:border-box;background:#fff;box-shadow:0 14px 35px rgba(20,30,50,.12);display:flex;flex-direction:column;justify-content:center}
 .rf-side.back{transform:rotateY(180deg);background:#f8fafc}.rf-side h2{font-size:clamp(23px,4vw,34px);line-height:1.3;margin:9px 0}.rf-answer{font-size:18px;line-height:1.75}
 .rf-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}.rf-note{font-size:12px;color:#667085;line-height:1.6}
 @media(max-width:900px){.rf-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
 @media(max-width:600px){
   #revisionView .revision-page{width:calc(100% - 20px);margin:14px auto 32px}
   .rf-grid,.rf-chapters{grid-template-columns:1fr}.rf-stats{grid-template-columns:repeat(2,1fr)}
   .rf-hero{padding:17px}.rf-subject{padding:16px}.rf-card,.rf-face{min-height:300px;height:300px}.rf-side{padding:22px}.rf-answer{font-size:16px}
   .rf-actions .rf-btn{flex:1 1 130px}
 }
 @media(prefers-reduced-motion:reduce){.rf-face{transition:none}}
 `;
 document.head.appendChild(s);
}

function open(){
 styles();
 document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
 const v=document.getElementById('revisionView');
 if(!v)return;
 v.classList.remove('hidden');
 renderHome();
 window.scrollTo({top:0,behavior:'smooth'});
}

function renderHome(){
 const plan=document.getElementById('revisionPlan'),host=document.getElementById('revisionContent');
 if(!host)return;
 const ss=units();
 const q=String(window.__rfq||'').trim().toLocaleLowerCase('hi-IN');
 const filtered=ss.filter(s=>!q||`${s.hi} ${s.name}`.toLocaleLowerCase('hi-IN').includes(q));
 if(plan)plan.innerHTML='';
 host.innerHTML=`<div class="rf">
  <div class="rf-hero"><h2>🧠 Smart Revision Hub</h2><p>पहले subject चुनो, फिर chapter चुनकर concept, example, active recall और challenge cards से revise करो।</p>
   <div class="rf-stats"><div class="rf-stat"><b>${ss.length}</b><span>Subjects</span></div><div class="rf-stat"><b>${ss.reduce((n,s)=>n+s.count,0)}</b><span>Revision chapters</span></div><div class="rf-stat"><b>8</b><span>Cards / chapter</span></div><div class="rf-stat"><b>∞</b><span>Practice again</span></div></div>
  </div>
  <div class="rf-tools"><input id="rfSearch" class="rf-search" placeholder="🔎 Subject खोजो…" value="${esc(window.__rfq||'')}" autocomplete="off" aria-label="Subject खोजें"><select id="rfFilter" class="rf-filter" aria-label="Subject filter"><option value="all">All subjects</option><option value="started">With revision data</option></select></div>
  <div id="rfGrid" class="rf-grid">${filtered.map(s=>`<article class="rf-subject"><div class="rf-subject-top"><span class="rf-icon">${s.icon}</span><div><h3>${esc(s.hi)}</h3><div class="rf-muted">${esc(s.name)}</div></div></div><div class="rf-count">📚 ${s.count} chapters</div><div class="rf-muted">Concept recall • key points • examples • active recall • challenge</div><button class="rf-btn" data-sub="${s.id}">Open subject →</button></article>`).join('')}</div>
  <div class="rf-note">💡 Revision flow: <b>Recall → Flip card → Check answer → Apply → Next → Finish.</b> Progress is saved locally on this browser.</div>
 </div>`;
 const search=document.getElementById('rfSearch');
 search.oninput=e=>{window.__rfq=e.target.value;renderHome()};
 host.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>renderSubject(b.dataset.sub));
 search.focus({preventScroll:true});
}

function renderSubject(id){
 const s=units().find(x=>x.id===id),host=document.getElementById('revisionContent');
 if(!s||!host)return;
 host.innerHTML=`<div class="rf"><button id="rfBack" class="rf-btn rf-back">← सभी subjects</button><div class="rf-hero"><h2>${s.icon} ${esc(s.hi)}</h2><p>${s.count} chapters को focused flashcard revision में बदलो। हर chapter में recall, key idea, example, common mistake और challenge है।</p></div><div class="rf-chapters">${Array.from({length:s.count},(_,i)=>{const u=s.units[i]||[`Chapter ${i+1}`,`Chapter ${i+1} के मुख्य concepts को recall करो।`,`एक example सोचो और अपने शब्दों में समझाओ।`];return `<article class="rf-ch"><div class="rf-icon">🃏</div><div class="rf-ch-main"><b>Chapter ${i+1} · ${esc(u[0])}</b><small>${esc(u[1]||'Quick revision')} ${u[2]?' '+esc(u[2]):''}</small></div><button class="rf-btn" data-ch="${i}">Start</button></article>`}).join('')}</div></div>`;
 document.getElementById('rfBack').onclick=renderHome;
 host.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>deck(s,Number(b.dataset.ch)));
 window.scrollTo({top:0,behavior:'smooth'});
}

function makeCards(u){
 const title=u[0]||'Chapter';
 const p1=u[1]||'इस chapter की मुख्य अवधारणा अपने शब्दों में बताओ।';
 const p2=u[2]||'इस concept को एक उदाहरण से जोड़कर समझाओ।';
 return [
  ['🎯 Core concept',p1],
  ['⭐ Key point',p2],
  ['💡 Explain it simply',`“${title}” को किसी छोटे भाई/बहन को समझाने जैसा सरल बनाकर बताओ। उत्तर में मुख्य शब्द और कारण शामिल करो।`],
  ['🏠 Real-life example',`“${title}” का रोज़मर्रा की जिंदगी, आसपास के environment या school-life से एक सही example जोड़ो।`],
  ['⚠️ Common mistake',`सिर्फ definition याद करने की गलती मत करो। “${title}” में concept, कारण और example के बीच संबंध भी पहचानो।`],
  ['🔁 Active recall',`बिना किताब देखे “${title}” के 2 सबसे महत्वपूर्ण points बोलो और बताओ कि दोनों में क्या संबंध है।`],
  ['🧩 Apply & connect',`अगर “${title}” से जुड़ी कोई नई स्थिति दी जाए, तो पहले कौन-सा concept पहचानोगे और उसका उपयोग कैसे करोगे?`],
  ['🏆 60-second challenge',`60 seconds में “${title}” का mini-summary दो: क्या है → कैसे/क्यों → example → एक key takeaway।`]
 ];
}

function deck(s,i){
 const u=s.units[i]||[`Chapter ${i+1}`,`Chapter ${i+1} के मुख्य concepts को recall करो।`,`एक example सोचो और अपने शब्दों में समझाओ।`];
 const cards=makeCards(u);
 let pos=0,flip=false;
 const host=document.getElementById('revisionContent');
 function paint(){
  const c=cards[pos];
  host.innerHTML=`<div class="rf"><div class="rf-deck"><button id="rfDeckBack" class="rf-btn rf-back">← Chapters</button><div class="rf-hero"><h2>${s.icon} ${esc(s.hi)} · Chapter ${i+1}</h2><p>${esc(u[0])} • Card ${pos+1} / ${cards.length}</p></div><div class="rf-card"><div id="rfFace" tabindex="0" role="button" aria-label="Flashcard flip करें" class="rf-face ${flip?'flipped':''}"><div class="rf-side"><div class="rf-muted">RECALL</div><h2>${esc(c[0])}</h2><div class="rf-muted">Tap / Enter to reveal answer</div></div><div class="rf-side back"><div class="rf-muted">ANSWER</div><div class="rf-answer">${esc(c[1])}</div><div class="rf-muted">अब इसे अपने शब्दों में दोहराओ।</div></div></div></div><div class="rf-actions"><button id="rfPrev" class="rf-btn rf-back" ${pos===0?'disabled':''}>← Previous</button><button id="rfNext" class="rf-btn">${pos===cards.length-1?'Finish':'Next →'}</button></div><div class="rf-note">Card tip: पहले बिना flip किए answer सोचो, फिर check करो।</div></div></div>`;
  document.getElementById('rfDeckBack').onclick=()=>renderSubject(s.id);
  const f=document.getElementById('rfFace');
  f.onclick=()=>{flip=!flip;paint()};
  f.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip=!flip;paint()}};
  f.focus();
  document.getElementById('rfPrev').onclick=()=>{if(pos){pos--;flip=false;paint()}};
  document.getElementById('rfNext').onclick=()=>{if(pos<cards.length-1){pos++;flip=false;paint()}else{const k=`${s.id}:${i}`;let d={};try{d=JSON.parse(localStorage.getItem('class6RevisionFlashcardsFinal')||'{}')}catch(_){}d[k]=Date.now();localStorage.setItem('class6RevisionFlashcardsFinal',JSON.stringify(d));renderSubject(s.id)}};
 }
 paint();
}

window.openUnifiedRevision=open;
window.openRevision=open;
window.RevisionFinal={open,renderHome};
})();
