function safeUrlDecode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export type ChatbotRuntimeConfig = {
  apiBaseUrl: string;
  authToken?: string;
  initialSessionId?: string;
  allowClose?: boolean;
  parentOrigin?: string; // if set, we postMessage only to this origin
};

export function getRuntimeConfig(): ChatbotRuntimeConfig {
  const url = new URL(window.location.href);
  const qs = url.searchParams;

  const env: any = (import.meta as any).env || {};
  const appEnv: string = env.VITE_APP_ENV || "local";

  let defaultParentOrigin: string | undefined;
  switch (appEnv) {
    case "rc":
      defaultParentOrigin = "https://admin.rc.stagehungerbox.com";
      break;
    case "qa":
      defaultParentOrigin = "https://admin.stagehungerbox.com";
      break;
    case "production":
      defaultParentOrigin = "https://admin.hungerbox.com";
      break;
    case "local":
    default:
      defaultParentOrigin = "http://admin.dev.hungerbox.com";
      break;
  }

  const apiBaseUrl = qs.get("apiBase") || env.VITE_CHATBOT_API_BASE || "";

  const authToken =
    // highest priority: query param
    qs.get("token") ||
    // then localStorage (can be set by host app)
    localStorage.getItem("hb-chatbot-token") ||
    // finally, build-time env from .env.local
    (import.meta as any).env?.VITE_CHATBOT_TOKEN ||
    undefined;

  const initialSessionId = qs.get("sessionId") || undefined;
  const allowClose =
    (qs.get("allowClose") || "").toLowerCase() === "true" ? true : undefined;

  const parentOrigin = qs.get("parentOrigin")
    ? safeUrlDecode(qs.get("parentOrigin") as string)
    : defaultParentOrigin;

  return {
    apiBaseUrl,
    authToken,
    initialSessionId,
    allowClose,
    parentOrigin,
  };
}
