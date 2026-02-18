import DOMPurify from 'dompurify';
import { parseHtmlWithEcharts } from '../utils/echartsParser';
import { EChartsBlock } from './EChartsBlock';

/** Sanitizes HTML, stripping scripts. Used for non-chart segments. */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html || '', {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script'],
  });
}

/** Wraps tables in scroll containers for horizontal scrolling. */
function wrapTablesInScrollContainer(html: string): string {
  const sanitized = sanitizeHtml(html);
  if (typeof document === 'undefined') return sanitized;
  try {
    const doc = new DOMParser().parseFromString(sanitized, 'text/html');
    doc.querySelectorAll('table').forEach((table) => {
      const wrapper = doc.createElement('div');
      wrapper.className = 'assistant-table-scroll-wrapper';
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
    return doc.body?.innerHTML ?? sanitized;
  } catch {
    return sanitized;
  }
}

export interface AssistantMessageContentProps {
  html: string;
  onImageClick?: (src: string) => void;
}

/**
 * Renders assistant message content: parses HTML for ECharts blocks,
 * renders charts in iframes, and sanitizes/renders the rest as HTML.
 */
export function AssistantMessageContent({ html, onImageClick }: AssistantMessageContentProps) {
  const segments = parseHtmlWithEcharts(html || '');

  return (
    <div className="assistant-message-content">
      {segments.map((seg, idx) => {
        if (seg.type === 'echarts') {
          return <EChartsBlock key={`echarts-${idx}`} chartHtml={seg.chartHtml} />;
        }
        const prepared = wrapTablesInScrollContainer(seg.html);
        if (!prepared.trim()) return null;
        return (
          <div
            key={`html-${idx}`}
            className="assistant-html"
            dangerouslySetInnerHTML={{ __html: prepared }}
            onClick={(e) => {
              if (!onImageClick) return;
              const target = e.target as HTMLElement | null;
              if (target?.tagName === 'IMG') {
                const src = (target as HTMLImageElement).src;
                if (src) onImageClick(src);
              }
            }}
            role="presentation"
          />
        );
      })}
    </div>
  );
}
