/**
 * Normalize plain text by:
 * - optionally stripping URLs
 * - collapsing whitespace
 * - trimming empty lines
 */
export function normalizePlainText(raw: string, stripUrls: boolean): string {
  let text = raw || '';
  if (stripUrls) {
    text = text.replace(/\bhttps?:\/\/\S+/gi, '');
  }
  const normalized = text.replace(/\r\n?/g, '\n');
  return normalized
    .split('\n')
    .map((ln) => ln.replace(/\s+/g, ' ').trim())
    .filter((ln) => ln.length > 0)
    .join('\n');
}

/** Extract plain text from HTML for UI use (keeps URLs). */
export function extractPlainText(html: string): string {
  try {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    const raw = div.textContent || (div as any).innerText || '';
    return normalizePlainText(raw, false);
  } catch {
    return html;
  }
}

/** Extract plain text from HTML for analytics (strips URLs). */
export function extractPlainTextForAnalytics(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || '', 'text/html');
    if (!doc || !doc.body) return '';
    doc.querySelectorAll('script, style, a, link').forEach((el) => el.remove());
    const raw = doc.body.textContent || '';
    return normalizePlainText(raw, true);
  } catch {
    const fallback = extractPlainText(html || '');
    return normalizePlainText(fallback, true);
  }
}

