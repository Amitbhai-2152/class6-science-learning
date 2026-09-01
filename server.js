import express from "express";

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const configuredOrigin = String(process.env.ALLOWED_ORIGIN || "").trim();
const allowedOrigins = new Set([configuredOrigin, "https://amitbhai-2152.github.io"].filter(Boolean));
const geminiBase = "https://generativelanguage.googleapis.com/v1beta";
const fallbackModels = [model, "gemini-3.1-flash-lite", "gemini-3.5-flash-lite"].filter((v,i,a)=>v && a.indexOf(v)===i);

app.use(express.json({ limit: "64kb" }));
app.use((req, res, next) => {
  const requestOrigin = String(req.headers.origin || "").trim();
  if (!requestOrigin || requestOrigin === "null") res.setHeader("Access-Control-Allow-Origin", "*");
  else if (allowedOrigins.has(requestOrigin)) { res.setHeader("Access-Control-Allow-Origin", requestOrigin); res.setHeader("Vary", "Origin"); }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  if (req.method === "OPTIONS") {
    if (requestOrigin && allowedOrigins.has(requestOrigin)) return res.sendStatus(204);
    if (!requestOrigin) return res.sendStatus(204);
    return res.status(403).json({ error: "Origin not allowed.", code: "cors_origin_denied" });
  }
  next();
});

const ipHits = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
function rateLimit(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const old = ipHits.get(ip) || { count: 0, start: now };
  if (now - old.start >= WINDOW_MS) { old.count = 0; old.start = now; }
  old.count += 1; ipHits.set(ip, old);
  if (old.count > MAX_REQUESTS) return res.status(429).json({ error: "बहुत जल्दी बहुत सारे सवाल भेजे गए। थोड़ी देर बाद फिर कोशिश करें।", code: "rate_limited" });
  next();
}

function cleanText(value, max = 4000) { return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max); }

function buildInstructions(subject, chapter, section) {
  const context = [subject && `Current subject context: ${cleanText(subject, 80)}`, chapter && `Current chapter context: ${cleanText(chapter, 160)}`, section && `Current section context: ${cleanText(section, 160)}`].filter(Boolean).join("\n");
  return `You are the Universal AI Tutor inside a Class 6 learning website for an Indian school learner.\n\nPrimary goal:\n- Answer the learner's exact academic question directly and helpfully, even when it is outside the currently open chapter.\n- Do not restrict the answer to the current subject or chapter. They are only context hints.\n- Support Maths, Science, English, Hindi, GK, reasoning, homework help, definitions, examples, translations, grammar, and step-by-step problem solving.\n\nTeaching style:\n- Use simple Hindi by default. Use English when the learner asks in English or asks for translation.\n- Explain at Class 6 level, adapting when needed.\n- For Maths, show the calculation step by step and verify the final result.\n- For Science, explain what/why/how, use examples, and provide a text flow chart when requested.\n- For English/Hindi, give examples and corrections rather than only definitions.\n- For GK/reasoning, distinguish facts from guesses and state uncertainty when needed.\n- If the learner says they do not understand, explain the same idea more simply with a new example.\n- Answer the exact question before optional tips.\n- Keep content age-appropriate and safe.\n\n${context || "No current lesson context is available; answer as a general Class 6 tutor."}`;
}

function geminiContents(messages) {
  return messages.map(m => ({ role: m?.role === "assistant" ? "model" : "user", parts: [{ text: cleanText(m?.content, 3000) }] })).filter(m => m.parts[0].text);
}

function retryable(code, status) { return status === 429 || status >= 500 || code === "UNAVAILABLE" || code === "RESOURCE_EXHAUSTED"; }

async function callGemini(messages, instructions) {
  if (!process.env.GEMINI_API_KEY) { const e = new Error("GEMINI_API_KEY is not configured."); e.code="missing_gemini_api_key"; e.status=503; throw e; }
  let lastError;
  for (const candidate of fallbackModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const url = `${geminiBase}/models/${encodeURIComponent(candidate)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
      try {
        const response = await fetch(url, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ systemInstruction:{parts:[{text:instructions}]}, contents:geminiContents(messages), generationConfig:{maxOutputTokens:900, temperature:0.25} }) });
        let data={}; try { data=await response.json(); } catch {}
        if (!response.ok) {
          const e=new Error(data?.error?.message || `Gemini request failed (${response.status})`); e.status=response.status; e.code=data?.error?.status || data?.error?.code || `http_${response.status}`; lastError=e;
          if (retryable(e.code,e.status) && attempt===1) { await new Promise(r=>setTimeout(r,800)); continue; }
          if (retryable(e.code,e.status)) break;
          throw e;
        }
        const text=String(data?.candidates?.[0]?.content?.parts?.map(p=>p?.text||"").join("")||"").trim();
        if (!text) { const e=new Error("Gemini returned no text answer."); e.status=502; e.code="empty_output"; throw e; }
        return { text, model: candidate };
      } catch(e) {
        lastError=e;
        if (e?.status && retryable(e.code,e.status) && attempt===1) { await new Promise(r=>setTimeout(r,800)); continue; }
        if (!(e?.status && retryable(e.code,e.status))) throw e;
      }
    }
  }
  throw lastError || Object.assign(new Error("Gemini request failed."),{status:502,code:"gemini_request_failed"});
}

app.get("/api/health", async (_req,res)=>res.json({ok:Boolean(process.env.GEMINI_API_KEY),configured:Boolean(process.env.GEMINI_API_KEY),model,provider:"gemini"}));

app.get("/api/health/deep", async (_req,res)=>{
  try { const result=await callGemini([{role:"user",content:"Connection test."}],"Reply with exactly: Tutor connection successful."); return res.json({ok:true,configured:true,model:result.model,provider:"gemini",test:"ok",answer:result.text}); }
  catch(error){ const status=Number(error?.status)||502; return res.status(status>=400&&status<600?status:502).json({ok:false,configured:Boolean(process.env.GEMINI_API_KEY),model,provider:"gemini",test:"error",errorType:error?.name||"GeminiError",errorCode:error?.code||"gemini_request_failed",errorMessage:String(error?.message||"").slice(0,300)}); }
});

app.post("/api/tutor",rateLimit,async(req,res)=>{
  try {
    const body=req.body||{}, messages=Array.isArray(body.messages)?body.messages.slice(-10):[];
    const safeMessages=messages.map(m=>({role:m?.role==="assistant"?"assistant":"user",content:cleanText(m?.content,3000)})).filter(m=>m.content);
    if(!safeMessages.length)return res.status(400).json({error:"सवाल भेजें।",code:"empty_messages"});
    const result=await callGemini(safeMessages,buildInstructions(body.subject,body.chapter,body.section));
    return res.json({answer:result.text,model:result.model,provider:"gemini"});
  } catch(error){ console.error("Tutor API error:",error?.message||error); const status=Number(error?.status)||500; return res.status(status>=400&&status<600?status:500).json({error:"Tutor से अभी उत्तर नहीं मिल पाया।",code:error?.code||"gemini_request_failed",errorMessage:String(error?.message||"").slice(0,300)}); }
});

app.listen(port,host,()=>console.log(`Class 6 Tutor API listening on http://${host}:${port}`));
