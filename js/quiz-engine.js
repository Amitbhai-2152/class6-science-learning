const QuizEngine={
 state:null,
 run(questions,containerId,onDone){
  const box=document.getElementById(containerId);if(!box||!Array.isArray(questions)||!questions.length)return;
  this.state={questions,containerId,submitted:false,onDone};
  const letters=['A','B','C','D','E'];
  box.innerHTML=`<div class="quiz-top"><span id="quizCount">0/${questions.length} answered</span><span>1 अंक • No negative marking</span></div>`+
  questions.map((q,i)=>`<div class="qbox" id="qbox_${i}"><div class="qhead"><span class="qnum">${i+1}</span><b>${escapeHtml(q.question)}</b></div>${q.options.map((o,j)=>`<label class="option"><input type="radio" name="quiz_${containerId}_${i}" value="${j}" onchange="QuizEngine.updateCount()"><span><strong>${letters[j]}.</strong> ${escapeHtml(o)}</span></label>`).join('')}<div class="answer-note hidden" id="note_${i}"></div></div>`).join('')+
  `<button id="submitQuizBtn" class="btn primary full" onclick="QuizEngine.submit()">उत्तर जाँचें ✓</button><div id="quizFeedback"></div>`;
  this.updateCount();
 },
 updateCount(){
  const s=this.state;if(!s)return;let n=0;for(let i=0;i<s.questions.length;i++)if(document.querySelector(`input[name="quiz_${s.containerId}_${i}"]:checked`))n++;const out=document.getElementById('quizCount');if(out)out.textContent=`${n}/${s.questions.length} answered`;
 },
 submit(){
  const s=this.state;if(!s||s.submitted)return;let score=0;let unanswered=[];
  for(let i=0;i<s.questions.length;i++){
   const a=document.querySelector(`input[name="quiz_${s.containerId}_${i}"]:checked`);if(!a){unanswered.push(i+1);continue}if(+a.value===s.questions[i].answer)score++;
  }
  if(unanswered.length){document.getElementById('quizFeedback').innerHTML=`<div class="feedback bad">पहले सभी प्रश्नों के उत्तर चुनो। बाकी: <b>${unanswered.join(', ')}</b></div>`;document.getElementById(`qbox_${unanswered[0]-1}`).scrollIntoView({behavior:'smooth',block:'center'});return}
  s.submitted=true;
  for(let i=0;i<s.questions.length;i++){
   const q=s.questions[i],a=document.querySelector(`input[name="quiz_${s.containerId}_${i}"]:checked`),note=document.getElementById(`note_${i}`),chosen=+a.value;
   document.querySelectorAll(`#qbox_${i} .option`).forEach((lab,j)=>{lab.classList.toggle('quiz-correct',j===q.answer);lab.classList.toggle('quiz-wrong',j===chosen&&chosen!==q.answer);lab.querySelector('input').disabled=true});
   const explanation=q.explanation||`सही उत्तर: ${q.options[q.answer]}.`;note.classList.remove('hidden');note.innerHTML=`${chosen===q.answer?'✅ सही':'❌ गलत'}<br><b>क्यों?</b> ${escapeHtml(explanation)}`;
  }
  const pct=Math.round(score/s.questions.length*100);const feedback=document.getElementById('quizFeedback');feedback.innerHTML=`<div class="feedback ${pct>=75?'ok':'bad'}"><div class="quiz-score">${score}/${s.questions.length}</div><b>${pct>=90?'🏆 उत्कृष्ट!':pct>=75?'🎯 अच्छा प्रदर्शन':'🔄 एक बार फिर revise करो'}</b><p>${pct>=75?'तुम्हारी समझ अच्छी है। अब कठिन application questions पर जाओ।':'गलत answers के नीचे “क्यों?” पढ़ो और कमजोर concepts दोबारा पढ़ो।'}</p><button class="btn soft" onclick="QuizEngine.retry()">फिर से प्रयास करें ↻</button></div>`;
  document.getElementById('submitQuizBtn').disabled=true;
  s.onDone?.(score);
 },
 retry(){const s=this.state;if(!s)return;this.run(s.questions,s.containerId,s.onDone);document.getElementById(s.containerId)?.scrollIntoView({behavior:'smooth'});}
};