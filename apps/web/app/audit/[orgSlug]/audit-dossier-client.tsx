'use client';

import { useState } from 'react';
import { ConformanceStatus } from '@iso16363/shared-types';
import { AuditPanel } from '../../../components/audit-panel/audit-panel';
import { ConformanceBadge } from '../../../components/audit-panel/conformance-badge';
import { downloadPdf } from '../../../lib/api-client';

interface Evidence {
  id: string;
  fileName: string;
  uploadedAt: string;
}

interface DossierMetric {
  metricId: string;
  code: string;
  title: string;
  normText: string | null;
  readiness: string;
  justification: string | null;
  auditorOpinion: ConformanceStatus | null;
  auditorComment: string | null;
  evidences: Evidence[];
}

interface Subsection {
  id: string;
  code: string;
  title: string;
  metrics: DossierMetric[];
}

interface Section {
  id: string;
  code: string;
  title: string;
  subsections: Subsection[];
}

interface Props {
  sections: Section[];
  orgName: string;
  orgSlug: string;
  token: string;
  isAuditor: boolean;
}

type FilterMode = 'all' | 'non_compliant' | 'awaiting';

const READINESS_DOT: Record<string, string> = {
  READY: '#1D9E75',
  IN_PROGRESS: '#378ADD',
  PENDING: '#EF9F27',
};

function matchesFilter(metric: DossierMetric, filter: FilterMode): boolean {
  if (filter === 'all') return true;
  if (filter === 'awaiting') return metric.auditorOpinion === null;
  if (filter === 'non_compliant')
    return metric.auditorOpinion === ConformanceStatus.NON_COMPLIANT || metric.auditorOpinion === ConformanceStatus.PARTIAL;
  return true;
}

