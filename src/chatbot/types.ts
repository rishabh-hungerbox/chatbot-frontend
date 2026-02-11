export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  meta_data?: any[];
  timeTakenSeconds?: number;
  good_response?: boolean | null;
  response_id?: string;
  request_id?: string;
  model_name?: string;
  system_response_time?: string;
  options?: Record<
    string,
    Array<{
      key: string;
      value: string;
    }>
  >;
  // User attachment preview (local object URL or remote URLs from history)
  sentImageUrl?: string;
  sentImageUrls?: string[];
  sentImageName?: string;
  sentImageSize?: number;
};

export type SessionSummary = {
  session_id?: string;
  id?: string;
  title?: string;
};

export type SessionHistoryListResponse = {
  sessions: SessionSummary[];
};

