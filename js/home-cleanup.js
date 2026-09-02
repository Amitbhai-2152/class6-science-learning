(function(){'use strict';
function makeCard(icon,title,desc,href,action){
 const el=href?document.createElement('a'):document.createElement('button');
 el.className='offer-card'; if(href)el.href=href; else el.type='button';
 el.innerHTML='<span class="offer-icon">'+icon+'</span><span class="offer-copy"><strong>'+title+'</strong><small>'+desc+'</small></span><span class="offer-arrow">›</span>';
 if(action)el.addEventListener('click',action);
 return el;
}
function clean(){
 const home=document.getElementById('homeView'); if(!home)return;
 const content=home.querySelector('.study-content'); if(!content)return;
 const offerings=content.querySelector('.offer-grid')?.closest('.study-section');
 if(!offerings)return;
 const heading=offerings.querySelector('h2'); if(heading)heading.textContent='Batch Offerings';
 const sub=offerings.querySelector('.study-section-head p'); if(sub)sub.textContent='हर सुविधा अपनी सही category में।';
 const grid=offerings.querySelector('.offer-grid');
 if(grid){
  grid.replaceChildren(
   makeCard('🎓','All Classes','Science, Maths, English, Hindi और GK','subjects/all-classes.html'),
   makeCard('📝','All Tests','Sunday exam planner, syllabus preview और candidate CBT','tests/planner.html'),
   makeCard('🔁','Revision','कमजोर topics और chapter revision','javascript:void(0)',()=>window.openRevision?.()),
   makeCard('📊','My Progress','Mastery, scores, attempts और XP','javascript:void(0)',()=>window.openProgress?.())
  );
 }
 ['.subject-grid','.test-grid','.home-chapter-section','.reward-stats'].forEach(sel=>{
  const node=home.querySelector(sel); const section=node?.closest('.study-section'); if(section)section.remove();
 });
 home.querySelectorAll('.study-section').forEach(section=>{
  const text=(section.querySelector('h2')?.textContent||'').trim().toLowerCase();
  if(['subjects','test center','science chapters','learning rewards','quick access'].includes(text))section.remove();
 });
 const title=home.querySelector('.batch-title'); if(title)title.textContent='कक्षा 6 • Learning Hub';
 const bannerSub=home.querySelector('.batch-sub'); if(bannerSub)bannerSub.textContent='Learn • Practice • Test • Improve';
 const bannerAction=home.querySelector('.batch-button'); if(bannerAction){bannerAction.textContent='Revision Plan ↗';bannerAction.onclick=()=>window.openRevision?.()}
}
function routeFromHash(){
 const h=location.hash.replace(/^#/,'');
 if(h==='science-practice'&&window.FullScienceTest){window.FullScienceTest.start(4)}
 else if(h==='science-cbt'&&window.ScienceCBT){window.ScienceCBT.open()}
 else if(h==='science'&&window.openChapter){window.openChapter(1)}
}
window.addEventListener('load',()=>{setTimeout(()=>{clean();routeFromHash()},0)});
window.addEventListener('science:xp',clean);
window.HomeCleanup={clean,routeFromHash};
})();
