const Tutor={
 add(text,who){const d=document.createElement('div');d.className='msg '+who;d.textContent=text;document.getElementById('messages').appendChild(d);document.getElementById('messages').scrollTop=document.getElementById('messages').scrollHeight},
 current(){return window.CHAPTERS?.[window.currentChapter-1]||null},
 currentSection(){const c=this.current();return c?.sections?.[window._part]||null},
 reply(q){
  const x=q.toLowerCase(),c=this.current(),s=this.currentSection();
  if(x.includes('quiz')||x.includes('सवाल पूछ')||x.includes('मुझसे सवाल'))return c?'ठीक है! पहले बिना उत्तर देखे सोचो: “'+c.title+'” में सबसे महत्वपूर्ण idea क्या है? अपना उत्तर लिखो, मैं उसे check करूँगा।':'कोई chapter खोलो, फिर मैं उसी topic से सवाल पूछूँगा।';
  if(x.includes('example')||x.includes('उदाहरण'))return s?`Example: ${s.body.split('।')[0]}। अब इसी idea का अपने आसपास एक example सोचो।`:'पहले chapter खोलो, फिर मैं current concept का example दूँगा।';
  if(x.includes('hint')||x.includes('संकेत')||x.includes('hint'))return s?`Hint: answer सीधे मत देखो। Current concept में सबसे महत्वपूर्ण शब्द या process खोजो: “${s.title}”.`:'किसी chapter को खोलकर question पर hint माँगो।';
  if(x.includes('exam')||x.includes('परीक्षा'))return s?`Exam tip: “${s.title}” से definition के साथ “क्यों”, “कैसे” और situation-based question बन सकता है। उत्तर में concept + reason + example जोड़ना उपयोगी है।`:'किसी chapter को खोलकर exam tip माँगो।';
  if(x.includes('अवलोकन')&&x.includes('अनुमान'))return'अवलोकन वह जानकारी है जिसे तुम सीधे देखकर, सुनकर या मापकर दर्ज कर सकते हो। अनुमान उस जानकारी से बनाया गया संभावित विचार है। उदाहरण: “सड़क गीली है” = अवलोकन; “बारिश हुई होगी” = अनुमान।';
  if(x.includes('अवलोकन'))return'अवलोकन = ध्यान से देखी, सुनी या मापी गई और दर्ज की जा सकने वाली जानकारी।';
  if(x.includes('अनुमान'))return'अनुमान उपलब्ध जानकारी के आधार पर बनाया गया संभावित विचार है। उसे प्रमाण और जाँच से परखा जा सकता है।';
  if(x.includes('प्रयोग')||x.includes('जाँच'))return'प्रयोग में चार सवाल पूछो: क्या बदला? क्या समान रखा? क्या मापा? परिणाम क्या मिला?';
  if(x.includes('प्रमाण'))return'प्रमाण वह information है जो किसी claim को support करती है—जैसे measurement, observation या data।';
  if(x.includes('विज्ञान'))return'विज्ञान प्रकृति को समझने के लिए questions, observations, testing, evidence और conclusions की व्यवस्थित सोच है।';
  if(x.includes('सरल')||x.includes('आसान')||x.includes('समझ नहीं'))return s?`बहुत आसान भाषा में: “${s.title}” का मुख्य idea है—${s.remember||s.body.split('।')[0]+'।'}`:'कोई chapter खोलो और फिर “आसान करके समझाओ” पूछो।';
  if(x.includes('गलत')||x.includes('answer check')||x.includes('मेरा उत्तर'))return'अपना पूरा उत्तर लिखो। मैं बताऊँगा कि क्या सही है, कहाँ सुधार चाहिए और exam में इसे और मजबूत कैसे लिख सकते हो।';
  return c?`अभी हम “${c.title}” पढ़ रहे हैं${s?` और current concept “${s.title}” है`:''}। तुम “सरल करके समझाओ”, “example दो”, “hint दो”, “मुझसे सवाल पूछो” या अपना answer check करने को कह सकते हो।`:'पहले कोई chapter खोलो। फिर मैं उसी context में help करूँगा।'
 },
 send(qOverride){const i=document.getElementById('chatInput'),q=(qOverride||i.value).trim();if(!q)return;this.add(q,'user');i.value='';setTimeout(()=>this.add(this.reply(q),'bot'),160)}
};
function toggleChat(){document.getElementById('chatWrap').classList.toggle('hidden');if(!document.getElementById('chatWrap').classList.contains('hidden'))document.getElementById('chatInput').focus()}
function sendMessage(){Tutor.send()}
function tutorQuick(mode){const prompts={explain:'इस concept को आसान करके समझाओ',example:'एक real-life example दो',hint:'एक hint दो, पूरा answer मत बताओ',quiz:'मुझसे सवाल पूछो',exam:'इसका exam tip दो'};Tutor.send(prompts[mode]||'मुझे इस concept में मदद चाहिए')}
