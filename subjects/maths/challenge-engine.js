(function(){if(!window.XPSystem){const s=document.createElement('script');s.src='../../js/xp-system.js?v=2';document.head.appendChild(s)}})();
(function(){
'use strict';

const escapeHtml = s => String(s ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
const shuffle = arr => { const x=[...arr]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]];} return x; };

function ChallengeEngine(){
  let chapter=null, questions=[], index=0, answers=[], locked=false, best=0;
  const mount=()=>document.getElementById('challengeMount');
  const key=()=>`mathsChallengeBest:${chapter?.id||0}`;
  const readBest=()=>{try{best=Number(localStorage.getItem(key())||0)}catch(_){best=0}};
  const saveBest=score=>{best=Math.max(best,score);try{localStorage.setItem(key(),String(best))}catch(_){} };
  const scoreNow=()=>answers.reduce((s,a,i)=>s+(a!=null&&a===questions[i].answer?1:0),0);
  const streak=()=>{let n=0;for(let i=answers.length-1;i>=0;i--){if(answers[i]==null||answers[i]!==questions[i].answer)break;n++;}return n;};
  const answerLabel=(q,a)=>a==null?'छोड़ा':`${String.fromCharCode(65+a)}. ${q.options?.[a]??''}`;

  function start(c){
    chapter=c; readBest();
    const pool=shuffle(c?.challenge||[]);
    questions=pool.slice(0,Math.min(10,pool.length));
    index=0; answers=[]; locked=false;
    if(!questions.length){renderEmpty();return;}
    renderQuestion();
  }

  function renderIntro(c){
    chapter=c; readBest(); const count=Math.min(10,(c?.challenge||[]).length);
    const m=mount(); if(!m)return;
    m.innerHTML=`<div class="mc-hero"><div class="mc-badge">🎯 CHALLENGE MODE</div><h3>${escapeHtml(c.title)} Challenge</h3><p>10 तक mixed questions • पहले सोचो, फिर answer चुनो • submit के बाद पूरा review</p><div class="mc-stats"><span>🧩 ${count} Questions</span><span>🏆 Best ${best}/${count||10}</span><span>🚫 No negative marking</span></div><button class="mc-primary" id="mcStart">Challenge शुरू करें 🚀</button></div>`;
    m.querySelector('#mcStart').onclick=()=>start(c);
  }

  function renderEmpty(){const m=mount();if(m)m.innerHTML='<div class="mc-empty">इस chapter के लिए challenge questions उपलब्ध नहीं हैं।</div>';}

  function renderQuestion(){
    const m=mount(); if(!m)return;
    const q=questions[index];
    if(!q){renderResult();return;}
    const current=answers[index]; const done=locked && current!=null; const currentScore=scoreNow();
    const pct=Math.round((index+1)/questions.length*100);
    const combo=done?streak():0;
    m.innerHTML=`<div class="mc-top"><div><span class="mc-badge">🎯 CHALLENGE</span><strong>Q${index+1}/${questions.length}</strong></div><div class="mc-score">Score ${currentScore}</div></div><div class="mc-progress"><i style="width:${pct}%"></i></div><article class="mc-question"><div class="mc-qmeta">अध्याय ${q.chapterId??chapter.id} • ${escapeHtml(q.chapterTitle||chapter.title||'')}</div><h3>${escapeHtml(q.question)}</h3><div class="mc-options">${(q.options||[]).map((o,i)=>`<button type="button" class="mc-option ${done&&i===q.answer?'mc-correct':''} ${done&&i===current&&current!==q.answer?'mc-wrong':''} ${current===i?'mc-selected':''}" data-i="${i}" ${done?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${escapeHtml(o)}</button>`).join('')}</div>${done?`<div class="mc-feedback ${current===q.answer?'ok':'bad'}"><b>${current===q.answer?'✅ सही उत्तर!':'❌ यह उत्तर सही नहीं है'}</b><p><b>सही उत्तर:</b> ${escapeHtml(q.options?.[q.answer]??'')}</p><p><b>💡 क्यों?</b> ${escapeHtml(q.explanation||'सही विकल्प दिए गए concept के अनुसार है।')}</p>${q.example?`<p><b>🌍 उदाहरण:</b> ${escapeHtml(q.example)}</p>`:''}${combo>=2?`<div class="mc-combo">🔥 ${combo} correct streak!</div>`:''}</div><button class="mc-primary" id="mcNext">${index===questions.length-1?'Result देखें 🏆':'अगला प्रश्न →'}</button>`:'<p class="mc-hint">पहले अपना answer चुनो—फिर explanation मिलेगा।</p>'}</article>`;
    m.querySelectorAll('.mc-option').forEach(btn=>btn.onclick=()=>choose(Number(btn.dataset.i)));
    const next=m.querySelector('#mcNext');
    if(next)next.onclick=()=>{
      if(index===questions.length-1){
        renderResult();
      }else{
        index++;
        locked=false;
        renderQuestion();
      }
    };
  }

  function choose(i){if(locked)return;answers[index]=i;locked=true;renderQuestion();}

  function renderResult(){
    const m=mount();if(!m)return;
    const score=scoreNow(), total=questions.length, pct=Math.round(score/total*100);saveBest(score);
    window.XPSystem?.score?.('maths',`chapter-challenge:${chapter?.id||0}`,pct,'chapter-challenge');
    const grade=pct>=90?'🏆 Outstanding!':pct>=75?'🌟 बहुत अच्छा!':pct>=60?'👍 अच्छा प्रयास':'📚 थोड़ा और practice करो';
    m.innerHTML=`<div class="mc-result"><div class="mc-badge">RESULT</div><div class="mc-score-big">${score}<small>/${total}</small></div><h3>${grade}</h3><p>${pct}% • Best score: ${best}/${total}</p><div class="mc-result-grid"><div><b>✅ ${score}</b><span>Correct</span></div><div><b>❌ ${total-score}</b><span>Need review</span></div><div><b>🏆 ${best}</b><span>Best score</span></div></div><div class="mc-actions"><button class="mc-secondary" id="mcRetry">🔄 फिर से दें</button><button class="mc-primary" id="mcReview">🔎 पूरा Review</button></div></div>`;
    m.querySelector('#mcRetry').onclick=()=>start(chapter);
    m.querySelector('#mcReview').onclick=renderReview;
  }

  function renderReview(){
    const m=mount();if(!m)return;
    m.innerHTML=`<div class="mc-review-head"><div><div class="mc-badge">ANSWER TOUR</div><h3>हर Challenge Question का Review</h3><p>तुम्हारा answer • सही answer • reason • example</p></div><button class="mc-secondary" id="mcBack">↩ Result</button></div><div class="mc-review-list">${questions.map((q,i)=>{const a=answers[i],ok=a===q.answer;return `<article class="mc-review-card ${ok?'ok':'bad'}"><div class="mc-review-q"><b>Q${i+1}</b><span>${ok?'✅ सही':'❌ Review needed'}</span></div><h4>${escapeHtml(q.question)}</h4><p><b>तुम्हारा उत्तर:</b> ${escapeHtml(answerLabel(q,a))}</p><p><b>सही उत्तर:</b> ${escapeHtml(answerLabel(q,q.answer))}</p><div class="mc-explain"><b>💡 क्यों?</b> ${escapeHtml(q.explanation||'Concept के अनुसार यही सही विकल्प है।')}${q.example?`<br><br><b>🌍 उदाहरण:</b> ${escapeHtml(q.example)}`:''}</div></article>`;}).join('')}</div>`;
    m.querySelector('#mcBack').onclick=renderResult;
  }

  return {show:c=>renderIntro(c),start};
}
window.MathsChallenge=new ChallengeEngine();
})();
