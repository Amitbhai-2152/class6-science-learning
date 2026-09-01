import express from "express";

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const configuredOrigin = String(process.env.ALLOWED_ORIGIN || "").trim();
const allowedOrigins = new Set([configuredOrigin, "https://amitbhai-2152.github.io"].filter(Boolean));
const geminiBase = "https://generativelanguage.googleapis.com/v1beta";

app.use(express.json({ limit: "64kb" }));
app.use((req, res, next) => {
  const requestOrigin = String(req.headers.origin || "").trim();
  if (!requestOrigin || requestOrigin === "null") {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (allowedOrigins.has(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }
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
  if (now - old.start >= WINDOW_MS) {
    old.count = 0;
    old.start = now;
  }
  old.count += 1;
  ipHits.set(ip, old);
  if (old.count > MAX_REQUESTS) {
    return res.status(429).json({ error: "बहुत जल्दी बहुत सारे सवाल भेजे गए। थोड़ी देर बाद फिर कोशिश करें।", code: "rate_limited" });
  }
  next();
}

function cleanText(value, max = 4000) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function buildInstructions(subject, chapter, section) {
  const context = [
    subject && `Current subject context: ${cleanText(subject, 80)}`,
    chapter && `Current chapter context: ${cleanText(chapter, 160)}`,
    section && `Current section context: ${cleanText(section, 160)}`
  ].filter(Boolean).join("\n");

  return `You are the Universal AI Tutor inside a Class 6 learning website for an Indian school learner.

Primary goal:
- Answer the learner's exact academic question directly and helpfully, even when it is outside the currently open chapter.
- Do not restrict the answer to the current subject or chapter. They are only context hints.
- Support Maths, Science, English, Hindi, GK, reasoning, homework help, definitions, examples, translations, grammar, and step-by-step problem solving.

Teaching style:
- Use simple Hindi by default. Use English when the learner asks in English or asks for translation.
- Explain at Class 6 level, adapting when needed.
- For Maths, show the calculation step by step and verify the final result.
- For Science, explain what/why/how, use examples, and provide a text flow chart when requested.
- For English/Hindi, give examples and corrections rather than only definitions.
- For GK/reasoning, distinguish facts from guesses and state uncertainty when needed.
- If the learner says they do not understand, explain the same idea more simply with a new example.
- Answer the exact question before optional tips.
- Keep content age-appropriate and safe.

${context || "No current lesson context is available; answer as a general Class 6 tutor."}`;
}

function geminiContents(messages) {
  return messages
    .map(m => ({
      role: m?.role === "assistant" ? "model" : "user",
      parts: [{ text: cleanText(m?.content, 3000) }]
    }))
    .filter(m => m.parts[0].text);
}

async function callGemini(messages, instructions) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("GEMINI_API_KEY is not configured.");
    error.code = "missing_gemini_api_key";
    error.status = 503;
    throw error;
  }

  const url = `${geminiBase}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instructions }] },
      contents: geminiContents(messages),
      generationConfig: { maxOutputTokens: 900 }
    })
  });

  let data = {};
  try { data = await response.json(); } catch {}
  if (!response.ok) {
    const err = new Error(data?.error?.message || `Gemini request failed (${response.status})`);
    err.status = response.status;
    err.code = data?.error?.status || data?.error?.code || `http_${response.status}`;
    throw err;
  }

  const text = String(data?.candidates?.[0]?.content?.parts?.map(p => p?.text || "").join("") || "").trim();
  if (!text) {
    const err = new Error("Gemini returned no text answer.");
    err.status = 502;
    err.code = "empty_output";
    throw err;
  }
  return text;
}

app.get("/api/health", async (_req, res) => {
  const configured = Boolean(process.env.GEMINI_API_KEY);
  return res.json({ ok: configured, configured, model, provider: "gemini" });
});

app.get("/api/health/deep", async (_req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ ok: false, configured: false, model, provider: "gemini", test: "missing_api_key" });
  }
  try {
    const answer = await callGemini(
      [{ role: "user", content: "Connection test." }],
      "Reply with exactly: Tutor connection successful."
    );
    return res.json({ ok: true, configured: true, model, provider: "gemini", test: "ok", answer });
  } catch (error) {
    const status = Number(error?.status) || 502;
    return res.status(status >= 400 && status < 600 ? status : 502).json({
      ok: false,
      configured: true,
      model,
      provider: "gemini",
      test: "error",
      errorType: error?.name || "GeminiError",
      errorCode: error?.code || "gemini_request_failed",
      errorMessage: String(error?.message || "").slice(0, 300)
    });
  }
});

app.post("/api/tutor", rateLimit, async (req, res) => {
  try {
    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    const safeMessages = messages
      .map(m => ({
        role: m?.role === "assistant" ? "assistant" : "user",
        content: cleanText(m?.content, 3000)
      }))
      .filter(m => m.content);

    if (!safeMessages.length) {
      return res.status(400).json({ error: "सवाल भेजें।", code: "empty_messages" });
    }

    const answer = await callGemini(
      safeMessages,
      buildInstructions(body.subject, body.chapter, body.section)
    );
    return res.json({ answer, model, provider: "gemini" });
  } catch (error) {
    console.error("Tutor API error:", error?.message || error);
    const status = Number(error?.status) || 500;
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: "Tutor से अभी उत्तर नहीं मिल पाया।",
      code: error?.code || "gemini_request_failed",
      errorMessage: String(error?.message || "").slice(0, 300)
    });
  }
});

app.listen(port, host, () => {
  console.log(`Class 6 Tutor API listening on http://${host}:${port}`);
});
