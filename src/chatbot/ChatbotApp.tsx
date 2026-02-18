import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

import './chatbot.css';
import type { ChatMessage, SessionSummary } from './types';
import { getRuntimeConfig } from './config';
import { ChatbotApiClient, buildDefaultGreeting } from './api/chatbotApi';
import { copyToClipboard } from './utils/clipboard';
import { extractPlainText, extractPlainTextForCopy } from './utils/plainText';
import { hasEchartsContent } from './utils/echartsParser';
import { hasImageContent, extractImageUrlsFromHtml } from './utils/imageUtils';
import { track } from './utils/analytics';
import {
  Modal,
  useToast,
  ExecutionDetailsBadges,
  ExecutionDetailsContent,
  ExecutionDetailsDisclaimer,
  hasVisibleExecutionDetails,
  HistorySidebar,
} from './components';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useExecutionDetailsModal } from './hooks/useExecutionDetailsModal';
import { FeedbackSuggestionsBox } from './ui/FeedbackSuggestionsBox';
import { AssistantMessageContent } from './ui/AssistantMessageContent';
import {
  CopySvgIcon,
  DownloadChartSvgIcon,
  HistorySvgIcon,
  InfoSvgIcon,
  LongBackAeroSvgIcon,
  MicrophoneSvgIcon,
  OptionTickSvgIcon,
  RedCrossCloseSvgIcon,
  SendArrowSvgIcon,
  StopSvgIcon,
  ThumbsDownSvgIcon,
  ThumbsUpSvgIcon,
  NewIcon,
  UploadImageSvgIcon,
} from './ui/icons';
import Lottie from 'lottie-react';
import confetti from 'canvas-confetti';
import aiIconAnimation from './ui/ai_icon.json';
import messageLoadingAnimation from './ui/messge_loading.json';

/** Generates a unique session ID - never reuses values. Prefers crypto.randomUUID when available. */
function generateUniqueSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return uuidv4();
}

