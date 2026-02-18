import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { SendArrowSvgIcon } from './icons';

const FEEDBACK_BUBBLES = [
  "Don't like the style",
  'Not factually correct',
  "Shouldn't have used the memory",
  'Wrong Interpretation of the query',
] as const;

export function FeedbackSuggestionsBox({
  onSendFeedback,
  onClose,
  requestClose,
}: {
  onSendFeedback: (feedback: string) => Promise<void>;
  onClose: () => void;
  requestClose?: boolean;
}) {
  const [customText, setCustomText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const startClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
  }, [isClosing]);

  useEffect(() => {
    if (requestClose) startClose();
  }, [requestClose, startClose]);

  const handleAnimationEnd = useCallback(() => {
    if (isClosing) onClose();
  }, [isClosing, onClose]);

  const handleBubbleClick = async (text: string) => {
    if (isSending) return;
    setIsSending(true);
    try {
      await onSendFeedback(text);
      startClose();
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  const handleCustomSend = async () => {
    const text = customText.trim();
    if (!text || isSending) return;
    setIsSending(true);
    try {
      await onSendFeedback(text);
      startClose();
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={clsx('feedback-suggestions-box', isClosing && 'closing')}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="feedback-suggestions-header">
        <span className="feedback-suggestions-title">Let us know what went wrong:</span>
        <button
          type="button"
          className="feedback-suggestions-close-btn"
          onClick={startClose}
          aria-label="Close"
          title="Close"
        >
          ×
        </button>
      </div>
      <div className="feedback-suggestions-bubbles">
        {FEEDBACK_BUBBLES.map((text) => (
          <button
            key={text}
            type="button"
            className="feedback-suggestion-bubble"
            onClick={() => handleBubbleClick(text)}
            disabled={isSending}
          >
            {text}
          </button>
        ))}
      </div>
      <div className="feedback-suggestions-input-wrapper">
        <input
          type="text"
          className="feedback-suggestions-input"
          placeholder="Type your feedback..."
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCustomSend();
          }}
          disabled={isSending}
        />
        <button
          type="button"
          className="feedback-suggestions-send-btn"
          onClick={handleCustomSend}
          disabled={!customText.trim() || isSending}
          aria-label="Send feedback"
          title="Send feedback"
        >
          <SendArrowSvgIcon />
        </button>
      </div>
    </div>
  );
}
