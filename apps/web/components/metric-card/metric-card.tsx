'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ReadinessStatus } from '@iso16363/shared-types';
import { ReadinessToggle } from './readiness-toggle';
import { EvidenceList } from './evidence-list';
import { api } from '../../lib/api-client';

interface Evidence {
  id: string;
  fileName: string;
  uploadedAt: string;
}

interface MetricNode {
  id: string;
  code: string;
  title: string;
  normText: string | null;
  supportingText: string | null;
  evidenceExamples: string | null;
  discussion: string | null;
}

interface MetricStatusData {
  id: string;
  readiness: ReadinessStatus;
  justification: string | null;
  evidences: Evidence[];
}

interface Props {
  node: MetricNode;
  initialStatus: MetricStatusData | null;
}

export function MetricCard({ node, initialStatus }: Props) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';

  const [status, setStatus] = useState<MetricStatusData | null>(initialStatus);
  const [justification, setJustification] = useState(initialStatus?.justification ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function patch(data: Partial<{ readiness: ReadinessStatus; justification: string }>) {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await api.patch<MetricStatusData>(`/metrics/${node.id}`, data, token);
      setStatus(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const readiness = status?.readiness ?? ReadinessStatus.PENDING;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-gray-400">{node.code}</span>
            <h2 className="text-xl font-semibold text-gray-900 mt-0.5">{node.title}</h2>
          </div>
          <div className="shrink-0">
            <ReadinessToggle
              value={readiness}
              disabled={saving}
              onChange={(r) => patch({ readiness: r })}
            />
          </div>
        </div>
        {saved && <p className="text-xs text-green-600 mt-1">Saved</p>}
      </div>

      {/* Normative text */}
      {node.normText && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Normative Requirement
          </h3>
          <p className="text-sm text-gray-800 leading-relaxed border-l-4 border-blue-200 pl-3">
            {node.normText}
          </p>
        </section>
      )}

      {/* Supporting text */}
      {node.supportingText && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Supporting Text
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{node.supportingText}</p>
        </section>
      )}

      {/* Evidence examples */}
      {node.evidenceExamples && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Evidence Examples
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {node.evidenceExamples}
          </p>
        </section>
      )}

      {/* Discussion */}
      {node.discussion && (
        <details className="group">
          <summary className="text-xs font-semibold uppercase tracking-wide text-gray-500 cursor-pointer list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Discussion
          </summary>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{node.discussion}</p>
        </details>
      )}

      <hr className="border-gray-100" />

      {/* Justification */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Justification
        </h3>
        <textarea
          rows={4}
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          onBlur={() => {
            if (justification !== (status?.justification ?? '')) {
              patch({ justification });
            }
          }}
          placeholder="Describe how your repository satisfies this requirement…"
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      <hr className="border-gray-100" />

      {/* Evidence */}
      <EvidenceList
        metricId={node.id}
        evidences={status?.evidences ?? []}
        token={token}
        onUpdate={(evs) => setStatus((s) => s ? { ...s, evidences: evs } : s)}
      />
    </div>
  );
}
