import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import type { SessionSummary } from '../types';
import { BackButtonSvgIcon } from '../ui/icons';

export type HistorySidebarProps = {
  sessionHistory: SessionSummary[] | null;
  currentSessionId: string;
  isHistoryOpen: boolean;
  onCollapse: () => void;
  onSelectSession: (session: SessionSummary) => void;
  onRename: (sessionId: string, newTitle: string) => Promise<void>;
  onDelete: (sessionId: string) => Promise<void>;
};

export function HistorySidebar({
  sessionHistory,
  currentSessionId,
  isHistoryOpen,
  onCollapse,
  onSelectSession,
  onRename,
  onDelete,
}: HistorySidebarProps) {
  const [openHistoryMenuSessionId, setOpenHistoryMenuSessionId] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renamingTitleValue, setRenamingTitleValue] = useState('');
  const historyMenuRef = useRef<HTMLDivElement | null>(null);
  const historyRenameRef = useRef<HTMLDivElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!openHistoryMenuSessionId && !renamingSessionId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (openHistoryMenuSessionId && historyMenuRef.current && !historyMenuRef.current.contains(target)) {
        setOpenHistoryMenuSessionId(null);
      }
      if (renamingSessionId && historyRenameRef.current && !historyRenameRef.current.contains(target)) {
        setRenamingSessionId(null);
        setRenamingTitleValue('');
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openHistoryMenuSessionId, renamingSessionId]);

  useEffect(() => {
    if (renamingSessionId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingSessionId]);

  const startRename = useCallback((sessionId: string, currentTitle: string) => {
    setOpenHistoryMenuSessionId(null);
    setRenamingSessionId(sessionId);
    setRenamingTitleValue(currentTitle || '');
  }, []);

  const cancelRename = useCallback(() => {
    setRenamingSessionId(null);
    setRenamingTitleValue('');
  }, []);

  const submitRename = useCallback(
    async (sessionId: string) => {
      const newTitle = renamingTitleValue.trim();
      const session = (sessionHistory || []).find(
        (s) => String((s as any)?.session_id || (s as any)?.id) === sessionId
      );
      const currentTitle = ((session as any)?.title || 'Previous Chat')?.trim() || '';
      if (!newTitle || newTitle === currentTitle) {
        cancelRename();
        return;
      }
      try {
        await onRename(sessionId, newTitle);
        cancelRename();
      } catch {
        cancelRename();
      }
    },
    [cancelRename, onRename, renamingTitleValue, sessionHistory]
  );

  const handleDelete = useCallback(
    async (sessionId: string) => {
      try {
        await onDelete(sessionId);
        setOpenHistoryMenuSessionId(null);
      } catch {
        // ignore
      }
    },
    [onDelete]
  );

  return (
    <div className={clsx('history-sidebar', isHistoryOpen && 'open')}>
      <div className="history-sidebar-header">
        <span>Previous Chats</span>
        <button
          className="history-header-action"
          type="button"
          aria-label="Collapse history"
          title="Collapse history"
          onClick={onCollapse}
        >
          <BackButtonSvgIcon />
        </button>
      </div>
      <div className="history-list">
        {(sessionHistory || []).map((s) => {
          const sid = (s as any)?.session_id || (s as any)?.id;
          const title = (s as any)?.title || 'Previous Chat';
          const isMenuOpen = openHistoryMenuSessionId === String(sid);
          return (
            <div
              key={String(sid)}
              ref={renamingSessionId === String(sid) ? historyRenameRef : null}
              className={clsx(
                'history-item',
                String(sid) === currentSessionId && 'active',
                renamingSessionId === String(sid) && 'is-renaming'
              )}
              onClick={() => {
                if (renamingSessionId !== String(sid)) onSelectSession(s);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (renamingSessionId === String(sid)) return;
                if (e.key === 'Enter' || e.key === ' ') onSelectSession(s);
              }}
              title={title}
            >
              <div className="history-summary-wrap">
                <div className={clsx('history-summary', renamingSessionId === String(sid) && 'hidden')}>
                  {title}
                </div>
                {renamingSessionId === String(sid) ? (
                  <div
                    className="history-rename-overlay"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={renameInputRef}
                      type="text"
                      className="history-rename-input"
                      value={renamingTitleValue}
                      onChange={(e) => setRenamingTitleValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitRename(String(sid));
                        if (e.key === 'Escape') cancelRename();
                      }}
                      onBlur={() => submitRename(String(sid))}
                      aria-label="Rename chat"
                    />
                  </div>
                ) : null}
              </div>
              <div
                ref={isMenuOpen ? historyMenuRef : null}
                className="history-item-menu-wrap"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="history-item-menu"
                  aria-label="Options"
                  aria-expanded={isMenuOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (renamingSessionId === String(sid)) cancelRename();
                    setOpenHistoryMenuSessionId((prev) => (prev === String(sid) ? null : String(sid)));
                  }}
                />
                {isMenuOpen ? (
                  <div className="history-item-dropdown" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      className="history-item-dropdown-option"
                      onClick={() => startRename(String(sid), title)}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="history-item-dropdown-option history-item-dropdown-option-delete"
                      onClick={() => handleDelete(String(sid))}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
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
  );
}
