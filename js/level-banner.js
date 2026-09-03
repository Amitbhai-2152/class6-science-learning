(function(){
  'use strict';

  function snapshot(){
    return window.XPSystem?.snapshot?.() || {total:0,level:{level:1,xpIntoLevel:0,nextLevelXP:100,title:'Learner'}};
  }
  function levelNeed(level){let total=0;for(let n=2;n<=level;n++)total+=100+((n-2)*50);return total;}
  function levelTitle(level){return level>=10?'Master':level>=7?'Achiever':level>=5?'Scholar':level>=3?'Explorer':'Learner';}
  function escapeHtml(value){return String(value).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}

  function addStyles(){
    if(document.getElementById('level-drawer-style'))return;
    const s=document.createElement('style');s.id='level-drawer-style';
    s.textContent=`
.level-drawer-backdrop{position:fixed;inset:0;z-index:9990;background:rgba(10,15,24,.68);opacity:0;visibility:hidden;transition:opacity .24s ease,visibility .24s ease}
.level-drawer-backdrop.is-open{opacity:1;visibility:visible}
.level-drawer{position:absolute;top:0;right:0;width:min(480px,92vw);height:100%;background:#f8fbff;box-shadow:-18px 0 50px rgba(0,0,0,.28);transform:translateX(100%);transition:transform .34s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;overflow:hidden}
.level-drawer-backdrop.is-open .level-drawer{transform:translateX(0)}
.level-drawer-head{height:52px;flex:0 0 52px;background:rgba(255,255,255,.98);display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid #e3e8f0;box-sizing:border-box}
.level-drawer-back{width:30px;height:30px;border:0;background:transparent;color:#475569;font-size:24px;line-height:1;display:grid;place-items:center;padding:0;cursor:pointer}
.level-drawer-title{margin:0;font-size:19px;font-weight:800;color:#253041;letter-spacing:-.02em;flex:1}
.level-drawer-close{width:32px;height:32px;border:0;background:transparent;color:#475569;font-size:24px;line-height:1;display:grid;place-items:center;padding:0;cursor:pointer}
.level-drawer-steps{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;padding:15px 16px 13px;background:#f8fbff}
.level-drawer-step{height:4px;border-radius:999px;background:#cbd3de;transition:background .22s ease,transform .22s ease}
.level-drawer-step.active{background:#253041;transform:scaleY(1.15)}
.level-drawer-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}
.level-slide{display:none;padding:26px 18px 28px;min-height:100%;box-sizing:border-box}
.level-slide.is-active{display:block;animation:levelSlideIn .28s ease both}
@keyframes levelSlideIn{from{opacity:.2;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.level-intro{text-align:center}
.level-intro-kicker{font-size:11px;font-weight:900;letter-spacing:.14em;color:#65748a;text-transform:uppercase}
.level-intro-title{margin:10px 0 0;font-size:clamp(30px,7vw,44px);line-height:.98;letter-spacing:-.055em;color:#163c72;font-weight:950}
.level-intro-title span{font-size:.34em;vertical-align:middle;color:#0f766e;letter-spacing:.02em;margin-left:5px}
.level-intro-sub{margin:13px auto 0;max-width:410px;font-size:14px;line-height:1.55;color:#4b5b70}
.level-icon{width:108px;height:108px;margin:23px auto 17px;border-radius:30px;display:grid;place-items:center;background:linear-gradient(145deg,#edf4ff,#dce9fb);border:1px solid #c9d9ec;box-shadow:0 13px 30px rgba(30,74,123,.14),inset 0 1px 0 #fff}
.level-icon svg{width:68px;height:68px}
.level-swoosh{height:24px;margin:4px 0 12px;position:relative}
.level-swoosh:before{content:"";position:absolute;left:0;right:0;top:11px;border-top:1px solid #bfd4ef}
.level-swoosh span{position:relative;background:#f8fbff;padding:0 12px;color:#54739b;font-size:13px;font-weight:900;letter-spacing:.08em}
.level-definition{margin:0 auto;max-width:420px;color:#415168;font-size:14px;line-height:1.6}
.level-stat-card{margin:22px 0 0;padding:17px 15px;border:1px solid #dbe4ef;border-radius:19px;background:#fff;box-shadow:0 8px 24px rgba(16,42,67,.06)}
.level-stat-card b{display:block;font-size:17px;color:#18283f}.level-stat-card p{margin:6px 0 0;font-size:12px;color:#68788c;line-height:1.5}
.level-current{display:grid;grid-template-columns:88px minmax(0,1fr);gap:14px;align-items:center;margin:4px 0 20px}
.level-badge{width:88px;height:88px;border-radius:24px;display:grid;place-items:center;background:linear-gradient(145deg,#eff6ff,#dbeafe);border:1px solid #bfd4ec;box-shadow:0 10px 22px rgba(37,99,235,.12)}
.level-badge strong{font-size:26px;letter-spacing:-.04em;color:#234b80}.level-current h2{margin:0;font-size:23px;letter-spacing:-.04em;color:#15283f}.level-current p{margin:4px 0 0;color:#63748a;font-size:12px}
.level-xp-line{display:flex;justify-content:space-between;gap:10px;font-size:12px;color:#64748b;margin-top:16px}.level-xp-line b{color:#21334a}.level-meter{height:10px;margin-top:8px;background:#dfe7f1;border-radius:99px;overflow:hidden}.level-meter i{display:block;width:0;height:100%;border-radius:99px;background:linear-gradient(90deg,#4759e8,#0ea5e9,#14b8a6);transition:width .65s cubic-bezier(.2,.8,.2,1)}
.level-rank{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 14px;border-radius:15px;background:#fff;border:1px solid #dbe4ef}.level-rank strong{font-size:13px;color:#1e2e44}.level-rank span{font-size:11px;color:#65748a}
.level-roadmap-title{margin:0 0 10px;font-size:15px;color:#203149}.level-roadmap{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.level-node{position:relative;padding:15px 11px;border:1px solid #dbe4ef;border-radius:17px;background:#fff;min-height:88px;box-sizing:border-box;text-align:left;overflow:hidden}.level-node strong{display:block;font-size:20px;color:#203149}.level-node small{display:block;margin-top:5px;font-size:10px;color:#6a798c;font-weight:800}.level-node.current{border-color:#8db4e8;background:linear-gradient(180deg,#edf6ff,#fff);box-shadow:0 9px 20px rgba(37,99,235,.1)}.level-node.current:after{content:'YOU';position:absolute;right:9px;top:9px;padding:3px 6px;border-radius:999px;background:#dbeafe;color:#24558f;font-size:8px;font-weight:900;letter-spacing:.1em}.level-node.future{filter:blur(2.1px);opacity:.58}.level-node.future:before{content:'✦';position:absolute;inset:0;display:grid;place-items:center;font-size:26px;color:rgba(71,85,105,.35);filter:blur(0)}.level-node.past{opacity:.58}
.level-cloud-note{margin-top:14px;padding:13px 14px;border:1px dashed #bfd0e3;background:#f4f8fc;border-radius:15px;color:#52657c;font-size:12px;line-height:1.55}.level-cloud-note b{color:#273a53}
.level-footer{flex:0 0 auto;display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:13px 16px 12px;background:#fff;border-top:1px solid #dfe6ef;box-shadow:0 -8px 22px rgba(17,34,55,.07)}
.level-nav-btn{height:50px;border-radius:9px;border:1px solid #d8e0ea;background:#fff;color:#9aa5b4;font-weight:800;font-size:13px;cursor:pointer}.level-nav-btn.primary{background:#20262b;color:#fff;border-color:#20262b}.level-nav-btn:disabled{opacity:.52;cursor:not-allowed}.level-nav-btn:not(:disabled):hover{transform:translateY(-1px)}
@media(max-width:520px){.level-drawer{width:100vw}.level-drawer-head{padding:0 13px}.level-drawer-steps{padding-left:13px;padding-right:13px;gap:6px}.level-slide{padding:22px 14px 24px}.level-current{grid-template-columns:74px minmax(0,1fr);gap:11px}.level-badge{width:74px;height:74px;border-radius:20px}.level-footer{padding:11px 12px;gap:10px}.level-nav-btn{height:48px}.level-roadmap{grid-template-columns:1fr 1fr}}
@media(prefers-reduced-motion:reduce){.level-drawer-backdrop,.level-drawer,.level-slide,.level-meter i{transition:none;animation:none}}
`;
    document.head.appendChild(s);
  }

  function iconSvg(){return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M20 8h24v14c0 8.5-4.3 14.1-12 17-7.7-2.9-12-8.5-12-17V8Z" fill="#fff" stroke="#6b86aa" stroke-width="2.3"/><path d="M19 14H9v7c0 8 5 12 13 13M45 14h10v7c0 8-5 12-13 13" stroke="#7b93b6" stroke-width="2.8" stroke-linecap="round"/><path d="M32 39v11M23 56h18" stroke="#8098ba" stroke-width="3.2" stroke-linecap="round"/><path d="m32 13 2.8 5.4 6 .9-4.4 4.2 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.2 6-.9L32 13Z" fill="#f4b942"/></svg>`}

  function buildLevels(current){
    const start=Math.max(1,current-2),end=current+3;let out='';
    for(let level=start;level<=end;level++){
      const kind=level===current?'current':level<current?'past':'future';
      out+=`<div class="level-node ${kind}"><strong>Lv ${level}</strong><small>${escapeHtml(levelTitle(level))}</small><small>${level===current?'Your current standing':levelNeed(level)+' XP target'}</small></div>`;
    }
    return out;
  }

  function update(){
    const modal=document.getElementById('levelDrawer');if(!modal)return;
    const p=snapshot(),current=Math.max(1,Number(p.level?.level)||1),into=Math.max(0,Number(p.level?.xpIntoLevel)||0),next=Math.max(1,Number(p.level?.nextLevelXP)||100),total=Math.max(0,Number(p.total)||0),pct=Math.max(0,Math.min(100,Math.round(into/next*100)));
    modal.querySelectorAll('[data-level]').forEach(x=>x.textContent=current);
    modal.querySelector('[data-title]').textContent=p.level?.title||levelTitle(current);
    modal.querySelector('[data-total-xp]').textContent=`${total} XP`;
    modal.querySelector('[data-into]').textContent=`${into} / ${next} XP`;
    modal.querySelector('[data-need]').textContent=`${Math.max(0,next-into)} XP to next level`;
    modal.querySelector('.level-meter i').style.width=pct+'%';
    modal.querySelector('.level-roadmap').innerHTML=buildLevels(current);
    const tier=current>=10?'🏆 Master tier':current>=7?'⚡ Achiever tier':current>=5?'📘 Scholar tier':current>=3?'🚀 Explorer tier':'🌱 Learner tier';
    modal.querySelector('[data-rank]').textContent=tier;
  }

  function setSlide(n){
    const modal=document.getElementById('levelDrawer');if(!modal)return;
    const slides=[...modal.querySelectorAll('.level-slide')],max=slides.length;
    const next=Math.max(0,Math.min(max-1,n));slides.forEach((s,i)=>s.classList.toggle('is-active',i===next));
    modal.querySelectorAll('.level-drawer-step').forEach((x,i)=>x.classList.toggle('active',i===next));
    modal.dataset.slide=String(next);
    const prev=modal.querySelector('[data-prev]'),forward=modal.querySelector('[data-next]');
    prev.disabled=next===0;forward.textContent=next===max-1?'Done ✓':'Next ›';
    modal.querySelector('.level-drawer-scroll').scrollTop=0;
  }

  function close(){const modal=document.getElementById('levelDrawer');if(!modal)return;modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  function open(){const modal=document.getElementById('levelDrawer');if(!modal)return;update();setSlide(0);modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}

  function install(){
    if(document.getElementById('levelDrawer'))return;addStyles();
    const modal=document.createElement('div');modal.id='levelDrawer';modal.className='level-drawer-backdrop';modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<aside class="level-drawer" role="dialog" aria-modal="true" aria-labelledby="levelDrawerTitle"><header class="level-drawer-head"><button class="level-drawer-back" type="button" aria-label="Back">‹</button><h2 id="levelDrawerTitle" class="level-drawer-title">Information</h2><button class="level-drawer-close" type="button" aria-label="Close">×</button></header><div class="level-drawer-steps">${Array.from({length:7},()=>'<span class="level-drawer-step"></span>').join('')}</div><div class="level-drawer-scroll"><section class="level-slide level-intro is-active"><div class="level-intro-kicker">INTRODUCING</div><div class="level-intro-title">Level Up! <span>YOUR LEARNING JOURNEY</span></div><div class="level-icon">${iconSvg()}</div><div class="level-swoosh"><span>MAKING LEARNING FUN</span></div><p class="level-definition">हर activity से XP कमाओ, अपना level बढ़ाओ और धीरे-धीरे अगले level unlock करो। तुम्हारा progress उसी learning journey से जुड़ा रहेगा।</p><div class="level-stat-card"><b>⚡ XP or Experience Points</b><p>XP तुम्हारी learning activities से earned points हैं। जैसे-जैसे XP बढ़ेगा, तुम्हारा level और standing भी आगे बढ़ेगा।</p></div></section><section class="level-slide"><div class="level-current"><div class="level-badge"><strong>Lv <span data-level>1</span></strong></div><div><h2><span data-title>Learner</span> level</h2><p>यह अभी तुम्हारी current standing है।</p><div class="level-xp-line"><span data-into>0 / 100 XP</span><b data-total-xp>0 XP</b></div><div class="level-meter"><i></i></div><div class="level-xp-line"><span data-need>100 XP to next level</span><b>Keep going 🚀</b></div></div></div><div class="level-rank"><strong>Your current standing</strong><span data-rank>🌱 Learner tier</span></div><div class="level-stat-card"><b>तुम्हारा अगला milestone</b><p>हर नया level पिछले से थोड़ा बड़ा achievement है। अपनी पढ़ाई consistent रखो और next unlock तक पहुँचो।</p></div></section><section class="level-slide"><h3 class="level-roadmap-title">Your level roadmap</h3><div class="level-roadmap"></div><div class="level-cloud-note"><b>☁️ Future levels are clouded.</b> अभी जो levels unlock नहीं हुए हैं, वे hidden रहेंगे। XP बढ़ने पर वही cloud हटेगा और अगला level सामने आएगा।</div><div class="level-stat-card"><b>🏆 Make the next unlock yours</b><p>नई level discovery student को एक clear लक्ष्य देती है—learn, practice, earn XP, unlock.</p></div></section></div><footer class="level-footer"><button class="level-nav-btn" type="button" data-prev>‹ Previous</button><button class="level-nav-btn primary" type="button" data-next>Next ›</button></footer></aside>`;
    modal.addEventListener('click',e=>{if(e.target===modal)close()});
    modal.querySelector('.level-drawer-back').addEventListener('click',close);modal.querySelector('.level-drawer-close').addEventListener('click',close);
    modal.querySelector('[data-prev]').addEventListener('click',()=>setSlide(Number(modal.dataset.slide||0)-1));
    modal.querySelector('[data-next]').addEventListener('click',()=>{const i=Number(modal.dataset.slide||0);if(i===2)close();else setSlide(i+1)});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    document.body.appendChild(modal);
    const button=document.getElementById('levelMiniBtn');if(button){button.onclick=open;button.setAttribute('aria-label','अपना Level और XP देखें')}
  }
  function wireButton(){const button=document.getElementById('levelMiniBtn');if(!button)return false;button.onclick=open;button.setAttribute('aria-label','अपना Level और XP देखें');return true}
  window.LevelBanner={open,close,refresh:update};
  window.addEventListener('DOMContentLoaded',()=>{install();wireButton()});window.addEventListener('load',()=>{install();wireButton()});window.addEventListener('xp:earned',update);
})();