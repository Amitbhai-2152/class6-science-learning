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
function bind(){
  apply(read());
  const btn=document.getElementById('themeBtn');
  if(btn && !btn.dataset.themeBound){
    btn.dataset.themeBound='1';
    btn.type='button';
    btn.addEventListener('click',toggle,{passive:true});
  }
}
try{document.documentElement.dataset.theme=read()}catch(_){}
apply(read());
document.addEventListener('DOMContentLoaded',bind,{once:true});
window.addEventListener('load',bind,{once:true});
// Delegated fallback keeps the toggle working even if the Home view is re-rendered.
document.addEventListener('click',e=>{
  const btn=e.target?.closest?.('#themeBtn');
  if(!btn)return;
  e.preventDefault();
  toggle();
},{capture:true});
window.ThemeToggle={getTheme:read,apply,toggle};
})();
