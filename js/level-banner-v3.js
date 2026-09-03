(function(){
'use strict';

const TIERS=[
  {min:1,max:2,name:'Bronze',icon:'🥉',className:'bronze',line:'Start strong. Every small win counts.'},
  {min:3,max:4,name:'Silver',icon:'🥈',className:'silver',line:'Consistency is turning into skill.'},
  {min:5,max:6,name:'Gold',icon:'🥇',className:'gold',line:'Your learning streak is getting serious.'},
  {min:7,max:8,name:'Platinum',icon:'💠',className:'platinum',line:'You are building real mastery.'},
  {min:9,max:10,name:'Diamond',icon:'💎',className:'diamond',line:'Elite learning territory unlocked.'},
  {min:11,max:12,name:'Master',icon:'👑',className:'master',line:'You are becoming a learning leader.'},
  {min:13,max:Infinity,name:'Legend',icon:'🌟',className:'legend',line:'A level of your own. Keep inspiring.'}
];

function snapshot(){return window.XPSystem?.snapshot?.()||{total:0,level:{level:1,xpIntoLevel:0,nextLevelXP:100,title:'Learner'}}}
function tierFor(level){return TIERS.find(t=>level>=t.min&&level<=t.max)||TIERS[0]}
function totalNeededForLevel(level){if(level<=1)return 0;let total=0;for(let n=2;n<=level;n++)total+=100+((n-2)*50);return total}
function cumulativeNext(level){return totalNeededForLevel(level+1)}
function levelName(level){return tierFor(level).name}
function escapeHtml(v){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}

function addStyles(){
 if(document.getElementById('level-v3-style'))return;
 const s=document.createElement('style');s.id='level-v3-style';
 s.textContent=`
.level-v3-backdrop{position:fixed;inset:0;z-index:9990;background:rgba(10,14,22,.72);opacity:0;visibility:hidden;transition:opacity .28s ease,visibility .28s ease;backdrop-filter:blur(1px);-webkit-backdrop-filter:blur(1px)}
.level-v3-backdrop.is-open{opacity:1;visibility:visible}
.level-v3-drawer{position:absolute;top:0;right:0;width:min(500px,94vw);height:100%;background:#f7faff;box-shadow:-22px 0 60px rgba(0,0,0,.30);transform:translateX(100%);transition:transform .42s cubic-bezier(.18,.88,.2,1);display:flex;flex-direction:column;overflow:hidden}
.level-v3-backdrop.is-open .level-v3-drawer{transform:translateX(0)}
.level-v3-head{height:54px;flex:0 0 54px;display:flex;align-items:center;gap:10px;padding:0 15px;background:rgba(255,255,255,.97);border-bottom:1px solid #e1e7f0;box-sizing:border-box}
.level-v3-head button{width:32px;height:32px;border:0;background:transparent;color:#475569;display:grid;place-items:center;cursor:pointer;font-size:24px;line-height:1;padding:0;border-radius:9px}
.level-v3-head button:hover{background:#f1f5f9}.level-v3-head h2{margin:0;flex:1;font-size:19px;letter-spacing:-.02em;color:#263346}.level-v3-progress{height:34px;flex:0 0 34px;display:grid;grid-template-columns:repeat(7,1fr);gap:8px;padding:13px 16px 9px;box-sizing:border-box;background:#f7faff}.level-v3-progress i{height:4px;border-radius:99px;background:#cbd4df;transition:.25s}.level-v3-progress i.active{background:#273241;transform:scaleY(1.15)}
.level-v3-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}.level-v3-slide{display:none;padding:25px 18px 30px;min-height:100%;box-sizing:border-box}.level-v3-slide.active{display:block;animation:v3Slide .32s ease both}@keyframes v3Slide{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.level-v3-intro{text-align:center}.level-v3-kicker{font-size:11px;font-weight:900;letter-spacing:.17em;color:#6a7890}.level-v3-title{margin:9px 0 0;font-size:clamp(32px,8vw,46px);line-height:.95;letter-spacing:-.06em;color:#153f78;font-weight:950}.level-v3-title span{display:block;margin-top:9px;font-size:11px;letter-spacing:.16em;color:#0f766e}.level-v3-sub{margin:13px auto 0;max-width:420px;color:#4d5c70;font-size:14px;line-height:1.58}.level-v3-hero-icon{position:relative;width:120px;height:120px;margin:22px auto 17px;border-radius:34px;display:grid;place-items:center;background:linear-gradient(145deg,#eef6ff,#dbe9fb);border:1px solid #c7d8ec;box-shadow:0 18px 34px rgba(30,75,123,.16),inset 0 1px 0 #fff;animation:v3Float 3.2s ease-in-out infinite}@keyframes v3Float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}.level-v3-hero-icon:before,.level-v3-hero-icon:after{content:'✦';position:absolute;color:#f0b93b;font-size:18px;animation:v3Spark 2.1s ease-in-out infinite}.level-v3-hero-icon:before{left:-10px;top:14px}.level-v3-hero-icon:after{right:-8px;bottom:9px;animation-delay:.75s}@keyframes v3Spark{0%,100%{opacity:.25;transform:scale(.8) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(14deg)}}
.level-v3-hero-icon svg{width:72px;height:72px}.level-v3-slogan{position:relative;height:22px;margin:0 0 14px}.level-v3-slogan:before{content:'';position:absolute;left:0;right:0;top:11px;border-top:1px solid #bfd1e8}.level-v3-slogan span{position:relative;padding:0 12px;background:#f7faff;font-size:12px;font-weight:900;letter-spacing:.10em;color:#55749c}.level-v3-definition{max-width:430px;margin:0 auto;color:#415267;font-size:14px;line-height:1.62}.level-v3-info{margin-top:20px;padding:16px;text-align:left;border:1px solid #dae4f0;border-radius:19px;background:#fff;box-shadow:0 9px 25px rgba(17,39,67,.06)}.level-v3-info strong{display:block;font-size:16px;color:#1d2d43}.level-v3-info p{margin:6px 0 0;color:#68798e;font-size:12px;line-height:1.55}
.level-v3-current{display:grid;grid-template-columns:92px minmax(0,1fr);gap:15px;align-items:center}.level-v3-badge{position:relative;width:92px;height:92px;border-radius:26px;display:grid;place-items:center;background:linear-gradient(145deg,#edf5ff,#d8e8fb);border:1px solid #bdd2ea;box-shadow:0 11px 24px rgba(37,99,235,.12);animation:v3Pulse 2.6s ease-in-out infinite}@keyframes v3Pulse{0%,100%{box-shadow:0 11px 24px rgba(37,99,235,.12)}50%{box-shadow:0 13px 32px rgba(37,99,235,.20)}}.level-v3-badge .tier-icon{font-size:44px;filter:drop-shadow(0 5px 9px rgba(15,23,42,.13))}.level-v3-badge .level-number{position:absolute;right:-6px;bottom:-6px;padding:5px 8px;border-radius:10px;background:#1f2937;color:#fff;font-size:11px;font-weight:900;box-shadow:0 5px 14px rgba(0,0,0,.16)}.level-v3-eyebrow{font-size:10px;font-weight:900;letter-spacing:.13em;color:#73839a;text-transform:uppercase}.level-v3-current h1{margin:5px 0 0;font-size:26px;letter-spacing:-.045em;color:#182b42}.level-v3-current p{margin:5px 0 0;font-size:12px;color:#65758a;line-height:1.45}.level-v3-tier{display:inline-flex;align-items:center;gap:6px;margin-top:7px;padding:5px 8px;border-radius:999px;background:#eef4fb;border:1px solid #d7e2ef;color:#365778;font-size:10px;font-weight:900}
.level-v3-meter-wrap{margin-top:19px;padding:14px;border-radius:17px;background:#fff;border:1px solid #dce5ef}.level-v3-meter-line{display:flex;justify-content:space-between;gap:10px;font-size:12px;color:#66778d}.level-v3-meter-line b{color:#24364d}.level-v3-meter{height:11px;margin-top:9px;background:#dfe7f1;border-radius:99px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(15,23,42,.10)}.level-v3-meter i{display:block;width:0;height:100%;border-radius:99px;background:linear-gradient(90deg,#4f46e5,#0ea5e9,#14b8a6);transition:width .8s cubic-bezier(.18,.88,.2,1)}.level-v3-meter-note{display:flex;justify-content:space-between;gap:10px;margin-top:7px;font-size:10px;color:#718096}.level-v3-standing{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:14px;padding:13px 14px;background:#fff;border:1px solid #dce5ef;border-radius:15px}.level-v3-standing strong{font-size:13px;color:#22334a}.level-v3-standing span{font-size:11px;color:#65758b;text-align:right}
.level-v3-heading{margin:0 0 11px;font-size:16px;color:#21344d;letter-spacing:-.015em}.level-v3-ladder{display:grid;gap:9px}.level-v3-node{position:relative;display:grid;grid-template-columns:46px minmax(0,1fr) auto;gap:11px;align-items:center;padding:11px 12px;border:1px solid #dce5ef;border-radius:16px;background:#fff;overflow:hidden}.level-v3-node .node-icon{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;font-size:24px;background:#f1f5f9;border:1px solid #e2e8f0}.level-v3-node strong{font-size:14px;color:#22344b}.level-v3-node small{display:block;margin-top:3px;font-size:10px;color:#6b7b90}.level-v3-node .node-xp{font-size:10px;color:#6b7b90;font-weight:800;text-align:right}.level-v3-node.current{border-color:#8fb4e6;background:linear-gradient(90deg,#eef7ff,#fff);box-shadow:0 8px 20px rgba(37,99,235,.10)}.level-v3-node.current .node-icon{background:#e4f0ff;border-color:#bad3ef}.level-v3-node.current:after{content:'YOU';position:absolute;right:10px;top:8px;padding:3px 6px;border-radius:999px;background:#dbeafe;color:#24558e;font-size:7px;font-weight:900;letter-spacing:.1em}.level-v3-node.future{filter:blur(2.4px);opacity:.55}.level-v3-node.future:before{content:'✦';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;color:#64748b;font-size:24px;filter:blur(0)}.level-v3-node.past{opacity:.56}.level-v3-cloud{margin-top:13px;padding:13px 14px;border:1px dashed #bfd0e1;border-radius:15px;background:#f3f7fc;color:#53677e;font-size:12px;line-height:1.55}.level-v3-cloud strong{color:#293d56}
.level-v3-footer{flex:0 0 auto;display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px 15px;background:#fff;border-top:1px solid #dfe6ee;box-shadow:0 -8px 22px rgba(17,34,55,.08)}.level-v3-btn{height:50px;border-radius:9px;border:1px solid #d7dfe9;background:#fff;color:#a0aab8;font-size:13px;font-weight:900;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,background .15s ease}.level-v3-btn.primary{background:#20262b;color:#fff;border-color:#20262b}.level-v3-btn:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 6px 15px rgba(15,23,42,.10)}.level-v3-btn:disabled{opacity:.55;cursor:not-allowed}
@media(max-width:520px){.level-v3-drawer{width:100vw}.level-v3-head{padding:0 12px}.level-v3-progress{padding-left:12px;padding-right:12px;gap:6px}.level-v3-slide{padding:22px 14px 24px}.level-v3-current{grid-template-columns:76px minmax(0,1fr);gap:11px}.level-v3-badge{width:76px;height:76px;border-radius:21px}.level-v3-badge .tier-icon{font-size:35px}.level-v3-current h1{font-size:22px}.level-v3-footer{padding:11px 12px;gap:10px}.level-v3-btn{height:48px}.level-v3-node{grid-template-columns:40px minmax(0,1fr) auto}.level-v3-node .node-icon{width:40px;height:40px;font-size:21px}}
@media(prefers-reduced-motion:reduce){.level-v3-backdrop,.level-v3-drawer,.level-v3-slide,.level-v3-meter i,.level-v3-hero-icon,.level-v3-badge{transition:none!important;animation:none!important}}
`;
 document.head.appendChild(s)
}

function trophySvg(){return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M20 8h24v14c0 8.7-4.4 14.8-12 17.6C24.4 36.8 20 30.7 20 22V8Z" fill="#fff" stroke="#6d86a8" stroke-width="2.4"/><path d="M19 14H9v7c0 7.8 5 12.8 13 13.8M45 14h10v7c0 7.8-5 12.8-13 13.8" stroke="#7892b5" stroke-width="2.8" stroke-linecap="round"/><path d="M32 39v11M23 57h18" stroke="#849bbb" stroke-width="3.2" stroke-linecap="round"/><path d="m32 13 2.8 5.4 6 .9-4.4 4.2 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.2 6-.9L32 13Z" fill="#f4b942"/></svg>`}

function buildLadder(current){
 const start=Math.max(1,current-2),end=Math.min(current+4,15);let html='';
 for(let level=start;level<=end;level++){
  const tier=tierFor(level),kind=level===current?'current':level<current?'past':'future';
  const target=level===current?'Current':`${totalNeededForLevel(level)} XP target`;
  html+=`<div class="level-v3-node ${kind}"><div class="node-icon">${tier.icon}</div><div><strong>Level ${level} • ${escapeHtml(tier.name)}</strong><small>${escapeHtml(tier.line)}</small></div><div class="node-xp">${escapeHtml(target)}</div></div>`;
 }
 return html
}

function update(){
 const modal=document.getElementById('levelDrawerV3');if(!modal)return;
 const p=snapshot(),level=Math.max(1,Number(p.level?.level)||1),into=Math.max(0,Number(p.level?.xpIntoLevel)||0),next=Math.max(1,Number(p.level?.nextLevelXP)||100),total=Math.max(0,Number(p.total)||0),tier=tierFor(level),pct=Math.max(0,Math.min(100,Math.round(into/next*100))),need=Math.max(0,next-into);
 modal.querySelector('[data-level]').textContent=level;
 modal.querySelector('[data-total]').textContent=total+' XP';
 modal.querySelector('[data-into]').textContent=into+' / '+next+' XP';
 modal.querySelector('[data-next]').textContent=need+' XP to reach Level '+(level+1);
 modal.querySelector('[data-tier]').textContent=tier.icon+' '+tier.name+' Tier';
 modal.querySelector('[data-tier-line]').textContent=tier.line;
 modal.querySelector('[data-badge]').textContent=tier.icon;
 modal.querySelector('[data-rank]').textContent=tier.name+' Tier';
 modal.querySelector('.level-v3-meter i').style.width=pct+'%';
 modal.querySelector('[data-ladder]').innerHTML=buildLadder(level);
 const all=modal.querySelectorAll('[data-stamp]');all.forEach(x=>x.textContent='Lv '+level);
}

function setSlide(n){
 const modal=document.getElementById('levelDrawerV3');if(!modal)return;
 const slides=[...modal.querySelectorAll('.level-v3-slide')],max=slides.length,next=Math.max(0,Math.min(max-1,n));
 slides.forEach((s,i)=>s.classList.toggle('active',i===next));
 modal.querySelectorAll('.level-v3-progress i').forEach((x,i)=>x.classList.toggle('active',i===next));
 modal.dataset.slide=String(next);
 const prev=modal.querySelector('[data-prev]'),forward=modal.querySelector('[data-forward]');
 prev.disabled=next===0;forward.textContent=next===max-1?'Finish ✓':'Next ›';
 modal.querySelector('.level-v3-scroll').scrollTop=0;
}
function close(){const m=document.getElementById('levelDrawerV3');if(!m)return;m.classList.remove('is-open');m.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function open(){const m=document.getElementById('levelDrawerV3');if(!m)return;update();setSlide(0);m.classList.add('is-open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}

function install(){
 if(document.getElementById('levelDrawerV3'))return;addStyles();
 const modal=document.createElement('div');modal.id='levelDrawerV3';modal.className='level-v3-backdrop';modal.setAttribute('aria-hidden','true');
 modal.innerHTML=`<aside class="level-v3-drawer" role="dialog" aria-modal="true" aria-labelledby="levelV3Title"><header class="level-v3-head"><button type="button" data-back aria-label="Back">‹</button><h2 id="levelV3Title">Information</h2><button type="button" data-close aria-label="Close">×</button></header><div class="level-v3-progress">${Array.from({length:7},()=>'<i></i>').join('')}</div><div class="level-v3-scroll">
<section class="level-v3-slide level-v3-intro active"><div class="level-v3-kicker">INTRODUCING</div><h1 class="level-v3-title">Level Up!<span>YOUR LEARNING JOURNEY</span></h1><div class="level-v3-hero-icon">${trophySvg()}</div><div class="level-v3-slogan"><span>MAKE EVERY XP COUNT</span></div><p class="level-v3-definition">Earn XP by learning, practising, revising and taking tests. Every useful effort moves you one step closer to your next level.</p><div class="level-v3-info"><strong>⚡ XP = Your Progress Power</strong><p>XP is the points balance that powers your level. The more meaningful learning you complete, the further your journey goes.</p></div></section>
<section class="level-v3-slide"><div class="level-v3-kicker">YOUR CURRENT STANDING</div><div class="level-v3-current" style="margin-top:10px"><div class="level-v3-badge"><span class="tier-icon" data-badge>🥉</span><span class="level-number" data-stamp>Lv 1</span></div><div><div class="level-v3-eyebrow">YOU ARE CURRENTLY</div><h1>Level <span data-level>1</span></h1><p data-tier-line>Start strong. Every small win counts.</p><span class="level-v3-tier" data-tier>🥉 Bronze Tier</span></div></div><div class="level-v3-meter-wrap"><div class="level-v3-meter-line"><b data-total>0 XP</b><span data-into>0 / 100 XP</span></div><div class="level-v3-meter"><i></i></div><div class="level-v3-meter-note"><span>Progress to next level</span><b data-next>100 XP to reach Level 2</b></div></div><div class="level-v3-standing"><strong>Your standing</strong><span data-rank>Bronze Tier</span></div></section>
<section class="level-v3-slide"><div class="level-v3-kicker">THE LEVEL LADDER</div><h2 class="level-v3-heading" style="margin-top:7px">Every new level has a new identity.</h2><div class="level-v3-ladder" data-ladder></div><div class="level-v3-cloud"><strong>☁️ Future levels stay clouded.</strong><br>Keep earning XP and each next tier will reveal itself. Bronze → Silver → Gold → Platinum → Diamond → Master → Legend.</div></section>
<section class="level-v3-slide"><div class="level-v3-kicker">YOUR NEXT UNLOCK</div><h2 class="level-v3-heading" style="margin-top:7px">The next level should feel earned.</h2><div class="level-v3-info"><strong>🚀 Level up through real learning</strong><p>Finish chapters, practise questions, revise consistently and take tests. Your XP balance decides when the next tier opens.</p></div><div class="level-v3-info"><strong>💎 Tier journey</strong><p>Bronze builds the habit. Silver builds consistency. Gold builds confidence. Platinum and Diamond signal mastery. Master and Legend are the long-game goals.</p></div></section>
<section class="level-v3-slide"><div class="level-v3-kicker">KEEP CLIMBING</div><h2 class="level-v3-heading" style="font-size:23px;margin-top:8px">Small wins. Big journey.</h2><div class="level-v3-info"><strong>🎯 Focus on the next useful action.</strong><p>You do not need to rush through levels. Learn well, earn XP honestly, and let each unlock mark something you have actually achieved.</p></div><div class="level-v3-info"><strong>🌟 Your journey is always moving.</strong><p>Your current tier is just the chapter you are in—not the finish line.</p></div></section>
<section class="level-v3-slide"><div class="level-v3-kicker">LEVEL SYSTEM</div><h2 class="level-v3-heading" style="font-size:23px;margin-top:8px">One balance. One journey.</h2><div class="level-v3-info"><strong>⚡ XP powers your level</strong><p>The navbar, progress view and this information drawer read the same central XP balance.</p></div><div class="level-v3-info"><strong>🏆 Your future standing</strong><p>When you reach a new tier, the clouded destination becomes your new current standing.</p></div></section>
<section class="level-v3-slide"><div class="level-v3-intro" style="padding-top:24px"><div class="level-v3-kicker">READY?</div><h1 class="level-v3-title" style="font-size:35px">Keep Learning.<span>KEEP LEVELING UP.</span></h1><div class="level-v3-hero-icon" style="margin-top:28px">${trophySvg()}</div><p class="level-v3-definition">Your next tier is waiting behind the cloud. Earn it one learning win at a time. 🌟</p></div></section>
</div><footer class="level-v3-footer"><button class="level-v3-btn" data-prev disabled>‹ Previous</button><button class="level-v3-btn primary" data-forward>Next ›</button></footer></aside>`;
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 modal.querySelector('[data-close]').addEventListener('click',close);modal.querySelector('[data-back]').addEventListener('click',()=>{const n=Number(modal.dataset.slide||0);if(n>0)setSlide(n-1);else close()});modal.querySelector('[data-prev]').addEventListener('click',()=>setSlide(Number(modal.dataset.slide||0)-1));modal.querySelector('[data-forward]').addEventListener('click',()=>{const n=Number(modal.dataset.slide||0),max=modal.querySelectorAll('.level-v3-slide').length;if(n===max-1)close();else setSlide(n+1)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 document.body.appendChild(modal);
 const nav=document.getElementById('levelMiniBtn');if(nav){nav.onclick=open;nav.setAttribute('aria-label','अपना Level और XP देखें')}
}
function wire(){const b=document.getElementById('levelMiniBtn');if(b){b.onclick=open;b.setAttribute('aria-label','अपना Level और XP देखें');return true}return false}
window.LevelBanner={open,close,refresh:update};
window.addEventListener('DOMContentLoaded',()=>{install();wire()});
window.addEventListener('load',()=>{install();wire()});
window.addEventListener('xp:earned',()=>update());
})();
