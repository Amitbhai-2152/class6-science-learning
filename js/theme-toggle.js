(function(){
'use strict';
const KEY='class6ThemeV1';
function getTheme(){
  try{
    const saved=localStorage.getItem(KEY);
    if(saved==='dark'||saved==='light')return saved;
  }catch(_){}
  return 'light';
}
function apply(theme){
  const dark=theme==='dark';
  document.body.classList.toggle('dark',dark);
  const btn=document.getElementById('themeBtn');
  if(btn){
    btn.textContent=dark?'☀️':'🌙';
    btn.setAttribute('aria-label',dark?'Light mode करें':'Dark mode करें');
    btn.setAttribute('title',dark?'Light mode':'Dark mode');
  }
}
function save(theme){try{localStorage.setItem(KEY,theme)}catch(_){} }
function toggle(){
  const next=document.body.classList.contains('dark')?'light':'dark';
  save(next);
  apply(next);
}
function bind(){
  apply(getTheme());
  const btn=document.getElementById('themeBtn');
  if(btn && !btn.dataset.themeBound){
    btn.dataset.themeBound='1';
    btn.addEventListener('click',toggle);
  }
}
try{document.documentElement.dataset.theme=getTheme();}catch(_){}
window.addEventListener('DOMContentLoaded',bind);
window.addEventListener('load',()=>apply(getTheme()));
window.ThemeToggle={getTheme,apply,toggle};
})();
