# chatbot-frontend (Admin Dashboard Chatbot WebView)

This repo contains a **standalone React frontend** for the Admin AI Assistant, intended to be deployed and embedded inside **iframes/webviews** from the admin dashboard or other apps.

## Run locally

```bash
nvm use 22
npm install
npm run dev
```

## Configure backend (API base)

The app needs a backend base URL. Provide it via either:

- env: `VITE_CHATBOT_API_BASE`
- query param: `?apiBase=...`

Optional auth:

- query param: `?token=...` (Bearer token)
- localStorage: `hb-chatbot-token`

Example:

- `http://localhost:5173/?apiBase=https%3A%2F%2Fapi.yourdomain.com%2F&allowClose=true&parentOrigin=https%3A%2F%2Fadmin.yourdomain.com`

## Embed in an iframe

```html
<iframe
  src="https://your-cdn/chatbot/?apiBase=https%3A%2F%2Fapi.yourdomain.com%2F&allowClose=true&parentOrigin=https%3A%2F%2Fadmin.yourdomain.com"
  style="width: 100%; height: 820px; border: 0;"
  allow="clipboard-read; clipboard-write"
></iframe>
```

The iframe posts these messages to the parent (use `parentOrigin` to lock origin):

- `hb-chatbot-ready`
- `hb-chatbot-resize` (best-effort; includes `height`)
- `hb-chatbot-close`
