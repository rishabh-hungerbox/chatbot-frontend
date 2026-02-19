<a name="top"></a>

<p align="center">
  <img src="https://s3.ap-south-1.amazonaws.com/qa-content-1.hungerbox.com/chat_logo_gif.gif" width="32" height="32" alt="Chatbot" align="middle" />
  &nbsp;
  <img src="assets/readme-title.svg" height="32" alt="Chatbot Micro Frontend" align="middle" />
</p>

Standalone React frontend for the Admin AI Assistant. Embed in iframes from the admin dashboard or other apps.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)](https://vitejs.dev/)
[![Node](https://img.shields.io/badge/Node-22-339933?logo=nodedotjs)](https://nodejs.org/)
[![language](https://img.shields.io/badge/language-TypeScript%20%7C%20TSX-3178C6)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/badge/license-Private-red)](#)

## Stack

| Category | Packages |
|----------|----------|
| **Framework** | [React](https://www.npmjs.com/package/react) ^19.2, [React DOM](https://www.npmjs.com/package/react-dom) ^19.2 |
| **Build** | [Vite](https://www.npmjs.com/package/vite) ^7.3, [@vitejs/plugin-react](https://www.npmjs.com/package/@vitejs/plugin-react) ^5.1 |
| **Language** | [TypeScript](https://www.npmjs.com/package/typescript) ~5.9 |
| **UI / UX** | [Lottie React](https://www.npmjs.com/package/lottie-react) ^2.4, [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) ^1.9, [clsx](https://www.npmjs.com/package/clsx) ^2.1 |
| **Utilities** | [dompurify](https://www.npmjs.com/package/dompurify) ^3.2, [uuid](https://www.npmjs.com/package/uuid) ^11.1 |
| **Linting** | [ESLint](https://www.npmjs.com/package/eslint) ^9.39, [typescript-eslint](https://www.npmjs.com/package/typescript-eslint) ^8.48 |

---

## Contents

- [Setup](#setup)
- [Local nginx](#local-nginx-optional)
- [Embed in iframe](#embed-in-iframe)

---

## Setup

```bash
nvm use 22
npm install
npm run dev
```

## Local nginx (optional)

Sample nginx config for local dev with `chatbot.dev.hungerbox.com` proxying to Vite (port 7000) and forwarding `/api` to your backend:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name chatbot.dev.hungerbox.com;

    client_max_body_size 5M;

    # Vite dev server root (only used for static 404 etc.)
    root /Users/hungerbox/work/chatbot-frontend;
    index index.html;

    access_log /opt/homebrew/etc/nginx/log/chatbot-access.log;
    error_log  /opt/homebrew/etc/nginx/log/chatbot-error.log;

    # Proxy all frontend traffic to Vite dev server
    location / {
        proxy_buffering off;
        proxy_pass http://127.0.0.1:7000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API proxy: /api on chatbot host → backend api
    location /api {
        client_max_body_size 5M;
        proxy_pass http://local.rest.com/api;
        proxy_connect_timeout 600s;
        proxy_send_timeout    600s;
        proxy_read_timeout    600s;
        send_timeout          600s;
        keepalive_timeout     75s;
    }
}
```

## Embed in iframe

Hit the chatbot URL with the bearer token:

```
https://chatbot.dev.hungerbox.com/?token=<your-bearer-token>
```

Example:

```html
<iframe
  src="https://chatbot.dev.hungerbox.com/?token=YOUR_BEARER_TOKEN"
  style="width: 100%; height: 800px; border: 0;"
></iframe>
```

The chatbot uses the same origin for API calls (e.g. `chatbot.dev.hungerbox.com/api`). Pass the token for authenticated requests.

---

[↑ Back to top](#top)
