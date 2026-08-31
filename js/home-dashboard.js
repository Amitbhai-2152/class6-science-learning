(function(){'use strict';
function pctFromMaths(){try{const h=JSON.parse(localStorage.getItem('mathsExamHistory')||'[]');if(!Array.isArray(h)||!h.length)return 0;return Math.max(...h.map(x=>Number(x.pct)||0))}catch(e){return 0}}
function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
function width(id,v){const e=document.getElementById(id);if(e)e.style.width=Math.max(0,Math.min(100,v))+'%'}
function refineHome(){
 const home=document.getElementById('homeView');if(!home)return;
 const chapterSection=home.querySelector('.home-chapter-section')?.closest('.study-section');
 if(chapterSection)chapterSection.style.display='none';
 const title=home.querySelector('.batch-title');if(title)title.textContent='कक्षा 6 • Learning Hub';
 const sub=home.querySelector('.batch-sub');if(sub)sub.textContent='Learn • Practice • Test • Improve';
 const quick=home.querySelector('.study-section:first-of-type h2');if(quick)quick.textContent='Explore';
 const cards=[...home.querySelectorAll('.offer-grid .offer-card')];
 if(cards[0]){cards[0].innerHTML='<span class="offer-icon">🎓</span><span class="offer-copy"><strong>Class 6</strong><small>पूरे Class 6 learning space में जाओ</small></span><span class="offer-arrow">›</span>';cards[0].onclick=()=>home.querySelector('.subject-grid')?.scrollIntoView({behavior:'smooth',block:'start'});cards[0].removeAttribute('href')}
 if(cards[1]){cards[1].innerHTML='<span class="offer-icon">❓</span><span class="offer-copy"><strong>My Doubts</strong><small>अपना सवाल Tutor से पूछो</small></span><span class="offer-arrow">›</span>';cards[1].onclick=()=>window.toggleChat?.();cards[1].removeAttribute('href')}
 if(cards[2])cards[2].innerHTML='<span class="offer-icon">🔁</span><span class="offer-copy"><strong>Revision</strong><small>कमजोर topics को फिर से पढ़ो</small></span><span class="offer-arrow">›</span>';
 if(cards[3])cards[3].innerHTML='<span class="offer-icon">📊</span><span class="offer-copy"><strong>My Progress</strong><small>Mastery, scores और XP देखें</small></span><span class="offer-arrow">›</span>';
 if(cards[4]){cards[4].innerHTML='<span class="offer-icon">📝</span><span class="offer-copy"><strong>All Tests</strong><small>Available practice और CBT tests</small></span><span class="offer-arrow">›</span>';cards[4].onclick=()=>document.querySelector('.test-grid')?.scrollIntoView({behavior:'smooth',block:'start'});cards[4].removeAttribute('href')}
 if(cards[5])cards[5].innerHTML='<span class="offer-icon">📖</span><span class="offer-copy"><strong>Study Library</strong><small>Subjects और chapters से सीखना शुरू करो</small></span><span class="offer-arrow">›</span>';
 if(cards[6]){cards[6].innerHTML='<span class="offer-icon gold">🎯</span><span class="offer-copy"><strong>Practice</strong><small>Concept के बाद खुद को test करो</small></span><span class="offer-arrow">›</span>';cards[6].onclick=()=>home.querySelector('.subject-grid')?.scrollIntoView({behavior:'smooth',block:'start'});cards[6].removeAttribute('href')}
 if(cards[7])cards[7].style.display='none';
 const continueLabels=home.querySelectorAll('.continue-label');if(continueLabels[1])continueLabels[1].textContent='Current learning path';
 const continueMeta=home.querySelector('.continue-meta span');if(continueMeta)continueMeta.textContent='Current subject progress';
 const testHead=home.querySelector('.test-grid')?.closest('.study-section');if(testHead){const h=testHead.querySelector('h2');const p=testHead.querySelector('p');if(h)h.textContent='Test Center';if(p)p.textContent='Practice से exam readiness तक।'}
}
function refresh(){
 const sci=window.Progress?.data||{completed:[],section:{},xp:0,streak:0,badges:[]};
 const sciencePct=Math.round((sci.completed.length/12)*100);const mathsPct=pctFromMaths();
 set('homeSciencePct',sciencePct+'%');set('homeSciencePct2',sciencePct+'%');set('homeMathsPct',mathsPct+'%');set('homeTotalXP',String(sci.xp||0));set('homeStreak',String(sci.streak||0));
 width('homeScienceBar',sciencePct);width('homeMathsBar',mathsPct);
 const last=Math.max(1,Number(window.currentChapter)||1),ch=window.CHAPTERS?.[last-1];
 if(ch){set('continueTitle',ch.title);set('continueMeta',sciencePct?`अध्याय ${last} • जहाँ छोड़ा था वहाँ से जारी रखो`:'अध्याय 1 से शुरुआत करो');}
 const saved=Number(sci.section?.[last]||0),total=ch?.sections?.length||1;const cp=Math.round(Math.min(saved,total)/total*100);set('continuePercent',cp+'%');width('continueBar',cp);
}
window.addEventListener('load',()=>setTimeout(()=>{refineHome();refresh()},0));window.addEventListener('science:xp',refresh);window.addEventListener('storage',refresh);window.HomeDashboard={refresh,refineHome};
})();
