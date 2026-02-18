import { useEffect, useMemo, useRef, useState } from 'react';
import { extractChartHeight, extractChartWidth } from '../utils/echartsParser';

const DEFAULT_HEIGHT = 520;
const MIN_HEIGHT = 280;
const MAX_HEIGHT = 1200;
const DEFAULT_MIN_WIDTH = 600;

/**
 * Wraps ECharts chart HTML in an iframe so scripts run safely.
 * Height is derived from: (1) backend chart CSS, (2) postMessage from iframe after render, (3) viewport-based fallback.
 */
const DEBUG = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;

export function EChartsBlock({ chartHtml }: { chartHtml: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (DEBUG) {
    console.log('[EChartsBlock] Rendering chart, length:', chartHtml?.length, 'hasEcharts:', /echarts\.init/.test(chartHtml ?? ''));
  }

  const parsedHeight = extractChartHeight(chartHtml);
  const baseHeight = parsedHeight ?? DEFAULT_HEIGHT;

  const [iframeHeight, setIframeHeight] = useState(() =>
    Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, baseHeight))
  );

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'hb-echarts-error') {
        console.warn('[EChartsBlock] iframe script error:', e.data.error, e.data.src, e.data.line, e.data.col);
        return;
      }
      if (e.data?.type !== 'hb-echarts-height' || typeof e.data?.height !== 'number') return;
      const h = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, e.data.height));
      setIframeHeight((prev) => (h > prev ? h : prev));
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [chartHtml]);

  useEffect(() => {
    setIframeHeight(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, baseHeight)));
  }, [baseHeight, chartHtml]);

  const fullDoc = useMemo(
    () => buildChartDocument(chartHtml, iframeHeight),
    [chartHtml, iframeHeight]
  );

  return (
    <div ref={containerRef} className="echarts-chart-wrapper" style={{ width: '100%', minHeight: MIN_HEIGHT }}>
      <iframe
        ref={iframeRef}
        title="ECharts visualization"
        srcDoc={fullDoc}
        className="echarts-chart-iframe"
        style={{ width: '100%', height: iframeHeight, border: 'none' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

/**
 * Builds a full HTML document for the iframe. Adds viewport meta and height override
 * so the chart container fills the iframe and resizes without reloading.
 */
const HEIGHT_REPORT_SCRIPT = `
(function(){
  function chartEl(){
    var wrap = document.querySelector('[id^="chart-"][id$="-wrap"]');
    if (wrap) return wrap.querySelector('[id^="chart-"]:not([id$="-hint"])');
    return document.querySelector('[id^="chart-"]:not([id*="-wrap"]):not([id*="-hint"])');
  }
  function send(){
    var el = chartEl();
    var h = el ? Math.max(el.scrollHeight || 0, el.offsetHeight || 0, el.clientHeight || 0) : 0;
    if (h > 0 && window.parent !== window) {
      try { window.parent.postMessage({ type: 'hb-echarts-height', height: Math.ceil(h) }, '*'); } catch(e){}
    }
  }
  send();
  setTimeout(send, 150);
  setTimeout(send, 500);
  if (window.addEventListener) window.addEventListener('resize', function(){ setTimeout(send, 100); });
})();
`;

const IFRAME_ERROR_HANDLER_SCRIPT = `
(function(){
  var origOnError = window.onerror;
  window.onerror = function(msg, src, line, col, err) {
    try {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'hb-echarts-error',
          error: String(msg || err),
          src: String(src || ''),
          line: line,
          col: col
        }, '*');
      }
    } catch(e) {}
    return origOnError ? origOnError.apply(this, arguments) : false;
  };
})();
`;

const EXPORT_CHART_SCRIPT = `
(function(){
  function chartEl(){
    var wrap = document.querySelector('[id^="chart-"][id$="-wrap"]');
    if (wrap) return wrap.querySelector('[id^="chart-"]:not([id$="-hint"])');
    return document.querySelector('[id^="chart-"]:not([id*="-wrap"]):not([id*="-hint"])');
  }
  window.addEventListener('message', function(e){
    if (e.data && e.data.type === 'hb-echarts-export') {
      var el = chartEl();
      var echartsLib = (typeof echarts !== 'undefined' ? echarts : window.echarts);
      var chart = el && echartsLib ? echartsLib.getInstanceByDom(el) : null;
      if (chart && chart.getDataURL) {
        try {
          var dataUrl = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' });
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'hb-echarts-export-result', dataUrl: dataUrl }, '*');
          }
        } catch (err) {
          window.parent.postMessage({ type: 'hb-echarts-export-result', error: String(err) }, '*');
        }
      } else {
        window.parent.postMessage({ type: 'hb-echarts-export-result', error: 'Chart not found' }, '*');
      }
    }
  });
})();
`;

function buildChartDocument(chartHtml: string, containerHeight: number): string {
  const minWidth = Math.max(DEFAULT_MIN_WIDTH, extractChartWidth(chartHtml) ?? 0);
  const fixedHeight = containerHeight;
  const chartOnly = '[id^="chart-"]:not([id*="-wrap"]):not([id*="-hint"])';
  const heightOverride = `${chartOnly}{height:${fixedHeight}px!important;max-height:${fixedHeight}px!important}`;
  const wrapFix = '[id^="chart-"][id$="-wrap"]{height:' + fixedHeight + 'px!important;max-height:' + fixedHeight + 'px!important}';
  const safeStyles = `${heightOverride}${wrapFix}body{margin:0;padding:0;overflow-x:auto;overflow-y:hidden;min-width:${minWidth}px;height:${fixedHeight}px}${chartOnly}{min-width:${minWidth}px!important;width:100%!important}`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${safeStyles}</style></head><body style="margin:0;padding:0"><script>${IFRAME_ERROR_HANDLER_SCRIPT}</script>${chartHtml}<script>${HEIGHT_REPORT_SCRIPT}</script><script>${EXPORT_CHART_SCRIPT}</script></body></html>`;
}
