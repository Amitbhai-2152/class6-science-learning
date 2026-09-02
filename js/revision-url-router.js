(function(){
'use strict';
const root=document.getElementById('app');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const META=[
 {id:'science',hi:'विज्ञान',en:'Science',icon:'🔬'},
 {id:'maths',hi:'गणित',en:'Maths',icon:'➗'},
 {id:'english',hi:'अंग्रेज़ी',en:'English',icon:'📖'},
 {id:'hindi',hi:'हिंदी',en:'Hindi',icon:'🪔'},
 {id:'gk',hi:'सामान्य ज्ञान + तर्क',en:'GK + Reasoning',icon:'🧠'},
 {id:'social',hi:'सामाजिक विज्ञान',en:'Social Science',icon:'🌍'}
];
let subjects=[];
function parseSubjects(text){
 const match=text.match(/const SUBJECTS=(\[[\s\S]*?\]);\s*function cards/);
 if(!match)throw new Error('Revision dataset marker not found');
 return Function('return ('+match[1]+')')();
}
async function loadData(){
 try{
  const r=await fetch('js/revision-standalone.js?v=5&cb='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw new Error('HTTP '+r.status);
  subjects=parseSubjects(await r.text());
 }catch(err){console.error(err);subjects=[];}
 render();
}
function all(){return META.map(m=>{const s=subjects.find(x=>x.id===m.id);return {...m,units:Array.isArray(s?.units)?s.units:[]}})}
function makeCards(u){
 const t=u[0]||'अध्याय',a=u[1]||'मुख्य विचार समझो।',b=u[2]||'मुख्य तथ्य को उदाहरण से जोड़ो।';
 return [
  ['🎯 मुख्य विचार',a,'इस अध्याय की बुनियाद इसी विचार को समझना है।'],
  ['⭐ जरूरी तथ्य',b,'इस तथ्य को बिना किताब देखे दोहराओ और इसका अर्थ समझाओ।'],
  ['💡 सरल समझ',`${t}: ${a}`,`सरल भाषा में समझो कि यह विचार क्या बताता है और क्यों महत्वपूर्ण है।`],
  ['🏠 उदाहरण',`रोज़मर्रा की किसी स्थिति में ${t} को पहचानो।`,`अपने जीवन या आसपास की किसी स्थिति का छोटा उदाहरण बनाओ और बताओ कि ${b}`],
  ['🔗 संबंध',`${a} ${b}`,`दोनों बातों को जोड़कर पूरा concept समझो: पहली बात मुख्य idea देती है और दूसरी उसे स्पष्ट करती है।`],
  ['⚠️ ध्यान रखने वाली बात',`सिर्फ शब्द याद करना पर्याप्त नहीं है।`,`उत्तर देते समय जहाँ जरूरी हो वहाँ कारण, उदाहरण, तुलना या उपयोग भी लिखो।`],
  ['🚀 उपयोग',`${t} का ज्ञान किसी नई स्थिति में लागू किया जा सकता है।`,`नई समस्या में पहले सही concept पहचानो और फिर सीखा हुआ नियम/तथ्य लगाओ।`],
  ['📝 Exam recap',`${a} ${b}`,`30 सेकंड self-check: chapter बंद करो, मुख्य विचार बोलो, key fact बताओ और एक example बनाओ।`]
 ];
}
function layoutHead(title,sub){return `<section class="rv-hero"><h1>${title}</h1><p>${sub}</p></section>`}
function home(){
 const ss=all(),total=ss.reduce((n,s)=>n+s.units.length,0);
 root.innerHTML=layoutHead('🧠 Smart Revision Hub','सभी 6 subjects को subject → chapter → 8-card revision flow में पढ़ो.')+
 `<div class="rv-section"><input id="search" class="rv-search" placeholder="Subject या chapter खोजें…"><div class="rv-grid">${ss.map(s=>`<a class="rv-sub rv-link" href="revision.html?subject=${encodeURIComponent(s.id)}"><div class="rv-icon">${s.icon}</div><h2>${esc(s.hi)}</h2><div class="rv-muted">${esc(s.en)} • ${s.units.length} chapters • ${s.units.length*8} cards</div><p class="rv-muted">मुख्य विचार • तथ्य • कारण • उदाहरण • संबंध • उपयोग • exam recap</p><span class="rv-btn">Chapters देखें →</span></a>`).join('')}</div><div class="rv-muted" style="margin-top:12px">कुल ${total} chapters • ${total*8} study cards</div></div>`;
 const input=document.getElementById('search');input.oninput=()=>{const q=input.value.trim().toLowerCase();root.querySelectorAll('.rv-sub').forEach(a=>a.hidden=!!q&&!a.textContent.toLowerCase().includes(q))};
}
function chapterPage(s){
 root.innerHTML=layoutHead(`${s.icon} ${esc(s.hi)}`,`${s.units.length} chapters • हर chapter में 8 meaningful revision cards.`)+`<div class="rv-section"><div class="rv-toolbar"><a class="rv-back rv-inline" href="revision.html">← सभी Subjects</a></div><div class="rv-chapters">${s.units.map((u,i)=>`<a class="rv-ch rv-link" href="revision.html?subject=${encodeURIComponent(s.id)}&chapter=${i+1}"><div class="rv-icon">🃏</div><div class="rv-ch-main"><b>Chapter ${i+1} · ${esc(u[0])}</b><small>${esc(u[1])}</small><span class="rv-chip">8 study cards</span></div><span class="rv-btn">Revise →</span></a>`).join('')}</div></div>`;
}
function deckPage(s,index){
 const u=s.units[index];if(!u){chapterPage(s);return}const cs=makeCards(u),done=JSON.parse(localStorage.getItem('class6StandaloneRevision')||'{}');let card=0,flip=false;
 function paint(){const c=cs[card];root.innerHTML=`<div class="rv-deck"><div class="rv-controls" style="justify-content:flex-start"><a class="rv-back rv-inline" href="revision.html?subject=${encodeURIComponent(s.id)}">← Chapters</a></div>${layoutHead(`${s.icon} ${esc(s.hi)} · Chapter ${index+1}`,`${esc(u[0])} • Card ${card+1}/${cs.length}`)}<div class="rv-card"><div class="rv-face ${flip?'flip':''}" tabindex="0" role="button" aria-label="Flashcard flip करें"><article class="rv-side"><div class="rv-kicker">${esc(c[0])}</div><h2>${esc(c[1])}</h2><div class="rv-tip">इस note को पढ़ो, अपने शब्दों में समझाओ और फिर Flip card दबाओ।</div></article><article class="rv-side back"><div class="rv-kicker">RECAP + ACTIVE RECALL</div><p>${esc(c[2])}</p><div class="rv-tip">अब किताब बंद करके एक छोटा example या one-line answer बोलकर recall करो।</div></article></div></div><div class="rv-controls"><button class="rv-back" type="button" id="prev" ${card?'':'disabled'}>← Previous</button><button class="rv-btn" type="button" id="flip">${flip?'Front':'Flip card'}</button>${card<cs.length-1?`<button class="rv-btn" type="button" id="next">Next →</button>`:`<a class="rv-btn rv-inline" href="revision.html?subject=${encodeURIComponent(s.id)}" id="finish">Finish ✓</a>`}</div><div class="rv-progress"><i style="width:${(card+1)/cs.length*100}%"></i></div></div>`;const face=root.querySelector('.rv-face');const toggle=()=>{flip=!flip;paint()};face.onclick=toggle;face.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}};root.querySelector('#flip').onclick=toggle;root.querySelector('#prev').onclick=()=>{if(card){card--;flip=false;paint()}};const next=root.querySelector('#next');if(next)next.onclick=()=>{card++;flip=false;paint()};const key=s.id+':'+index;if(card===cs.length-1){done[key]=Date.now();localStorage.setItem('class6StandaloneRevision',JSON.stringify(done));}}
 paint();
}
function render(){if(!root)return;const p=new URLSearchParams(location.search),sid=p.get('subject'),chapter=Math.max(0,(Number(p.get('chapter'))||0)-1),ss=all();if(!sid){home();return}const s=ss.find(x=>x.id===sid);if(!s){home();return}if(p.has('chapter'))deckPage(s,chapter);else chapterPage(s)}
loadData();
})();
