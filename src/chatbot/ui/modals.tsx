import { useEffect } from 'react';
import ReactDOM from 'react-dom';

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 720,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="hb-modal-overlay" onMouseDown={onClose} role="presentation">
      <div
        className="hb-modal"
        style={{ maxWidth }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
      >
        <div className="hb-modal-header">
          <div className="hb-modal-title">{title || ''}</div>
          <button className="hb-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="hb-modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

