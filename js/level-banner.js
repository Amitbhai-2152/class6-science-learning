(function(){
'use strict';

function snapshot(){
  return window.XPSystem?.snapshot?.() || {
    total:0,
    level:{level:1,xpIntoLevel:0,nextLevelXP:100,title:'Learner'}
  };
}

function thresholdForLevel(level){
  let need=100;
  for(let n=2;n<level;n++) need=100+((n-1)*50);
  return level<=1?0:need;
}

function levelTitle(level){
  return level>=10?'Master':level>=7?'Achiever':level>=5?'Scholar':level>=3?'Explorer':'Learner';
}

function escapeHtml(value){
  return String(value).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
}

function addStyles(){
  if(document.getElementById('level-banner-style')) return;
  const s=document.createElement('style');
  s.id='level-banner-style';
  s.textContent=`
.level-banner-backdrop{position:fixed;inset:0;z-index:9990;display:grid;place-items:center;padding:16px;background:rgba(15,23,42,.48);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);opacity:0;visibility:hidden;transition:opacity .22s ease,visibility .22s ease}
.level-banner-backdrop.is-open{opacity:1;visibility:visible}
.level-banner{position:relative;width:min(720px,100%);max-height:min(88vh,760px);overflow:auto;border:1px solid rgba(255,255,255,.8);border-radius:28px;background:linear-gradient(180deg,#ffffff 0%,#f8fbff 100%);box-shadow:0 28px 90px rgba(15,23,42,.28);transform:translateY(18px) scale(.97);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
.level-banner-backdrop.is-open .level-banner{transform:translateY(0) scale(1)}
.level-banner-close{position:absolute;right:14px;top:14px;width:40px;height:40px;border:1px solid #dbe4ee;border-radius:13px;background:rgba(255,255,255,.9);font-size:22px;cursor:pointer;z-index:4;display:grid;place-items:center}
.level-banner-hero{position:relative;padding:28px 28px 22px;overflow:hidden;background:radial-gradient(circle at 85% 10%,rgba(99,102,241,.18),transparent 32%),radial-gradient(circle at 15% 0%,rgba(14,165,233,.16),transparent 30%),linear-gradient(135deg,#f7fbff,#eef5ff)}
.level-banner-hero:after{content:"";position:absolute;width:170px;height:170px;right:-72px;top:-80px;border-radius:50%;background:rgba(255,255,255,.36);border:1px solid rgba(255,255,255,.7)}
.level-banner-kicker{font-size:11px;letter-spacing:.16em;font-weight:800;color:#64748b;margin-bottom:8px}
.level-banner-title{margin:0;font-size:clamp(24px,4vw,34px);letter-spacing:-.04em;color:#10233f;line-height:1.1}
.level-banner-sub{margin:9px 0 0;color:#64748b;font-size:13px;line-height:1.5;max-width:560px}
.level-banner-current{display:grid;grid-template-columns:100px minmax(0,1fr);gap:18px;align-items:center;margin-top:20px}
.level-banner-icon{width:100px;height:100px;border-radius:28px;display:grid;place-items:center;background:linear-gradient(145deg,#1d4ed8,#6366f1 58%,#0ea5e9);box-shadow:0 18px 34px rgba(37,99,235,.25),inset 0 1px 0 rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.75)}
.level-banner-icon svg{width:58px;height:58px;filter:drop-shadow(0 5px 9px rgba(15,23,42,.18))}
.level-banner-level{font-size:clamp(26px,5vw,40px);font-weight:900;color:#10233f;letter-spacing:-.04em}
.level-banner-level span{font-size:14px;font-weight:800;color:#64748b;letter-spacing:0}
.level-banner-xp{margin-top:5px;font-size:14px;color:#475569}
.level-banner-xp b{color:#0f172a}
.level-banner-meter{height:12px;margin-top:13px;border-radius:99px;background:#dfe7f1;overflow:hidden;box-shadow:inset 0 1px 3px rgba(15,23,42,.1)}
.level-banner-meter i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,#4f46e5,#0ea5e9,#14b8a6);transition:width .65s cubic-bezier(.2,.8,.2,1)}
.level-banner-next{display:flex;justify-content:space-between;gap:10px;margin-top:7px;font-size:11px;color:#64748b}
.level-banner-next b{color:#334155}
.level-banner-body{padding:20px 28px 28px}
.level-banner-rank{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 15px;border:1px solid #dbe4ee;border-radius:16px;background:#fff;margin-bottom:18px}
.level-banner-rank strong{font-size:14px;color:#17233a}.level-banner-rank span{font-size:11px;color:#64748b}
.level-banner-section-title{margin:0 0 10px;font-size:14px;letter-spacing:.01em;color:#1e293b}
.level-banner-roadmap{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px}
.level-node{position:relative;min-width:0;padding:13px 9px;border:1px solid #dbe4ee;border-radius:16px;background:rgba(255,255,255,.9);text-align:center;overflow:hidden}
.level-node strong{display:block;font-size:17px;color:#17233a}.level-node small{display:block;margin-top:4px;font-size:10px;color:#64748b;font-weight:700}
.level-node.current{border-color:#93c5fd;background:linear-gradient(180deg,#eef7ff,#fff);box-shadow:0 8px 20px rgba(37,99,235,.10)}
.level-node.current:before{content:"CURRENT";display:inline-block;margin-bottom:4px;padding:3px 6px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:8px;font-weight:900;letter-spacing:.08em}
.level-node.future{filter:blur(2.2px);opacity:.62;transform:scale(.985);background:linear-gradient(180deg,rgba(241,245,249,.82),rgba(255,255,255,.65));}
.level-node.future:after{content:"✦";position:absolute;inset:0;display:grid;place-items:center;font-size:28px;color:rgba(100,116,139,.38);filter:blur(0)}
.level-node.past{opacity:.58}
.level-banner-tip{margin-top:16px;padding:13px 15px;border:1px dashed #cbd5e1;border-radius:15px;background:#f8fafc;color:#475569;font-size:12px;line-height:1.5}
.level-banner-tip b{color:#1e293b}
@media(max-width:640px){.level-banner-backdrop{padding:10px}.level-banner{border-radius:22px}.level-banner-hero{padding:23px 18px 19px}.level-banner-body{padding:18px}.level-banner-current{grid-template-columns:76px minmax(0,1fr);gap:13px}.level-banner-icon{width:76px;height:76px;border-radius:22px}.level-banner-icon svg{width:46px;height:46px}.level-banner-roadmap{grid-template-columns:repeat(2,minmax(0,1fr))}.level-node:nth-child(5){grid-column:1/-1}.level-banner-rank{align-items:flex-start;flex-direction:column}.level-banner-close{right:10px;top:10px}}
@media(prefers-reduced-motion:reduce){.level-banner-backdrop,.level-banner,.level-banner-meter i{transition:none}}
`;
  document.head.appendChild(s);
}

function iconSvg(){
  return `<svg viewBox="0 0 64 64" aria-hidden="true" fill="none"><path d="M19 8h26v15c0 9-5 15-13 18-8-3-13-9-13-18V8Z" fill="rgba(255,255,255,.92)"/><path d="M18 14H9v7c0 8 5 13 13 14M46 14h9v7c0 8-5 13-13 14" stroke="#c7d2fe" stroke-width="3" stroke-linecap="round"/><path d="M32 41v9M22 57h20" stroke="#dbeafe" stroke-width="4" stroke-linecap="round"/><path d="m32 13 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.3 6.1-.9L32 13Z" fill="#fbbf24"/></svg>`;
}

function buildLevels(current){
  const start=Math.max(1,current-2);
  const end=current+2;
  let out='';
  for(let level=start;level<=end;level++){
    const kind=level===current?'current':level<current?'past':'future';
    const need=thresholdForLevel(level);
    out+=`<div class="level-node ${kind}"><strong>Lv ${level}</strong><small>${escapeHtml(levelTitle(level))}${level===current?' • YOU':''}</small>${level>current?`<small>${need} XP</small>`:''}</div>`;
  }
  return out;
}

function updateBanner(){
  const modal=document.getElementById('levelBanner');
  if(!modal)return;
  const p=snapshot();
  const current=Math.max(1,Number(p.level?.level)||1);
  const into=Math.max(0,Number(p.level?.xpIntoLevel)||0);
  const next=Math.max(1,Number(p.level?.nextLevelXP)||100);
  const total=Math.max(0,Number(p.total)||0);
  const pct=Math.max(0,Math.min(100,Math.round(into/next*100)));
  modal.querySelector('[data-level]').textContent=current;
  modal.querySelector('[data-title]').textContent=p.level?.title||levelTitle(current);
  modal.querySelector('[data-total-xp]').textContent=`${total} XP`;
  modal.querySelector('[data-into]').textContent=`${into} / ${next} XP`;
  modal.querySelector('[data-need]').textContent=`${Math.max(0,next-into)} XP to next level`;
  modal.querySelector('.level-banner-meter i').style.width=pct+'%';
  modal.querySelector('.level-banner-roadmap').innerHTML=buildLevels(current);
  const rank= current>=10?'🏆 Master tier':current>=7?'⚡ Achiever tier':current>=5?'📘 Scholar tier':current>=3?'🚀 Explorer tier':'🌱 Learner tier';
  modal.querySelector('[data-rank]').textContent=rank;
}

function close(){
  const modal=document.getElementById('levelBanner');
  if(!modal)return;
  modal.classList.remove('is-open');
  setTimeout(()=>{modal.setAttribute('aria-hidden','true')},220);
}

function open(){
  const modal=document.getElementById('levelBanner');
  if(!modal)return;
  updateBanner();
  modal.setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>modal.classList.add('is-open'));
}

function install(){
  if(document.getElementById('levelBanner')) return;
  addStyles();
  const modal=document.createElement('div');
  modal.id='levelBanner';
  modal.className='level-banner-backdrop';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`<section class="level-banner" role="dialog" aria-modal="true" aria-labelledby="levelBannerTitle"><button class="level-banner-close" type="button" aria-label="Level panel बंद करें">×</button><div class="level-banner-hero"><div class="level-banner-kicker">LEVEL SYSTEM • YOUR JOURNEY</div><h2 id="levelBannerTitle" class="level-banner-title">Introducing your Level ✨</h2><p class="level-banner-sub">हर XP के साथ तुम्हारा level बढ़ता है। अगला level अभी clouded है—उसे unlock करने के लिए सीखते रहो।</p><div class="level-banner-current"><div class="level-banner-icon">${iconSvg()}</div><div><div class="level-banner-level">Lv <span data-level>1</span> <span>• <em data-title>Learner</em></span></div><div class="level-banner-xp"><b data-total-xp>0 XP</b> total • <span data-into>0 / 100 XP</span></div><div class="level-banner-meter"><i></i></div><div class="level-banner-next"><span data-need>100 XP to next level</span><b>Keep going 🚀</b></div></div></div></div><div class="level-banner-body"><div class="level-banner-rank"><div><strong>Your current standing</strong><br><span>तुम अभी इस learning journey के इस stage पर हो।</span></div><strong data-rank>🌱 Learner tier</strong></div><h3 class="level-banner-section-title">Your level roadmap</h3><div class="level-banner-roadmap"></div><div class="level-banner-tip"><b>Next level hidden by design.</b> Future levels stay cloudy until your XP reaches them, so every new unlock feels earned and exciting.</div></div></section>`;
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  modal.querySelector('.level-banner-close').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  document.body.appendChild(modal);
  const button=document.getElementById('levelMiniBtn');
  if(button){button.onclick=open;button.setAttribute('aria-label','अपना Level और XP देखें')}
}

function wireButton(){
  const button=document.getElementById('levelMiniBtn');
  if(!button)return false;
  button.onclick=open;
  button.setAttribute('aria-label','अपना Level और XP देखें');
  return true;
}

window.LevelBanner={open,close,refresh:updateBanner};

window.addEventListener('DOMContentLoaded',()=>{install();wireButton()});
window.addEventListener('load',()=>{install();wireButton()});
window.addEventListener('xp:earned',()=>updateBanner());
})();
