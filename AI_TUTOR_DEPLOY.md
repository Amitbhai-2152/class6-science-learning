# Class 6 AI Tutor — live deployment

The website frontend can stay on GitHub Pages. The OpenAI call must run from a secure Node backend.

## 1. Deploy the backend

The repository contains `server.js`, `package.json`, and `render.yaml`.

The backend exposes:

- `GET /api/health`
- `POST /api/tutor`

Set these server environment variables:

- `OPENAI_API_KEY` — your OpenAI API key. Keep this server-side only.
- `OPENAI_MODEL` — `gpt-5.6-luna` is the current cost-sensitive model configured for this project.
- `ALLOWED_ORIGIN` — the exact browser origin hosting the frontend, for example `https://your-user.github.io`.

Do not put `OPENAI_API_KEY` into `js/ai-config.js`, HTML, or any browser-side JavaScript.

## 2. Verify the backend

Open your deployed backend's `/api/health` endpoint.

Expected shape:

```json
{"ok":true,"configured":true,"model":"gpt-5.6-luna"}
```

`configured: false` means the server secret has not been configured yet.

## 3. Connect GitHub Pages

Edit `js/ai-config.js`:

```js
window.CLASS6_AI_CONFIG = {
  endpoint: "https://YOUR-BACKEND-DOMAIN.example/api/tutor"
};
```

Only the backend URL belongs in this file. Never add the OpenAI key.

## 4. Test Science

Open the Science Tutor and ask a chapter-specific question, for example:

`पाचन की प्रक्रिया flow chart से समझाओ।`

The bridge sends the current Science chapter and section as context.

## 5. Test Maths

Open a Maths chapter such as Chapter 7 and ask:

`इस chapter का एक कठिन सवाल step-by-step समझाओ।`

The bridge derives the active Maths chapter from the page URL so the backend receives the correct chapter context.

## 6. CORS

For production, `ALLOWED_ORIGIN` should be the exact frontend origin, not `*`.

## 7. Runtime checks

The repository includes a GitHub Actions workflow that validates Node syntax, installs dependencies, and runs the Tutor server health check before changes are considered safe.

## 8. OpenAI API

The backend uses the OpenAI Responses API. Model selection is controlled by the `OPENAI_MODEL` environment variable so it can be changed without rewriting the frontend.
