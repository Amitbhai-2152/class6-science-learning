# AI Tutor setup

The browser never receives the OpenAI API key. The frontend calls `/api/tutor`; `server.js` calls the OpenAI Responses API with `OPENAI_API_KEY` stored only on the server.

## Local run

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Set `OPENAI_API_KEY` in the server environment. Do not commit `.env`.
4. Run `npm install`.
5. Run `npm start`.
6. Open the site from the same server origin.

## Separate frontend hosting

If the static site is hosted separately (for example on a static host), deploy `server.js` to a server/runtime that supports Node.js. Set `ALLOWED_ORIGIN` to the exact frontend origin and configure `window.CLASS6_AI_CONFIG = { endpoint: "https://your-ai-backend.example/api/tutor" }` before `js/ai-tutor-client.js` loads.

## Model

`OPENAI_MODEL` defaults to `gpt-5.6-luna`. Change it server-side when needed; never accept a model name directly from the browser.

## Safety and reliability

- Keep the API key only in server environment variables.
- Keep the request body small and send only recent conversation turns.
- The server limits request size and applies a simple per-IP rate limit.
- The UI retains a local tutor fallback when the AI backend is unavailable.
- Maths should continue using deterministic calculation logic for arithmetic verification where available.
