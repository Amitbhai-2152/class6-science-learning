(function(){
'use strict';
const DATA=window.REVISION_CHAPTERS||[];
const subject=window.REVISION_SUBJECT||{name:'Revision',icon:'📚'};
const root=document.getElementById('revisionApp');
if(!root)return;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const qs=new URLSearchParams(location.search);let current=Math.max(0,Math.min(DATA.length-1,(Number(qs.get('chapter'))||1)-1));
const key='class6-revision-v2-'+(subject.id||subject.name);
let done=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(done)||done.length!==DATA.length)done=Array(DATA.length).fill(false);
const pct=()=>Math.round(done.filter(Boolean).length/DATA.length*100);
const save=()=>localStorage.setItem(key,JSON.stringify(done));
function cardSet(ch){
 const c=ch.core||'इस chapter के मुख्य विचार को समझो।', d=ch.detail||'इस विचार को उदाहरणों और अभ्यास से जोड़ो।';
 return [
  ['01 · CORE IDEA','मुख्य अवधारणा',c],
  ['02 · WHY IT MATTERS','क्यों जरूरी है?',d],
  ['03 · REAL EXAMPLE','आसान उदाहरण',ch.example||('रोज़मर्रा की स्थिति में '+ch.title+' को पहचानो।')],
  ['04 · KEY DISTINCTION','ध्यान रखने वाली बात',ch.distinction||'समान दिखने वाले concepts के बीच सही अंतर पहचानना परीक्षा में महत्वपूर्ण है।'],
  ['05 · COMMON MISTAKE','आम गलती',ch.mistake||'सिर्फ शब्द याद करने के बजाय पूरा अर्थ और उसका उपयोग समझो।'],
  ['06 · EXAM READY','Exam-ready line',ch.exam||c],
  ['07 · MEMORY HOOK','याद रखने की trick',ch.memory||'पहले concept → फिर example → फिर खुद से बिना देखे दोहराओ।'],
  ['08 · SELF-CHECK','Self-check',ch.check||'क्या तुम इस chapter के मुख्य विचार को अपने शब्दों में समझा सकते हो?']
 ];
 return cardSet;
}
function render(){
 const ch=DATA[current];
 root.innerHTML=`<div class="rv2-shell">
  <div class="rv2-top"><a class="rv2-back" href="revision-v2.html">← All subjects</a><span class="rv2-count">${current+1}/${DATA.length}</span></div>
  <section class="rv2-hero"><div class="rv2-icon">${esc(subject.icon||'📚')}</div><div><div class="rv2-kicker">CLASS 6 • ${esc(subject.name||'REVISION')}</div><h1>${esc(ch.title)}</h1><p>8 study cards: concept, example, distinction, mistake, exam line, memory hook और self-check.</p></div></section>
  <div class="rv2-progress"><div><b>Subject mastery</b><span>${pct()}%</span></div><i style="width:${pct()}%"></i></div>
  <section class="rv2-cards">${cardSet(ch).map((x,i)=>`<article class="rv2-card"><span>${x[0]}</span><h2>${esc(x[1])}</h2><p>${esc(x[2])}</p>${i===7?'<div class="rv2-check">✓ अब किताब बंद करके उत्तर अपने शब्दों में बोलो।</div>':''}</article>`).join('')}</section>
  <div class="rv2-actions"><a class="rv2-btn" href="${location.pathname}?chapter=${current}">← Previous chapter</a><button class="rv2-btn primary" id="markBtn" type="button">${done[current]?'✓ Completed':'Mark chapter complete'}</button><a class="rv2-btn" href="${location.pathname}?chapter=${Math.min(DATA.length,current+2)}">Next chapter →</a></div>
  <div class="rv2-list"><div class="rv2-list-head"><h2>Chapter index</h2><span>${done.filter(Boolean).length}/${DATA.length} complete</span></div>${DATA.map((x,i)=>`<a class="rv2-ch ${i===current?'active':''} ${done[i]?'done':''}" href="${location.pathname}?chapter=${i+1}"><span>${done[i]?'✓':'○'}</span><div><b>Chapter ${i+1} · ${esc(x.title)}</b><small>${esc(x.core||'Revision notes')}</small></div><em>8 cards</em></a>`).join('')}</div>
 </div>`;
 document.getElementById('markBtn').onclick=()=>{done[current]=!done[current];save();render();};
}
render();
})();
