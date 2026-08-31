(function(){'use strict';
function pctFromMaths(){try{const h=JSON.parse(localStorage.getItem('mathsExamHistory')||'[]');if(!Array.isArray(h)||!h.length)return 0;return Math.max(...h.map(x=>Number(x.pct)||0))}catch(e){return 0}}
function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
function width(id,v){const e=document.getElementById(id);if(e)e.style.width=Math.max(0,Math.min(100,v))+'%'}
function refineHome(){
 const home=document.getElementById('homeView');if(!home)return;
 const content=home.querySelector('.study-content');
 const chapterSection=home.querySelector('.home-chapter-section')?.closest('.study-section');
 if(chapterSection)chapterSection.style.display='none';
 const title=home.querySelector('.batch-title');if(title)title.textContent='कक्षा 6 • Learning Hub';
 const sub=home.querySelector('.batch-sub');if(sub)sub.textContent='Learn • Practice • Test • Improve';
 const sections=[...home.querySelectorAll('.study-content > .study-section')];
 const subject=home.querySelector('.subject-grid')?.closest('.study-section');
 const cont=home.querySelector('.continue-shell')?.closest('.study-section');
 const explore=home.querySelector('.offer-grid')?.closest('.study-section');
 const tests=home.querySelector('.test-grid')?.closest('.study-section');
 const rewards=home.querySelector('.reward-stats')?.closest('.study-section');
 if(content){[subject,cont,explore,tests,rewards].filter(Boolean).forEach(s=>content.appendChild(s))}
 const exploreTitle=explore?.querySelector('h2');if(exploreTitle)exploreTitle.textContent='Explore';
 const quickCards=[...home.querySelectorAll('.offer-grid .offer-card')];
 if(quickCards[0]){quickCards[0].innerHTML='<span class="offer-icon">🎓</span><span class="offer-copy"><strong>Class 6</strong><small>इस class के सभी subjects और learning tools</small></span><span class="offer-arrow">›</span>';quickCards[0].onclick=()=>subject?.scrollIntoView({behavior:'smooth',block:'start'});quickCards[0].removeAttribute('href')}
 if(quickCards[1]){quickCards[1].innerHTML='<span class="offer-icon">❓</span><span class="offer-copy"><strong>My Doubts</strong><small>अपना सवाल Tutor से पूछो</small></span><span class="offer-arrow">›</span>';quickCards[1].onclick=()=>window.toggleChat?.();quickCards[1].removeAttribute('href')}
 if(quickCards[2]){quickCards[2].innerHTML='<span class="offer-icon">🔁</span><span class="offer-copy"><strong>Revision</strong><small>कमजोर topics को दोबारा पढ़ो</small></span><span class="offer-arrow">›</span>';}
 if(quickCards[3]){quickCards[3].innerHTML='<span class="offer-icon">📊</span><span class="offer-copy"><strong>My Progress</strong><small>Mastery, scores और XP देखें</small></span><span class="offer-arrow">›</span>';}
 if(quickCards[4]){quickCards[4].innerHTML='<span class="offer-icon">📝</span><span class="offer-copy"><strong>All Tests</strong><small>Available practice और CBT tests</small></span><span class="offer-arrow">›</span>';quickCards[4].onclick=()=>tests?.scrollIntoView({behavior:'smooth',block:'start'});quickCards[4].removeAttribute('href')}
 if(quickCards[5]){quickCards[5].innerHTML='<span class="offer-icon">📖</span><span class="offer-copy"><strong>Study Library</strong><small>Subjects और chapters से सीखना शुरू करो</small></span><span class="offer-arrow">›</span>';}
 if(quickCards[6]){quickCards[6].innerHTML='<span class="offer-icon gold">🎯</span><span class="offer-copy"><strong>Practice</strong><small>Concept के बाद खुद को test करो</small></span><span class="offer-arrow">›</span>';quickCards[6].onclick=()=>tests?.scrollIntoView({behavior:'smooth',block:'start'});quickCards[6].removeAttribute('href')}
 if(quickCards[7])quickCards[7].style.display='none';
 const subjectHead=subject?.querySelector('h2');if(subjectHead)subjectHead.textContent='Subjects';
 const continueHead=cont?.querySelector('h2');if(continueHead)continueHead.textContent='Continue Learning';
 const continueLabels=home.querySelectorAll('.continue-label');if(continueLabels[1])continueLabels[1].textContent='Current learning path';
 const continueMeta=home.querySelector('.continue-meta span');if(continueMeta)continueMeta.textContent='Current subject progress';
 const testHead=tests?.querySelector('h2');if(testHead)testHead.textContent='Test Center';const testSub=tests?.querySelector('p');if(testSub)testSub.textContent='Practice से exam readiness तक।';
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
