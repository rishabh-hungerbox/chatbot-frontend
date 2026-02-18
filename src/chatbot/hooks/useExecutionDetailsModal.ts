import { useCallback, useState } from 'react';
import type { ChatMessage } from '../types';

export function useExecutionDetailsModal() {
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaForMessage, setMetaForMessage] = useState<ChatMessage | null>(null);

  const openMetaForMessage = useCallback((m: ChatMessage) => {
    setMetaForMessage(m);
    setMetaOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setMetaOpen(false);
    setMetaForMessage(null);
  }, []);

  return { metaOpen, metaForMessage, openMetaForMessage, closeModal };
}
