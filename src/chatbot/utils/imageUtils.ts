/**
 * Detects if HTML contains any <img> elements.
 */
export function hasImageContent(html: string): boolean {
  if (!html || typeof html !== 'string') return false;
  return /<img[\s>]/i.test(html);
}

/**
 * Extracts all image URLs (src attributes) from HTML.
 */
export function extractImageUrlsFromHtml(html: string): string[] {
  if (!html || typeof html !== 'string') return [];
  const urls: string[] = [];
  const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRegex.exec(html)) !== null) {
    const src = m[1]?.trim();
    if (src && !urls.includes(src)) urls.push(src);
  }
  return urls;
}
