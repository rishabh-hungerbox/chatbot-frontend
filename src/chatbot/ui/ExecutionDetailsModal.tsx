import { copyToClipboard } from '../utils/clipboard';
import {
  CopySvgIcon,
  DataProcessingStepIcon,
  QueryStepIcon,
  ReasoningStepIcon,
  ToolCallStepIcon,
} from './icons';
import { useToast } from './Toast';
import type { ChatMessage } from '../types';
import './execution-details.css';

type MetaEntry = Record<string, unknown> & {
  step?: string;
  step_name?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  is_hidden?: number | boolean;
  function?: string;
  args?: Record<string, unknown>;
  query?: string;
  Query?: string;
};

function formatSql(sql: string): string {
  if (!sql) return '';
  let normalized = String(sql).replace(/\s+/g, ' ').trim();

  const clauses = [
    'SELECT',
    'FROM',
    'WHERE',
    'GROUP BY',
    'ORDER BY',
    'HAVING',
    'INNER JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'FULL JOIN',
    'CROSS JOIN',
    'JOIN',
    'ON',
    'AND',
    'OR',
    'LIMIT',
    'OFFSET',
    'VALUES',
    'SET',
    'RETURNING',
  ];

  clauses.forEach((kw) => {
    const re = new RegExp('\\b' + kw.replace(/\s+/g, '\\s+') + '\\b', 'ig');
    normalized = normalized.replace(re, () => kw);
  });

  const breakBefore = [
    'SELECT',
    'FROM',
    'WHERE',
    'GROUP BY',
    'ORDER BY',
    'HAVING',
    'INNER JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'FULL JOIN',
    'CROSS JOIN',
    'JOIN',
    'LIMIT',
    'OFFSET',
    'RETURNING',
  ];

  breakBefore.forEach((kw) => {
    const re = new RegExp('\\s' + kw.replace(/\s+/g, '\\s+') + '\\b', 'g');
    normalized = normalized.replace(re, '\n' + kw);
  });

  normalized = normalized
    .replace(/\sAND\b/g, '\n  AND')
    .replace(/\sOR\b/g, '\n  OR')
    .replace(/,\s*/g, ', ');

  return normalized.trim();
}

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return String(value);
  }
}

function getStepIcon(step: string): React.ReactNode {
  const name = (step || '').toLowerCase();
  if (name.includes('tool')) return <ToolCallStepIcon />;
  if (name.includes('query')) return <QueryStepIcon />;
  if (name.includes('reasoning')) return <ReasoningStepIcon />;
  if (name.includes('process') || name.includes('data')) return <DataProcessingStepIcon />;
  return <ToolCallStepIcon />;
}

export function getMetaDataFromMessage(message: ChatMessage): MetaEntry[] {
  const m = (message as Record<string, unknown>)?.meta_data ?? message?.meta_data;
  if (Array.isArray(m)) return m as MetaEntry[];
  const fn = (message as Record<string, unknown>)?.function_steps;
  if (Array.isArray(fn)) return fn as MetaEntry[];
  return [];
}

export function hasVisibleExecutionDetails(message: ChatMessage | null | undefined): boolean {
  const meta = getMetaDataFromMessage(message || ({} as ChatMessage));
  return meta.some((e) => !isHidden(e));
}

function isHidden(entry: MetaEntry): boolean {
  const v = entry?.is_hidden;
  return v === 1 || v === true;
}

function getStep(entry: MetaEntry): string {
  const raw = (entry?.step ?? (entry as Record<string, unknown>)?.step_name) as string | undefined;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (entry?.query || entry?.Query) return 'Query';
  if (typeof entry?.function === 'string') return 'Tool Call';
  return 'Step';
}

function getDurationSeconds(entry: MetaEntry): number | null {
  const d = entry?.duration;
  if (typeof d === 'number' && isFinite(d)) return d;
  const start = entry?.start_time;
  const end = entry?.end_time;
  if (start && end) {
    const s = Date.parse(String(start));
    const e = Date.parse(String(end));
    if (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) {
      return Math.round((e - s) / 1000);
    }
  }
  return null;
}

function isQuery(entry: MetaEntry): boolean {
  return !!(entry?.Query ?? entry?.query);
}

function getQuery(entry: MetaEntry): string {
  return String(entry?.Query ?? entry?.query ?? '');
}

function isFunction(entry: MetaEntry): boolean {
  return typeof entry?.function === 'string';
}

function getFunctionName(entry: MetaEntry): string {
  return String(entry?.function ?? '');
}

function getFunctionArgs(entry: MetaEntry): Record<string, unknown> {
  return (entry?.args || {}) as Record<string, unknown>;
}

function hasSalesOrderQuery(metaData: MetaEntry[]): boolean {
  if (!Array.isArray(metaData)) return false;
  const hasQuery = metaData.some((entry) => {
    if (!isQuery(entry)) return false;
    const q = getQuery(entry);
    const lower = (typeof q === 'string' ? q : '').toLowerCase();
    return lower.includes('sales_order') || lower.includes('salesorder');
  });
  if (hasQuery) return true;
  return metaData.some((entry) =>
    JSON.stringify(entry).toLowerCase().includes('sales_order')
  );
}

