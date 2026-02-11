import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 7000,
    allowedHosts: ["chatbot.dev.hungerbox.com"],
    proxy: {
      // Local dev proxy so the browser does not see a cross-origin call
      // and therefore does not enforce CORS between localhost:5173 and ai.dev.hungerbox.com
      "/chatbot-api": {
        target: "http:/local.rest.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
