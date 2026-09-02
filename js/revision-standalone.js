(function(){
'use strict';
const root=document.getElementById('app');
const META=[
{id:'science',hi:'विज्ञान',en:'Science',icon:'🔬'},
{id:'maths',hi:'गणित',en:'Maths',icon:'➗'},
{id:'english',hi:'अंग्रेज़ी',en:'English',icon:'📖'},
{id:'hindi',hi:'हिंदी',en:'Hindi',icon:'🪔'},
{id:'gk',hi:'सामान्य ज्ञान + तर्क',en:'GK + Reasoning',icon:'🧠'},
{id:'social',hi:'सामाजिक विज्ञान',en:'Social Science',icon:'🌍'}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
let sourceData=null;
function normalize(raw){
 if(Array.isArray(raw))return raw;
 if(Array.isArray(raw?.subjects))return raw.subjects;
 if(Array.isArray(raw?.SUBJECTS))return raw.SUBJECTS;
 return [];
}
function data(){
 const raw=sourceData||window.__REVISION_SUBJECTS||window.UnifiedRevision?.subjects||window.RevisionData?.subjects||window.RevisionData;
 const arr=normalize(raw);
 return META.map(m=>{const s=arr.find(x=>x&&x.id===m.id);return {...m,units:Array.isArray(s?.units)?s.units:[]}});
}
async function ensureData(){
 if(data().some(s=>s.units.length)){paint();return;}
 try{
  const r=await fetch('js/unified-revision.js?v=4&cb='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const text=await r.text();
  const marker='const SUBJECTS=';
  const patched=text.includes(marker)?text.replace(marker,'window.__REVISION_SUBJECTS='):text;
  (0,eval)(patched);
  sourceData=window.__REVISION_SUBJECTS||window.UnifiedRevision?.subjects||null;
 }catch(err){console.error('Revision data load failed',err)}
 paint();
}
function cards(u){
 const t=u[0]||'यह chapter',a=u[1]||'मुख्य विचार को समझो।',b=u[2]||'मुख्य तथ्य को उदाहरण से जोड़ो।';
 return [
 ['🎯 मुख्य विचार',a,'पहले इस विचार का अर्थ अपने शब्दों में बोलकर समझो।'],
 ['⭐ जरूरी तथ्य',b,'यह तथ्य chapter की पहचान बनाने वाला key point है; इसे बिना किताब देखे दोहराओ।'],
 ['💡 ऐसा क्यों?',`“${t}” में ${a.charAt(0).toLowerCase()+a.slice(1)}`,`कारण या नियम को समझने पर केवल रटना नहीं पड़ता। ${b}`],
 ['🏠 आसान उदाहरण',`${t} को किसी रोज़मर्रा की स्थिति से जोड़कर देखो।`,`एक वास्तविक स्थिति में सोचो कि ${b.charAt(0).toLowerCase()+b.slice(1)} तब कैसे दिखाई देगा। उदाहरण अपने शब्दों में बनाओ।`],
 ['🔗 आपस में संबंध',`${a} और ${b}`,`इन दोनों points को साथ पढ़ने पर concept का पूरा picture बनता है: पहला point idea बताता है, दूसरा उसके काम करने का तरीका या खास तथ्य।`],
 ['⚠️ गलती से बचो','सिर्फ definition याद करके answer मत छोड़ो।',`उत्तर में जहाँ जरूरी हो वहाँ कारण, तुलना, उदाहरण या application जोड़ो। इस chapter का आधार: ${a}`],
 ['🚀 जीवन में उपयोग',`${t} का ज्ञान पढ़ाई के बाहर भी काम आ सकता है।`,`किसी नई situation में पहले concept पहचानो, फिर rule/fact लागू करो: ${b}`],
 ['📝 परीक्षा से पहले',`दो बातें पक्की करो: ${a} और ${b}`,'30 सेकंड का self-check: chapter बंद करो, दोनों points बिना देखे बोलो और एक छोटा example बनाओ।']
 ];
}
let state={screen:'subjects',sid:null,cid:0,card:0,flip:false,query:''};
function goSubjects(){state.screen='subjects';state.sid=null;state.query='';paint()}
function goChapters(sid){state.screen='chapters';state.sid=sid;state.query='';paint()}
function goDeck(cid){state.screen='deck';state.cid=Number(cid)||0;state.card=0;state.flip=false;paint()}
function current(){const s=data().find(x=>x.id===state.sid);return {s,u:s?.units?.[state.cid]||[]}}
function paint(){
 if(!root)return;
 const ss=data(),total=ss.reduce((n,s)=>n+s.units.length,0);
 if(state.screen==='subjects'){
  root.innerHTML=`<section class="rv-hero"><h1>🧠 Smart Revision Hub</h1><p>सभी 6 subjects के chapters को छोटे, साफ और meaningful revision cards में दोहराओ। पहले subject चुनो, फिर chapter, फिर 8 study cards.</p><div class="rv-stats"><div class="rv-stat"><b>6</b><span>Subjects</span></div><div class="rv-stat"><b>${total||'—'}</b><span>Chapters</span></div><div class="rv-stat"><b>8</b><span>Cards / chapter</span></div><div class="rv-stat"><b>${total?total*8:'—'}</b><span>Study cards</span></div></div></section><div class="rv-section"><input class="rv-search" id="search" placeholder="किसी subject या chapter को खोजें…" value="${esc(state.query)}"><div class="rv-grid" id="subjectGrid"></div></div>`;
  const grid=document.getElementById('subjectGrid');
  const q=state.query.trim().toLowerCase();
  const filtered=ss.filter(s=>!q||`${s.hi} ${s.en} ${s.units.map(u=>u[0]).join(' ')}`.toLowerCase().includes(q));
  grid.innerHTML=filtered.length?filtered.map(s=>`<article class="rv-sub" data-open-subject="${s.id}" tabindex="0" role="button"><div class="rv-icon">${s.icon}</div><h2>${esc(s.hi)}</h2><div class="rv-muted">${esc(s.en)} • ${s.units.length} chapters • ${s.units.length*8} cards</div><p class="rv-muted">मुख्य विचार • तथ्य • कारण • उदाहरण • संबंध • mistake check • उपयोग • exam recap</p><button class="rv-btn" type="button">Chapters देखें →</button></article>`).join(''):'<div class="rv-empty">Revision content अभी उपलब्ध नहीं है।</div>';
  const input=document.getElementById('search');
  input.oninput=e=>{state.query=e.target.value;paint()};
  return;
 }
 if(state.screen==='chapters'){
  const s=ss.find(x=>x.id===state.sid);
  if(!s||!s.units.length){goSubjects();return}
  root.innerHTML=`<section class="rv-hero"><button class="rv-back" id="backSubjects" type="button">← Subjects</button><h1 style="margin-top:16px">${s.icon} ${esc(s.hi)}</h1><p>${s.units.length} chapters • हर chapter में 8 meaningful revision cards.</p></section><div class="rv-section"><div class="rv-chapters">${s.units.map((u,i)=>`<article class="rv-ch"><div class="rv-icon">🃏</div><div class="rv-ch-main"><b>Chapter ${i+1} · ${esc(u[0])}</b><small>${esc(u[1])}</small><span class="rv-chip">8 study cards</span></div><button class="rv-btn" type="button" data-open-chapter="${i}">Revise →</button></article>`).join('')}</div></div>`;
  document.getElementById('backSubjects').onclick=goSubjects;
  return;
 }
 const {s,u}=current();
 if(!s||!u.length){goSubjects();return}
 const cs=cards(u),c=cs[state.card]||cs[0];
 root.innerHTML=`<div class="rv-deck"><button class="rv-back" id="backChapters" type="button">← Chapters</button><section class="rv-hero" style="margin-top:12px"><h1 style="font-size:clamp(23px,4vw,34px)">${s.icon} ${esc(s.hi)} · Chapter ${state.cid+1}</h1><p>${esc(u[0])} • Card ${state.card+1} / ${cs.length}</p><div class="rv-progress"><i style="width:${(state.card+1)/cs.length*100}%"></i></div></section><div class="rv-card" style="margin-top:14px"><div class="rv-face ${state.flip?'flip':''}" id="face" tabindex="0" role="button" aria-label="Card flip करें"><article class="rv-side"><div class="rv-kicker">${esc(c[0])}</div><h2>${esc(c[1])}</h2><div class="rv-tip">इसे अपने शब्दों में समझाओ। फिर card पलटकर recap देखो।</div></article><article class="rv-side back"><div class="rv-kicker">RECAP + ACTIVE RECALL</div><p>${esc(c[2])}</p><div class="rv-tip">अब किताब बंद करके एक छोटा example या one-line answer बोलकर देखो।</div></article></div></div><div class="rv-controls"><button class="rv-back" id="prev" type="button" ${state.card?'':'disabled'}>← Previous</button><button class="rv-btn" id="flip" type="button">${state.flip?'Front':'Flip card'}</button><button class="rv-btn" id="next" type="button">${state.card===cs.length-1?'Finish':'Next →'}</button></div></div>`;
 document.getElementById('backChapters').onclick=()=>goChapters(s.id);
 const face=document.getElementById('face');
 const toggle=()=>{state.flip=!state.flip;paint()};
 face.onclick=toggle;
 face.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}};
 document.getElementById('flip').onclick=toggle;
 document.getElementById('prev').onclick=()=>{if(state.card){state.card--;state.flip=false;paint()}};
 document.getElementById('next').onclick=()=>{if(state.card<cs.length-1){state.card++;state.flip=false;paint()}else{let done={};try{done=JSON.parse(localStorage.getItem('class6StandaloneRevision')||'{}')}catch(_){}done[`${s.id}:${state.cid}`]=Date.now();localStorage.setItem('class6StandaloneRevision',JSON.stringify(done));goChapters(s.id)}};
 face.focus();
}
if(root){
 root.addEventListener('click',e=>{
  const sub=e.target.closest('[data-open-subject]');
  if(sub&&root.contains(sub)){goChapters(sub.dataset.openSubject);return}
  const ch=e.target.closest('[data-open-chapter]');
  if(ch&&root.contains(ch)){goDeck(ch.dataset.openChapter);return}
 });
 root.addEventListener('keydown',e=>{
  const sub=e.target.closest('[data-open-subject]');
  if(sub&&(e.key==='Enter'||e.key===' ')){e.preventDefault();goChapters(sub.dataset.openSubject)}
 });
}
paint();
ensureData();
})();
