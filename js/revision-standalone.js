(function(){
'use strict';
const root=document.getElementById('app');
const SUBJECTS=[
 {id:'science',hi:'विज्ञान',en:'Science',icon:'🔬',units:[
  ['पौधों में पोषण','पौधे प्रकाश संश्लेषण के द्वारा अपना भोजन बनाते हैं।','प्रकाश, जल, कार्बन डाइऑक्साइड और chlorophyll की भूमिका समझो।'],
  ['जीव-जगत में गति','जीवों और पौधों में गति के अलग-अलग तरीके दिखाई देते हैं।','चलना, तैरना, उड़ना और पौधों की दिशा-आधारित गति उदाहरण हैं।'],
  ['विद्युत परिपथ','विद्युत धारा के लिए बंद परिपथ आवश्यक है।','सेल, तार, स्विच और बल्ब मिलकर सरल circuit बनाते हैं।'],
  ['चुंबक और उसके प्रभाव','चुंबक कुछ धातुओं को आकर्षित करता है और उसके दो ध्रुव होते हैं।','समान ध्रुव दूर धकेलते हैं और विपरीत ध्रुव आकर्षित करते हैं।'],
  ['माप और गति','सही माप के लिए उचित इकाई और उपकरण चुनना जरूरी है।','दूरी, समय और गति को दैनिक जीवन के उदाहरणों से जोड़ो।'],
  ['जल और उसका चक्र','वाष्पीकरण, संघनन और वर्षण जल चक्र के प्रमुख चरण हैं।','सूर्य की ऊष्मा जल के एक अवस्था से दूसरी अवस्था में जाने में मदद करती है।'],
  ['हवा और मौसम','तापमान, नमी और हवा की गति मौसम को प्रभावित करती है।','अलग परिस्थितियों में हवा की दिशा और गति बदल सकती है।'],
  ['कचरा और संसाधन','कचरा कम करना, पुनः उपयोग और पुनर्चक्रण संसाधन बचाते हैं।','गीले और सूखे कचरे को अलग करना बेहतर प्रबंधन की पहली सीढ़ी है।'],
  ['वस्तुओं का पृथक्करण','मिश्रण को अलग करने के लिए उसके घटकों के गुणों को पहचानना पड़ता है।','छानना, निथारना, छनन और वाष्पीकरण अलग परिस्थितियों में उपयोगी हैं।'],
  ['जीवों की विशेषताएँ','जीवों में वृद्धि, पोषण, श्वसन और प्रजनन जैसी जीवन-प्रक्रियाएँ होती हैं।','जीव को पहचानने के लिए अनेक लक्षणों को साथ देखो।'],
  ['प्रकाश और छाया','प्रकाश सीधी रेखा में चलता है और अपारदर्शी वस्तु छाया बना सकती है।','प्रकाश स्रोत, वस्तु और पर्दे की स्थिति बदलने से छाया बदलती है।'],
  ['हमारा सौरमंडल','सूर्य एक तारा है और ग्रह उसके चारों ओर परिक्रमा करते हैं।','पृथ्वी का घूर्णन दिन-रात से और परिक्रमा वर्ष से जुड़ी है।'] ]},
 {id:'maths',hi:'गणित',en:'Maths',icon:'➗',units:[
  ['बड़ी संख्याएँ','स्थान-मूल्य की मदद से बड़ी संख्याएँ पढ़ना, लिखना और तुलना करना सीखो।','अंकों की संख्या और फिर बाएँ से स्थान-मूल्य देखकर तुलना करो।'],
  ['अंकगणितीय व्यंजक','संख्याएँ और संक्रियाएँ मिलकर गणितीय व्यंजक बनाती हैं।','कोष्ठक और संक्रियाओं के क्रम का सही उपयोग करो।'],
  ['दशमलव','दशमलव पूर्ण और आंशिक मात्राओं को एक ही संख्या में दिखा सकता है।','दशमलव की तुलना स्थान-मूल्य के आधार पर करो।'],
  ['चर वाले व्यंजक','अक्षर किसी अज्ञात या बदलने वाली संख्या का प्रतिनिधित्व कर सकता है।','एक ही चर को उसके दिए मान से बदलकर व्यंजक का मान निकालो।'],
  ['समानांतर और प्रतिच्छेदी रेखाएँ','समानांतर रेखाएँ नहीं मिलतीं, जबकि प्रतिच्छेदी रेखाएँ एक बिंदु पर मिलती हैं।','रेखाओं की दिशा और उनके मिलने के बिंदु से संबंध पहचानो।'],
  ['संख्या पैटर्न','संख्या श्रेणी में छिपे नियम को पहचानकर अगला पद निकाला जा सकता है।','पहले जोड़, घटाव, गुणा या भाग जैसे सरल नियम जाँचो।'],
  ['तीन प्रतिच्छेदी रेखाएँ','तीन रेखाओं के मिलने से अनेक कोण और उनके संबंध बनते हैं।','शीर्ष, भुजा और कोण को साफ चित्र में पहचानो।'],
  ['भिन्न','भिन्न पूरे के बराबर भाग को दर्शाता है।','अंश, हर और समतुल्य भिन्नों का संबंध समझो।'] ]},
 {id:'english',hi:'अंग्रेज़ी',en:'English',icon:'📖',units:[
  ['Parts of Speech','Noun नाम देता है, pronoun noun की जगह आता है और verb action/state बताता है।','Adjective noun को और adverb action को अधिक स्पष्ट कर सकता है।'],
  ['Nouns & Pronouns','Common, proper, singular और plural nouns पहचानो।','Pronoun का number और person उसके संदर्भ से मेल खाना चाहिए।'],
  ['Verbs & Tenses','Present, past और future forms समय का संकेत देती हैं।','Yesterday, now, tomorrow और habitual action जैसे clues ध्यान से देखो।'],
  ['Adjectives & Adverbs','Adjective noun की विशेषता बताता है और adverb verb या adjective को modify कर सकता है।','Sentence में सही form चुनने के लिए उसके काम को पहचानो।'],
  ['Articles & Prepositions','a, an और the का चयन sound तथा context पर निर्भर करता है।','in, on, at, under और between संबंध या स्थान बताते हैं।'],
  ['Subject–Verb Agreement','Subject और verb का number आपस में मेल होना चाहिए।','बीच के extra words देखकर असली subject को नजरअंदाज मत करो।'],
  ['Sentence & Error Correction','Capital letters, punctuation और सही word order sentence को स्पष्ट बनाते हैं।','Agreement, tense, article और spelling जैसी common errors जाँचो।'],
  ['Translation & Everyday English','अच्छे translation में अर्थ और natural expression दोनों महत्वपूर्ण हैं।','शब्द-दर-शब्द अनुवाद के बजाय पूरे sentence का अर्थ पकड़ो।'] ]},
 {id:'hindi',hi:'हिंदी',en:'Hindi',icon:'🪔',units:[
  ['संज्ञा','व्यक्ति, स्थान, वस्तु, प्राणी या भाव के नाम को संज्ञा कहते हैं।','व्यक्तिवाचक, जातिवाचक और भाववाचक उदाहरणों को पहचानो।'],
  ['सर्वनाम','जो शब्द संज्ञा के स्थान पर आते हैं, वे सर्वनाम कहलाते हैं।','मैं, हम, तुम, वह और वे जैसे शब्द संदर्भ के अनुसार समझो।'],
  ['विशेषण','संज्ञा या सर्वनाम की विशेषता बताने वाला शब्द विशेषण है।','रंग, आकार, संख्या या गुण बताने वाले शब्द पहचानो।'],
  ['क्रिया','जिस शब्द से काम करने या होने का बोध हो, वह क्रिया है।','कर्ता क्या कर रहा है या क्या हो रहा है, यह देखकर क्रिया खोजो।'],
  ['काल','क्रिया के समय का बोध वर्तमान, भूत या भविष्य काल से होता है।','कल, आज और आने वाले समय जैसे संकेतों से काल पहचानो।'],
  ['लिंग और वचन','लिंग से पुल्लिंग-स्त्रीलिंग और वचन से एकवचन-बहुवचन का बोध होता है।','शब्द का सही रूप sentence के अनुसार चुनो।'],
  ['वाक्य रचना','शब्दों को सही क्रम में रखकर अर्थपूर्ण वाक्य बनाया जाता है।','कर्ता, क्रिया और कर्म के संबंध को समझकर sentence बनाओ।'],
  ['वर्तनी और विराम-चिह्न','सही spelling और punctuation लिखित भाषा को स्पष्ट बनाते हैं।','पूर्ण विराम, प्रश्नवाचक और अल्पविराम का उचित प्रयोग करो।'] ]},
 {id:'gk',hi:'सामान्य ज्ञान + तर्क',en:'GK + Reasoning',icon:'🧠',units:[
  ['भारत का परिचय','भारत की भौगोलिक और सांस्कृतिक विविधता उसे विशेष बनाती है।','राज्य, राजधानी, नदियाँ, पर्वत और प्रमुख प्रतीकों को जोड़कर याद करो।'],
  ['विश्व और महाद्वीप','पृथ्वी पर सात महाद्वीप और पाँच प्रमुख महासागर माने जाते हैं।','मानचित्र पर महाद्वीपों और महासागरों की स्थिति पहचानो।'],
  ['विज्ञान और दैनिक जीवन','दैनिक जीवन की अनेक घटनाओं के पीछे सरल वैज्ञानिक कारण होते हैं।','देखी हुई घटना से कारण तक सोचने की आदत बनाओ।'],
  ['पर्यावरण जागरूकता','जल, वायु, मिट्टी, वन और जीव-जंतु हमारे पर्यावरण का हिस्सा हैं।','संसाधनों का समझदारी से उपयोग और संरक्षण जरूरी है।'],
  ['महत्वपूर्ण व्यक्तित्व और घटनाएँ','इतिहास और समाज को समझने के लिए प्रमुख व्यक्तियों और घटनाओं का संदर्भ जानना उपयोगी है।','व्यक्ति, घटना और उसके प्रभाव को साथ याद करो।'],
  ['संख्या और अक्षर श्रेणी','Series में अगला पद निकालने के लिए नियम खोजा जाता है।','अंतर, गुणक या अक्षरों की क्रमिक स्थिति जाँचो।'],
  ['दिशा और संबंध तर्क','दिशा, स्थान और संबंध आधारित प्रश्नों में जानकारी को क्रमबद्ध करना जरूरी है।','उत्तर देने से पहले छोटा mental diagram बनाओ।'],
  ['समानता और वर्गीकरण','Analogy और classification में वस्तुओं के बीच साझा नियम पहचाना जाता है।','पहले संबंध खोजो, फिर विकल्पों में वही संबंध लागू करो।'] ]},
 {id:'social',hi:'सामाजिक विज्ञान',en:'Social Science',icon:'🌍',units:[
  ['पृथ्वी पर स्थानों का पता लगाना','मानचित्र, दिशा और अक्षांश-देशांतर किसी स्थान को पहचानने में मदद करते हैं।','स्थान बताने के लिए पैमाना, दिशा और coordinates को साथ समझो।'],
  ['महासागर और महाद्वीप','पृथ्वी की बड़ी स्थल-राशियों को महाद्वीप और विशाल जल-भागों को महासागर कहते हैं।','विश्व मानचित्र पर उनके आकार और स्थान की तुलना करो।'],
  ['स्थलरूप और जीवन','पर्वत, पठार, मैदान और तटीय क्षेत्र लोगों के जीवन को प्रभावित करते हैं।','भू-आकृति और वहाँ की आजीविका के बीच संबंध देखो।'],
  ['इतिहास की समयरेखा और स्रोत','इतिहास को समझने के लिए घटनाओं का क्रम और उनके स्रोत महत्वपूर्ण हैं।','शिलालेख, सिक्के, ग्रंथ और पुरातात्त्विक अवशेष clues देते हैं।'],
  ['भारत, अर्थात् भारत','भारत की पहचान उसकी भौगोलिक सीमा, लोगों और विविध सांस्कृतिक परंपराओं से जुड़ती है।','देश को समझते समय भूगोल और संस्कृति को साथ देखो।'],
  ['भारतीय सभ्यता की शुरुआत','प्राचीन सभ्यताओं में नगर, कृषि, शिल्प और व्यापार के प्रमाण मिलते हैं।','पुरातात्त्विक वस्तुओं से उस समय के जीवन के बारे में निष्कर्ष निकालो।'],
  ['भारत की सांस्कृतिक जड़ें','भाषा, कला, परंपरा, त्योहार और विचार पीढ़ियों से संस्कृति को समृद्ध करते हैं।','विविध परंपराओं में साझा मानवीय मूल्यों को पहचानो।'],
  ['विविधता में एकता — अनेक में एक','भारत में अलग-अलग भाषाएँ, भोजन, पोशाक और परंपराएँ मिलती हैं।','विविधता के बीच साझा नियम, अनुभव और नागरिकता एकता बनाते हैं।'],
  ['परिवार और समुदाय','परिवार और समुदाय सहयोग, जिम्मेदारी और सीखने के अवसर देते हैं।','घर और पड़ोस में अलग-अलग भूमिकाओं को समझो।'],
  ['जमीनी लोकतंत्र — भाग 1: शासन','शासन में निर्णय लेने और सार्वजनिक सुविधाएँ चलाने की संस्थाएँ शामिल होती हैं।','स्थानीय समस्याओं और उन्हें सुलझाने वाली संस्थाओं का संबंध देखो।'],
  ['जमीनी लोकतंत्र — भाग 2: ग्रामीण स्थानीय सरकार','गाँवों में स्थानीय सरकार लोगों की रोज़मर्रा की जरूरतों से जुड़े निर्णय लेती है।','ग्राम सभा और ग्राम पंचायत की भूमिकाएँ अलग-अलग पहचानो।'],
  ['जमीनी लोकतंत्र — भाग 3: शहरी स्थानीय सरकार','शहरों में स्थानीय निकाय सफाई, सड़क, पानी और अन्य सेवाओं की देखभाल करते हैं।','नगर निकाय और नागरिक जिम्मेदारियों का संबंध समझो।'],
  ['आजीविका और आर्थिक जीवन','लोग अलग-अलग काम करके आय अर्जित करते हैं और समाज की जरूरतें पूरी करते हैं।','काम, आय, कौशल और बाजार के बीच संबंध देखो।'],
  ['विविधता, संसाधन और हमारा भविष्य','संसाधनों का न्यायपूर्ण और टिकाऊ उपयोग आने वाली पीढ़ियों के लिए जरूरी है।','आज के फैसलों का भविष्य के पर्यावरण और समाज पर असर सोचो।'] ]}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
let state={screen:'subjects',sid:null,cid:0,card:0,flip:false,query:''};
function getSubject(id){return SUBJECTS.find(s=>s.id===id)}
function goSubjects(){state.screen='subjects';state.sid=null;state.query='';paint()}
function goChapters(id){if(!getSubject(id))return;state.screen='chapters';state.sid=id;state.query='';paint()}
function goDeck(id,cid){const s=getSubject(id);if(!s||!s.units[cid])return;state.screen='deck';state.sid=id;state.cid=Number(cid);state.card=0;state.flip=false;paint()}
function makeCards(u){const [t,a,b]=u;return [
 ['🎯 मुख्य विचार',a,`याद रखो: ${a}`],
 ['⭐ जरूरी तथ्य',b,`यह key point ${t} को पहचानने में मदद करता है: ${b}`],
 ['💡 सरल समझ',`इस topic को अपनी भाषा में समझो — ${a.toLowerCase()}`,`जब मूल विचार स्पष्ट हो जाता है तो ${b.toLowerCase()}`],
 ['🏠 उदाहरण',`${t} को किसी वास्तविक स्थिति से जोड़ो।`,`सोचो कि रोज़मर्रा की जिंदगी में ${b.toLowerCase()}`],
 ['🔗 संबंध',`${a} और ${b}`,`पहला point मुख्य idea बताता है और दूसरा उसी idea की विशेषता या application स्पष्ट करता है।`],
 ['⚠️ गलती से बचो','केवल definition रटकर answer खत्म मत करो।',`जहाँ जरूरी हो वहाँ कारण, तुलना या उदाहरण भी दो। इस topic का आधार है: ${a}`],
 ['🚀 उपयोग',`${t} की जानकारी कहाँ काम आती है?`,`किसी नई situation में concept पहचानो और फिर यह fact लागू करो: ${b}`],
 ['📝 Exam recap',`${a} ${b}`,`परीक्षा से पहले दोनों points बिना किताब देखे बोलो और एक छोटा example खुद बनाओ।`]
 ]}
function paint(){
 if(!root)return;
 if(state.screen==='subjects'){
  const q=state.query.trim().toLowerCase();
  const filtered=SUBJECTS.filter(s=>!q||`${s.hi} ${s.en} ${s.units.map(u=>u[0]).join(' ')}`.toLowerCase().includes(q));
  const total=SUBJECTS.reduce((n,s)=>n+s.units.length,0);
  root.innerHTML=`<section class="rv-hero"><h1>🧠 Smart Revision Hub</h1><p>सभी subjects को व्यवस्थित तरीके से revise करो — subject चुनो, chapter चुनो और फिर 8 study cards पढ़ो।</p><div class="rv-stats"><div class="rv-stat"><b>6</b><span>Subjects</span></div><div class="rv-stat"><b>${total}</b><span>Chapters</span></div><div class="rv-stat"><b>8</b><span>Cards / chapter</span></div><div class="rv-stat"><b>${total*8}</b><span>Total cards</span></div></div></section><div class="rv-section"><input id="search" class="rv-search" placeholder="किसी subject या chapter को खोजें…" value="${esc(state.query)}"><div id="subjectGrid" class="rv-grid">${filtered.map(s=>`<article class="rv-sub" data-open-subject="${s.id}" tabindex="0" role="button"><div class="rv-icon">${s.icon}</div><h2>${esc(s.hi)}</h2><div class="rv-muted">${esc(s.en)} • ${s.units.length} chapters • ${s.units.length*8} cards</div><p class="rv-muted">मुख्य विचार • जरूरी तथ्य • सरल समझ • उदाहरण • संबंध • सावधानी • उपयोग • exam recap</p><button class="rv-btn" type="button">Chapters देखें →</button></article>`).join('')}</div></div>`;
  document.getElementById('search').oninput=e=>{state.query=e.target.value;paint()};return;
 }
 if(state.screen==='chapters'){
  const s=getSubject(state.sid);if(!s){goSubjects();return}
  root.innerHTML=`<section class="rv-hero"><button id="backSubjects" class="rv-back" type="button">← Subjects</button><h1 style="margin-top:16px">${s.icon} ${esc(s.hi)}</h1><p>${s.units.length} chapters • हर chapter में 8 study cards</p></section><div class="rv-section"><div class="rv-chapters">${s.units.map((u,i)=>`<article class="rv-ch"><div class="rv-icon">🃏</div><div class="rv-ch-main"><b>Chapter ${i+1} · ${esc(u[0])}</b><small>${esc(u[1])}</small><span class="rv-chip">8 cards</span></div><button class="rv-btn" type="button" data-open-chapter="${i}">Revise →</button></article>`).join('')}</div></div>`;
  document.getElementById('backSubjects').onclick=goSubjects;return;
 }
 const s=getSubject(state.sid),u=s?.units?.[state.cid];if(!s||!u){goSubjects();return}
 const cs=makeCards(u),c=cs[state.card];
 root.innerHTML=`<div class="rv-deck"><button id="backChapters" class="rv-back" type="button">← Chapters</button><section class="rv-hero" style="margin-top:12px"><h1 style="font-size:clamp(23px,4vw,34px)">${s.icon} ${esc(s.hi)} · Chapter ${state.cid+1}</h1><p>${esc(u[0])} • Card ${state.card+1} / ${cs.length}</p><div class="rv-progress"><i style="width:${(state.card+1)/cs.length*100}%"></i></div></section><div class="rv-card" style="margin-top:14px"><div id="face" class="rv-face ${state.flip?'flip':''}" tabindex="0" role="button" aria-label="Card flip करें"><article class="rv-side"><div class="rv-kicker">${esc(c[0])}</div><h2>${esc(c[1])}</h2><div class="rv-tip">इसे अपने शब्दों में समझो, फिर flip करके recap देखो।</div></article><article class="rv-side back"><div class="rv-kicker">RECAP + ACTIVE RECALL</div><p>${esc(c[2])}</p><div class="rv-tip">अब किताब बंद करके एक छोटा example या one-line answer बोलो।</div></article></div></div><div class="rv-controls"><button id="prev" class="rv-back" type="button" ${state.card?'':'disabled'}>← Previous</button><button id="flip" class="rv-btn" type="button">${state.flip?'Front':'Flip card'}</button><button id="next" class="rv-btn" type="button">${state.card===cs.length-1?'Finish':'Next →'}</button></div></div>`;
 document.getElementById('backChapters').onclick=()=>goChapters(s.id);
 const flip=()=>{state.flip=!state.flip;paint()};document.getElementById('face').onclick=flip;document.getElementById('face').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}};document.getElementById('flip').onclick=flip;
 document.getElementById('prev').onclick=()=>{if(state.card){state.card--;state.flip=false;paint()}};
 document.getElementById('next').onclick=()=>{if(state.card<cs.length-1){state.card++;state.flip=false;paint()}else{const key=`${s.id}:${state.cid}`;const done=JSON.parse(localStorage.getItem('class6StandaloneRevision')||'{}');done[key]=Date.now();localStorage.setItem('class6StandaloneRevision',JSON.stringify(done));goChapters(s.id)}};
 document.getElementById('face').focus();
}
root.addEventListener('click',e=>{const sub=e.target.closest('[data-open-subject]');if(sub){goChapters(sub.dataset.openSubject);return}const ch=e.target.closest('[data-open-chapter]');if(ch){goDeck(state.sid,ch.dataset.openChapter)}});
root.addEventListener('keydown',e=>{const sub=e.target.closest('[data-open-subject]');if(sub&&(e.key==='Enter'||e.key===' ')){e.preventDefault();goChapters(sub.dataset.openSubject)}});
paint();
})();
