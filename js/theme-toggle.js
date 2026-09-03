(function(){
'use strict';
const KEY='class6ThemeV2';
function read(){
  try{const saved=localStorage.getItem(KEY)||localStorage.getItem('class6ThemeV1');if(saved==='dark'||saved==='light')return saved}catch(_){}
  return 'light';
}
function apply(theme){
  const dark=theme==='dark';
  document.documentElement.classList.toggle('dark',dark);
  if(document.body)document.body.classList.toggle('dark',dark);
  const btn=document.getElementById('themeBtn');
  if(btn){
    btn.textContent=dark?'☀️':'🌙';
    btn.setAttribute('aria-label',dark?'Light mode करें':'Dark mode करें');
    btn.setAttribute('title',dark?'Light mode':'Dark mode');
    btn.setAttribute('aria-pressed',dark?'true':'false');
  }
}
function save(theme){try{localStorage.setItem(KEY,theme);localStorage.setItem('class6ThemeV1',theme)}catch(_){}
}
function toggle(){
  const next=(document.documentElement.classList.contains('dark')||document.body?.classList.contains('dark'))?'light':'dark';
  save(next);apply(next);
}
// Apply as early as possible so there is no light-flash before the page is ready.
apply(read());
// Use one delegated listener only. This also survives Home DOM re-renders.
document.addEventListener('click',e=>{
  const btn=e.target?.closest?.('#themeBtn');
  if(!btn)return;
  e.preventDefault();
  e.stopPropagation();
  toggle();
},{capture:true});
window.addEventListener('DOMContentLoaded',()=>apply(read()),{once:true});
window.addEventListener('load',()=>apply(read()),{once:true});
window.ThemeToggle={getTheme:read,apply,toggle};
})();
