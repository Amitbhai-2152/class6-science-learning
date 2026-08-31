(function(){'use strict';
const cssId='homepage-v2-css';
function ensureCss(){if(document.getElementById(cssId))return;const l=document.createElement('link');l.id=cssId;l.rel='stylesheet';l.href='css/homepage-v2.css';document.head.appendChild(l)}
function el(id){return document.getElementById(id)}
function scrollToId(id){const e=el(id);if(e)e.scrollIntoView({behavior:'smooth',block:'start'})}
function comingSoon(name){window.alert(`${name} अभी development में है। इसे इसी section में बाद में जोड़ेंगे।`)}
function actionCard(icon,title,desc,action,extra){return `<button class="hub-card ${extra||''}" type="button" data-action="${action}"><span class="hub-icon">${icon}</span><span class="hub-copy"><strong>${title}</strong><small>${desc}</small></span><span class="hub-arrow">›</span></button>`}
function subjectCard(cls,icon,title,desc,action,status){return `<button class="subject-v2 ${cls}" type="button" data-action="${action}"><div class="big">${icon}</div><h3>${title}</h3><p>${desc}</p><span class="status">${status}</span></button>`}
function testCard(icon,title,desc,action,kind){return `<article class="test-v2"><div class="big">${icon}</div><h3>${title}</h3><p>${desc}</p>${kind==='link'?`<a href="subjects/maths/maths-exam.html" class="test-action">Open →</a>`:`<button type="button" class="test-action" data-action="${action}">Start →</button>`}</article>`}
function libraryCard(icon,title,desc,action,status){return `<article class="library-card"><div class="book-icon">${icon}</div><h3>${title}</h3><p>${desc}</p><button type="button" data-action="${action}">${status}</button></article>`}
function replaceHome(){
 const home=el('homeView');if(!home||home.dataset.hubBuilt==='1')return;
 home.dataset.hubBuilt='1';home.classList.add('home-v2');
 const content=home.querySelector('.study-content');if(!content)return;
 content.innerHTML=`
  <section class="hub-section" id="offeringsSection">
   <div class="hub-head"><div><h2>Batch Offerings</h2><p>हर learning feature अपनी सही category में।</p></div></div>
   <div class="hub-grid offerings-grid">
    ${actionCard('🎓','All Classes','सभी subjects और उनके learning paths','classes')}
    ${actionCard('📝','All Tests','Practice tests और CBT एक जगह','tests')}
    ${actionCard('❓','My Doubts','Science और Maths Tutor','doubts')}
    ${actionCard('📚','Digital Books','Subject-wise learning material','books')}
    ${actionCard('👥','Community','Discussion और learner community','community')}
    ${actionCard('🔄','CatchUp','छूटा हुआ content और revision','catchup')}
    ${actionCard('π','Pi','Maths learning assistant','pi')}
    ${actionCard('🎯','Preparation Meter','अपनी mastery और readiness देखो','meter')}
    ${actionCard('🎟️','Test Pass','Available tests की quick access','tests')}
    ${actionCard('🧰','Khazana','XP, badges और rewards','rewards')}
    ${actionCard('♾️','Infinite Practice','Practice area और challenges','practice')}
    ${actionCard('🏆','Topper Mentorship','Personalized high-level guidance','topper')}
    ${actionCard('👨‍🏫','Mentorship 1:1','One-to-one mentorship','one')}
   </div>
  </section>

  <section class="hub-section" id="allClassesSection">
   <div class="hub-head"><div><h2>All Classes</h2><p>Class 6 के सभी subjects यहाँ रहेंगे।</p></div></div>
   <div class="subject-grid-v2">
    ${subjectCard('science','🔬','Science','12 chapters • Visuals • Activities • Tutor','science','Available now')}
    ${subjectCard('maths','➗','Mathematics','8 chapters • Step solutions • Hints • CBT','maths','Available now')}
    ${subjectCard('english','🇬🇧','English Grammar & Translation','Grammar • Translation • Error correction • Tests','english','Coming soon')}
    ${subjectCard('hindi','अ','Hindi','Paragraph • Grammar • Practice tests','hindi','Coming soon')}
    ${subjectCard('gk','🧠','GK & Mind / Thinking','GK • Reasoning • Thinking challenges','gk','Coming soon')}
   </div>
  </section>

  <section class="hub-section" id="allTestsSection">
   <div class="hub-head"><div><h2>All Tests</h2><p>हर available exam इसी category में मिलेगा।</p></div></div>
   <div class="test-grid-v2">
    ${testCard('🧪','Science Practice','48 questions • detailed answer tour','science-practice')}
    ${testCard('⏱️','Science CBT','120 minutes • candidate details • review','science-cbt')}
    ${testCard('➗','Maths Practice','30 questions • 30 marks • no negative marking','maths-practice','link')}
    ${testCard('📐','Maths CBT','60 questions • 120 minutes • full review','maths-cbt','link')}
    ${testCard('🇬🇧','English Tests','Grammar + translation tests','english-tests')}
    ${testCard('🧠','GK & Thinking Tests','Reasoning and timed challenges','gk-tests')}
   </div>
  </section>

  <section class="hub-section" id="doubtsSection">
   <div class="hub-head"><div><h2>My Doubts</h2><p>सवाल पूछो—Tutor concept को आसान तरीके से समझाएगा।</p></div></div>
   <div class="tools-grid">
    <div class="tool-card"><div class="hub-icon">🤖</div><h3>Science Tutor</h3><p>Concept, example, hint और flow-chart style explanations।</p><button class="tool-btn" data-action="science-tutor">पूछो →</button></div>
    <div class="tool-card"><div class="hub-icon">π</div><h3>Maths Tutor</h3><p>Step-by-step hints, mistake analysis और worked examples।</p><button class="tool-btn" data-action="maths-tutor">पूछो →</button></div>
    <div class="tool-card"><div class="hub-icon">💬</div><h3>How to ask</h3><p>उदाहरण: “भिन्न को number line पर कैसे दिखाएँ?”</p><button class="tool-btn" data-action="example-question">Example →</button></div>
   </div>
  </section>

  <section class="hub-section" id="booksSection">
   <div class="hub-head"><div><h2>Digital Books</h2><p>Learning content को subject-wise रखें, exam tools से अलग।</p></div></div>
   <div class="library-grid">
    ${libraryCard('🔬','Science Book','12 chapter learning journey with visuals and activities','science-book','Open Science')}
    ${libraryCard('➗','Maths Book','8 chapter modules and step-solution learning','maths-book','Open Maths')}
    ${libraryCard('🇬🇧','English Book','Grammar और translation lessons','english-book','Coming soon')}
    ${libraryCard('अ','Hindi Book','Paragraph और grammar learning','hindi-book','Coming soon')}
    ${libraryCard('🧠','GK Book','GK और thinking topics','gk-book','Coming soon')}
   </div>
  </section>

  <section class="hub-section" id="toolsSection">
   <div class="hub-head"><div><h2>Learning Tools</h2><p>Revision, practice और progress को अलग रखें।</p></div></div>
   <div class="tools-grid">
    <div class="tool-card"><div class="hub-icon">🔄</div><h3>CatchUp / Revision</h3><p>Weak topics और due revisions सबसे पहले दिखें।</p><button class="tool-btn" data-action="catchup">Open revision →</button></div>
    <div class="tool-card"><div class="hub-icon gold">📊</div><h3>Preparation Meter</h3><p>Science और Maths mastery, scores और attempts।</p><button class="tool-btn" data-action="meter">View meter →</button></div>
    <div class="tool-card"><div class="hub-icon gold">🏆</div><h3>Khazana</h3><p>XP, badges और learning milestones।</p><button class="tool-btn" data-action="rewards">View rewards →</button></div>
    <div class="tool-card"><div class="hub-icon">♾️</div><h3>Infinite Practice</h3><p>Available challenges से extra practice करो।</p><button class="tool-btn" data-action="practice">Practice →</button></div>
    <div class="tool-card"><div class="hub-icon">🏆</div><h3>Topper Mentorship</h3><p>Personalized mentoring module बाद में जोड़ा जाएगा।</p><button class="tool-btn" data-action="topper">Coming soon</button></div>
    <div class="tool-card"><div class="hub-icon">👨‍🏫</div><h3>Mentorship 1:1</h3><p>One-to-one learning support module बाद में जोड़ा जाएगा।</p><button class="tool-btn" data-action="one">Coming soon</button></div>
   </div>
  </section>

  <section class="hub-section" id="continueSection">
   <div class="hub-head"><div><h2>Continue Learning</h2><p>अभी जिस subject पर काम कर रहे हो, वहीं से जारी रखो।</p></div></div>
   <div class="progress-v2">
    <div class="panel-v2"><div class="continue-head"><div><div class="continue-label">CURRENT PATH</div><h3 id="continueTitle">Science</h3></div><span id="continuePercent" class="tag">0%</span></div><p id="continueMeta" class="continue-label">अध्याय 1 से शुरुआत करो</p><div class="continue-progress"><i id="continueBar"></i></div><div class="continue-meta"><span>Current subject progress</span><b id="homeSciencePct">0%</b></div><div class="continue-actions"><button class="home-btn primary" type="button" data-action="continue-science">Continue →</button><button class="home-btn soft" type="button" data-action="catchup">Revise</button></div></div>
    <div class="panel-v2"><h3>Overall Progress</h3><div class="bar-row"><div class="bar-top"><span>🔬 Science</span><span id="homeSciencePct2">0%</span></div><div class="bar"><i id="homeScienceBar"></i></div></div><div class="bar-row"><div class="bar-top"><span>➗ Maths</span><span id="homeMathsPct">0%</span></div><div class="bar maths"><i id="homeMathsBar"></i></div></div><div class="mini-stats-v2"><div><b id="homeTotalXP">0</b><span>XP</span></div><div><b id="homeStreak">0</b><span>Streak</span></div><div><b id="badgeHome">0</b><span>Badges</span></div></div></div>
   </div>
  </section>

  <div class="legacy-compat"><div id="chapterGrid"></div><span id="progressPercent">0%</span><span id="progressText"></span><span id="homeProgress"></span><div id="badgeStrip"></div><span id="xpHome">0</span><span id="streakHome">0</span></div>`;
 bindActions(home);
}
function bindActions(home){
 home.querySelectorAll('[data-action]').forEach(node=>{node.addEventListener('click',()=>{
  const a=node.dataset.action;
  if(a==='classes'||a==='science-book')scrollToId('allClassesSection');
  else if(a==='tests'||a==='test-pass')scrollToId('allTestsSection');
  else if(a==='doubts'||a==='science-tutor')window.toggleChat?.();
  else if(a==='books')scrollToId('booksSection');
  else if(a==='catchup')window.openRevision?.();
  else if(a==='pi'||a==='maths-tutor'||a==='maths-book'||a==='maths-practice'||a==='maths-cbt')window.location.href='subjects/maths/maths-exam.html';
  else if(a==='meter'||a==='progress')window.openProgress?.();
  else if(a==='rewards')scrollToId('toolsSection');
  else if(a==='practice'||a==='infinite')scrollToId('allTestsSection');
  else if(a==='continue-science'||a==='science')window.openChapter?.(1);
  else if(a==='science-practice')window.FullScienceTest?.start(4);
  else if(a==='science-cbt')window.ScienceCBT?.open();
  else if(a==='example-question')window.toggleChat?.();
  else comingSoon(node.textContent.trim()||a);
 });});
}
function refresh(){
 const sci=window.Progress?.data||{completed:[],section:{},xp:0,streak:0,badges:[]};
 const sciencePct=Math.round((sci.completed.length/12)*100);let mathsPct=0;try{const h=JSON.parse(localStorage.getItem('mathsExamHistory')||'[]');if(Array.isArray(h)&&h.length)mathsPct=Math.max(...h.map(x=>Number(x.pct)||0))}catch(e){}
 const set=(id,v)=>{const e=el(id);if(e)e.textContent=v};const width=(id,v)=>{const e=el(id);if(e)e.style.width=Math.max(0,Math.min(100,v))+'%'};
 set('homeSciencePct',sciencePct+'%');set('homeSciencePct2',sciencePct+'%');set('homeMathsPct',mathsPct+'%');set('homeTotalXP',String(sci.xp||0));set('homeStreak',String(sci.streak||0));set('badgeHome',String((sci.badges||[]).length));width('homeScienceBar',sciencePct);width('homeMathsBar',mathsPct);
 const last=Math.max(1,Number(window.currentChapter)||1),ch=window.CHAPTERS?.[last-1];if(ch){set('continueTitle',ch.title);set('continueMeta',sciencePct?`अध्याय ${last} • जहाँ छोड़ा था वहाँ से जारी रखो`:'अध्याय 1 से शुरुआत करो')}const saved=Number(sci.section?.[last]||0),total=ch?.sections?.length||1;const cp=Math.round(Math.min(saved,total)/total*100);set('continuePercent',cp+'%');width('continueBar',cp)
}
function init(){ensureCss();replaceHome();refresh()}
window.addEventListener('load',()=>setTimeout(init,0));window.addEventListener('science:xp',refresh);window.addEventListener('storage',refresh);window.HomeDashboard={refresh};
})();