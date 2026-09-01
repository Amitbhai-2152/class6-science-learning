(function(){
  'use strict';
  const AI=window.AITutorClient;
  if(!AI)return;

  function push(text,who){const box=document.getElementById('messages');if(!box)return;const d=document.createElement('div');d.className='msg '+who;d.textContent=text;box.appendChild(d);box.scrollTop=box.scrollHeight}
  function context(){const c=window.CHAPTERS?.[window.currentChapter-1],s=c?.sections?.[window._part];return {subject:'Science',chapter:c?.title||'',section:s?.title||''}}
  function errorText(err){
    const msg=String(err?.message||err||'Unknown error');
    return `⚠️ AI Tutor request failed: ${msg}`;
  }
  function replaceScience(){
    const T=window.Tutor;if(!T||T.__aiBound)return;
    T.__aiBound=true;T.__history=[];
    T.send=async function(qOverride){
      const input=document.getElementById('chatInput');const q=String(qOverride||input?.value||'').trim();if(!q)return;
      if(input)input.value='';push(q,'user');T.updateContext?.();T.setTyping?.(true);
      try{
        const ctx=context();T.__history.push({role:'user',content:q});
        const answer=await AI.ask({messages:T.__history,subject:ctx.subject,chapter:ctx.chapter,section:ctx.section});
        T.__history.push({role:'assistant',content:answer});push(answer,'bot');
      }catch(err){
        T.__history.pop();
        console.error('Science AI Tutor error:',err);
        push(errorText(err),'bot');
      }finally{T.setTyping?.(false)}
    };
  }
  function mathHistory(){return window.__mathsAIHistory||(window.__mathsAIHistory=[])}
  function activeMathsChapter(){
    const chapters=[1,2,3,4,5,6,7,8].map(n=>window['mathsChapter0'+n]).filter(Boolean);
    const fromUrl=Number(new URLSearchParams(location.search).get('chapter'))||1;
    return chapters.find(c=>Number(c.id)===fromUrl)||chapters[0]||null;
  }
  function replaceMaths(){
    const M=window.MathsTutor;if(!M||M.__aiBound)return;
    M.__aiBound=true;
    M.ask=async function(q){
      const text=String(q||'').trim();if(!text)return;
      const w=document.getElementById('mathsTutor');M.open?.();const msgs=w?.querySelector('.mt-msgs');if(!msgs)return;
      const user=document.createElement('div');user.className='mt-user';user.textContent=text;msgs.appendChild(user);msgs.scrollTop=msgs.scrollHeight;
      const active=activeMathsChapter();
      const history=mathHistory();history.push({role:'user',content:text});
      try{
        const answer=await AI.ask({messages:history,subject:'Mathematics',chapter:active?.title||'',section:''});
        history.push({role:'assistant',content:answer});
        const bot=document.createElement('div');bot.className='mt-bot';bot.textContent=answer;msgs.appendChild(bot);msgs.scrollTop=msgs.scrollHeight;
      }catch(err){
        history.pop();
        console.error('Maths AI Tutor error:',err);
        const bot=document.createElement('div');bot.className='mt-bot';bot.textContent=errorText(err);msgs.appendChild(bot);msgs.scrollTop=msgs.scrollHeight;
      }
    };
  }
  const start=()=>{replaceScience();replaceMaths()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,50));else setTimeout(start,50);
})();
