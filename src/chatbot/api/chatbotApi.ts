import type { ChatMessage, SessionHistoryListResponse } from "../types";

export type ChatbotApiClientOptions = {
  apiBaseUrl: string;
  authToken?: string;
};

function joinUrl(base: string, path: string): string {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  return b ? `${b}/${p}` : `/${p}`;
}

export class ChatbotApiClient {
  private apiBaseUrl: string;
  private authToken?: string;

  constructor(opts: ChatbotApiClientOptions) {
    this.apiBaseUrl = opts.apiBaseUrl || "";
    this.authToken = opts.authToken;
  }

  setAuthToken(token?: string) {
    this.authToken = token;
  }

  private headers(extra?: Record<string, string>): HeadersInit {
    const h: Record<string, string> = {
      ...(extra || {}),
    };
    if (this.authToken) {
      h.Authorization = `Bearer ${this.authToken}`;
    }
    return h;
  }

  /**
   * NOTE: Endpoints vary across environments. This client is intentionally thin:
   * API base is derived from window.location.origin + '/api'. Ensure your deployment
   * serves or proxies the API at /api. The backend should expose:
   * - POST /v3/dashboard_management/ai-admin-agent
   * - GET  /v3/dashboard_management/ai-admin-agent/history
   * - GET  /v3/dashboard_management/ai-admin-agent/history/:id
   * - POST /v3/dashboard_management/ai-admin-agent/history/:id/rename
   * - DELETE /v3/dashboard_management/ai-admin-agent/history/:id
   * - POST /v3/dashboard_management/ai-admin-agent/feedback/:id
   *
   * If your backend differs, update these paths in one place.
   */

  async sendMessage(params: {
    session_id: string;
    query: string;
    model_name?: string | null;
    file?: File | null;
    signal?: AbortSignal;
  }): Promise<any> {
    const url = joinUrl(
      this.apiBaseUrl,
      "v3/dashboard_management/ai-admin-agent",
    );
    const form = new FormData();
    form.append("session_id", params.session_id);
    form.append("query", params.query);
    form.append("html_response", "true");
    if (params.model_name) form.append("model_name", params.model_name);
    if (params.file) form.append("image", params.file);

    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      body: form,
      credentials: "include",
      signal: params.signal,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`sendMessage failed: ${res.status} ${txt}`);
    }
    return await res.json();
  }

  async getSessionHistory(): Promise<SessionHistoryListResponse> {
    const url = joinUrl(
      this.apiBaseUrl,
      "v3/dashboard_management/ai-admin-agent/history",
    );
    const res = await fetch(url, {
      method: "GET",
      headers: this.headers(),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`getSessionHistory failed: ${res.status}`);
    return (await res.json()) as SessionHistoryListResponse;
  }

  async getSessionHistoryById(sessionId: string): Promise<any> {
    const url = joinUrl(
      this.apiBaseUrl,
      `v3/dashboard_management/ai-admin-agent/history/${encodeURIComponent(
        sessionId,
      )}`,
    );
    const res = await fetch(url, {
      method: "GET",
      headers: this.headers(),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`getSessionHistoryById failed: ${res.status}`);
    return await res.json();
  }

  async renameSessionHistory(sessionId: string, title: string): Promise<void> {
    const url = joinUrl(
      this.apiBaseUrl,
      `v3/dashboard_management/ai-admin-agent/history/${encodeURIComponent(
        sessionId,
      )}`,
    );
    const res = await fetch(url, {
      method: "PUT",
      headers: this.headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ title }),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`renameSessionHistory failed: ${res.status}`);
  }

  async deleteSessionHistory(sessionId: string): Promise<void> {
    const url = joinUrl(
      this.apiBaseUrl,
      `v3/dashboard_management/ai-admin-agent/history/${encodeURIComponent(
        sessionId,
      )}`,
    );
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.headers(),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`deleteSessionHistory failed: ${res.status}`);
  }

  async sendFeedback(
    responseId: string,
    body: { good_response: boolean | null; feedback?: string | null },
  ): Promise<void> {
    const url = joinUrl(
      this.apiBaseUrl,
      `v3/dashboard_management/ai-admin-agent/feedback/${encodeURIComponent(responseId)}`,
    );
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`sendFeedback failed: ${res.status}`);
  }

  // Optional endpoints used for super-admin "search user chats". Keep best-effort.
  async searchUsers(query: string): Promise<any> {
    const url = joinUrl(
      this.apiBaseUrl,
      `v3/dashboard_management/ai-admin-agent/users/search?q=${encodeURIComponent(
        query,
      )}`,
    );
    const res = await fetch(url, {
      method: "GET",
      headers: this.headers(),
      credentials: "include",
    });
    if (!res.ok) throw new Error(`searchUsers failed: ${res.status}`);
    return await res.json();
  }

  async getSessionHistoryForUser(userId: number): Promise<any> {
    const url = joinUrl(
      this.apiBaseUrl,
      `v3/dashboard_management/ai-admin-agent/users/${encodeURIComponent(
        String(userId),
      )}/history`,
    );
    const res = await fetch(url, {
      method: "GET",
      headers: this.headers(),
      credentials: "include",
    });
    if (!res.ok)
      throw new Error(`getSessionHistoryForUser failed: ${res.status}`);
    return await res.json();
  }

  async getSessionHistoryByIdForUser(
    userId: number,
    sessionId: string,
  ): Promise<any> {
    const url = joinUrl(
      this.apiBaseUrl,
      `v3/dashboard_management/ai-admin-agent/users/${encodeURIComponent(
        String(userId),
      )}/history/${encodeURIComponent(sessionId)}`,
    );
    const res = await fetch(url, {
      method: "GET",
      headers: this.headers(),
      credentials: "include",
    });
    if (!res.ok)
      throw new Error(`getSessionHistoryByIdForUser failed: ${res.status}`);
    return await res.json();
  }
}

export function buildDefaultGreeting(): ChatMessage {
  return {
    role: "assistant",
    content: "Hello! I'm your AI assistant. How can I help you today?",
  };
}
