/** Copy text to clipboard with fallback when navigator.clipboard is unavailable. */
export function copyToClipboard(text: string): Promise<void> {
  const toCopy = String(text ?? '').trim();
  if (!toCopy) return Promise.resolve();
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(toCopy).catch(() => {
      const ta = document.createElement('textarea');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.value = toCopy;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(ta);
      }
    });
  }
  const ta = document.createElement('textarea');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.value = toCopy;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(ta);
  }
  return Promise.resolve();
}
