'use client';

import { useState } from 'react';
import { ConformanceStatus, ReadinessStatus } from '@iso16363/shared-types';
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
  READY: 'bg-green-500',
  IN_PROGRESS: 'bg-yellow-400',
  PENDING: 'bg-gray-300',
};

function matchesFilter(metric: DossierMetric, filter: FilterMode): boolean {
  if (filter === 'all') return true;
  if (filter === 'awaiting') return metric.auditorOpinion === null;
  if (filter === 'non_compliant')
    return metric.auditorOpinion === ConformanceStatus.NON_COMPLIANT || metric.auditorOpinion === ConformanceStatus.PARTIAL;
  return true;
}

function MetricRow({
  metric,
  token,
  isAuditor,
}: {
  metric: DossierMetric;
  token: string;
  isAuditor: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [opinion, setOpinion] = useState(metric.auditorOpinion);
  const [comment, setComment] = useState(metric.auditorComment);

  return (
    <li className="border-b border-gray-50 last:border-0">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${READINESS_DOT[metric.readiness] ?? 'bg-gray-300'}`}
        />
        <span className="font-mono text-xs text-gray-400 w-12 shrink-0">{metric.code}</span>
        <span className="text-sm text-gray-800 flex-1 text-left">{metric.title}</span>
        <div className="flex items-center gap-2 shrink-0">
          {opinion ? (
            <ConformanceBadge status={opinion} />
          ) : (
            <span className="text-xs text-gray-300 italic">awaiting</span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 bg-gray-50/50">
          {metric.normText && (
            <p className="text-sm text-gray-700 border-l-4 border-blue-200 pl-3 leading-relaxed">
              {metric.normText}
            </p>
          )}
          {metric.justification && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Justification
              </p>
              <p className="text-sm text-gray-700">{metric.justification}</p>
            </div>
          )}
          {metric.evidences.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Evidence ({metric.evidences.length})
              </p>
              <ul className="space-y-1">
                {metric.evidences.map((ev) => (
                  <li key={ev.id} className="text-sm text-blue-600">
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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{orgName}</h1>
        <p className="text-sm text-gray-500 mt-1">ISO 16363 Audit Dossier</p>
      </div>

      {/* Export actions */}
      <div className="flex gap-2">
        <button
          onClick={() => handleExport('draft')}
          disabled={exporting}
          className="px-4 py-2 text-xs font-medium bg-white border border-gray-200 rounded-md hover:border-gray-400 disabled:opacity-50 transition-colors"
        >
          {exporting ? 'Generating…' : 'Export Draft PDF'}
        </button>
        <button
          onClick={() => handleExport('official')}
          disabled={exporting}
          className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {exporting ? 'Generating…' : 'Export Official PDF'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{reviewed}</p>
          <p className="text-xs text-gray-500 mt-0.5">of {allMetrics.length} reviewed</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{nonCompliant}</p>
          <p className="text-xs text-gray-500 mt-0.5">non-compliant / partial</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{awaiting}</p>
          <p className="text-xs text-gray-500 mt-0.5">awaiting review</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(
          [
            { mode: 'all' as const, label: 'All metrics' },
            { mode: 'non_compliant' as const, label: 'Non-compliant / Partial' },
            { mode: 'awaiting' as const, label: 'Awaiting review' },
          ] as const
        ).map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === mode
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const sectionMetrics = section.subsections.flatMap((sub) => sub.metrics);
        const visibleCount = sectionMetrics.filter((m) => matchesFilter(m, filter)).length;
        if (visibleCount === 0) return null;

        return (
          <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="font-mono text-xs text-gray-400 mr-2">{section.code}</span>
              <span className="text-sm font-semibold text-gray-900">{section.title}</span>
            </div>

            {section.subsections.map((sub) => {
              const visibleMetrics = sub.metrics.filter((m) => matchesFilter(m, filter));
              if (visibleMetrics.length === 0) return null;

              return (
                <div key={sub.id}>
                  <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                    <span className="font-mono text-xs text-gray-400 mr-2">{sub.code}</span>
                    <span className="text-xs font-medium text-gray-600">{sub.title}</span>
                  </div>
                  <ul>
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
