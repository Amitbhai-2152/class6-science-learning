# Class 6 AI Tutor — deployment

The frontend is still safe for GitHub Pages, while the OpenAI call runs on a Node server. Never put `OPENAI_API_KEY` in browser JavaScript.

## 1. Deploy the backend

The repository includes `render.yaml`, `server.js`, and `package.json`. Deploy the Node service to a Node-capable host and expose:

- `GET /api/health`
- `POST /api/tutor`

Set these server environment variables:

- `OPENAI_API_KEY` — your OpenAI API key (server secret)
- `OPENAI_MODEL` — recommended starting value: `gpt-5.6-luna`
- `ALLOWED_ORIGIN` — the exact origin where the GitHub Pages frontend is hosted, for example `https://example.github.io`

After deployment, `/api/health` should report `ok: true` and `configured: true`.

## 2. Point the frontend at the backend

Edit `js/ai-config.js` and set:

```js
window.CLASS6_AI_CONFIG = {
  endpoint: "https://YOUR-BACKEND-DOMAIN.example/api/tutor"
};
```

Do not add the OpenAI key to this file.

## 3. Verify both tutors

Open the Science Tutor and ask a chapter-specific question. Then open Maths and ask a question from a different chapter. The bridge sends subject/chapter/section context to the backend.

## 4. CORS

Use the exact frontend origin in `ALLOWED_ORIGIN`; do not leave it as `*` in production.

## 5. Model note

The backend uses the OpenAI Responses API. The model is configurable through `OPENAI_MODEL`, so it can be changed later without editing frontend code.