/** Fires confetti across the entire page for thumbs up celebration. */
function fireConfetti() {
  const duration = 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

const LOADING_MESSAGES = [
  'Working on your request...',
  'Please be patient...',
  'This might take a minute or two...',
  'Thinking...',
  'Fetching the requested data...',
  'Almost there...',
];

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

export function ChatbotApp() {
  const cfg = useMemo(() => getRuntimeConfig(), []);
  const api = useMemo(() => new ChatbotApiClient({ apiBaseUrl: cfg.apiBaseUrl, authToken: cfg.authToken }), [cfg]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildDefaultGreeting()]);
  const [userMessage, setUserMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [tokenLimitReached, setTokenLimitReached] = useState(false);
  const [loadingTick, setLoadingTick] = useState(0);

  const [sessionHistory, setSessionHistory] = useState<SessionSummary[] | null>(null);

  const [selectedModel] = useState<string | null>(() => {
    try {
      return localStorage.getItem('hb-admin-chatbot-model');
    } catch {
      return null;
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const fromQs = cfg.initialSessionId;
    if (fromQs) return fromQs;
    return generateUniqueSessionId();
  });

  const [hasAssistantRespondedInSession, setHasAssistantRespondedInSession] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { showToast } = useToast();
  const { metaOpen, metaForMessage, openMetaForMessage, closeModal: closeExecutionDetails } = useExecutionDetailsModal();

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [feedbackSuggestionsForResponseId, setFeedbackSuggestionsForResponseId] = useState<string | null>(null);
  const [feedbackSuggestionsRequestClose, setFeedbackSuggestionsRequestClose] = useState(false);

  const DEFAULT_GREETING_CONTENT = buildDefaultGreeting().content;
  const isEmptyState =
    !!cfg.centeredEmptyState &&
    !isLoading &&
    messages.length === 1 &&
    messages[0]?.role === 'assistant' &&
    (messages[0]?.content || '').trim() === DEFAULT_GREETING_CONTENT;

  const [justLeftEmptyState, setJustLeftEmptyState] = useState(false);
  const prevEmptyStateRef = useRef(isEmptyState);
  useEffect(() => {
    if (prevEmptyStateRef.current && !isEmptyState) {
      setJustLeftEmptyState(true);
      const t = setTimeout(() => setJustLeftEmptyState(false), 450);
      return () => clearTimeout(t);
    }
    prevEmptyStateRef.current = isEmptyState;
  }, [isEmptyState]);

  const [isMobile, setIsMobile] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // When resizing to mobile, auto-collapse history so sidebar doesn't overlay
  useEffect(() => {
    if (isMobile) setIsHistoryOpen(false);
  }, [isMobile]);

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

  const adjustMessageInputHeight = useCallback(() => {
    const el = messageInputRef.current;
    if (!el) return;
    el.style.height = '0';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 18;
    const minLines = window.matchMedia('(max-width: 768px)').matches ? 1 : 2;
    const minH = minLines * lineHeight;
    const maxH = 8 * lineHeight;
    const h = Math.min(Math.max(el.scrollHeight, minH), maxH);
    el.style.height = `${h}px`;
  }, []);

  useEffect(() => {
    adjustMessageInputHeight();
  }, [userMessage, adjustMessageInputHeight]);

  useEffect(() => {
    if (!isMobile) return;
    adjustMessageInputHeight();
  }, [isMobile, adjustMessageInputHeight]);

  useEffect(() => {
    if (!isLoading) return;
    setLoadingTick(0);
    const id = setInterval(() => {
      setLoadingTick((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(id);
  }, [isLoading]);

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

  const prevMessagesLengthRef = useRef(0);
  useEffect(() => {
    const prevLen = prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    if (messages.length > prevLen) {
      scrollToBottom();
    }
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

  const startNewChat = useCallback(() => {
    if (isLoading) {
      showToast('Please wait for the request to complete or cancel it.');
      return;
    }
    track('new_chat_icon_click', { source: 'webview', timestamp: new Date().toISOString() });
    setTokenLimitReached(false);
    setIsLoading(false);
    setSelectedFile(null);
    setSelectedFilePreviewUrl(null);
    setMessages([buildDefaultGreeting()]);
    setSelectedOptions({});
    const newId = generateUniqueSessionId();
    setCurrentSessionId(newId);
  }, [isLoading, showToast]);

  const handleHistoryRename = useCallback(
    async (sessionId: string, newTitle: string) => {
      await api.renameSessionHistory(sessionId, newTitle);
      fetchSessionHistory();
    },
    [api, fetchSessionHistory]
  );

  const handleHistoryDelete = useCallback(
    async (sessionId: string) => {
      await api.deleteSessionHistory(sessionId);
      if (sessionId === currentSessionId) startNewChat();
      fetchSessionHistory();
    },
    [api, currentSessionId, fetchSessionHistory, startNewChat]
  );

  const onFileSelected = useCallback((file: File | null) => {
    if (!file) return;
    const ext = file.name.toLowerCase().split('.').pop();
    const allowed = ['png', 'jpeg', 'jpg'];
    if (!allowed.includes(ext || '')) return;
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

  const onSend = useCallback(async (overrideMessage?: string) => {
    const textToSend = (overrideMessage ?? userMessage).trim();
    if ((!textToSend && !selectedFile) || isLoading || tokenLimitReached) return;
    if (!cfg.apiBaseUrl) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Missing API base URL. Pass `?apiBase=...` or set `VITE_CHATBOT_API_BASE`.' },
      ]);
      return;
    }

    const fileToSend = selectedFile;
    const fileName = fileToSend?.name;
    const userText = textToSend;

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
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const start = performance.now();
    try {
      const response = await api.sendMessage({
        session_id: currentSessionId,
        query: userText || (fileName ? `[Image: ${fileName}]` : ''),
        model_name: selectedModel,
        file: fileToSend,
        signal: controller.signal,
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
      if (e?.name === 'AbortError') {
        return;
      }
      const elapsedSeconds = Math.max(0, Math.round((performance.now() - start) / 1000));
      const errorContent =
        elapsedSeconds >= 180
          ? 'Time limit reached. Please revisit the page in some time to get your answer.'
          : "I'm sorry, but I'm experiencing some technical difficulties. Please try again later.";
      setMessages((prev) => [...prev, { role: 'assistant', content: errorContent, timeTakenSeconds: elapsedSeconds }]);
    } finally {
      abortControllerRef.current = null;
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

  const onStopRequest = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const onSelectHistorySession = useCallback(
    async (s: SessionSummary) => {
      if (isLoading) {
        showToast('Please wait for the request to complete or cancel it.');
        return;
      }
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
              meta_data: Array.isArray((item as any)?.meta_data)
                ? (item as any).meta_data
                : Array.isArray((item as any)?.function_steps)
                  ? (item as any).function_steps
                  : undefined,
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
        setSelectedOptions({});
        setTokenLimitReached(!!(res as any)?.token_limit_reached);
        setHasAssistantRespondedInSession(true);
      } catch {
        // ignore
      }
    },
    [api, currentSessionId, isLoading, showToast]
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

  const [selectedOptions, setSelectedOptions] = useState<Record<string, Record<string, string>>>({});

  const getOptionsKey = useCallback((m: ChatMessage, idx: number) => {
    return (m as any)?.response_id ?? `msg-${idx}`;
  }, []);

  const onOptionSelect = useCallback(
    (messageIndex: number, question: string, key: string) => {
      const msg = messages[messageIndex];
      if (!msg || !isLatestOptionsMessage(messageIndex)) return;
      const optionsKey = getOptionsKey(msg, messageIndex);
      setSelectedOptions((prev) => {
        const cur = { ...(prev[optionsKey] || {}) };
        cur[question] = key;
        return { ...prev, [optionsKey]: cur };
      });

      // auto-submit if all selected (only consider questions that have choices)
      const opts = (msg as any)?.options || {};
      const questions = Object.keys(opts).filter(
        (q) => Array.isArray(opts[q]) && (opts[q]?.length ?? 0) > 0
      );
      const nextSel = { ...(selectedOptions[optionsKey] || {}), [question]: key };
      const allSelected = questions.length > 0 && questions.every((q) => !!nextSel[q]);
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
          onSend(msgText);
        }
      }
    },
    [getOptionsKey, isLatestOptionsMessage, messages, onSend, selectedOptions]
  );


  const onThumbsUp = useCallback(
    async (m: ChatMessage) => {
      if (!m.response_id) return;
      setFeedbackSuggestionsForResponseId(null);
      const isAlreadyLiked = m.good_response === true;
      const goodResponse = isAlreadyLiked ? null : true;
      try {
        await api.sendFeedback(m.response_id, { good_response: goodResponse, feedback: null });
        setMessages((prev) =>
          prev.map((x) => (x === m ? { ...x, good_response: goodResponse } : x))
        );
        track('thumbs_up_click', { source: 'webview', response_id: m.response_id });

        if (goodResponse === true) {
          fireConfetti();
        }
      } catch {
        // ignore
      }
    },
    [api]
  );

  const onThumbsDown = useCallback(
    async (m: ChatMessage) => {
      if (!m.response_id) return;
      const isAlreadyDisliked = m.good_response === false;
      if (isAlreadyDisliked) {
        if (feedbackSuggestionsForResponseId === m.response_id) {
          setFeedbackSuggestionsRequestClose(true);
        } else {
          setFeedbackSuggestionsForResponseId(null);
        }
        try {
          await api.sendFeedback(m.response_id, { good_response: null, feedback: null });
          setMessages((prev) =>
            prev.map((x) => (x === m ? { ...x, good_response: null } : x))
          );
        } catch {
          // ignore
        }
      } else {
        try {
          await api.sendFeedback(m.response_id, { good_response: false, feedback: null });
          setMessages((prev) => prev.map((x) => (x === m ? { ...x, good_response: false } : x)));
        } catch {
          // ignore
        }
        setFeedbackSuggestionsForResponseId(m.response_id);
      }
      track('thumbs_down_click', { source: 'webview', response_id: m.response_id });
    },
    [api, feedbackSuggestionsForResponseId]
  );

  const onSendFeedbackFromSuggestions = useCallback(
    async (feedback: string) => {
      const responseId = feedbackSuggestionsForResponseId;
      if (!responseId) return;
      await api.sendFeedback(responseId, { good_response: false, feedback: feedback.trim() || null });
    },
    [api, feedbackSuggestionsForResponseId]
  );

  const onClose = useCallback(() => {
    try {
      const targetOrigin = cfg.parentOrigin || '*';
      window.parent?.postMessage?.({ type: 'hb-chatbot-close' }, targetOrigin);
    } catch {
      // ignore
    }
  }, [cfg.parentOrigin]);

  const onTranscript = useCallback((text: string) => {
    setUserMessage(text);
  }, []);

  const onVoiceSilence = useCallback(
    (transcript: string) => {
      if (transcript.trim()) {
        onSend(transcript);
      }
    },
    [onSend]
  );

  const { isListening, isSupported, toggleListening } = useSpeechRecognition(onTranscript, onVoiceSilence);

  const onCopyMessage = useCallback(
    (content: string) => {
      const plain = extractPlainTextForCopy(content || '');
      copyToClipboard(plain).then(() => showToast('Text Copied!'));
    },
    [showToast]
  );

  const onDownloadChart = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const frame = (e.currentTarget as HTMLElement).closest('.assistant-message-frame');
      const wrapper = frame?.querySelector('.echarts-chart-wrapper');
      const iframe = wrapper?.querySelector('iframe');
      if (!iframe?.contentWindow) {
        showToast('Chart not ready to download');
        return;
      }
      const handler = (ev: MessageEvent) => {
        if (ev.data?.type !== 'hb-echarts-export-result') return;
        window.removeEventListener('message', handler);
        if (ev.data?.error) {
          showToast('Failed to export chart');
          return;
        }
        const dataUrl = ev.data?.dataUrl;
        if (dataUrl) {
          try {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `chart-${Date.now()}.png`;
            a.click();
            showToast('Chart downloaded');
          } catch {
            showToast('Failed to save chart');
          }
        }
      };
      window.addEventListener('message', handler);
      iframe.contentWindow.postMessage({ type: 'hb-echarts-export' }, '*');
    },
    [showToast]
  );

  const onDownloadImage = useCallback(
    async (content: string) => {
      const urls = extractImageUrlsFromHtml(content || '');
      if (urls.length === 0) {
        showToast('No image to download');
        return;
      }
      const downloadOne = async (rawUrl: string, index: number): Promise<boolean> => {
        const url = rawUrl.startsWith('data:') ? rawUrl : new URL(rawUrl, window.location.origin).href;
        if (rawUrl.startsWith('data:')) {
          try {
            const a = document.createElement('a');
            a.href = url;
            a.download = `image-${index + 1}.png`;
            a.click();
            return true;
          } catch {
            return false;
          }
        }
        try {
          const res = await fetch(url, { mode: 'cors' });
          if (!res.ok) throw new Error('Fetch failed');
          const blob = await res.blob();
          const ext = (blob.type?.split('/')[1] || 'png').replace(/^jpeg$/, 'jpg');
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `image-${index + 1}.${ext}`;
          a.click();
          URL.revokeObjectURL(a.href);
          return true;
        } catch {
          window.open(url, '_blank', 'noopener,noreferrer');
          return false;
        }
      };
      let ok = 0;
      for (let i = 0; i < urls.length; i++) {
        if (await downloadOne(urls[i], i)) ok++;
      }
      if (ok > 0) {
        showToast(ok > 1 ? 'Images downloaded' : 'Image downloaded');
      } else if (urls.length > 0) {
        showToast('Image opened in new tab');
      }
    },
    [showToast]
  );

  return (
    <div className="chatbot-root">
      <div className={clsx('chatbot-dialog', isHistoryOpen && 'history-open')}>
        <HistorySidebar
          sessionHistory={sessionHistory}
          currentSessionId={currentSessionId}
          isHistoryOpen={isHistoryOpen}
          onCollapse={() => setIsHistoryOpen(false)}
          onSelectSession={onSelectHistorySession}
          onRename={handleHistoryRename}
          onDelete={handleHistoryDelete}
        />

        <div className="chat-main">
        {isMobile && isHistoryOpen && (
          <div
            className="history-overlay-backdrop"
            onClick={() => setIsHistoryOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsHistoryOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close history"
          />
        )}
        <div className={clsx('chatbot-header', isMobile && 'chatbot-header-mobile')}>
          {isMobile && (
            <div className="header-back-row">
              <button
                className="header-back-btn-mobile"
                type="button"
                aria-label="Back"
                title="Back"
                onClick={onClose}
              >
                <LongBackAeroSvgIcon />
              </button>
            </div>
          )}
          <div className="header-main-row">
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
            {!isHistoryOpen && (
              <button
                className="header-btn-pill history-toggle-btn"
                onClick={() => setIsHistoryOpen(true)}
                aria-label="Previous Chats"
                title="Previous Chats"
                type="button"
              >
                <span className="header-pill-icon" aria-hidden="true">
                  <HistorySvgIcon />
                </span>
                <span>Previous Chats</span>
              </button>
            )}
            <button
              className="header-btn-pill"
              onClick={startNewChat}
              disabled={!hasAssistantRespondedInSession}
              aria-label="New"
              title="New chat"
              type="button"
            >
              <span className="header-pill-icon" aria-hidden="true">
                <NewIcon />
              </span>
              <span>New</span>
            </button>
            {!isMobile && (
              <button
                className="header-close-icon-btn"
                type="button"
                aria-label="Close"
                title="Close"
                onClick={onClose}
              >
                <RedCrossCloseSvgIcon />
              </button>
            )}
          </div>
          </div>
        </div>

        <div className="chatbot-content">
          <div className={clsx('chat-content-column', isEmptyState && 'empty-state')}>
            {isEmptyState && <div className="empty-state-spacer" aria-hidden="true" />}
            {!isEmptyState && (
            <div
              className={clsx('messages-container', justLeftEmptyState && 'messages-fly-in')}
              ref={messagesContainerRef}
            >
            {messages.map((m, i) => {
              const hasImg = !!(m.sentImageUrl || (m.sentImageUrls && m.sentImageUrls.length > 0));
              return (
                <div
                  key={i}
                  className={clsx('message', m.role === 'user' ? 'user-message' : 'assistant-message', hasImg && 'has-user-image')}
                  data-msg-idx={i}
                >
                  {m.role === 'assistant' ? (
                    <div className="assistant-message-frame">
                      <div className="assistant-message-body">
                        <AssistantMessageContent
                          html={m.content || ''}
                          onImageClick={setImagePreviewUrl}
                        />

                        {m.options &&
                        Object.keys(m.options).length > 0 &&
                        Object.keys(m.options).some(
                          (q) => Array.isArray(m.options?.[q]) && (m.options?.[q]?.length ?? 0) > 0
                        ) ? (
                          <div className={clsx('options-container', (!isLatestOptionsMessage(i) || isLoading) && 'disabled')}>
                            {Object.keys(m.options || {})
                              .filter((q) => Array.isArray(m.options?.[q]) && (m.options?.[q]?.length ?? 0) > 0)
                              .map((question) => (
                              <div className="option-group" key={question}>
                                <div className="option-question">{question}</div>
                                <div className="option-choices">
                                  {(m.options?.[question] || []).map((choice) => {
                                    const optionsKey = getOptionsKey(m, i);
                                    const sel = (selectedOptions[optionsKey] || {})[question];
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
                                        {sel === choice.key ? (
                                          <span className="option-tick-icon" aria-hidden="true">
                                            <OptionTickSvgIcon />
                                          </span>
                                        ) : null}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {i > 0 ? (
                        <>
                          <div className="assistant-message-actions">
                            <div className="assistant-actions-bubble">
                              <button
                                className="assistant-action-btn"
                                onClick={() => onCopyMessage(m.content || '')}
                                title="Copy"
                                aria-label="Copy"
                                type="button"
                              >
                                <CopySvgIcon />
                              </button>
                              <span className="assistant-actions-separator" aria-hidden="true" />
                              <button
                                type="button"
                                className={clsx('assistant-action-btn rating-btn', m.good_response === true && 'selected')}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onThumbsUp(m);
                                }}
                                aria-label="Thumbs up"
                                title="Helpful"
                              >
                                <ThumbsUpSvgIcon filled={m.good_response === true} />
                              </button>
                              <button
                                type="button"
                                className={clsx('assistant-action-btn rating-btn', m.good_response === false && 'selected')}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onThumbsDown(m);
                                }}
                                aria-label="Thumbs down"
                                title="Not helpful"
                              >
                                <ThumbsDownSvgIcon filled={m.good_response === false} />
                              </button>
                            </div>
                            {hasEchartsContent(m.content || '') ? (
                              <button
                                type="button"
                                className="download-chart-btn"
                                onClick={onDownloadChart}
                                aria-label="Download Chart"
                                title="Download Chart"
                              >
                                <DownloadChartSvgIcon />
                                <span className="download-chart-btn-text">Download Chart</span>
                              </button>
                            ) : null}
                            {hasImageContent(m.content || '') ? (
                              <button
                                type="button"
                                className="download-chart-btn"
                                onClick={() => onDownloadImage(m.content || '')}
                                aria-label="Download Image"
                                title="Download Image"
                              >
                                <DownloadChartSvgIcon />
                                <span className="download-chart-btn-text">Download Image</span>
                              </button>
                            ) : null}
                            {m.timeTakenSeconds !== undefined ? (
                              <span className="time-taken">(Time Taken: {m.timeTakenSeconds} sec)</span>
                            ) : null}
                            <button
                              className="assistant-action-btn meta-info-btn"
                              onClick={() => openMetaForMessage(m)}
                              title="Show execution details"
                              aria-label="Show execution details"
                              type="button"
                            >
                              <InfoSvgIcon />
                            </button>
                          </div>
                          {m.response_id && feedbackSuggestionsForResponseId === m.response_id ? (
                            <FeedbackSuggestionsBox
                              onSendFeedback={onSendFeedbackFromSuggestions}
                              onClose={() => {
                                setFeedbackSuggestionsForResponseId(null);
                                setFeedbackSuggestionsRequestClose(false);
                              }}
                              requestClose={feedbackSuggestionsRequestClose}
                            />
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <div className="message-content">{m.content}</div>
                      {(m.sentImageUrls?.length || m.sentImageUrl) ? (
                        <div className="user-images-container">
                          {(m.sentImageUrls || []).map((url) => (
                            <div key={url} className="user-image-preview" onClick={() => setImagePreviewUrl(url)}>
                              {/* eslint-disable-next-line jsx-a11y/alt-text */}
                              <img src={url} alt="" />
                            </div>
                          ))}
                          {m.sentImageUrl ? (
                            <div
                              key={m.sentImageUrl}
                              className="user-image-preview"
                              onClick={() => setImagePreviewUrl(m.sentImageUrl!)}
                            >
                              {/* eslint-disable-next-line jsx-a11y/alt-text */}
                              <img src={m.sentImageUrl} alt="" />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              );
            })}

            {isLoading ? (
              <div className="assistant-message message">
                <div className="assistant-message-frame">
                  <div className="assistant-message-body loading-message-body">
                    <div className="loading-lottie-wrap">
                      <Lottie
                        animationData={messageLoadingAnimation}
                        loop
                        aria-label="Loading"
                        className="loading-lottie"
                      />
                    </div>
                    <span className="loading-message-text">
                      {LOADING_MESSAGES[loadingTick % LOADING_MESSAGES.length]}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
            </div>
            )}

            <div className={clsx('footer-container', isEmptyState && 'footer-centered')}>
            {isEmptyState && (
              <p className="empty-state-prompt" aria-live="polite">Ready when you are.</p>
            )}
            {tokenLimitReached ? (
              <div className="context-limit-message">
                <span>Context limit reached. Please start a New Chat</span>
                <button className="history-btn" onClick={startNewChat} title="Start New Chat" type="button">
                  ↻
                </button>
              </div>
            ) : null}

            <div className="input-row">
              {selectedFile && selectedFilePreviewUrl ? (
                <div className="selected-image-bar">
                  <div className="selected-image-preview">
                    <img src={selectedFilePreviewUrl} alt="Selected" />
                    <button
                      className="selected-image-remove"
                      onClick={removeFile}
                      type="button"
                      aria-label="Remove image"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                  <span className="selected-image-name">{selectedFile.name}</span>
                </div>
              ) : null}
              <div className="input-wrapper">
                <textarea
                  ref={(r) => {
                    messageInputRef.current = r;
                  }}
                  className="message-input"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask anything you need..."
                  rows={isMobile ? 1 : 2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                  disabled={isLoading || tokenLimitReached}
                />
                <div className="input-actions">
                  <button
                    className="upload-image-btn input-icon-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || tokenLimitReached}
                    aria-label="Upload image"
                    title="Upload image (PNG, JPEG, JPG)"
                    type="button"
                  >
                    <UploadImageSvgIcon />
                  </button>
                  <button
                    className={clsx('voice-btn input-icon-btn', isListening && 'active')}
                    disabled={!isSupported || isLoading || tokenLimitReached}
                    onClick={() => toggleListening()}
                    aria-label={
                      !isSupported
                        ? 'Voice input not supported'
                        : isListening
                          ? 'Stop listening'
                          : 'Start voice input'
                    }
                    title={
                      !isSupported
                        ? 'Voice input not supported in this browser'
                        : isListening
                          ? 'Stop listening'
                          : 'Start voice input'
                    }
                    type="button"
                  >
                    <MicrophoneSvgIcon />
                  </button>
                  {isLoading ? (
                    <button
                      className="stop-btn send-btn-inline input-icon-btn"
                      onClick={onStopRequest}
                      aria-label="Stop request"
                      title="Stop request"
                      type="button"
                    >
                      <StopSvgIcon />
                    </button>
                  ) : (
                    <button
                      className="send-btn send-btn-inline input-icon-btn"
                      onClick={() => onSend()}
                      disabled={(!userMessage.trim() && !selectedFile) || tokenLimitReached}
                      aria-label="Send message"
                      title="Send message"
                      type="button"
                    >
                      <SendArrowSvgIcon />
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={(r) => {
                  fileInputRef.current = r;
                }}
                type="file"
                accept=".png,.jpeg,.jpg,image/png,image/jpeg,image/jpg"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  if (f) onFileSelected(f);
                  e.currentTarget.value = '';
                }}
                style={{ display: 'none' }}
              />
            </div>

            {!isEmptyState && (
            <p className="chat-disclaimer">AI can make mistakes. Please double-check responses</p>
            )}

            </div>
            {isEmptyState && <div className="empty-state-spacer" aria-hidden="true" />}
          </div>
        </div>
        </div>
      </div>

      <Modal
        open={metaOpen}
        onClose={closeExecutionDetails}
        title="Execution Details"
        headerExtra={metaForMessage ? <ExecutionDetailsBadges message={metaForMessage} /> : null}
        headerNote={metaForMessage ? <ExecutionDetailsDisclaimer message={metaForMessage} /> : null}
        maxWidth={720}
        hideHeaderBorder={!hasVisibleExecutionDetails(metaForMessage)}
        hideBody={!hasVisibleExecutionDetails(metaForMessage)}
        closeIcon={<RedCrossCloseSvgIcon size={44} />}
      >
        {metaForMessage ? <ExecutionDetailsContent message={metaForMessage} /> : null}
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

    </div>
  );
}