function formatTimestamp(ts: string | undefined): string {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const date = d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    return `${time} • ${date}`;
  } catch {
    return String(ts);
  }
}

export function ExecutionDetailsDisclaimer({ message }: { message: ChatMessage }) {
  const metaData = getMetaDataFromMessage(message || ({} as ChatMessage));
  if (!hasSalesOrderQuery(metaData)) return null;
  return (
    <div className="execution-details-disclaimer execution-details-disclaimer-header">
      Disclaimer: The order count is tracked at vendor level, meaning all items purchased from a single vendor in
      one transaction are recorded as one order. If this varies from your reports, please contact the HungerBox
      team.
    </div>
  );
}

export function ExecutionDetailsBadges({ message }: { message: ChatMessage }) {
  const metaData = getMetaDataFromMessage(message || ({} as ChatMessage));
  const executionTimeSeconds = message?.timeTakenSeconds;
  const systemResponseTime = message?.system_response_time;
  const modelName = message?.model_name;

  const totalExecutionSeconds =
    typeof executionTimeSeconds === 'number'
      ? executionTimeSeconds
      : (() => {
          const visible = metaData.filter((e) => !isHidden(e));
          if (visible.length === 0) return null;
          const first = visible[0];
          const last = visible[visible.length - 1];
          const start = first?.start_time ? Date.parse(String(first.start_time)) : NaN;
          const end = last?.end_time ? Date.parse(String(last.end_time)) : NaN;
          if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
            return Math.round((end - start) / 1000);
          }
          return null;
        })();

  const displayTime =
    systemResponseTime || (metaData.length > 0 ? formatTimestamp(String(metaData[0]?.start_time)) : '');

  const getModelClass = (): string => {
    if (!modelName) return '';
    const name = modelName.toLowerCase();
    if (name.includes('gpt')) return 'execution-details-badge-model-gpt';
    if (name.includes('grok')) return 'execution-details-badge-model-grok';
    if (name.includes('gemini')) return 'execution-details-badge-model-gemini';
    if (name.includes('claude')) return 'execution-details-badge-model-claude';
    return '';
  };

  if (totalExecutionSeconds == null && !displayTime && !modelName) return null;

  return (
    <div className="execution-details-badges">
      {totalExecutionSeconds != null && (
        <span className="execution-details-badge execution-details-badge-exec">
          <span className="execution-details-exec-label">Execution:</span>{' '}
          <span className="execution-details-exec-seconds">{totalExecutionSeconds}s</span>
        </span>
      )}
      {displayTime && (
        <span className="execution-details-badge execution-details-badge-time">{displayTime}</span>
      )}
      {modelName && (
        <span
          className={`execution-details-badge execution-details-badge-model ${getModelClass()}`.trim()}
        >
          {modelName}
        </span>
      )}
    </div>
  );
}

export function ExecutionDetailsContent({ message }: { message: ChatMessage }) {
  const metaData = getMetaDataFromMessage(message || ({} as ChatMessage));
  const { showToast } = useToast();

  const handleCopy = (text: string) => {
    copyToClipboard(text).then(() => showToast('Text Copied!'));
  };

  const visibleCount = metaData.filter((e) => !isHidden(e)).length;
  if (visibleCount === 0) return null;

  return (
    <div className="execution-details">
      <div className="execution-details-content">
        <div className="execution-details-timeline">
          {metaData.map((item, i) => {
            if (isHidden(item)) return null;
            const step = getStep(item);
            const duration = getDurationSeconds(item);
            const isQueryStep = isQuery(item);
            const isFuncStep = isFunction(item);

            return (
              <div key={i} className="execution-details-timeline-item" data-index={i}>
                <div className="execution-details-timeline-marker" aria-label={step}>
                  {getStepIcon(step)}
                </div>
                <div className="execution-details-timeline-content">
                  <div className="execution-details-timeline-header">
                    <span className="execution-details-badge-step">{step}</span>
                    {duration != null && <span className="execution-details-duration">{duration}s</span>}
                  </div>

                  {isQueryStep && (
                    <div className="execution-details-detail-block">
                      <div className="execution-details-detail-actions">
                        <button
                          type="button"
                          className="execution-details-icon-btn"
                          onClick={() => handleCopy(getQuery(item))}
                          aria-label="Copy query"
                        >
                          <CopySvgIcon />
                        </button>
                      </div>
                      <pre className="execution-details-code-block execution-details-sql">{formatSql(getQuery(item))}</pre>
                    </div>
                  )}

                  {isFuncStep && (
                    <div className="execution-details-detail-block">
                      <div className="execution-details-meta-row">
                        <span className="execution-details-badge-func">Function</span>
                        <span className="execution-details-meta-key">{getFunctionName(item)}</span>
                      </div>
                      <div className="execution-details-section-row">
                        <span className="execution-details-section-title">Args</span>
                        <button
                          type="button"
                          className="execution-details-icon-btn"
                          onClick={() => handleCopy(formatJson(getFunctionArgs(item)))}
                          aria-label="Copy args as JSON"
                        >
                          <CopySvgIcon />
                        </button>
                      </div>
                      <pre className="execution-details-code-block execution-details-json">
                        {formatJson(getFunctionArgs(item))}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
