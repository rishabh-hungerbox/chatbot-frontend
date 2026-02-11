import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

import './chatbot.css';
import type { ChatMessage, SessionSummary } from './types';
import { getRuntimeConfig } from './config';
import { ChatbotApiClient, buildDefaultGreeting } from './api/chatbotApi';
import { extractPlainText } from './utils/plainText';
import { track } from './utils/analytics';
import { Modal } from './ui/modals';
import {
  BackButtonSvgIcon,
  CopyIcon,
  MicrophoneSvgIcon,
  SendArrowSvgIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  InfoIcon,
  NewIcon,
} from './ui/icons';
import Lottie from 'lottie-react';
import aiIconAnimation from './ui/ai_icon.json';

function decodeMaybeBase64(value: any): string {
  try {
    const raw = (value ?? '').toString();
    if (!raw) return '';
    // base64-ish heuristic: if it contains '<' assume it is already HTML
    if (raw.includes('<')) return raw;
    const binary = atob(raw);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    if ((window as any).TextDecoder) {
      const decoder = new (window as any).TextDecoder('utf-8');
      return decoder.decode(bytes);
    }
    // eslint-disable-next-line no-restricted-globals
    return decodeURIComponent(escape(binary));
  } catch {
    try {
      return (value ?? '').toString();
    } catch {
      return '';
    }
  }
}

function sanitizeHtml(html: string): string {
  // Keep it permissive enough for tables/images but strip scripts.
  return DOMPurify.sanitize(html || '', {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script'],
  });
}

