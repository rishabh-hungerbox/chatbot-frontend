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
  /** When true, show centered empty state (Ready when you are.) - for standalone web view */
  centeredEmptyState?: boolean;
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

  const apiBaseUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api` : "";

  const authTokenRaw =
    // highest priority: query param (token or bearer - both supported for embed use)
    qs.get("token") ||
    qs.get("bearer") ||
    // then localStorage (can be set by host app)
    localStorage.getItem("hb-chatbot-token") ||
    // finally, build-time env from .env.local
    (import.meta as any).env?.VITE_CHATBOT_TOKEN ||
    undefined;
  // Strip "Bearer " prefix if passed; store raw token in localStorage for persistence
  const authToken = authTokenRaw
    ? authTokenRaw.replace(/^Bearer\s+/i, "").trim()
    : undefined;
  if (authToken && (qs.get("token") || qs.get("bearer"))) {
    try {
      localStorage.setItem("hb-chatbot-token", authToken);
    } catch (_e) {}
  }

  const initialSessionId = qs.get("sessionId") || undefined;
  const allowClose =
    (qs.get("allowClose") || "").toLowerCase() === "true" ? true : undefined;

  const centeredEmptyState =
    qs.get("centeredEmptyState") === "true"
      ? true
      : qs.get("centeredEmptyState") === "false"
        ? false
        : typeof window !== "undefined" && (window as any).self === (window as any).top;

  const parentOrigin = qs.get("parentOrigin")
    ? safeUrlDecode(qs.get("parentOrigin") as string)
    : defaultParentOrigin;

  return {
    apiBaseUrl,
    authToken,
    initialSessionId,
    allowClose,
    parentOrigin,
    centeredEmptyState,
  };
}
