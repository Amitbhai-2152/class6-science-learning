(function(){'use strict';
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
function data(){return META.map(m=>{const s=window.UnifiedRevision?.subjects?.find?.(x=>x.id===m.id);return {...m,units:Array.isArray(s?.units)?s.units:[]}})}
function cards(u){const t=u[0]||'यह chapter',a=u[1]||'मुख्य विचार को समझो।',b=u[2]||'मुख्य तथ्य को उदाहरण से जोड़ो।';return [
['🎯 मुख्य विचार',a,'पहले इस विचार का अर्थ अपने शब्दों में बोलकर समझो।'],
['⭐ जरूरी तथ्य',b,'यह तथ्य chapter की पहचान बनाने वाला key point है; इसे बिना किताब देखे दोहराओ।'],
['💡 ऐसा क्यों?',`“${t}” में ${a.charAt(0).toLowerCase()+a.slice(1)}`,`कारण या नियम को समझने पर केवल रटना नहीं पड़ता। ${b}`],
['🏠 आसान उदाहरण',`${t} को किसी रोज़मर्रा की स्थिति से जोड़कर देखो।`,`एक वास्तविक स्थिति में सोचो कि ${b.charAt(0).toLowerCase()+b.slice(1)} तब कैसे दिखाई देगा। उदाहरण अपने शब्दों में बनाओ।`],
['🔗 आपस में संबंध',`${a} और ${b}`,`इन दोनों points को साथ पढ़ने पर concept का पूरा picture बनता है: पहला point idea बताता है, दूसरा उसके काम करने का तरीका या खास तथ्य।`],
['⚠️ गलती से बचो',`सिर्फ definition याद करके answer मत छोड़ो।`,`उत्तर में जहाँ जरूरी हो वहाँ कारण, तुलना, उदाहरण या application जोड़ो। इस chapter का आधार: ${a}`],
['🚀 जीवन में उपयोग',`${t} का ज्ञान पढ़ाई के बाहर भी काम आ सकता है।`,`किसी नई situation में पहले concept पहचानो, फिर rule/fact लागू करो: ${b}`],
['📝 परीक्षा से पहले',`दो बातें पक्की करो: ${a} और ${b}`,`30 सेकंड का self-check: chapter बंद करो, दोनों points बिना देखे बोलो और एक छोटा example बनाओ।`]
]}
let state={screen:'subjects',sid:null,cid:0,card:0,flip:false,query:''};
function subjects(){state.screen='subjects';state.sid=null;paint()}
function chapters(sid){state.screen='chapters';state.sid=sid;state.query='';paint()}
function deck(cid){state.screen='deck';state.cid=cid;state.card=0;state.flip=false;paint()}
function current(){const s=data().find(x=>x.id===state.sid);return {s,u:s?.units?.[state.cid]||[]}}
function paint(){if(!root)return;const ss=data();const total=ss.reduce((n,s)=>n+s.units.length,0);if(state.screen==='subjects'){
root.innerHTML=`<section class="rv-hero"><h1>🧠 Smart Revision Hub</h1><p>सभी 6 subjects के chapters को छोटे, साफ और meaningful revision cards में दोहराओ। पहले subject चुनो, फिर chapter, फिर 8 study cards.</p><div class="rv-stats"><div class="rv-stat"><b>6</b><span>Subjects</span></div><div class="rv-stat"><b>${total}</b><span>Chapters</span></div><div class="rv-stat"><b>8</b><span>Cards / chapter</span></div><div class="rv-stat"><b>${total*8}</b><span>Study cards</span></div></div></section><div class="rv-section"><input class="rv-search" id="search" placeholder="किसी subject या chapter को खोजें…" value="${esc(state.query)}"><div class="rv-grid" id="subjectGrid"></div></div>`;
const grid=document.getElementById('subjectGrid'),q=state.query.trim().toLowerCase();const filtered=ss.filter(s=>!q||`${s.hi} ${s.en} ${s.units.map(u=>u[0]).join(' ')}`.toLowerCase().includes(q));grid.innerHTML=filtered.length?filtered.map(s=>`<article class="rv-sub"><div class="rv-icon">${s.icon}</div><h2>${esc(s.hi)}</h2><div class="rv-muted">${esc(s.en)} • ${s.units.length} chapters • ${s.units.length*8} cards</div><p class="rv-muted">मुख्य विचार • तथ्य • कारण • उदाहरण • संबंध • mistake check • उपयोग • exam recap</p><button class="rv-btn" data-s="${s.id}">Chapters देखें →</button></article>`).join(''):'<div class="rv-empty">इस search से कोई subject/chapter नहीं मिला।</div>';
grid.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>chapters(b.dataset.s));document.getElementById('search').oninput=e=>{state.query=e.target.value;paint()};
return}
if(state.screen==='chapters'){const s=ss.find(x=>x.id===state.sid);if(!s){subjects();return}root.innerHTML=`<section class="rv-hero"><button class="rv-back" id="back">← Subjects</button><h1 style="margin-top:16px">${s.icon} ${esc(s.hi)}</h1><p>${s.units.length} chapters • हर chapter में 8 meaningful revision cards.</p></section><div class="rv-section"><div class="rv-chapters">${s.units.map((u,i)=>`<article class="rv-ch"><div class="rv-icon">🃏</div><div class="rv-ch-main"><b>Chapter ${i+1} · ${esc(u[0])}</b><small>${esc(u[1])}</small><span class="rv-chip">8 study cards</span></div><button class="rv-btn" data-c="${i}">Revise →</button></article>`).join('')}</div></div>`;document.getElementById('back').onclick=subjects;root.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>deck(Number(b.dataset.c)));return}
const {s,u}=current();const cs=cards(u),c=cs[state.card]||cs[0];root.innerHTML=`<div class="rv-deck"><button class="rv-back" id="back">← Chapters</button><section class="rv-hero" style="margin-top:12px"><h1 style="font-size:clamp(23px,4vw,34px)">${s.icon} ${esc(s.hi)} · Chapter ${state.cid+1}</h1><p>${esc(u[0]||'Chapter')} • Card ${state.card+1} / ${cs.length}</p><div class="rv-progress"><i style="width:${(state.card+1)/cs.length*100}%"></i></div></section><div class="rv-card" style="margin-top:14px"><div class="rv-face ${state.flip?'flip':''}" id="face" tabindex="0" role="button" aria-label="Card flip करें"><article class="rv-side"><div class="rv-kicker">${esc(c[0])}</div><h2>${esc(c[1])}</h2><div class="rv-tip">इसे अपने शब्दों में समझाओ। फिर card पलटकर recap देखो।</div></article><article class="rv-side back"><div class="rv-kicker">RECAP + ACTIVE RECALL</div><p>${esc(c[2])}</p><div class="rv-tip">अब किताब बंद करके एक छोटा example या one-line answer बोलकर देखो।</div></article></div></div><div class="rv-controls"><button class="rv-back" id="prev" ${state.card?'':'disabled'}>← Previous</button><button class="rv-btn" id="flip">${state.flip?'Front':'Flip card'}</button><button class="rv-btn" id="next">${state.card===cs.length-1?'Finish':'Next →'}</button></div></div>`;document.getElementById('back').onclick=()=>chapters(s.id);const face=document.getElementById('face');const toggle=()=>{state.flip=!state.flip;paint()};face.onclick=toggle;face.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}};document.getElementById('flip').onclick=toggle;document.getElementById('prev').onclick=()=>{if(state.card){state.card--;state.flip=false;paint()}};document.getElementById('next').onclick=()=>{if(state.card<cs.length-1){state.card++;state.flip=false;paint()}else{let done={};try{done=JSON.parse(localStorage.getItem('class6StandaloneRevision')||'{}')}catch(_){}done[`${s.id}:${state.cid}`]=Date.now();localStorage.setItem('class6StandaloneRevision',JSON.stringify(done));chapters(s.id)}};face.focus()}
paint();
})();
