window.AITutorClient=(()=>{
  const cfg=window.CLASS6_AI_CONFIG||{};
  const endpoint=String(cfg.endpoint||"/api/tutor");
  function context(subject,chapter,section){return {subject,chapter,section}}
  async function ask({messages,subject,chapter,section}){
    const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages,subject,chapter,section})});
    let data={};try{data=await res.json()}catch{}
    if(!res.ok)throw new Error(data.error||"Tutor request failed");
    if(!data.answer)throw new Error("Tutor returned no answer");
    return data.answer;
  }
  return {endpoint,context,ask};
})();
