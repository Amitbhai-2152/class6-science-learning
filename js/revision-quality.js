(function(){
'use strict';

const DATA={
 science:{hi:'विज्ञान',icon:'🔬',chapters:[
 ['पौधों में पोषण','पौधे प्रकाश संश्लेषण द्वारा अपना भोजन बनाते हैं। प्रकाश, जल, कार्बन डाइऑक्साइड और chlorophyll इसमें महत्वपूर्ण हैं।','हरित पौधे','प्रकाश संश्लेषण','chlorophyll'],
 ['जीव-जगत में गति','जीवों में गति शरीर या शरीर के किसी भाग की स्थिति बदलने के रूप में दिखाई देती है। अलग-अलग जीवों की गति अलग होती है।','चलना','रेंगना','तैरना'],
 ['विद्युत परिपथ','बल्ब तभी जलता है जब विद्युत पथ पूरा हो। सेल, तार, स्विच और बल्ब मिलकर सरल परिपथ बना सकते हैं।','cell','closed circuit','switch'],
 ['चुंबक और उसके प्रभाव','चुंबक कुछ पदार्थों को आकर्षित करता है और उसके उत्तर तथा दक्षिण ध्रुव होते हैं। विपरीत ध्रुव आकर्षित करते हैं।','चुंबकीय पदार्थ','ध्रुव','आकर्षण'],
 ['माप और गति','मापन के लिए उपयुक्त इकाई और उपकरण चुनना जरूरी है। दूरी और समय जैसी राशियाँ गति को समझने में मदद करती हैं।','लंबाई','समय','गति'],
 ['जल और उसका चक्र','सूर्य की ऊष्मा से जल वाष्पित होता है, ऊपर जाकर ठंडा होकर संघनित होता है और फिर वर्षण हो सकता है।','वाष्पीकरण','संघनन','वर्षण'],
 ['हवा और मौसम','मौसम को तापमान, नमी, हवा की गति और दिशा जैसी स्थितियाँ प्रभावित करती हैं।','तापमान','नमी','हवा'],
 ['कचरा और संसाधन','कचरे को कम करना, पुनः उपयोग और पुनर्चक्रण संसाधनों तथा पर्यावरण की रक्षा में मदद करते हैं।','Reduce','Reuse','Recycle'],
 ['वस्तुओं का पृथक्करण','मिश्रण को अलग करने के लिए घटकों के गुणों के अनुसार विधि चुनी जाती है।','छानना','निथारना','वाष्पीकरण'],
 ['जीवों की विशेषताएँ','जीवों में पोषण, वृद्धि, श्वसन, प्रतिक्रिया और प्रजनन जैसी जीवन-प्रक्रियाएँ दिखाई देती हैं।','पोषण','श्वसन','वृद्धि'],
 ['प्रकाश और छाया','प्रकाश के मार्ग में अपारदर्शी वस्तु आने पर छाया बन सकती है। स्रोत, वस्तु और पर्दे की स्थिति छाया बदलती है।','प्रकाश स्रोत','अपारदर्शी वस्तु','पर्दा'],
 ['हमारा सौरमंडल','सूर्य एक तारा है और ग्रह उसकी परिक्रमा करते हैं। पृथ्वी का घूर्णन दिन-रात से जुड़ा है।','सूर्य','घूर्णन','परिक्रमा'] ]},
 maths:{hi:'गणित',icon:'➗',chapters:[
 ['हमारे आसपास बड़ी संख्याएँ','बड़ी संख्याएँ पढ़ने और लिखने में स्थान-मूल्य तथा अंकों के समूह का उपयोग किया जाता है।','स्थान-मूल्य','अंक','तुलना'],
 ['अंकगणितीय व्यंजक','व्यंजक में संख्याएँ और संक्रियाएँ मिलकर एक गणितीय संबंध दिखाती हैं। कोष्ठक और संक्रियाओं का क्रम महत्वपूर्ण है।','व्यंजक','कोष्ठक','क्रम'],
 ['दशमलव के आगे एक झलक','दशमलव बिंदु पूर्ण इकाई और उसके भाग को अलग करता है। प्रत्येक स्थान का निश्चित मान होता है।','दशमलव','दशमांश','स्थान-मूल्य'],
 ['अक्षर-संख्याओं वाले व्यंजक','अक्षर किसी अज्ञात या बदलने वाली संख्या को दर्शा सकता है। दिए गए मान से व्यंजक का मान निकाला जा सकता है।','चर','मान','व्यंजक'],
 ['समानांतर और प्रतिच्छेदी रेखाएँ','समानांतर रेखाएँ एक-दूसरे से समान दूरी पर रहती हैं और नहीं मिलतीं; प्रतिच्छेदी रेखाएँ एक बिंदु पर मिलती हैं।','समानांतर','प्रतिच्छेदी','रेखा'],
 ['संख्या खेल','संख्या पैटर्न में छिपे नियम को पहचानकर अगला या लुप्त पद निकाला जाता है।','पैटर्न','नियम','पद'],
 ['तीन प्रतिच्छेदी रेखाओं की कहानी','रेखाओं के मिलने पर बनने वाले कोणों को पहचानना और उनके संबंध देखना ज्यामिति की मूल कुशलता है।','शीर्ष','भुजा','कोण'],
 ['भिन्नों के साथ काम','भिन्न पूरे के बराबर भाग को दर्शाता है। अंश बताता है कितने भाग लिए गए और हर बताता है कुल समान भाग।','अंश','हर','समतुल्य भिन्न'] ]},
 english:{hi:'अंग्रेज़ी',icon:'📖',chapters:[
 ['Parts of Speech','Noun व्यक्ति, स्थान, वस्तु या विचार का नाम देता है; pronoun noun की जगह और verb क्रिया या अवस्था बताता है।','noun','pronoun','verb'],
 ['Nouns & Pronouns','Common और proper nouns के साथ singular तथा plural forms पहचानो। Pronoun का person और number संदर्भ से मेल खाना चाहिए।','common noun','proper noun','pronoun'],
 ['Verbs & Tenses','Present, past और future forms समय बताते हैं। Sentence में time clues tense चुनने में मदद करते हैं।','present','past','future'],
 ['Adjectives & Adverbs','Adjective noun को describe करता है, जबकि adverb verb या अन्य शब्द के बारे में अधिक जानकारी दे सकता है।','adjective','adverb','description'],
 ['Articles & Prepositions','a, an और the का चयन noun के sound और context पर निर्भर करता है। Prepositions स्थान और संबंध बताते हैं।','a/an/the','in/on/at','position'],
 ['Subject–Verb Agreement','Verb को वास्तविक subject के number के साथ match करना चाहिए। बीच में आए शब्द agreement का नियम नहीं बदलते।','subject','verb','agreement'],
 ['Sentences & Error Correction','Capitalization, punctuation, word order, tense और agreement को जाँचकर sentence errors खोजे जा सकते हैं।','capital letter','punctuation','word order'],
 ['Translation & Everyday English','Translation में सही अर्थ के साथ natural English structure चुनना जरूरी है। सामान्य sentence order अक्सर subject + verb + object होता है।','meaning','word order','natural expression'] ]},
 hindi:{hi:'हिंदी',icon:'🪔',chapters:[
 ['संज्ञा','व्यक्ति, स्थान, वस्तु, प्राणी या भाव के नाम संज्ञा कहलाते हैं।','व्यक्ति','स्थान','भाव'],
 ['सर्वनाम','संज्ञा के स्थान पर प्रयुक्त शब्द सर्वनाम कहलाते हैं। संदर्भ के अनुसार सही सर्वनाम चुनना जरूरी है।','मैं/हम','तुम/आप','वह/वे'],
 ['विशेषण','जो शब्द संज्ञा या सर्वनाम की विशेषता बताते हैं, वे विशेषण कहलाते हैं।','गुण','संख्या','परिमाण'],
 ['क्रिया','जिस शब्द से किसी कार्य, घटना या अवस्था का बोध हो, वह क्रिया है।','काम','अवस्था','क्रिया-शब्द'],
 ['काल','क्रिया के होने के समय का बोध कराने वाले रूपों को काल से समझा जाता है।','वर्तमान','भूत','भविष्य'],
 ['वचन और लिंग','वचन से एक या अनेक का तथा लिंग से स्त्री या पुरुष जाति का व्याकरणिक बोध हो सकता है।','एकवचन','बहुवचन','लिंग'],
 ['वाक्य शुद्धि','शुद्ध वाक्य के लिए शब्द-क्रम, वर्तनी, लिंग-वचन और क्रिया का सही मेल देखना चाहिए।','वर्तनी','शब्द-क्रम','मेल'],
 ['अनुच्छेद लेखन','अच्छे अनुच्छेद में स्पष्ट विषय, क्रमबद्ध विचार, सरल भाषा और उचित समापन होना चाहिए।','विषय','क्रम','समापन'] ]},
 gk:{hi:'सामान्य ज्ञान + तर्क',icon:'🧠',chapters:[
 ['भारत और विश्व','सामान्य ज्ञान में देश, राजधानियाँ, प्रतीक, महाद्वीप और प्रमुख वैश्विक तथ्य शामिल होते हैं।','देश','राजधानी','महाद्वीप'],
 ['विज्ञान एवं प्रकृति','प्राकृतिक घटनाओं और रोजमर्रा के विज्ञान को कारण-परिणाम से जोड़कर समझना GK को मजबूत करता है।','प्रकृति','कारण','परिणाम'],
 ['इतिहास और संस्कृति','ऐतिहासिक घटनाओं, व्यक्तियों और सांस्कृतिक परंपराओं को समय और स्थान के संदर्भ में याद करना अधिक उपयोगी है।','समयरेखा','विरासत','परंपरा'],
 ['भूगोल','मानचित्र, दिशाएँ, स्थलरूप, जल निकाय और जलवायु भूगोल की बुनियादी जानकारी देते हैं।','दिशा','स्थलरूप','जलवायु'],
 ['खेल और पुरस्कार','खेल GK में खेलों, प्रमुख प्रतियोगिताओं और पुरस्कारों से जुड़े तथ्य आते हैं।','खेल','प्रतियोगिता','पुरस्कार'],
 ['संख्या तर्क','संख्या-आधारित reasoning में pattern, difference, multiples और simple operations के नियम खोजे जाते हैं।','pattern','difference','multiple'],
 ['चित्र/दिशा तर्क','दिशा तथा चित्र reasoning में rotation, position, symmetry और movement को क्रम से देखना जरूरी है।','दिशा','घूर्णन','स्थिति'],
 ['दैनिक जीवन reasoning','दैनिक situations में क्रम, तुलना, वर्गीकरण और elimination जैसे reasoning tools काम आते हैं।','क्रम','तुलना','वर्गीकरण'] ]},
 social:{hi:'सामाजिक विज्ञान',icon:'🌍',chapters:[
 ['पृथ्वी पर स्थानों का पता लगाना','पृथ्वी पर किसी स्थान को समझने के लिए दिशा, मानचित्र और स्थान-संबंधी संकेत उपयोगी हैं।','मानचित्र','दिशा','स्थान'],
 ['महासागर और महाद्वीप','पृथ्वी की सतह पर बड़े स्थलखंड महाद्वीप और विशाल जलराशियाँ महासागर कहलाती हैं।','महाद्वीप','महासागर','ग्लोब'],
 ['स्थलरूप और जीवन','पर्वत, पठार, मैदान और अन्य स्थलरूप लोगों के जीवन, खेती और बसावट को प्रभावित करते हैं।','पर्वत','पठार','मैदान'],
 ['इतिहास की समयरेखा और स्रोत','इतिहास को समझने में घटनाओं का क्रम और पुरातात्विक तथा लिखित स्रोत महत्वपूर्ण होते हैं।','समयरेखा','स्रोत','साक्ष्य'],
 ['भारत, अर्थात् भारत','भारत का भूगोल, उसकी विविध भौगोलिक इकाइयाँ और सांस्कृतिक पहचान मिलकर देश की समझ बनाती हैं।','भारत','भूगोल','पहचान'],
 ['भारतीय सभ्यता की शुरुआत','प्रारंभिक सभ्यताओं को समझते समय बस्तियाँ, कृषि, शिल्प और उपलब्ध पुरावशेषों पर ध्यान दिया जाता है।','सभ्यता','बस्ती','पुरावशेष'],
 ['भारत की सांस्कृतिक जड़ें','भारतीय संस्कृति की विविध परंपराओं को भाषा, कला, रीति और साझा विरासत के माध्यम से समझा जा सकता है।','संस्कृति','परंपरा','विरासत'],
 ['विविधता में एकता — अनेक में एक','भाषा, भोजन, पहनावा और परंपराओं की विविधता के बीच साझा नागरिक जीवन एकता की भावना बनाता है।','विविधता','एकता','साझापन'],
 ['परिवार और समुदाय','परिवार और समुदाय सहयोग, जिम्मेदारी तथा सामाजिक सीखने के महत्वपूर्ण स्थान हैं।','परिवार','समुदाय','जिम्मेदारी'],
 ['जमीनी लोकतंत्र — भाग 1: शासन','स्थानीय स्तर पर लोकतांत्रिक संस्थाएँ लोगों की जरूरतों और सार्वजनिक निर्णयों से जुड़ी होती हैं।','शासन','स्थानीय','निर्णय'],
 ['जमीनी लोकतंत्र — भाग 2: ग्रामीण स्थानीय सरकार','ग्राम स्तर की स्थानीय संस्थाएँ स्थानीय समस्याओं और विकास के कार्यों में भाग लेती हैं।','ग्राम','स्थानीय सरकार','विकास'],
 ['जमीनी लोकतंत्र — भाग 3: शहरी स्थानीय सरकार','नगरों में स्थानीय निकाय सफाई, सड़क, जल और अन्य नागरिक सेवाओं से जुड़े कार्य करते हैं।','नगर','सेवा','स्थानीय निकाय'],
 ['आजीविका और आर्थिक जीवन','लोग अलग-अलग काम और आजीविका के माध्यम से वस्तुएँ तथा सेवाएँ प्रदान करते हैं।','आजीविका','वस्तु','सेवा'],
 ['विविधता, संसाधन और हमारा भविष्य','संसाधनों का जिम्मेदार उपयोग, संरक्षण और समान भागीदारी टिकाऊ भविष्य के लिए महत्वपूर्ण हैं।','संसाधन','संरक्षण','भविष्य'] ]}
};

function safe(s){return String(s).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#92;','"':'&quot;'}[m]));}
function key(subject,idx){return 'revision-v3-'+subject+'-'+idx;}
function getDone(subject){try{return JSON.parse(localStorage.getItem(key(subject,'done'))||'{}')}catch(e){return {}}}
function setDone(subject,idx,val){const d=getDone(subject);d[idx]=!!val;localStorage.setItem(key(subject,'done'),JSON.stringify(d));}

function cards(ch,subject,index){
 const [title,desc,a,b,c]=ch;
 const s={science:{ex:`उदाहरण: ${title} को समझते समय ${a}, ${b} और ${c} को एक साथ जोड़ो।`,why:`यह विचार रोजमर्रा की चीजों को वैज्ञानिक कारण से समझने में मदद करता है।`},maths:{ex:`उदाहरण: पहले ${a} पहचानो, फिर दिए गए नियम के अनुसार चरण लिखो; उत्तर सीधे अनुमान से मत चुनो।`,why:`यह तरीका calculation की accuracy बढ़ाता है और गलती ढूँढना आसान बनाता है।`},english:{ex:`Example: पहले ${a} पहचानो, फिर sentence में ${b} और ${c} की भूमिका जाँचो।`,why:`इससे grammar को rule याद करने के बजाय sentence में लागू करना आता है।`},hindi:{ex:`उदाहरण: वाक्य पढ़कर पहले ${a} पहचानो, फिर ${b} और ${c} के आधार पर सही रूप चुनो।`,why:`यह भाषा को केवल परिभाषा से नहीं बल्कि प्रयोग से सीखने में मदद करता है।`},gk:{ex:`उदाहरण: किसी reasoning सवाल में ${a} से शुरुआत करके ${b} और ${c} का संबंध ढूँढो।`,why:`ऐसी strategy बिना जल्दबाजी के clue को व्यवस्थित ढंग से पढ़ना सिखाती है।`},social:{ex:`उदाहरण: ${title} पढ़ते समय ${a}, ${b} और ${c} के बीच संबंध को अपने शब्दों में समझाओ।`,why:`यह अध्याय को अलग-अलग facts की जगह एक connected idea के रूप में याद रखने में मदद करता है।`}}[subject];
 return [
  ['मुख्य विचार',desc],
  ['जरूरी शब्द',`${a} • ${b} • ${c}`],
  ['कैसे समझें',`पहले ${a} पहचानो। फिर ${b} से उसका संबंध देखो। अंत में ${c} से पूरी बात जोड़ो।`],
  ['उदाहरण',s.ex],
  ['क्यों महत्वपूर्ण?',s.why],
  ['सामान्य गलती',`सिर्फ एक शब्द या definition याद करके रुक जाना। ${title} में concepts के बीच संबंध भी देखना जरूरी है।`],
  ['Exam Tip',`उत्तर लिखते समय मुख्य शब्द ${a}, ${b} और ${c} में से जो लागू हों उन्हें सही संदर्भ में इस्तेमाल करो।`],
  ['Active Recall',`किताब बंद करके 20 सेकंड में समझाओ: “${title} में सबसे जरूरी बात क्या है और उसका एक उदाहरण क्या है?”`]
 ];
}

function render(subject){
 const root=document.getElementById('revisionQualityApp'); if(!root)return;
 const d=DATA[subject]||DATA.science; const done=getDone(subject);
 root.innerHTML=`<div class="rq-shell"><div class="rq-top"><a class="rq-back" href="revision-v2.html">← सभी Subjects</a><span class="rq-badge">8 study cards / chapter</span></div><section class="rq-hero"><div class="rq-icon">${d.icon}</div><div><div class="rq-eyebrow">CLASS 6 • REVISION</div><h1>${safe(d.hi)} Revision</h1><p>हर chapter को खोलो और 8 meaningful study cards से concept, example, mistake और recall को एक साथ revise करो।</p></div></section><div class="rq-summary"><div><b>${d.chapters.length}</b><span>Chapters</span></div><div><b>${d.chapters.length*8}</b><span>Study cards</span></div><div><b>${Object.values(done).filter(Boolean).length}</b><span>Completed</span></div></div><div class="rq-list">${d.chapters.map((ch,i)=>{
   const finished=!!done[i];
   const cs=cards(ch,subject,i);
   return `<details class="rq-chapter" ${i===0?'open':''}><summary><span><b>Chapter ${i+1} · ${safe(ch[0])}</b><small>${safe(ch[1])}</small></span><em>${finished?'✓ Done':'8 cards'}</em></summary><div class="rq-card-grid">${cs.map((x,j)=>`<article class="rq-card"><span>${String(j+1).padStart(2,'0')} · ${safe(x[0])}</span><h3>${safe(x[0])}</h3><p>${safe(x[1])}</p></article>`).join('')}</div><div class="rq-actions"><button class="rq-complete" type="button" data-complete="${i}">${finished?'✓ Chapter completed':'Mark chapter complete'}</button></div></details>`
 }).join('')}</div></div>`;
 root.querySelectorAll('[data-complete]').forEach(btn=>btn.addEventListener('click',()=>{
   const i=Number(btn.dataset.complete); setDone(subject,i,!getDone(subject)[i]); render(subject);
 }));
}

function injectStyle(){if(document.getElementById('rq-style'))return;const st=document.createElement('style');st.id='rq-style';st.textContent=`.rq-shell{width:min(1120px,calc(100% - 24px));margin:auto;padding:16px 0 55px;color:#20252b}.rq-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px}.rq-back,.rq-badge{display:inline-flex;align-items:center;min-height:44px;padding:9px 14px;border-radius:12px;font-weight:800}.rq-back{background:#e9edf1;color:#20252b;text-decoration:none}.rq-badge{background:#fff;border:1px solid #e0e5eb;color:#667085;font-size:12px}.rq-hero{display:flex;gap:18px;align-items:center;padding:24px;border-radius:24px;background:linear-gradient(135deg,#20252b,#59636e);color:#fff;box-shadow:0 14px 34px rgba(20,30,50,.12)}.rq-icon{font-size:46px}.rq-eyebrow{font-size:11px;font-weight:900;letter-spacing:.08em;opacity:.75}.rq-hero h1{margin:5px 0 7px;font-size:clamp(28px,5vw,42px)}.rq-hero p{margin:0;line-height:1.7;color:#e5eaf0;max-width:820px}.rq-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.rq-summary>div{background:#fff;border:1px solid #e0e5eb;border-radius:16px;padding:13px 15px}.rq-summary b{display:block;font-size:22px}.rq-summary span{font-size:12px;color:#667085}.rq-list{display:grid;gap:12px}.rq-chapter{background:#fff;border:1px solid #dfe5eb;border-radius:18px;overflow:hidden;box-shadow:0 7px 22px rgba(20,30,50,.05)}.rq-chapter summary{display:flex;justify-content:space-between;gap:12px;align-items:center;cursor:pointer;padding:17px;list-style:none;min-height:62px;touch-action:manipulation}.rq-chapter summary::-webkit-details-marker{display:none}.rq-chapter summary>span{min-width:0}.rq-chapter summary b{display:block;line-height:1.45}.rq-chapter summary small{display:block;color:#667085;margin-top:5px;line-height:1.5}.rq-chapter summary em{font-style:normal;white-space:nowrap;border-radius:99px;padding:6px 9px;background:#f1f4f6;color:#667085;font-size:11px;font-weight:900}.rq-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:0 14px 14px}.rq-card{border:1px solid #e1e6ec;border-radius:16px;padding:16px;background:#fbfcfd;min-height:185px}.rq-card span{font-size:11px;font-weight:900;color:#7a8591}.rq-card h3{margin:8px 0;font-size:18px}.rq-card p{margin:0;color:#38424c;line-height:1.72;font-size:14px}.rq-actions{padding:0 14px 16px}.rq-complete{min-height:46px;padding:10px 15px;border:0;border-radius:12px;background:#20252b;color:#fff;font:inherit;font-weight:800;cursor:pointer;width:100%;touch-action:manipulation}.rq-complete:focus-visible,.rq-back:focus-visible{outline:3px solid #20252b;outline-offset:3px}@media(max-width:700px){.rq-hero{padding:19px;align-items:flex-start}.rq-icon{font-size:38px}.rq-summary{grid-template-columns:1fr 1fr}.rq-summary>div:last-child{grid-column:1/-1}.rq-card-grid{grid-template-columns:1fr}.rq-card{min-height:0}.rq-chapter summary{align-items:flex-start}.rq-chapter summary em{margin-top:1px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}`;document.head.appendChild(st)}

const params=new URLSearchParams(location.search); const subject=params.get('subject')||document.body.dataset.revisionSubject||'science';
injectStyle();
const root=document.getElementById('revisionQualityApp');
if(root)render(subject);
})();