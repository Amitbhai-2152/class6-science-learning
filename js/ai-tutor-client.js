window.AITutorClient=(()=>{
  const cfg=window.CLASS6_AI_CONFIG||{};
  const endpoint=String(cfg.endpoint||"/api/tutor");
  function context(subject,chapter,section){return {subject,chapter,section}}
  async function ask({messages,subject,chapter,section}){
    let res;
    try{
      res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages,subject,chapter,section})});
    }catch(error){
      throw new Error(`NETWORK/CORS: ${error?.message||"fetch failed"}`);
    }
    const raw=await res.text();
    let data={};
    try{data=JSON.parse(raw)}catch{}
    if(!res.ok){
      const code=data?.code||"no_code";
      throw new Error(`HTTP ${res.status} ${res.statusText||""} | code=${code} | ${data?.error||raw.slice(0,300)||"empty response"}`.trim());
    }
    if(!data.answer)throw new Error(`HTTP ${res.status} | code=no_answer | Tutor returned no answer`);
    return data.answer;
  }
  return {endpoint,context,ask};
})();
