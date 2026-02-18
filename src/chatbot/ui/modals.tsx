import { useEffect } from 'react';
import ReactDOM from 'react-dom';

export function Modal({
  open,
  onClose,
  title,
  headerExtra,
  headerNote,
  children,
  maxWidth = 720,
  hideHeaderBorder,
  hideBody,
  closeIcon,
}: {
  open: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  headerExtra?: React.ReactNode;
  headerNote?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number;
  hideHeaderBorder?: boolean;
  hideBody?: boolean;
  closeIcon?: React.ReactNode;
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

  const ariaLabel = typeof title === 'string' ? title : 'Dialog';

  return ReactDOM.createPortal(
    <div className="hb-modal-overlay" onMouseDown={onClose} role="presentation">
      <div
        className={`hb-modal${closeIcon ? ' hb-modal-has-close-icon' : ''}`}
        style={{ maxWidth }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <div className={`hb-modal-header${hideHeaderBorder ? ' hb-modal-header-no-border' : ''}`}>
          <div className="hb-modal-header-top">
            <div className="hb-modal-header-left">
              <div className="hb-modal-title">{title || ''}</div>
              {headerExtra}
            </div>
            <button className="hb-icon-btn" onClick={onClose} aria-label="Close">
              {closeIcon ?? '✕'}
            </button>
          </div>
          {headerNote ? <div className="hb-modal-header-note">{headerNote}</div> : null}
        </div>
        {!hideBody && <div className="hb-modal-body">{children}</div>}
      </div>
    </div>,
    document.body
  );
}