export function ChatbotApp() {
  const cfg = useMemo(() => getRuntimeConfig(), []);
  const api = useMemo(() => new ChatbotApiClient({ apiBaseUrl: cfg.apiBaseUrl, authToken: cfg.authToken }), [cfg]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildDefaultGreeting()]);
  const [userMessage, setUserMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [tokenLimitReached, setTokenLimitReached] = useState(false);

  const [sessionHistory, setSessionHistory] = useState<SessionSummary[] | null>(null);

  const [selectedModel, setSelectedModel] = useState<string | null>(() => {
    try {
      return localStorage.getItem('hb-admin-chatbot-model');
    } catch {
      return null;
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const fromQs = cfg.initialSessionId;
    if (fromQs) return fromQs;
    try {
      const saved = localStorage.getItem('hb-admin-chatbot-session-id');
      if (saved) return saved;
    } catch {
      // ignore
    }
    return uuidv4();
  });

  const [hasAssistantRespondedInSession, setHasAssistantRespondedInSession] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [metaOpen, setMetaOpen] = useState(false);
  const [metaForMessage, setMetaForMessage] = useState<ChatMessage | null>(null);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackForMessage, setFeedbackForMessage] = useState<ChatMessage | null>(null);

  // iframe friendliness: tell parent ready + height changes (optional)
  useEffect(() => {
    try {
      const targetOrigin = cfg.parentOrigin || '*';
      window.parent?.postMessage?.({ type: 'hb-chatbot-ready' }, targetOrigin);
    } catch {
      // ignore
    }
  }, [cfg.parentOrigin]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    try {
      const el = messagesContainerRef.current;
      const ro = new ResizeObserver(() => {
        try {
          const h = document.documentElement.scrollHeight;
          const targetOrigin = cfg.parentOrigin || '*';
          window.parent?.postMessage?.({ type: 'hb-chatbot-resize', height: h }, targetOrigin);
        } catch {
          // ignore
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    } catch {
      return;
    }
  }, [cfg.parentOrigin]);

  useEffect(() => {
    try {
      localStorage.setItem('hb-admin-chatbot-session-id', currentSessionId);
    } catch {
      // ignore
    }
  }, [currentSessionId]);

  useEffect(() => {
    // update "hasAssistantRespondedInSession" similar to Angular
    const has = messages.some((m, idx) => {
      if (!m || m.role !== 'assistant') return false;
      const c = (m.content || '').trim();
      if (idx === 0 && c === buildDefaultGreeting().content) return false;
      return true;
    });
    setHasAssistantRespondedInSession(has);
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    try {
      const el = messagesContainerRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchSessionHistory = useCallback(async () => {
    if (!cfg.apiBaseUrl) return;
    try {
      const res = await api.getSessionHistory();
      const sessions = Array.isArray((res as any)?.sessions) ? (res as any).sessions : [];
      setSessionHistory(sessions);
    } catch {
      // history is optional; ignore
    }
  }, [api, cfg.apiBaseUrl]);

  useEffect(() => {
    fetchSessionHistory();
  }, [fetchSessionHistory]);

  const isHistoryOpen = true;

  const startNewChat = useCallback(() => {
    track('new_chat_icon_click', { source: 'webview', timestamp: new Date().toISOString() });
    setTokenLimitReached(false);
    setIsLoading(false);
    setSelectedFile(null);
    setSelectedFilePreviewUrl(null);
    setMessages([buildDefaultGreeting()]);
    const newId = uuidv4();
    setCurrentSessionId(newId);
  }, []);

  const onFileSelected = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    try {
      if (selectedFilePreviewUrl) URL.revokeObjectURL(selectedFilePreviewUrl);
    } catch {
      // ignore
    }
    setSelectedFile(file);
    try {
      setSelectedFilePreviewUrl(URL.createObjectURL(file));
    } catch {
      setSelectedFilePreviewUrl(null);
    }
  }, [selectedFilePreviewUrl]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    try {
      if (selectedFilePreviewUrl) URL.revokeObjectURL(selectedFilePreviewUrl);
    } catch {
      // ignore
    }
    setSelectedFilePreviewUrl(null);
  }, [selectedFilePreviewUrl]);

  const onSend = useCallback(async () => {
    if ((!userMessage.trim() && !selectedFile) || isLoading || tokenLimitReached) return;
    if (!cfg.apiBaseUrl) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Missing API base URL. Pass `?apiBase=...` or set `VITE_CHATBOT_API_BASE`.' },
      ]);
      return;
    }

    const fileToSend = selectedFile;
    const fileName = fileToSend?.name;
    const userText = userMessage.trim();

    let sentImageUrl: string | undefined;
    if (fileToSend) {
      try {
        sentImageUrl = URL.createObjectURL(fileToSend);
      } catch {
        sentImageUrl = undefined;
      }
    }

    const userChat: ChatMessage = {
      role: 'user',
      content: userText || (fileName ? `Uploaded image: ${fileName}` : ''),
      sentImageUrl,
      sentImageName: fileName,
      sentImageSize: typeof fileToSend?.size === 'number' ? fileToSend?.size : undefined,
    };

    setMessages((prev) => [...prev, userChat]);
    setUserMessage('');
    removeFile();

    setIsLoading(true);
    const start = performance.now();
    try {
      const response = await api.sendMessage({
        session_id: currentSessionId,
        query: userText || (fileName ? `[Image: ${fileName}]` : ''),
        model_name: selectedModel,
        file: fileToSend,
      });

      const elapsedSeconds = Math.max(0, Math.round((performance.now() - start) / 1000));
      const decodedHtml = decodeMaybeBase64((response as any)?.response);

      const assistantChat: ChatMessage = {
        role: 'assistant',
        content: decodedHtml || "I apologize, but I couldn't process your request at the moment.",
        meta_data: Array.isArray((response as any)?.meta_data) ? (response as any).meta_data : undefined,
        timeTakenSeconds: elapsedSeconds,
        good_response:
          typeof (response as any)?.good_response === 'boolean'
            ? (response as any).good_response
            : (response as any)?.good_response === null
              ? null
              : undefined,
        response_id:
          (response as any)?.response_id != null ? String((response as any).response_id) : undefined,
        request_id:
          (response as any)?.request_id != null ? String((response as any).request_id) : undefined,
        model_name: (response as any)?.model_name,
        system_response_time:
          (response as any)?.system_response_time != null ? String((response as any).system_response_time) : undefined,
        options:
          (response as any)?.options && typeof (response as any).options === 'object'
            ? (response as any).options
            : undefined,
      };

      setMessages((prev) => [...prev, assistantChat]);

      // token limit state if present
      try {
        setTokenLimitReached(!!(response as any)?.token_limit_reached);
      } catch {
        // ignore
      }

      // refresh sidebar after a reply (best effort)
      setTimeout(() => {
        fetchSessionHistory();
      }, 2000);

      track('AI_response_received', {
        source: 'webview',
        chat_id: assistantChat.request_id || undefined,
        chat_content: extractPlainText(assistantChat.content || ''),
      });
    } catch (e: any) {
      const elapsedSeconds = Math.max(0, Math.round((performance.now() - start) / 1000));
      const errorContent =
        elapsedSeconds >= 180
          ? 'Time limit reached. Please revisit the page in some time to get your answer.'
          : "I'm sorry, but I'm experiencing some technical difficulties. Please try again later.";
      setMessages((prev) => [...prev, { role: 'assistant', content: errorContent, timeTakenSeconds: elapsedSeconds }]);
    } finally {
      setIsLoading(false);
    }
  }, [
    api,
    cfg.apiBaseUrl,
    currentSessionId,
    fetchSessionHistory,
    isLoading,
    removeFile,
    selectedFile,
    selectedModel,
    tokenLimitReached,
    userMessage,
  ]);

  const onSelectHistorySession = useCallback(
    async (s: SessionSummary) => {
      if (isLoading) return;
      const sid = (s as any)?.session_id || (s as any)?.id;
      if (!sid) return;
      if (sid === currentSessionId) return;

      try {
        const res = await api.getSessionHistoryById(String(sid));
        setCurrentSessionId(String((res as any)?.session_id || sid));

        const historyItems: any[] = Array.isArray((res as any)?.session_history) ? (res as any).session_history : [];
        const rebuilt: ChatMessage[] = [buildDefaultGreeting()];

        for (const item of historyItems) {
          const userText = String((item as any)?.user_query || '');
          const assistantHtml = decodeMaybeBase64(String((item as any)?.system_response || ''));

          if (userText) {
            const u: ChatMessage = { role: 'user', content: userText };
            try {
              const urls = Array.isArray((item as any)?.input_image_urls)
                ? (item as any).input_image_urls.filter((u: any) => !!u)
                : [];
              if (urls.length) u.sentImageUrls = urls;
            } catch {
              // ignore
            }
            rebuilt.push(u);
          }

          if (assistantHtml) {
            rebuilt.push({
              role: 'assistant',
              content: assistantHtml,
              meta_data: Array.isArray((item as any)?.meta_data) ? (item as any).meta_data : undefined,
              timeTakenSeconds:
                typeof (item as any)?.time_taken_seconds === 'number'
                  ? (item as any).time_taken_seconds
                  : typeof (item as any)?.time_taken === 'number'
                    ? (item as any).time_taken
                    : undefined,
              good_response:
                typeof (item as any)?.good_response === 'boolean'
                  ? (item as any).good_response
                  : (item as any)?.good_response === null
                    ? null
                    : undefined,
              response_id: (item as any)?.response_id != null ? String((item as any).response_id) : undefined,
              request_id: (item as any)?.request_id != null ? String((item as any).request_id) : undefined,
              model_name: (item as any)?.model_name,
              system_response_time:
                (item as any)?.system_response_time != null ? String((item as any).system_response_time) : undefined,
              options:
                (item as any)?.options && typeof (item as any).options === 'object'
                  ? (item as any).options
                  : undefined,
            });
          }
        }

        setMessages(rebuilt);
        setTokenLimitReached(!!(res as any)?.token_limit_reached);
        setHasAssistantRespondedInSession(true);
      } catch {
        // ignore
      }
    },
    [api, currentSessionId, isLoading]
  );

  const isLatestOptionsMessage = useCallback(
    (idx: number) => {
      let lastAssistantIdx = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i]?.role === 'assistant') {
          lastAssistantIdx = i;
          break;
        }
      }
      if (lastAssistantIdx === -1) return false;
      const msg = messages[idx];
      return idx === lastAssistantIdx && !!(msg as any)?.options;
    },
    [messages]
  );

  const [selectedOptions, setSelectedOptions] = useState<Record<number, Record<string, string>>>({});

  const onOptionSelect = useCallback(
    (messageIndex: number, question: string, key: string) => {
      if (!isLatestOptionsMessage(messageIndex)) return;
      setSelectedOptions((prev) => {
        const cur = { ...(prev[messageIndex] || {}) };
        cur[question] = key;
        return { ...prev, [messageIndex]: cur };
      });

      // auto-submit if all selected
      const opts = (messages[messageIndex] as any)?.options || {};
      const questions = Object.keys(opts);
      const nextSel = { ...(selectedOptions[messageIndex] || {}), [question]: key };
      const allSelected = questions.every((q) => !!nextSel[q]);
      if (allSelected) {
        const parts: string[] = [];
        questions.forEach((q) => {
          const selectedKey = nextSel[q];
          const choices = Array.isArray(opts[q]) ? opts[q] : [];
          const choice = choices.find((c: any) => c && c.key === selectedKey);
          if (choice) parts.push(`(${choice.key}): ${choice.value} `);
        });
        const msgText = parts.join('\n').trim();
        if (msgText) {
          setUserMessage(msgText);
          setTimeout(() => onSend(), 200);
        }
      }
    },
    [isLatestOptionsMessage, messages, onSend, selectedOptions]
  );

  const openMetaForMessage = useCallback((m: ChatMessage) => {
    setMetaForMessage(m);
    setMetaOpen(true);
  }, []);

  const onThumbsUp = useCallback(
    async (m: ChatMessage) => {
      if (!m.response_id) return;
      try {
        await api.sendFeedback({ response_id: m.response_id, good_response: true, feedback_text: null });
        setMessages((prev) =>
          prev.map((x) => (x === m ? { ...x, good_response: true } : x))
        );
        track('thumbs_up_click', { source: 'webview', response_id: m.response_id });
      } catch {
        // ignore
      }
    },
    [api]
  );

  const onThumbsDown = useCallback((m: ChatMessage) => {
    if (!m.response_id) return;
    setFeedbackForMessage(m);
    setFeedbackText('');
    setFeedbackOpen(true);
    track('thumbs_down_click', { source: 'webview', response_id: m.response_id });
  }, []);

  const submitThumbsDownFeedback = useCallback(async () => {
    const m = feedbackForMessage;
    if (!m?.response_id) return;
    try {
      await api.sendFeedback({
        response_id: m.response_id,
        good_response: false,
        feedback_text: feedbackText.trim() ? feedbackText.trim() : null,
      });
      setMessages((prev) => prev.map((x) => (x === m ? { ...x, good_response: false } : x)));
    } catch {
      // ignore
    } finally {
      setFeedbackOpen(false);
      setFeedbackForMessage(null);
    }
  }, [api, feedbackForMessage, feedbackText]);

  const onClose = useCallback(() => {
    try {
      const targetOrigin = cfg.parentOrigin || '*';
      window.parent?.postMessage?.({ type: 'hb-chatbot-close' }, targetOrigin);
    } catch {
      // ignore
    }
  }, [cfg.parentOrigin]);

  const onCopyMessage = useCallback(async (content: string) => {
    try {
      const plain = extractPlainText(content || '');
      await navigator.clipboard.writeText(plain);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="chatbot-root">
      <div className={clsx('chatbot-dialog', isHistoryOpen && 'history-open')}>
        <div className={clsx('history-sidebar', isHistoryOpen && 'open')}>
          <div className="history-sidebar-header">
            <span>Previous Chats:</span>
            <button className="history-header-action" type="button" aria-label="Collapse history" title="Collapse history" disabled>
              <BackButtonSvgIcon />
            </button>
          </div>
          <div className="history-list">
            {(sessionHistory || []).map((s) => {
              const sid = (s as any)?.session_id || (s as any)?.id;
              return (
                <div
                  key={String(sid)}
                  className={clsx('history-item', String(sid) === currentSessionId && 'active')}
                  onClick={() => onSelectHistorySession(s)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSelectHistorySession(s);
                  }}
                  title={(s as any)?.title || ''}
                >
                  <div className="history-summary">{(s as any)?.title || 'Previous Chat'}</div>
                  <div className="history-item-menu" aria-hidden="true" />
                </div>
              );
            })}
            {sessionHistory && sessionHistory.length === 0 ? (
              <div className="history-item">
                <div className="history-summary">Nothing...</div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="chat-main">
        <div className="chatbot-header">
          <div className="header-left">
            <Lottie
              className="ai-icon"
              animationData={aiIconAnimation}
              loop
              autoplay
              aria-label="AI Assistant"
            />
            <p className="chat-title">AI Assistant</p>
          </div>
          <div className="header-right">
            <button
              className="header-btn-pill"
              onClick={startNewChat}
              disabled={!hasAssistantRespondedInSession || isLoading}
              aria-label="New"
              title="New chat"
              type="button"
            >
              <span className="header-pill-icon" aria-hidden="true">
                <NewIcon />
              </span>
              <span>New</span>
            </button>
            <button
              className="header-btn-icon close-btn-desktop close-btn"
              onClick={cfg.allowClose ? onClose : undefined}
              aria-label="Close"
              title={cfg.allowClose ? 'Close' : 'Close disabled'}
              type="button"
              disabled={!cfg.allowClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="chatbot-content">
          <div className="messages-container" ref={messagesContainerRef}>
            {messages.map((m, i) => {
              const hasImg = !!(m.sentImageUrl || (m.sentImageUrls && m.sentImageUrls.length > 0));
              return (
                <div
                  key={i}
                  className={clsx('message', m.role === 'user' ? 'user-message' : 'assistant-message', hasImg && 'has-user-image')}
                  data-msg-idx={i}
                >
                  {m.role === 'assistant' ? (
                    <div className="message-content">
                      <div
                        className="assistant-html"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.content) }}
                        onClick={(e) => {
                          const t = e.target as HTMLElement | null;
                          if (t && t.tagName === 'IMG') {
                            const src = (t as HTMLImageElement).src;
                            if (src) setImagePreviewUrl(src);
                          }
                        }}
                      />

                      {m.options ? (
                        <div className={clsx('options-container', (!isLatestOptionsMessage(i) || isLoading) && 'disabled')}>
                          {Object.keys(m.options || {}).map((question) => (
                            <div className="option-group" key={question}>
                              <div className="option-question">{question}</div>
                              <div className="option-choices">
                                {(m.options?.[question] || []).map((choice) => {
                                  const sel = (selectedOptions[i] || {})[question];
                                  return (
                                    <button
                                      key={choice.key}
                                      type="button"
                                      className={clsx('option-choice-btn', sel === choice.key && 'selected')}
                                      disabled={!isLatestOptionsMessage(i) || isLoading}
                                      onClick={() => onOptionSelect(i, question, choice.key)}
                                      aria-label={`Select ${choice.value}`}
                                    >
                                      <span className="choice-key">{choice.key}</span>
                                      <span className="choice-value">{choice.value}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="assistant-footer">
                        <div className="footer-left">
                          <button
                            className="footer-action-btn"
                            onClick={() => onCopyMessage(m.content || '')}
                            title="Copy"
                            aria-label="Copy"
                            type="button"
                          >
                            <CopyIcon />
                          </button>
                          {i > 0 ? (
                            <>
                              <button
                                type="button"
                                className={clsx('rating-btn', m.good_response === true && 'selected')}
                                onClick={() => onThumbsUp(m)}
                                aria-label="Thumbs up"
                                title="Helpful"
                              >
                                <ThumbsUpIcon filled={m.good_response === true} />
                              </button>
                              <button
                                type="button"
                                className={clsx('rating-btn', m.good_response === false && 'selected')}
                                onClick={() => onThumbsDown(m)}
                                aria-label="Thumbs down"
                                title="Not helpful"
                              >
                                <ThumbsDownIcon filled={m.good_response === false} />
                              </button>
                            </>
                          ) : null}
                          {m.timeTakenSeconds !== undefined ? (
                            <span className="time-taken">(Time Taken: {m.timeTakenSeconds} sec)</span>
                          ) : null}
                          {i > 0 ? (
                            <button
                              className="meta-info-btn-inline"
                              onClick={() => openMetaForMessage(m)}
                              title="Show execution details"
                              aria-label="Show execution details"
                              type="button"
                            >
                              <InfoIcon />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="message-content">{m.content}</div>
                      {(m.sentImageUrls || []).map((url) => (
                        <div key={url} className="user-image-preview" onClick={() => setImagePreviewUrl(url)}>
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <img src={url} />
                        </div>
                      ))}
                      {m.sentImageUrl ? (
                        <div className="user-image-preview" onClick={() => setImagePreviewUrl(m.sentImageUrl!)}>
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <img src={m.sentImageUrl} />
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              );
            })}

            {isLoading ? (
              <div className="assistant-message message">
                <div className="message-content">Working on your request...</div>
              </div>
            ) : null}
          </div>

          <div className="footer-container">
            {tokenLimitReached ? (
              <div className="context-limit-message">
                <span>Context limit reached. Please start a New Chat</span>
                <button className="history-btn" onClick={startNewChat} title="Start New Chat" type="button">
                  ↻
                </button>
              </div>
            ) : null}

            <div className="input-row">
              <div className="input-wrapper">
                <textarea
                  className="message-input"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask anything you need..."
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                  disabled={isLoading || tokenLimitReached}
                />
                <button
                  className="attach-btn input-icon-btn input-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || tokenLimitReached}
                  aria-label="Attach file"
                  title="Attach file"
                  type="button"
                >
                  📎
                </button>
                <div className="input-actions">
                  <button
                    className="voice-btn input-icon-btn"
                    disabled
                    aria-label="Voice (coming soon)"
                    title="Voice (coming soon)"
                    type="button"
                  >
                    <MicrophoneSvgIcon />
                  </button>
                  <button
                    className="send-btn send-btn-inline input-icon-btn"
                    onClick={onSend}
                    disabled={(!userMessage.trim() && !selectedFile) || tokenLimitReached || isLoading}
                    aria-label="Send message"
                    title="Send message"
                    type="button"
                  >
                    <SendArrowSvgIcon />
                  </button>
                </div>
              </div>
              <button
                className="send-btn send-btn-mobile"
                onClick={onSend}
                disabled={(!userMessage.trim() && !selectedFile) || tokenLimitReached || isLoading}
                aria-label="Send message"
                title="Send message"
                type="button"
              >
                <SendArrowSvgIcon />
              </button>
              <input
                ref={(r) => {
                  fileInputRef.current = r;
                }}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  if (f) onFileSelected(f);
                  e.currentTarget.value = '';
                }}
                style={{ display: 'none' }}
              />
            </div>

            <p className="chat-disclaimer">AI can make mistakes. Please double-check responses</p>

            {selectedFile ? (
              <div style={{ paddingBottom: 8, fontSize: 12, color: '#555' }}>
                Attachment: <strong>{selectedFile.name}</strong>{' '}
                <button className="hb-icon-btn" onClick={removeFile} style={{ marginLeft: 8 }} type="button">
                  ✕
                </button>
              </div>
            ) : null}
          </div>
        </div>
        </div>
      </div>

      <Modal
        open={metaOpen}
        onClose={() => {
          setMetaOpen(false);
          setMetaForMessage(null);
        }}
        title="Execution Details"
        maxWidth={720}
      >
        <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 12.5 }}>
          {JSON.stringify(metaForMessage?.meta_data || [], null, 2)}
        </pre>
      </Modal>

      <Modal open={!!imagePreviewUrl} onClose={() => setImagePreviewUrl(null)} title="Image Preview" maxWidth={900}>
        {imagePreviewUrl ? (
          <img
            src={imagePreviewUrl}
            alt="preview"
            style={{ width: '100%', height: 'auto', borderRadius: 10, display: 'block' }}
          />
        ) : null}
      </Modal>

      <Modal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="Feedback" maxWidth={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: '#555' }}>
            Tell us what was wrong with the response (optional).
          </div>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 8,
              border: '1px solid rgba(0,0,0,0.18)',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="hb-icon-btn" onClick={() => setFeedbackOpen(false)} type="button">
              Cancel
            </button>
            <button className="send-btn" onClick={submitThumbsDownFeedback} type="button" style={{ width: 'auto', padding: '0 12px' }}>
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

