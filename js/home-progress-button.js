(function(){
'use strict';
function bind(){
  const btn=document.getElementById('progressBtn');
  if(!btn||btn.dataset.progressBound==='1')return;
  btn.dataset.progressBound='1';
  btn.addEventListener('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    if(typeof window.openProgress==='function'){
      window.openProgress();
      return;
    }
    try{location.hash='progress'}catch(_){}
  });
}
function injectCredits(){
  const home=document.getElementById('homeView');
  const shell=home?.querySelector('.home-shell');
  if(!shell||document.getElementById('siteCredits'))return;
  const style=document.createElement('style');
  style.id='siteCreditsStyle';
  style.textContent='.site-credits{margin:28px auto 8px;padding:16px 12px;text-align:center;color:#64748b;font-size:13px;line-height:1.6}.site-credits strong{color:#334155}.site-credits .credit-mark{font-size:12px;margin-bottom:3px}.site-credits .credit-names{font-weight:800}.site-credits .credit-note{font-size:11px;color:#94a3b8;margin-top:2px}';
  document.head.appendChild(style);
  const footer=document.createElement('footer');
  footer.id='siteCredits';
  footer.className='site-credits';
  footer.innerHTML='<div class="credit-mark">Made with dedication by</div><div class="credit-names"><strong>Amit Raj</strong> &amp; <strong>ChatGPT</strong></div><div class="credit-note">Class 6 Learning Hub</div>';
  shell.appendChild(footer);
}
window.addEventListener('DOMContentLoaded',function(){bind();injectCredits()});
window.addEventListener('load',function(){bind();injectCredits()});
})();
