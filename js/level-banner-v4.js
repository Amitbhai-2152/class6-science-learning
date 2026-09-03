(function(){
  'use strict';

  const TIERS=[
    {min:1,max:2,name:'Bronze',icon:'🥉',line:'Start strong. Every small win adds up.'},
    {min:3,max:4,name:'Silver',icon:'🥈',line:'Consistency is turning into skill.'},
    {min:5,max:6,name:'Gold',icon:'🥇',line:'You are building a serious learning habit.'},
    {min:7,max:8,name:'Platinum',icon:'💠',line:'Your practice is turning into mastery.'},
    {min:9,max:10,name:'Diamond',icon:'💎',line:'You are entering elite learning territory.'},
    {min:11,max:12,name:'Master',icon:'👑',line:'You are becoming a learning leader.'},
    {min:13,max:Infinity,name:'Legend',icon:'🌟',line:'A level of your own. Keep going.'}
  ];

  function snapshot(){
    return window.XPSystem?.snapshot?.() || {total:0,subjects:{},daily:{earned:0},level:{level:1,xpIntoLevel:0,nextLevelXP:100,title:'Learner'}};
  }
  function tierFor(level){return TIERS.find(t=>level>=t.min&&level<=t.max)||TIERS[0]}
  function totalNeeded(level){if(level<=1)return 0;let total=0;for(let n=2;n<=level;n++)total+=100+((n-2)*50);return total}
  function escapeHtml(v){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function subjectTotal(subjects){return Object.values(subjects||{}).reduce((s,v)=>s+(Number(v)||0),0)}

  function addStyles(){
    if(document.getElementById('level-v4-style'))return;
    const s=document.createElement('style');s.id='level-v4-style';
    s.textContent=`
.level4-backdrop{position:fixed;inset:0;z-index:9990;background:rgba(8,13,22,.70);opacity:0;visibility:hidden;transition:opacity .28s ease,visibility .28s ease;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
.level4-backdrop.open{opacity:1;visibility:visible}.level4-drawer{position:absolute;top:0;right:0;width:min(510px,94vw);height:100%;background:#f7faff;box-shadow:-24px 0 70px rgba(0,0,0,.32);transform:translateX(100%);transition:transform .46s cubic-bezier(.18,.88,.2,1);display:flex;flex-direction:column;overflow:hidden}.level4-backdrop.open .level4-drawer{transform:translateX(0)}
.level4-head{height:56px;flex:0 0 56px;display:flex;align-items:center;gap:10px;padding:0 15px;background:rgba(255,255,255,.98);border-bottom:1px solid #e1e7f0}.level4-head button{width:34px;height:34px;border:0;border-radius:10px;background:transparent;color:#475569;font-size:25px;display:grid;place-items:center;cursor:pointer}.level4-head button:hover{background:#f1f5f9}.level4-head h2{margin:0;flex:1;font-size:19px;color:#263346}.level4-progress{height:30px;flex:0 0 30px;display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:11px 16px 8px;box-sizing:border-box;background:#f7faff}.level4-progress i{height:4px;border-radius:99px;background:#ccd5e0;transition:.28s}.level4-progress i.active{background:#263241;transform:scaleY(1.2)}
.level4-scroll{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}.level4-slide{display:none;padding:27px 19px 32px;min-height:100%;box-sizing:border-box}.level4-slide.active{display:block;animation:l4In .34s ease both}@keyframes l4In{from{opacity:0;transform:translateY(13px)}to{opacity:1;transform:translateY(0)}}
.level4-intro{text-align:center}.level4-kicker{font-size:11px;font-weight:900;letter-spacing:.18em;color:#6a7890}.level4-title{margin:10px 0 0;font-size:clamp(33px,8vw,48px);line-height:.94;letter-spacing:-.06em;font-weight:950;color:#163f78}.level4-title small{display:block;margin-top:11px;font-size:11px;letter-spacing:.14em;color:#0f766e}.level4-sub{margin:13px auto 0;max-width:430px;font-size:14px;line-height:1.6;color:#4d5d72}.level4-hero{position:relative;width:124px;height:124px;margin:22px auto 18px;border-radius:35px;display:grid;place-items:center;background:linear-gradient(145deg,#eff6ff,#d8e8fb);border:1px solid #c4d7ec;box-shadow:0 18px 38px rgba(30,74,123,.17),inset 0 1px 0 #fff;animation:l4Float 3.2s ease-in-out infinite}@keyframes l4Float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}.level4-hero:before,.level4-hero:after{content:'✦';position:absolute;color:#f1ba40;font-size:18px;animation:l4Spark 2s ease-in-out infinite}.level4-hero:before{left:-10px;top:14px}.level4-hero:after{right:-9px;bottom:12px;animation-delay:.7s}@keyframes l4Spark{0%,100%{opacity:.25;transform:scale(.8) rotate(0)}50%{opacity:1;transform:scale(1.2) rotate(15deg)}}.level4-hero svg{width:74px;height:74px}.level4-rule{position:relative;height:22px;margin:0 0 14px}.level4-rule:before{content:'';position:absolute;left:0;right:0;top:11px;border-top:1px solid #bfd2e9}.level4-rule span{position:relative;background:#f7faff;padding:0 12px;color:#55769f;font-size:12px;font-weight:900;letter-spacing:.1em}.level4-card{padding:16px;border:1px solid #dae4ef;border-radius:19px;background:#fff;box-shadow:0 9px 25px rgba(17,39,67,.06);text-align:left}.level4-card strong{display:block;font-size:16px;color:#1d2e45}.level4-card p{margin:7px 0 0;font-size:12px;line-height:1.58;color:#68798e}
.level4-xp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}.level4-xp-item{padding:13px;border-radius:15px;background:#f8fbff;border:1px solid #dde6f0}.level4-xp-item b{display:block;font-size:16px;color:#20344d}.level4-xp-item span{display:block;margin-top:4px;font-size:10px;line-height:1.45;color:#718096}.level4-ways{display:grid;gap:9px;margin-top:15px}.level4-way{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:11px;align-items:center;padding:11px 12px;border:1px solid #dce5ef;border-radius:15px;background:#fff}.level4-way .way-icon{width:38px;height:38px;border-radius:11px;background:#eef4fb;display:grid;place-items:center;font-size:19px}.level4-way b{font-size:12px;color:#26384f}.level4-way span{display:block;margin-top:2px;font-size:10px;color:#718096;line-height:1.4}.level4-way em{font-style:normal;font-size:10px;color:#64748b;font-weight:800;text-align:right}.level4-note{margin-top:12px;padding:11px 12px;border:1px dashed #bfd0e2;border-radius:14px;background:#f4f8fc;color:#52657c;font-size:10px;line-height:1.55}.level4-note b{color:#263a54}
.level4-current{display:grid;grid-template-columns:92px minmax(0,1fr);gap:15px;align-items:center}.level4-badge{position:relative;width:92px;height:92px;border-radius:26px;display:grid;place-items:center;background:linear-gradient(145deg,#eff6ff,#d9e8fb);border:1px solid #bfd3e9;box-shadow:0 11px 25px rgba(37,99,235,.13);animation:l4Pulse 2.6s ease-in-out infinite}@keyframes l4Pulse{0%,100%{box-shadow:0 11px 25px rgba(37,99,235,.13)}50%{box-shadow:0 14px 34px rgba(37,99,235,.22)}}.level4-badge .tier-icon{font-size:44px;filter:drop-shadow(0 5px 8px rgba(15,23,42,.12))}.level4-badge .lvl-chip{position:absolute;right:-7px;bottom:-7px;padding:5px 8px;border-radius:10px;background:#20262b;color:#fff;font-size:10px;font-weight:900}.level4-eyebrow{font-size:10px;font-weight:900;letter-spacing:.13em;color:#728198;text-transform:uppercase}.level4-current h1{margin:5px 0 0;font-size:26px;letter-spacing:-.045em;color:#182b42}.level4-current p{margin:5px 0 0;font-size:12px;color:#65758b;line-height:1.45}.level4-tier{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:5px 9px;border-radius:999px;border:1px solid #d7e2ef;background:#eef4fb;color:#365778;font-size:10px;font-weight:900}
.level4-meter{margin-top:18px;padding:14px;border-radius:17px;background:#fff;border:1px solid #dce5ef}.level4-meter-line{display:flex;justify-content:space-between;gap:10px;font-size:12px;color:#66778c}.level4-meter-line b{color:#25374d}.level4-bar{height:11px;margin-top:9px;background:#e0e8f1;border-radius:99px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(15,23,42,.1)}.level4-bar i{display:block;width:0;height:100%;border-radius:99px;background:linear-gradient(90deg,#4f46e5,#0ea5e9,#14b8a6);transition:width .85s cubic-bezier(.18,.88,.2,1)}.level4-meter-foot{display:flex;justify-content:space-between;gap:9px;margin-top:7px;font-size:10px;color:#718096}.level4-standing{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:13px;padding:13px 14px;border:1px solid #dce5ef;border-radius:15px;background:#fff}.level4-standing b{font-size:13px;color:#22354c}.level4-standing span{text-align:right;font-size:11px;color:#63758b}
.level4-heading{margin:0 0 10px;font-size:16px;color:#21344d}.level4-ladder{display:grid;gap:8px}.level4-node{position:relative;display:grid;grid-template-columns:43px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px;border:1px solid #dce5ef;border-radius:15px;background:#fff;overflow:hidden}.level4-node .node-icon{width:43px;height:43px;border-radius:12px;background:#f1f5f9;border:1px solid #e1e8ef;display:grid;place-items:center;font-size:23px}.level4-node b{display:block;font-size:13px;color:#22354b}.level4-node small{display:block;margin-top:3px;font-size:10px;color:#6b7b90}.level4-node .target{font-size:10px;color:#6b7b90;font-weight:800;text-align:right}.level4-node.current{border-color:#90b6e9;background:linear-gradient(90deg,#edf7ff,#fff);box-shadow:0 8px 20px rgba(37,99,235,.1)}.level4-node.current .node-icon{background:#e4f1ff;border-color:#bdd4ef}.level4-node.current:after{content:'YOU';position:absolute;right:9px;top:7px;padding:3px 6px;border-radius:999px;background:#dbeafe;color:#24558c;font-size:7px;font-weight:900;letter-spacing:.1em}.level4-node.future{filter:blur(2.4px);opacity:.55}.level4-node.future:before{content:'✦';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;font-size:24px;color:#64748b;filter:blur(0)}.level4-node.past{opacity:.55}.level4-cloud{margin-top:12px;padding:13px 14px;border:1px dashed #bfd0e2;border-radius:15px;background:#f3f7fc;color:#53677d;font-size:11px;line-height:1.55}.level4-cloud b{color:#293d56}
.level4-footer{flex:0 0 auto;display:grid;grid-template-columns:1fr 1fr;gap:11px;padding:12px 15px;background:#fff;border-top:1px solid #dfe6ee;box-shadow:0 -8px 22px rgba(17,34,55,.08)}.level4-btn{height:49px;border-radius:9px;border:1px solid #d7dfe9;background:#fff;color:#9ca7b5;font-size:13px;font-weight:900;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}.level4-btn.primary{background:#20262b;color:#fff;border-color:#20262b}.level4-btn:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 6px 15px rgba(15,23,42,.1)}.level4-btn:disabled{opacity:.5;cursor:not-allowed}
@media(max-width:520px){.level4-drawer{width:100vw}.level4-head{padding:0 12px}.level4-progress{padding-left:12px;padding-right:12px}.level4-slide{padding:22px 14px 26px}.level4-xp-grid{grid-template-columns:1fr 1fr}.level4-current{grid-template-columns:76px minmax(0,1fr);gap:11px}.level4-badge{width:76px;height:76px;border-radius:21px}.level4-badge .tier-icon{font-size:35px}.level4-current h1{font-size:22px}.level4-node{grid-template-columns:39px minmax(0,1fr) auto}.level4-node .node-icon{width:39px;height:39px;font-size:20px}.level4-footer{padding:10px 12px;gap:9px}.level4-btn{height:48px}}
@media(prefers-reduced-motion:reduce){.level4-backdrop,.level4-drawer,.level4-slide,.level4-bar i,.level4-hero,.level4-badge,.level4-hero:before,.level4-hero:after{transition:none!important;animation:none!important}}
`;
    document.head.appendChild(s);
  }

  function trophySvg(){return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M20 8h24v14c0 8.7-4.4 14.8-12 17.6C24.4 36.8 20 30.7 20 22V8Z" fill="#fff" stroke="#6d86a8" stroke-width="2.4"/><path d="M19 14H9v7c0 7.8 5 12.8 13 13.8M45 14h10v7c0 7.8-5 12.8-13 13.8" stroke="#7892b5" stroke-width="2.8" stroke-linecap="round"/><path d="M32 39v11M23 57h18" stroke="#849bbb" stroke-width="3.2" stroke-linecap="round"/><path d="m32 13 2.8 5.4 6 .9-4.4 4.2 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.2 6-.9L32 13Z" fill="#f4b942"/></svg>`}

  function buildLadder(current){
    const start=Math.max(1,current-2),end=Math.min(current+4,15);let html='';
    for(let level=start;level<=end;level++){
      const tier=tierFor(level),kind=level===current?'current':level<current?'past':'future';
      const target=level===current?'Your current standing':`${totalNeeded(level)} XP target`;
      html+=`<div class="level4-node ${kind}"><div class="node-icon">${tier.icon}</div><div><b>Level ${level} • ${escapeHtml(tier.name)}</b><small>${escapeHtml(tier.line)}</small></div><div class="target">${target}</div></div>`;
    }
    return html;
  }

  function update(){
    const modal=document.getElementById('levelDrawerV4');if(!modal)return;
    const p=snapshot();
    const level=Math.max(1,Number(p.level?.level)||1);
    const tier=tierFor(level);
    const into=Math.max(0,Number(p.level?.xpIntoLevel)||0);
    const next=Math.max(1,Number(p.level?.nextLevelXP)||100);
    const total=Math.max(0,Number(p.total)||0);
    const pct=Math.max(0,Math.min(100,Math.round(into/next*100)));
    const remaining=Math.max(0,next-into);
    modal.querySelectorAll('[data-level]').forEach(el=>el.textContent=level);
    modal.querySelectorAll('[data-tier-name]').forEach(el=>el.textContent=tier.name);
    modal.querySelector('[data-tier-icon]').textContent=tier.icon;
    modal.querySelector('[data-tier-line]').textContent=tier.line;
    modal.querySelector('[data-total-xp]').textContent=`${total} XP`;
    modal.querySelector('[data-into]').textContent=`${into} / ${next} XP`;
    modal.querySelector('[data-remaining]').textContent=`${remaining} XP to next level`;
    modal.querySelector('[data-progress]').style.width=pct+'%';
    modal.querySelector('[data-daily]').textContent=`${Number(p.daily?.earned)||0} / ${Number(window.XPSystem?.DAILY_CAP)||200} XP today`;
    modal.querySelector('[data-subjects]').textContent=`${subjectTotal(p.subjects)} XP tracked across subjects`;
    modal.querySelector('[data-standing]').textContent=level>=13?'🌟 Legend tier':level>=11?'👑 Master tier':level>=9?'💎 Diamond tier':level>=7?'💠 Platinum tier':level>=5?'🥇 Gold tier':level>=3?'🥈 Silver tier':'🥉 Bronze tier';
    modal.querySelector('.level4-ladder').innerHTML=buildLadder(level);
  }

  function setSlide(index){
    const modal=document.getElementById('levelDrawerV4');if(!modal)return;
    const slides=[...modal.querySelectorAll('.level4-slide')],max=slides.length;
    const n=Math.max(0,Math.min(max-1,index));
    slides.forEach((s,i)=>s.classList.toggle('active',i===n));
    modal.querySelectorAll('.level4-progress i').forEach((el,i)=>el.classList.toggle('active',i===n));
    modal.dataset.slide=String(n);
    const prev=modal.querySelector('[data-prev]'),next=modal.querySelector('[data-next]');
    prev.disabled=n===0;next.textContent=n===max-1?'Done ✓':'Next ›';
    modal.querySelector('.level4-scroll').scrollTop=0;
  }
  function close(){const m=document.getElementById('levelDrawerV4');if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow='';}
  function open(){const m=document.getElementById('levelDrawerV4');if(!m)return;update();setSlide(0);m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}

  function install(){
    if(document.getElementById('levelDrawerV4'))return;
    addStyles();
    const modal=document.createElement('div');modal.id='levelDrawerV4';modal.className='level4-backdrop';modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<aside class="level4-drawer" role="dialog" aria-modal="true" aria-labelledby="level4Title"><header class="level4-head"><button type="button" data-prev aria-label="Previous">‹</button><h2 id="level4Title">Information</h2><button type="button" data-close aria-label="Close">×</button></header><div class="level4-progress"><i class="active"></i><i></i><i></i><i></i></div><div class="level4-scroll">
<section class="level4-slide level4-intro active"><div class="level4-kicker">INTRODUCING</div><div class="level4-title">Level Up!<small>YOUR LEARNING JOURNEY</small></div><div class="level4-hero">${trophySvg()}</div><div class="level4-rule"><span>MAKE PROGRESS • EARN XP • UNLOCK</span></div><p class="level4-sub">हर अच्छी learning action तुम्हें आगे ले जाती है। XP कमाओ, अपना level बढ़ाओ और अगली tier को unlock करने के लिए तैयार रहो।</p><div class="level4-card"><strong>⚡ XP — तुम्हारी learning currency</strong><p>XP तुम्हारे learning activities से जुड़ा real progress score है। यह इसी account के unified XP system से live पढ़ा जाता है—इसलिए यहाँ दिखने वाला total navbar और progress area के साथ match होना चाहिए।</p></div></section>
<section class="level4-slide"><h3 class="level4-heading">💰 XP कैसे कमाओ?</h3><p class="level4-sub" style="margin:0 0 14px;text-align:left">XP पाने के लिए सिर्फ score के पीछे मत भागो—regular learning actions complete करो।</p><div class="level4-ways"><div class="level4-way"><div class="way-icon">📚</div><div><b>Chapters complete करो</b><span>Study content पूरा करके learning milestones आगे बढ़ाओ.</span></div><em>XP</em></div><div class="level4-way"><div class="way-icon">📝</div><div><b>Tests & practice attempt करो</b><span>Practice और test performance के साथ XP earn होता है.</span></div><em>XP</em></div><div class="level4-way"><div class="way-icon">🔁</div><div><b>Revision पूरा करो</b><span>Revision chapters complete करके अपनी learning streak मजबूत करो.</span></div><em>XP</em></div><div class="level4-way"><div class="way-icon">🎯</div><div><b>Consistent रहो</b><span>बार-बार वही activity करने पर reward system diminishing returns लागू कर सकता है.</span></div><em>FAIR PLAY</em></div></div><div class="level4-xp-grid"><div class="level4-xp-item"><b data-daily>0 / 200 XP today</b><span>Daily XP cap — system में current limit.</span></div><div class="level4-xp-item"><b data-subjects>0 XP tracked across subjects</b><span>Subject ledger का live total snapshot.</span></div></div><div class="level4-note"><b>Remember:</b> XP “money” की तरह दिख सकता है, लेकिन इसे spend नहीं करना है. यह तुम्हारी learning progress को measure करने वाला score है.</div></section>
<section class="level4-slide"><div class="level4-current"><div class="level4-badge"><span class="tier-icon" data-tier-icon>🥉</span><span class="lvl-chip">Lv <span data-level>1</span></span></div><div><div class="level4-eyebrow">YOUR CURRENT STANDING</div><h1>Level <span data-level>1</span> • <span data-tier-name>Bronze</span></h1><p data-tier-line>Start strong. Every small win adds up.</p><div class="level4-tier"><span data-standing>🥉 Bronze tier</span></div></div></div><div class="level4-meter"><div class="level4-meter-line"><span>Current XP</span><b data-total-xp>0 XP</b></div><div class="level4-bar"><i data-progress></i></div><div class="level4-meter-foot"><span data-into>0 / 100 XP</span><b data-remaining>100 XP to next level</b></div></div><div class="level4-standing"><b>What does this mean?</b><span>Keep learning to fill the bar and unlock the next tier.</span></div></section>
<section class="level4-slide"><h3 class="level4-heading">🗺️ Your Level Roadmap</h3><p class="level4-sub" style="margin:0 0 14px;text-align:left">Your current tier is visible. Future tiers stay clouded until you reach them.</p><div class="level4-ladder"></div><div class="level4-cloud"><b>☁️ The next level is hidden for a reason.</b><br>Every new tier should feel earned. Increase your real XP through learning and watch the cloud clear.</div></section>
</div><footer class="level4-footer"><button class="level4-btn" type="button" data-prev>‹ Previous</button><button class="level4-btn primary" type="button" data-next>Next ›</button></footer></aside>`;
    document.body.appendChild(modal);
    const prev=modal.querySelector('.level4-footer [data-prev]'),next=modal.querySelector('.level4-footer [data-next]');
    prev.addEventListener('click',()=>setSlide((Number(modal.dataset.slide)||0)-1));
    next.addEventListener('click',()=>{const n=Number(modal.dataset.slide)||0;if(n>=3)close();else setSlide(n+1)});
    modal.querySelector('.level4-head [data-prev]').addEventListener('click',()=>{const n=Number(modal.dataset.slide)||0;if(n>0)setSlide(n-1);else close()});
    modal.querySelector('.level4-head [data-close]').addEventListener('click',close);
    modal.addEventListener('click',e=>{if(e.target===modal)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    const wire=()=>{const b=document.getElementById('levelMiniBtn');if(b){b.onclick=open;b.setAttribute('aria-label','अपना Level और XP देखें')}};
    wire();
  }

  window.LevelBannerV4={open,close,refresh:update};
  window.addEventListener('DOMContentLoaded',()=>{install();update()});
  window.addEventListener('load',()=>{install();update()});
  window.addEventListener('xp:earned',update);
})();
