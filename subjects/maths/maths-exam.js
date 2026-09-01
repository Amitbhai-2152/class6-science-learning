(function(){
'use strict';

const chapterVars=['mathsChapter01','mathsChapter02','mathsChapter03','mathsChapter04','mathsChapter05','mathsChapter06','mathsChapter07','mathsChapter08'];
const getChapters=()=>chapterVars.map(k=>window[k]).filter(Boolean);
const escapeHtml=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const uid=()=>`maths-exam-${Date.now()}`;

function getPracticeBank(){
 const candidates=[window.mathsPracticeBank,window.MathsPracticeBank,window.practiceBank,window.mathsPracticeQuestions];
 const bank=candidates.find(x=>Array.isArray(x));
 if(!bank)return [];
 return bank.filter(q=>q&&Array.isArray(q.options)&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length&&q.question);
}
function getChapterPool(){
 return getChapters().flatMap(c=>(c.challenge||[]).map((q,i)=>({...q,chapterId:c.id,chapterTitle:c.title,id:`${c.id}-${i}`})));
}
function buildPool(mode){
 if(mode==='PRACTICE'){
   const dedicated=getPracticeBank().map((q,i)=>({...q,chapterId:q.chapterId||0,chapterTitle:q.chapterTitle||`अध्याय ${q.chapterId||''}`,id:`practice-${i}`}));
   if(dedicated.length)return dedicated;
 }
 return getChapterPool();
}
function exampleFor(q){return q.example||'इसे अपने आसपास की किसी छोटी संख्या, वस्तु या दैनिक जीवन की स्थिति से जोड़कर दोबारा सोचो।';}
function showXP(n){if(window.showXP) window.showXP(n);}
function saveAttempt(mode,score,total,details){
 const key='mathsExamHistory';let h=[];try{h=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(h))h=[]}catch(_){h=[]}
 h.unshift({mode,score,total,pct:Math.round(score/Math.max(total,1)*100),at:new Date().toISOString(),details});
 localStorage.setItem(key,JSON.stringify(h.slice(0,20)));
}

function createShell(mode,title,subtitle){
 document.querySelectorAll('.maths-exam-shell').forEach(e=>e.remove());
 const root=document.createElement('section');root.className='maths-exam-shell';root.id=uid();
 root.innerHTML=`<div class="maths-exam-backdrop"></div><div class="maths-exam-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><div class="mx-head"><div><span class="mx-pill">${escapeHtml(mode)}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div><button class="mx-close" type="button" aria-label="बंद करें">×</button></div><div class="mx-body" id="mxBody"></div></div>`;
 document.body.appendChild(root);root.querySelector('.mx-close').onclick=()=>root.remove();root.querySelector('.maths-exam-backdrop').onclick=()=>root.remove();
 return root.querySelector('#mxBody');
}

function renderStart(mode){
 const pool=buildPool(mode);
 if(!pool.length){const b=createShell(mode,'Maths Exam','Questions अभी उपलब्ध नहीं हैं।');b.innerHTML='<div class="mx-empty">Maths question bank load नहीं हुआ। Page refresh करके फिर कोशिश करें।</div>';return}
 const count=mode==='PRACTICE'?30:60;
 const selected=shuffle(pool).slice(0,Math.min(count,pool.length));
 const marks=selected.length;
 const body=createShell(mode,mode==='PRACTICE'?'📝 Maths Practice Test':'⏱️ 2-Hour Maths CBT',mode==='PRACTICE'?`${marks} questions • ${marks} marks • No negative marking • Dedicated Practice Bank`:`${marks} questions • 120 minutes • ${marks} marks • No negative marking`);
 if(mode==='CBT'){
  body.innerHTML=`<div class="mx-instructions"><div><b>Marking scheme</b><span>✅ सही +1</span><span>❌ गलत 0</span><span>⚪ छोड़ा 0</span><span>🚫 Negative marking नहीं</span></div><p>पहले attempt करो, फिर submit से पहले review करो।</p></div><form class="mx-candidate" id="mxCandidate"><label>विद्यार्थी का नाम<input name="name" required maxlength="60" autocomplete="name"></label><label>पिता का नाम<input name="father" maxlength="60"></label><label>माता का नाम<input name="mother" maxlength="60"></label><label>आप कहाँ रहते हैं?<input name="place" maxlength="80" autocomplete="address-level2"></label><button class="mx-primary" type="submit">CBT शुरू करें 🚀</button></form>`;
  body.querySelector('#mxCandidate').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);runExam(selected,mode,{name:fd.get('name'),father:fd.get('father'),mother:fd.get('mother'),place:fd.get('place')});});
 }else{
  body.innerHTML=`<div class="mx-instructions"><div><b>Practice structure</b><span>🟢 Easy</span><span>🟡 Medium</span><span>🔴 Hard</span><span>🟣 HOTS</span><span>🚫 Negative marking नहीं</span></div><p>30 questions random dedicated bank से आएँगे। पूरा test finish करने के बाद detailed review मिलेगा।</p></div><button class="mx-primary" id="mxStart">Test शुरू करें 🚀</button>`;
  body.querySelector('#mxStart').onclick=()=>runExam(selected,mode,{});
 }
}

