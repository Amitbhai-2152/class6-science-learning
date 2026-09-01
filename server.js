import express from "express";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

app.use(express.json({ limit: "64kb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
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
    return res.status(429).json({ error: "बहुत जल्दी बहुत सारे सवाल भेजे गए। थोड़ी देर बाद फिर कोशिश करें।" });
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
- Answer the learner's academic question directly and helpfully, even when it is outside the currently open chapter.
- Do not restrict the answer to the current subject or chapter. They are only context hints.
- Support Maths, Science, English, Hindi, GK, reasoning, general school questions, homework help, definitions, examples, translations, grammar, and step-by-step problem solving.

Teaching style:
- Use simple Hindi by default. Use English when the learner asks in English or asks for translation.
- Explain at Class 6 level, but adapt upward or downward when needed.
- For Maths, show the calculation step by step, verify the final result, and identify common mistakes when useful.
- For Science, explain what/why/how, use examples, and provide a text flow chart when requested.
- For English/Hindi, give examples and corrections rather than only definitions.
- For GK/reasoning, distinguish facts from guesses and clearly state uncertainty when necessary.
- If the learner says “I don't understand”, explain the same idea in simpler language with a new example.
- Answer the exact question before adding optional tips.
- Do not ask for or expose sensitive personal information.
- Keep content age-appropriate and safe.

${context || "No current lesson context is available; answer as a general Class 6 tutor."}`;
}

app.get("/api/health", async (_req, res) => {
  const configured = Boolean(process.env.OPENAI_API_KEY);
  if (!configured) {
    return res.status(503).json({ ok: false, configured: false, model, openai: "missing_api_key" });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    await client.models.retrieve(model);
    return res.json({ ok: true, configured: true, model, openai: "ok" });
  } catch (error) {
    const status = Number(error?.status) || 502;
    return res.status(status >= 400 && status < 600 ? status : 502).json({
      ok: false,
      configured: true,
      model,
      openai: "error",
      errorType: error?.name || "OpenAIError",
      errorCode: error?.code || error?.type || "unknown"
    });
  }
});

app.post("/api/tutor", rateLimit, async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "AI Tutor server अभी configured नहीं है। OPENAI_API_KEY सेट करें।", code: "missing_api_key" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

    const response = await client.responses.create({
      model,
      instructions: buildInstructions(body.subject, body.chapter, body.section),
      input: safeMessages,
      max_output_tokens: 900
    });

    const text = String(response.output_text || "").trim();
    if (!text) {
      return res.status(502).json({ error: "AI ने खाली उत्तर दिया। फिर से कोशिश करें।", code: "empty_output" });
    }

    res.json({ answer: text, model });
  } catch (error) {
    console.error("Tutor API error:", error?.message || error);
    const status = Number(error?.status) || 500;
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: "Tutor से अभी उत्तर नहीं मिल पाया।",
      code: error?.code || error?.type || "openai_request_failed"
    });
  }
});

app.listen(port, host, () => {
  console.log(`Class 6 Tutor API listening on http://${host}:${port}`);
});