function MetricRow({ metric, token, isAuditor }: { metric: DossierMetric; token: string; isAuditor: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [opinion, setOpinion] = useState(metric.auditorOpinion);
  const [comment, setComment] = useState(metric.auditorComment);
  const isNC = opinion === ConformanceStatus.NON_COMPLIANT;

  return (
    <li
      style={{
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        borderLeft: isNC ? '2px solid #F09595' : 'none',
      }}
      className="last:border-b-0"
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        className="hover:bg-[#f5f6f8] transition-colors"
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: READINESS_DOT[metric.readiness] ?? '#EF9F27',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            width: 44,
            flexShrink: 0,
          }}
        >
          {metric.code}
        </span>
        <span style={{ fontSize: 13, color: 'var(--color-text-primary)', flex: 1, textAlign: 'left' }}>
          {metric.title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {opinion ? (
            <ConformanceBadge status={opinion} />
          ) : (
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              aguardando
            </span>
          )}
          <svg
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              color: 'var(--color-text-secondary)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div
          style={{
            padding: '0 12px 12px',
            background: 'var(--color-background-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {metric.normText && (
            <p
              style={{
                fontSize: 13,
                color: 'var(--color-text-primary)',
                borderLeft: '2px solid #B5D4F4',
                paddingLeft: 12,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {metric.normText}
            </p>
          )}

          {metric.justification && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Justificativa
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '8px 10px',
                  margin: 0,
                }}
              >
                {metric.justification}
              </p>
            </div>
          )}

          {metric.evidences.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Evidências ({metric.evidences.length})
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {metric.evidences.map((ev) => (
                  <li
                    key={ev.id}
                    style={{
                      fontSize: 12,
                      color: '#185FA5',
                      background: 'var(--color-background-primary)',
                      border: '0.5px solid var(--color-border-tertiary)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '4px 8px',
                    }}
                  >
                    {ev.fileName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AuditPanel
            metricId={metric.metricId}
            initialOpinion={opinion}
            initialComment={comment}
            token={token}
            readOnly={!isAuditor}
            onUpdate={(op, cm) => {
              setOpinion(op);
              setComment(cm);
            }}
          />
        </div>
      )}
    </li>
  );
}

export function AuditDossierClient({ sections, orgName, orgSlug, token, isAuditor }: Props) {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [exporting, setExporting] = useState(false);

  async function handleExport(variant: 'draft' | 'official') {
    setExporting(true);
    try {
      await downloadPdf(`/reports/${orgSlug}/pdf?variant=${variant}`, token, `iso16363-${variant}-${orgSlug}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  const allMetrics = sections.flatMap((s) => s.subsections.flatMap((sub) => sub.metrics));
  const reviewed = allMetrics.filter((m) => m.auditorOpinion !== null).length;
  const nonCompliant = allMetrics.filter(
    (m) => m.auditorOpinion === ConformanceStatus.NON_COMPLIANT || m.auditorOpinion === ConformanceStatus.PARTIAL,
  ).length;
  const awaiting = allMetrics.filter((m) => m.auditorOpinion === null).length;

  const FILTERS: { mode: FilterMode; label: string }[] = [
    { mode: 'all', label: 'Todas as métricas' },
    { mode: 'non_compliant', label: 'Não conformes / Parciais' },
    { mode: 'awaiting', label: 'Aguardando revisão' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
            Dossiê de auditoria
          </p>
          <h1 style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
            {orgName}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => handleExport('draft')}
            disabled={exporting}
            style={{
              padding: '5px 12px',
              fontSize: 11,
              fontWeight: 500,
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 'var(--border-radius-md)',
              cursor: exporting ? 'not-allowed' : 'pointer',
              opacity: exporting ? 0.5 : 1,
              color: 'var(--color-text-secondary)',
            }}
          >
            {exporting ? 'Gerando…' : 'Exportar rascunho'}
          </button>
          <button
            onClick={() => handleExport('official')}
            disabled={exporting}
            style={{
              padding: '5px 12px',
              fontSize: 11,
              fontWeight: 500,
              background: '#185FA5',
              color: '#E6F1FB',
              border: 'none',
              borderRadius: 'var(--border-radius-md)',
              cursor: exporting ? 'not-allowed' : 'pointer',
              opacity: exporting ? 0.5 : 1,
            }}
          >
            {exporting ? 'Gerando…' : 'Exportar oficial'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        {[
          { label: `de ${allMetrics.length} revisadas`, value: reviewed, color: 'var(--color-text-primary)', bg: 'var(--color-background-primary)' },
          { label: 'não conformes / parciais', value: nonCompliant, color: '#791F1F', bg: '#FCEBEB' },
          { label: 'aguardando revisão', value: awaiting, color: 'var(--color-text-secondary)', bg: 'var(--color-background-primary)' },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            style={{
              background: bg,
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '10px 12px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 22, fontWeight: 500, color, margin: 0, lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6 }}>
        {FILTERS.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            style={{
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: filter === mode ? 500 : 400,
              border: '0.5px solid',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: filter === mode ? '#E6F1FB' : 'var(--color-background-primary)',
              borderColor: filter === mode ? '#B5D4F4' : 'var(--color-border-secondary)',
              color: filter === mode ? '#0C447C' : 'var(--color-text-secondary)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const visibleCount = section.subsections
          .flatMap((sub) => sub.metrics)
          .filter((m) => matchesFilter(m, filter)).length;
        if (visibleCount === 0) return null;

        return (
          <div
            key={section.id}
            style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Section header */}
            <div
              style={{
                padding: '8px 12px',
                background: 'var(--color-background-secondary)',
                borderBottom: '0.5px solid var(--color-border-tertiary)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', marginRight: 8 }}>
                {section.code}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {section.title}
              </span>
            </div>

            {section.subsections.map((sub) => {
              const visibleMetrics = sub.metrics.filter((m) => matchesFilter(m, filter));
              if (visibleMetrics.length === 0) return null;

              return (
                <div key={sub.id}>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderBottom: '0.5px solid var(--color-border-tertiary)',
                      background: 'rgba(245,246,248,0.5)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', marginRight: 6 }}>
                      {sub.code}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                      {sub.title}
                    </span>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {visibleMetrics.map((metric) => (
                      <MetricRow key={metric.metricId} metric={metric} token={token} isAuditor={isAuditor} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