function runExam(questions,mode,candidate){
 const body=document.querySelector('.maths-exam-shell #mxBody');if(!body)return;
 let current=0;const answers=Array(questions.length).fill(null);const review=Array(questions.length).fill(false);let remaining=mode==='CBT'?120*60:null;let timer=null;
 function answerLabel(i){const a=answers[i];return a==null?'छोड़ा':String.fromCharCode(65+a)}
 function difficultyBadge(q){if(mode!=='PRACTICE'||!q.difficulty)return '';const map={EASY:'🟢 Easy',MEDIUM:'🟡 Medium',HARD:'🔴 Hard',HOTS:'🟣 HOTS'};return `<span class="mx-difficulty">${map[q.difficulty]||escapeHtml(q.difficulty)}</span>`}
 function render(){
  const q=questions[current];
  body.innerHTML=`<div class="mx-progress-head"><div><b>प्रश्न ${current+1} / ${questions.length}</b><small>${escapeHtml(q.chapterTitle||`अध्याय ${q.chapterId||''}`)} ${difficultyBadge(q)}</small></div>${mode==='CBT'?'<strong id="mxTimer" class="mx-timer">120:00</strong>':''}</div><div class="mx-progress"><i style="width:${(current+1)/questions.length*100}%"></i></div><div class="mx-layout"><aside class="mx-palette">${questions.map((_,i)=>`<button class="${answers[i]!=null?'answered ':''}${review[i]?'marked ':''}${i===current?'active':''}" data-i="${i}" title="प्रश्न ${i+1}">${i+1}</button>`).join('')}</aside><main class="mx-question"><span class="mx-qtag">अध्याय ${q.chapterId||''}</span><h3>${escapeHtml(q.question)}</h3><div class="mx-options">${q.options.map((o,i)=>`<label class="mx-option ${answers[current]===i?'selected':''}"><input type="radio" name="mxopt" value="${i}" ${answers[current]===i?'checked':''}><span><b>${String.fromCharCode(65+i)}</b>${escapeHtml(o)}</span></label>`).join('')}</div><div class="mx-actions"><button class="mx-secondary" id="mxMark">${review[current]?'★ Review से हटाएँ':'☆ Mark for Review'}</button><div><button class="mx-secondary" id="mxPrev" ${current===0?'disabled':''}>← पिछला</button><button class="mx-primary" id="mxNext">${current===questions.length-1?'📋 Review':'अगला →'}</button></div></div></main></div>`;
  body.querySelectorAll('input[name="mxopt"]').forEach(inp=>inp.onchange=()=>{answers[current]=Number(inp.value);render()});
  body.querySelectorAll('.mx-palette button').forEach(btn=>btn.onclick=()=>{current=Number(btn.dataset.i);render()});
  body.querySelector('#mxMark').onclick=()=>{review[current]=!review[current];render()};
  body.querySelector('#mxPrev').onclick=()=>{if(current>0){current--;render()}};
  body.querySelector('#mxNext').onclick=()=>{if(current<questions.length-1){current++;render()}else renderReview()};
  if(mode==='CBT')updateTimer();
 }
 function updateTimer(){const el=body.querySelector('#mxTimer');if(el){const m=Math.floor(remaining/60),s=remaining%60;el.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;el.classList.toggle('danger',remaining<=300)} }
 function startTimer(){if(mode!=='CBT')return;timer=setInterval(()=>{remaining--;updateTimer();if(remaining<=0){clearInterval(timer);finish(true)}},1000)}
 function renderReview(){
  if(timer){clearInterval(timer);timer=null}
  const unanswered=answers.filter(x=>x==null).length,marked=review.filter(Boolean).length;
  body.innerHTML=`<div class="mx-review-summary"><div><b>${questions.length}</b><span>कुल प्रश्न</span></div><div><b>${answers.length-unanswered}</b><span>Attempted</span></div><div><b>${unanswered}</b><span>Unanswered</span></div><div><b>${marked}</b><span>Marked</span></div></div><div class="mx-instructions"><b>Final check</b><p>Submit करने के बाद हर question का answer, explanation और example मिलेगा।</p></div><div class="mx-review-grid">${questions.map((q,i)=>`<button class="${answers[i]==null?'unanswered ':''}${review[i]?'marked':''}" data-i="${i}">Q${i+1}<small>${answerLabel(i)}</small></button>`).join('')}</div><div class="mx-actions"><button class="mx-secondary" id="mxBackReview">← Test में वापस</button><button class="mx-primary" id="mxSubmit">✅ Submit Test</button></div>`;
  body.querySelectorAll('.mx-review-grid button').forEach(btn=>btn.onclick=()=>{current=Number(btn.dataset.i);render()});
  body.querySelector('#mxBackReview').onclick=()=>render();
  body.querySelector('#mxSubmit').onclick=()=>finish(false);
 }
 function finish(auto){if(timer)clearInterval(timer);let score=0;questions.forEach((q,i)=>{if(answers[i]===q.answer)score++});saveAttempt(mode,score,questions.length,{candidate,auto});showXP(score);renderResult(score,auto)}
 function renderResult(score,auto){
  const pct=Math.round(score/questions.length*100);const grade=pct>=90?'🏆 उत्कृष्ट':pct>=75?'🌟 बहुत अच्छा':pct>=60?'👍 अच्छा':'📚 और अभ्यास करो';
  body.innerHTML=`<div class="mx-result"><div class="mx-score-ring"><strong>${score}</strong><span>/ ${questions.length}</span></div><h2>${grade}</h2><p class="mx-percent">${pct}% • ${auto?'समय समाप्त होने पर auto-submitted':'Test submitted'}</p><div class="mx-result-note"><span>✅ सही: ${score}</span><span>❌ गलत: ${questions.filter((q,i)=>answers[i]!=null&&answers[i]!==q.answer).length}</span><span>⚪ छोड़ा: ${answers.filter(x=>x==null).length}</span></div><div class="mx-actions"><button class="mx-secondary" id="mxRetake">🔄 फिर से दें</button><button class="mx-primary" id="mxTour">🔎 हर प्रश्न का Review देखें</button></div></div>`;
  body.querySelector('#mxRetake').onclick=()=>renderStart(mode);
  body.querySelector('#mxTour').onclick=()=>renderTour(score);
 }
 function renderTour(score){
  body.innerHTML=`<div class="mx-tour-head"><div><span class="mx-pill">ANSWER TOUR</span><h2>हर प्रश्न का Review</h2><p>सही उत्तर के साथ reasoning और example देखो।</p></div><button class="mx-secondary" id="mxDone">← Result</button></div><div class="mx-tour-list">${questions.map((q,i)=>{const ok=answers[i]===q.answer,chosen=answers[i];return `<article class="mx-tour-card ${ok?'correct':'wrong'}"><div class="mx-tour-q"><b>Q${i+1}</b><span>${escapeHtml(q.chapterTitle||`अध्याय ${q.chapterId||''}`)}${q.difficulty?` • ${escapeHtml(q.difficulty)}`:''}</span><em>${ok?'✅ सही':'❌ गलत/छोड़ा'}</em></div><h3>${escapeHtml(q.question)}</h3><div class="mx-answer-line"><b>आपका उत्तर:</b> ${chosen==null?'छोड़ा':escapeHtml(q.options[chosen])}</div><div class="mx-answer-line good"><b>सही उत्तर:</b> ${escapeHtml(q.options[q.answer])}</div><div class="mx-explain"><b>💡 क्यों?</b><p>${escapeHtml(q.explanation||'सही विकल्प दिए गए concept के अनुसार है।')}</p><b>🌍 उदाहरण</b><p>${escapeHtml(exampleFor(q))}</p></div></article>`}).join('')}</div>`;
  body.querySelector('#mxDone').onclick=()=>renderResult(score,false);
 }
 render();startTimer();
}

window.MathsExam={startPractice:()=>renderStart('PRACTICE'),startCBT:()=>renderStart('CBT'),history:()=>{try{return JSON.parse(localStorage.getItem('mathsExamHistory')||'[]')}catch(_){return[]}}};
})();