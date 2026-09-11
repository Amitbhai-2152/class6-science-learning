(function(){
'use strict';
const KEY='class6ThemeV2';
const SCRIPT_SRC=document.currentScript?.src||'';
function read(){
  try{const saved=localStorage.getItem(KEY)||localStorage.getItem('class6ThemeV1');if(saved==='dark'||saved==='light')return saved}catch(_){}
  return 'light';
}
function ensureStyles(){
  try{
    if(document.querySelector('link[href*="dark-theme-fix.css"]'))return;
    if(!SCRIPT_SRC)return;
    const href=new URL('../css/dark-theme-fix.css?v=2',SCRIPT_SRC).href;
    const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.setAttribute('data-global-theme-style','true');
    (document.head||document.documentElement).appendChild(link);
  }catch(_){}
}
function ensureButton(){
  if(!document.body||document.getElementById('themeBtn')||document.querySelector('.global-theme-toggle'))return;
  const btn=document.createElement('button');btn.type='button';btn.className='global-theme-toggle';btn.setAttribute('aria-label','थीम बदलें');btn.setAttribute('title','Dark mode बदलें');btn.textContent='🌙';document.body.appendChild(btn);
}
function apply(theme){
  ensureStyles();const dark=theme==='dark';document.documentElement.classList.toggle('dark',dark);if(document.body)document.body.classList.toggle('dark',dark);
  const btn=document.getElementById('themeBtn')||document.querySelector('.global-theme-toggle');
  if(btn){btn.textContent=dark?'☀️':'🌙';btn.setAttribute('aria-label',dark?'Light mode करें':'Dark mode करें');btn.setAttribute('title',dark?'Light mode':'Dark mode');btn.setAttribute('aria-pressed',dark?'true':'false')}
}
function save(theme){try{localStorage.setItem(KEY,theme);localStorage.setItem('class6ThemeV1',theme)}catch(_){}
}
function toggle(){const next=(document.documentElement.classList.contains('dark')||document.body?.classList.contains('dark'))?'light':'dark';save(next);apply(next)}
ensureStyles();apply(read());
document.addEventListener('click',e=>{const btn=e.target?.closest?.('#themeBtn,.global-theme-toggle');if(!btn)return;e.preventDefault();e.stopPropagation();toggle()},{capture:true});
window.addEventListener('DOMContentLoaded',()=>{apply(read());ensureButton()},{once:true});
window.addEventListener('load',()=>{apply(read());ensureButton()},{once:true});
window.ThemeToggle={getTheme:read,apply,toggle};
try{
  const scriptUrl=SCRIPT_SRC||document.querySelector('script[src*="theme-toggle.js"]')?.src||'';
  if(scriptUrl&&!document.querySelector('script[data-universal-chapter-completion-bridge],script[src*="chapter-completion-bridge.js"]')){
    const src=new URL('./chapter-completion-bridge.js?v=7',scriptUrl).href;const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute('data-universal-chapter-completion-bridge','true');(document.head||document.documentElement).appendChild(s);
  }
  if(scriptUrl&&!document.querySelector('script[data-chapter-status]')){
    const src=new URL('./chapter-status.js?v=2',scriptUrl).href;const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute('data-chapter-status','true');(document.head||document.documentElement).appendChild(s);
  }
}catch(_){}
})();
