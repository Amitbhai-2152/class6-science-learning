(function(){
  'use strict';
  const AI=window.AITutorClient;
  if(!AI)return;

  function pushScience(text,who){const box=document.getElementById('messages');if(!box)return;const d=document.createElement('div');d.className='msg '+who;d.textContent=text;box.appendChild(d);box.scrollTop=box.scrollHeight}
  function scienceContext(){const c=window.CHAPTERS?.[window.currentChapter-1],s=c?.sections?.[window._part];return {subject:'Science',chapter:c?.title||'',section:s?.title||''}}
  function replaceScience(){
    const T=window.Tutor;if(!T||T.__aiBound)return;
    T.__aiBound=true;T.__localSend=T.send.bind(T);T.__history=[];
    T.send=async function(qOverride){
      const input=document.getElementById('chatInput');const q=String(qOverride||input?.value||'').trim();if(!q)return;
      if(input)input.value='';pushScience(q,'user');T.updateContext?.();T.setTyping?.(true);
      try{
        const ctx=scienceContext();T.__history.push({role:'user',content:q});
        const answer=await AI.ask({messages:T.__history,subject:ctx.subject,chapter:ctx.chapter,section:ctx.section});
        T.__history.push({role:'assistant',content:answer});pushScience(answer,'bot');
      }catch(err){
        // Keep the local tutor as a graceful offline fallback.
        T.__history.pop();const local=T.reply?.(q);if(local)pushScience(local,'bot');else pushScience('AI Tutor से अभी connection नहीं हो पाया। बाद में फिर कोशिश करें।','bot');
      }finally{T.setTyping?.(false)}
    };
  }

  function mathHistory(){return window.__mathsAIHistory||(window.__mathsAIHistory=[])}
  function replaceMaths(){
    const M=window.MathsTutor;if(!M||M.__aiBound)return;
    M.__aiBound=true;
    const originalAsk=M.ask.bind(M);
    M.ask=async function(q){
      const text=String(q||'').trim();if(!text)return;
      const w=document.getElementById('mathsTutor');M.open?.();const msgs=w?.querySelector('.mt-msgs');if(!msgs){return originalAsk(q)}
      const user=document.createElement('div');user.className='mt-user';user.textContent=text;msgs.appendChild(user);msgs.scrollTop=msgs.scrollHeight;
      const chapters=[1,2,3,4,5,6,7,8].map(n=>window['mathsChapter0'+n]).filter(Boolean);
      const active=chapters[0];
      const history=mathHistory();history.push({role:'user',content:text});
      try{
        const answer=await AI.ask({messages:history,subject:'Mathematics',chapter:active?.title||'',section:''});
        history.push({role:'assistant',content:answer});
        const bot=document.createElement('div');bot.className='mt-bot';bot.textContent=answer;msgs.appendChild(bot);msgs.scrollTop=msgs.scrollHeight;
      }catch(err){
        history.pop();originalAsk(q);
      }
    };
  }

  const start=()=>{replaceScience();replaceMaths()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,50));else setTimeout(start,50);
})();
