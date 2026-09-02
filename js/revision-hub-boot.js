(function(){
'use strict';

/*
  Robust Revision entry point.
  This file intentionally does not depend on UnifiedRevision loading successfully.
  The home Revision buttons must always be clickable and open an all-subject hub.
*/
const SUBJECTS=[
 {id:'science',name:'Science',hi:'विज्ञान',icon:'🔬',units:[
  ['पौधों में पोषण','प्रकाश संश्लेषण: प्रकाश + जल + कार्बन डाइऑक्साइड से भोजन।','याद रखो: chlorophyll प्रकाश ऊर्जा पकड़ता है।'],
  ['जीव-जगत में गति','जीवों और पौधों में गति के अलग-अलग तरीके होते हैं।','उदाहरण: चलना, तैरना, उड़ना और रेंगना।'],
  ['विद्युत परिपथ','बंद परिपथ में ही विद्युत धारा का मार्ग पूरा होता है।','सेल, तार और उपकरण मिलकर सरल circuit बनाते हैं।'],
  ['चुंबक और उसके प्रभाव','चुंबक के दो ध्रुव होते हैं; समान ध्रुव दूर धकेलते हैं।','विपरीत ध्रुव आकर्षित करते हैं।'],
  ['माप और गति','सही मात्रा के लिए सही इकाई और उपकरण चुनना जरूरी है।','दूरी, समय और गति को रोजमर्रा से जोड़ो।'],
  ['जल और उसका चक्र','वाष्पीकरण → संघनन → वर्षण जल चक्र के प्रमुख चरण हैं।','सूर्य की ऊष्मा जल चक्र को चलाती है।'],
  ['हवा और मौसम','तापमान, नमी और हवा की गति मौसम को प्रभावित करते हैं।','अलग दाब और तापमान से हवा का स्थानांतरण होता है।'],
  ['कचरा और संसाधन','कम उपयोग, पुनः उपयोग और पुनर्चक्रण संसाधन बचाते हैं।','गीला और सूखा कचरा अलग रखना सीखो।'],
  ['वस्तुओं का पृथक्करण','मिश्रण के गुण देखकर अलग करने की विधि चुनते हैं।','छानना, निथारना और वाष्पीकरण अलग स्थितियों में उपयोगी हैं।'],
  ['जीवों की विशेषताएँ','पोषण, वृद्धि, श्वसन और प्रजनन जीवन-प्रक्रियाओं के उदाहरण हैं।','जीवों को लक्षणों के समूह से पहचानो।'],
  ['प्रकाश और छाया','अपारदर्शी वस्तु प्रकाश रोककर छाया बना सकती है।','स्रोत, वस्तु और पर्दे की स्थिति से छाया बदलती है।'],
  ['हमारा सौरमंडल','सूर्य एक तारा है और ग्रह उसके चारों ओर परिक्रमा करते हैं।','घूर्णन दिन-रात और परिक्रमा वर्ष से जुड़ी है।'] ]},
 {id:'maths',name:'Maths',hi:'गणित',icon:'➗',units:[
  ['हमारे आसपास बड़ी संख्याएँ','स्थान-मूल्य से बड़ी संख्याएँ पढ़ना, लिखना और तुलना करना सीखो।','पहले अंकों की संख्या, फिर बाएँ से स्थान-मूल्य देखो।'],
  ['अंकगणितीय व्यंजक','संख्याएँ और संक्रियाएँ मिलकर व्यंजक बनाती हैं।','कोष्ठक और संक्रियाओं के क्रम को ध्यान से लागू करो।'],
  ['दशमलव के आगे एक झलक','दशमलव पूर्ण और आंशिक मात्राओं को अलग करता है।','तुलना में दशमलव स्थान-मूल्य का उपयोग करो।'],
  ['अक्षर-संख्याओं वाले व्यंजक','अक्षर अज्ञात या बदलने वाली संख्या को दर्शा सकता है।','दिए गए मान को रखकर व्यंजक का मान निकालो।'],
  ['समानांतर और प्रतिच्छेदी रेखाएँ','समानांतर रेखाएँ नहीं मिलतीं; प्रतिच्छेदी रेखाएँ मिलती हैं।','दिशा और मिलने के बिंदु से संबंध पहचानो।'],
  ['संख्या खेल','संख्या पैटर्न में नियम खोजकर अगला पद निकालते हैं।','जोड़, घटाव, गुणा आदि संभावित नियम जाँचो।'],
  ['तीन प्रतिच्छेदी रेखाओं की कहानी','रेखाओं के मिलने से कोणों और उनके संबंधों का अध्ययन होता है।','शीर्ष, भुजा और कोण पहचानो।'],
  ['भिन्नों के साथ काम','भिन्न पूरे के बराबर भागों को दर्शाते हैं।','समान हर वाले भिन्नों में अंश की तुलना करो।'] ]},
 {id:'english',name:'English',hi:'अंग्रेज़ी',icon:'🇬🇧',units:[
  ['Parts of Speech','Noun नाम देता है; pronoun noun की जगह; verb action/state बताता है।','Adjective noun को और adverb action को describe कर सकता है।'],
  ['Nouns & Pronouns','Common/proper, singular/plural और possessive forms पहचानो।','Pronoun का person और number संदर्भ से मेल होना चाहिए।'],
  ['Verbs & Tenses','Present, past और future समय का संकेत देते हैं।','Yesterday → past, tomorrow → future जैसे clues देखो।'],
  ['Adjectives & Adverbs','Adjective noun को describe करता है; adverb verb आदि को modify करता है।','Quick और quickly का सही sentence use पहचानो।'],
  ['Articles & Prepositions','a/an/the का चयन sound और context पर निर्भर करता है।','in, on, at, under, between संबंध और स्थान बताते हैं।'],
  ['Subject–Verb Agreement','Singular subject के साथ सामान्यतः singular present verb आता है।','बीच के extra words से वास्तविक subject को confuse मत करो।'],
  ['Sentences & Error Correction','Capitalization और punctuation अर्थ को स्पष्ट करते हैं।','Agreement, tense, article और word order जाँचो।'],
  ['Translation & Everyday English','सामान्य word order subject + verb + object होता है।','शब्द-दर-शब्द नहीं, natural meaning पर ध्यान दो।'] ]},
 {id:'hindi',name:'Hindi',hi:'हिंदी',icon:'🪔',units:[
  ['संज्ञा','व्यक्ति, स्थान, वस्तु, प्राणी या भाव के नाम संज्ञा हैं।','खास नाम और भाव के नाम भी उदाहरण हो सकते हैं।'],
  ['सर्वनाम','संज्ञा के स्थान पर आने वाले शब्द सर्वनाम हैं।','मैं, हम, तुम, वह, वे जैसे शब्द पहचानो।'],
  ['विशेषण','संज्ञा या सर्वनाम की विशेषता बताने वाले शब्द विशेषण हैं।','रंग, आकार, संख्या और गुण के शब्द पहचानो।'],
  ['क्रिया','काम या अवस्था बताने वाले शब्द क्रिया कहलाते हैं।','वाक्य में कौन-सा काम हो रहा है, यह पूछो।'],
  ['काल','क्रिया के समय से वर्तमान, भूत और भविष्य का पता चलता है।','कल, आज, कल आने वाला जैसे समय-सूचक शब्द देखो।'],
  ['लिंग और वचन','शब्द के स्त्री/पुल्लिंग और एक/अनेक रूप पहचानो।','वाक्य में संबंधित शब्दों का मेल जाँचो।'],
  ['वाक्य-विन्यास','शब्दों का सही क्रम वाक्य का अर्थ स्पष्ट करता है।','कर्ता, क्रिया और कर्म का संबंध पहचानो।'],
  ['वर्तनी और विराम-चिह्न','सही वर्तनी और विराम-चिह्न लिखित भाषा को स्पष्ट बनाते हैं।','पूर्णविराम, प्रश्नवाचक और अल्पविराम का सही उपयोग करो।'] ]},
 {id:'gk',name:'GK + Reasoning',hi:'सामान्य ज्ञान + रीजनिंग',icon:'🧠',units:[
  ['भारत का भूगोल','राज्य, राजधानी, नदियाँ और प्रमुख भौगोलिक क्षेत्र दोहराओ।','मानचित्र पर दिशा और स्थान पहचानने का अभ्यास करो।'],
  ['भारत का संविधान और राष्ट्रीय प्रतीक','राष्ट्रीय प्रतीक और नागरिक जीवन से जुड़े मूल तथ्य याद करो।','तथ्य को रटने के बजाय उसके अर्थ से जोड़ो।'],
  ['विश्व और महाद्वीप','महाद्वीप, महासागर और प्रमुख देश/राजधानियाँ पहचानो।','मानचित्र देखकर स्थान याद करने का अभ्यास करो।'],
  ['विज्ञान सामान्य ज्ञान','दैनिक जीवन के वैज्ञानिक तथ्य और खोजें दोहराओ।','क्यों और कैसे वाले प्रश्न पूछकर याददाश्त मजबूत करो।'],
  ['संख्या श्रृंखला','श्रृंखला में जोड़, घटाव, गुणा या alternating rule खोजो।','पहले लगातार दो-तीन अंतर जाँचो।'],
  ['सादृश्य और वर्गीकरण','समान संबंध या साझा गुण के आधार पर उत्तर चुनो।','शब्दों/वस्तुओं के बीच संबंध स्पष्ट करो।'],
  ['दिशा और रक्त-संबंध','दिशा प्रश्नों में उत्तर-दिशा और रिश्तों का क्रम ध्यान से पढ़ो।','छोटा diagram बनाकर reasoning करो।'],
  ['कोडिंग-डिकोडिंग और तर्क','अक्षर/संख्या परिवर्तन के नियम को पहचानकर लागू करो।','दिए गए उदाहरणों से rule पहले verify करो।'] ]},
 {id:'sst',name:'Social Science',hi:'सामाजिक विज्ञान',icon:'🌍',units:[
  ['पृथ्वी पर स्थानों का पता लगाना','मानचित्र, दिशा, अक्षांश और देशांतर स्थान बताने के आधार हैं।','Active recall: किसी स्थान की स्थिति को दिशा और grid से समझाओ।'],
  ['महासागर और महाद्वीप','पृथ्वी की सतह पर महाद्वीप और महासागर बड़े भौगोलिक क्षेत्र बनाते हैं।','Active recall: सात महाद्वीप और पाँच महासागर मानचित्र पर पहचानो।'],
  ['स्थलरूप और जीवन','पर्वत, पठार और मैदान मानव जीवन, जलवायु और आजीविका को प्रभावित करते हैं।','Active recall: एक स्थलरूप और उससे जुड़ी आजीविका का उदाहरण दो।'],
  ['इतिहास की समयरेखा और स्रोत','पुरातात्त्विक, लिखित और मौखिक स्रोत अतीत को समझने में मदद करते हैं।','Active recall: किसी ऐतिहासिक प्रश्न के लिए दो स्रोत चुनो।'],
  ['भारत, अर्थात् भारत','भारत की भौगोलिक विविधता और नामों की ऐतिहासिक-सांस्कृतिक पृष्ठभूमि समझो।','Active recall: भारत की विविधता का मानचित्र-आधारित उदाहरण दो।'],
  ['भारतीय सभ्यता की शुरुआत','प्रारंभिक बस्तियों, कृषि, शिल्प और नगर जीवन ने सभ्यता के विकास को आकार दिया।','Active recall: स्थायी बस्ती बनने के दो कारण बताओ।'],
  ['भारत की सांस्कृतिक जड़ें','भाषा, परंपरा, कला, ज्ञान और उत्सव सांस्कृतिक विरासत बनाते हैं।','Active recall: अपनी स्थानीय संस्कृति का एक उदाहरण समझाओ।'],
  ['विविधता में एकता — अनेक में एक','भारत में विविध भाषाएँ, भोजन, पहनावे और परंपराएँ साझा नागरिकता के साथ रहती हैं।','Active recall: विविधता और एकता दोनों का एक-एक उदाहरण दो।'],
  ['परिवार और समुदाय','परिवार और समुदाय सहयोग, जिम्मेदारी और सामाजिक सीख के महत्वपूर्ण स्थान हैं।','Active recall: समुदाय की किसी समस्या में सहयोग कैसे होगा?'],
  ['जमीनी लोकतंत्र — भाग 1: शासन','शासन नियम, संस्थाओं और नागरिक भागीदारी के माध्यम से समाज चलाता है।','Active recall: स्थानीय समस्या पर नागरिक किस संस्था से जुड़ सकते हैं?'],
  ['जमीनी लोकतंत्र — भाग 2: ग्रामीण स्थानीय सरकार','ग्राम पंचायत जैसे स्थानीय निकाय गाँव की जरूरतों और विकास में भूमिका निभाते हैं।','Active recall: गाँव की एक सार्वजनिक समस्या और संभावित समाधान बताओ।'],
  ['जमीनी लोकतंत्र — भाग 3: शहरी स्थानीय सरकार','नगर निकाय पानी, सफाई, सड़क और अन्य स्थानीय सेवाओं में भूमिका निभाते हैं।','Active recall: अपने शहर की तीन स्थानीय सेवाएँ गिनाओ।'],
  ['आजीविका और आर्थिक जीवन','लोग खेती, व्यापार, सेवा, शिल्प और अन्य कामों से आजीविका कमाते हैं।','Active recall: किसी वस्तु को उत्पादन से उपभोग तक की यात्रा समझाओ।'],
  ['विविधता, संसाधन और हमारा भविष्य','संसाधनों का समझदारी से उपयोग और समान अवसर टिकाऊ भविष्य के लिए जरूरी हैं।','Active recall: किसी स्थानीय संसाधन को बचाने का एक उपाय बताओ।'] ]}
];

const KEY='class6RevisionDoneV2';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const done=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
const save=d=>{try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}};
let state={subject:'all',filter:'all',q:''};
function allUnits(){return SUBJECTS.flatMap(s=>s.units.map((u,i)=>({s,u,i,key:s.id+'-'+i})))}
function score(x){const d=done();return d[x.key]?1:0}
function render(){
 const plan=document.getElementById('revisionPlan'), content=document.getElementById('revisionContent'); if(!plan||!content)return;
 const units=allUnits(), completed=units.reduce((n,x)=>n+score(x),0), strong=units.filter(x=>score(x)).length;
 const filtered=units.filter(x=>{
   const subject=state.subject==='all'||x.s.id===state.subject;
   const text=(x.u[0]+' '+x.u[1]+' '+x.u[2]+' '+x.s.name+' '+x.s.hi).toLowerCase();
   const query=!state.q||text.includes(state.q.toLowerCase());
   const filter=state.filter==='done'?score(x):state.filter==='todo'?!score(x):true;
   return subject&&query&&filter;
 });
 const subjectsStarted=SUBJECTS.filter(s=>s.units.some((u,i)=>score({key:s.id+'-'+i}))).length;
 plan.innerHTML=`<div class="revision-stats"><div><b>${units.length}</b><span>Revision units</span></div><div><b>${units.length-completed}</b><span>Priority / due</span></div><div><b>${completed}</b><span>Revised</span></div><div><b>${subjectsStarted}/6</b><span>Subjects started</span></div></div><div class="revision-controls"><div class="revision-tabs"><button class="${state.subject==='all'?'active':''}" data-sub="all">✨ All</button>${SUBJECTS.map(s=>`<button class="${state.subject===s.id?'active':''}" data-sub="${s.id}">${s.icon} ${esc(s.hi)}</button>`).join('')}</div><div class="revision-tools"><input id="revisionSearchInput" type="search" placeholder="🔎 Topic, chapter, subject खोजें…" value="${esc(state.q)}" autocomplete="off"><select id="revisionFilter"><option value="all" ${state.filter==='all'?'selected':''}>सभी topics</option><option value="todo" ${state.filter==='todo'?'selected':''}>अभी revise करना है</option><option value="done" ${state.filter==='done'?'selected':''}>Revised / maintenance</option></select></div></div>`;
 content.innerHTML=`<div class="revision-results-head"><div><h2>📚 Revision Library</h2><p class="muted">${filtered.length} topics • पहले weak / pending topics पूरा करो।</p></div></div><div class="revision-grid">${filtered.map(x=>{const isDone=score(x);return `<article class="revision-unit ${isDone?'is-done':''}"><div class="revision-unit-top"><span class="revision-subject">${x.s.icon} ${esc(x.s.hi)}</span><span class="revision-status">${isDone?'✓ Revised':'Priority'}</span></div><h3>${esc(x.u[0])}</h3><p>${esc(x.u[1])}</p><div class="revision-recall"><b>🧠 Active Recall</b><span>${esc(x.u[2])}</span></div><div class="revision-unit-actions"><button class="revision-done-btn" data-key="${x.key}">${isDone?'↩ फिर से revise':'✓ मैंने revise किया'}</button><a href="${x.s.id==='sst'?'subjects/social-science/index.html':x.s.id==='gk'?'subjects/gk/index.html':'subjects/all-classes.html'}">Lesson खोलो ↗</a></div></article>`}).join('')||'<div class="revision-empty"><b>कोई topic नहीं मिला</b><p>Search बदलकर फिर कोशिश करो।</p></div>'}</div>`;
 bind();
}
function bind(){
 document.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{state.subject=b.dataset.sub;render()});
 const input=document.getElementById('revisionSearchInput'); if(input){input.oninput=()=>{state.q=input.value.trim();render();};input.onkeydown=e=>{if(e.key==='Escape'){state.q='';render();}}}
 const filter=document.getElementById('revisionFilter'); if(filter)filter.onchange=()=>{state.filter=filter.value;render()};
 document.querySelectorAll('.revision-done-btn').forEach(b=>b.onclick=()=>{const d=done();if(d[b.dataset.key])delete d[b.dataset.key];else d[b.dataset.key]=Date.now();save(d);render()});
}
function injectStyle(){if(document.getElementById('revisionHubStyle'))return;const st=document.createElement('style');st.id='revisionHubStyle';st.textContent=`
#revisionView .revision-page{width:100%;max-width:1180px;margin:0 auto;padding:8px 0 50px;min-width:0}#revisionView .revision-page-head{margin:8px 0 18px}#revisionView .revision-page-head h1{margin:8px 0 6px;font-size:clamp(1.7rem,4vw,2.5rem)}
.revision-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0 0 16px}.revision-stats>div{background:var(--card,#fff);border:1px solid var(--border,#ddd);border-radius:16px;padding:16px}.revision-stats b{display:block;font-size:1.45rem}.revision-stats span{font-size:.82rem;opacity:.7}.revision-controls{background:var(--card,#fff);border:1px solid var(--border,#ddd);border-radius:18px;padding:14px;margin-bottom:16px}.revision-tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:10px}.revision-tabs button{border:1px solid var(--border,#ddd);background:transparent;border-radius:999px;padding:9px 13px;white-space:nowrap;cursor:pointer}.revision-tabs button.active{background:var(--text,#20252b);color:#fff}.revision-tools{display:flex;gap:10px}.revision-tools input,.revision-tools select{min-height:44px;border:1px solid var(--border,#ddd);border-radius:12px;padding:0 12px;background:inherit;color:inherit}.revision-tools input{flex:1;min-width:0}.revision-tools select{width:210px}.revision-results-head{margin:4px 0 12px}.revision-results-head h2{margin:0 0 4px}.revision-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.revision-unit{background:var(--card,#fff);border:1px solid var(--border,#ddd);border-radius:18px;padding:16px;min-width:0}.revision-unit.is-done{opacity:.78}.revision-unit-top{display:flex;justify-content:space-between;gap:8px;align-items:center}.revision-subject,.revision-status{font-size:.78rem;font-weight:700}.revision-status{padding:5px 9px;border-radius:999px;background:rgba(127,127,127,.12)}.revision-unit h3{margin:10px 0 7px}.revision-unit p{margin:0;line-height:1.6}.revision-recall{margin-top:12px;padding:11px;border-radius:12px;background:rgba(127,127,127,.08);display:grid;gap:4px}.revision-recall span{line-height:1.5}.revision-unit-actions{display:flex;gap:9px;align-items:center;margin-top:13px}.revision-unit-actions button,.revision-unit-actions a{min-height:42px;border-radius:11px;padding:9px 12px;border:1px solid var(--border,#ddd);background:transparent;color:inherit;text-decoration:none;cursor:pointer}.revision-unit-actions button{font-weight:700}.revision-empty{text-align:center;padding:40px;border:1px dashed var(--border,#ddd);border-radius:16px;grid-column:1/-1}@media(max-width:760px){.revision-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.revision-grid{grid-template-columns:1fr}.revision-tools{flex-direction:column}.revision-tools select{width:100%}}@media(max-width:480px){#revisionView .revision-page{padding-bottom:28px}.revision-stats{gap:8px}.revision-stats>div{padding:12px}.revision-unit{padding:13px}.revision-unit-actions{flex-direction:column;align-items:stretch}.revision-unit-actions button,.revision-unit-actions a{text-align:center;width:100%;box-sizing:border-box}}
`;document.head.appendChild(st)}
function openUnifiedRevision(){injectStyle();document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));const view=document.getElementById('revisionView');if(!view)return;view.classList.remove('hidden');state={subject:'all',filter:'all',q:''};render();window.scrollTo({top:0,behavior:'smooth'})}
window.openUnifiedRevision=openUnifiedRevision;window.openRevision=openUnifiedRevision;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectStyle,{once:true});else injectStyle();
})();
