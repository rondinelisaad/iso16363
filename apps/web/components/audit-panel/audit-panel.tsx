'use client';

import { useState } from 'react';
import { ConformanceStatus } from '@iso16363/shared-types';
import { ConformanceBadge } from './conformance-badge';
import { api } from '../../lib/api-client';

const OPINION_OPTIONS: { value: ConformanceStatus; label: string }[] = [
  { value: ConformanceStatus.COMPLIANT, label: 'Compliant' },
  { value: ConformanceStatus.NON_COMPLIANT, label: 'Non-Compliant' },
  { value: ConformanceStatus.PARTIAL, label: 'Partial' },
  { value: ConformanceStatus.OBSERVATION, label: 'Observation' },
];

interface Props {
  metricId: string;
  initialOpinion: ConformanceStatus | null;
  initialComment: string | null;
  token: string;
  readOnly?: boolean;
  onUpdate?: (opinion: ConformanceStatus, comment: string) => void;
}

export function AuditPanel({ metricId, initialOpinion, initialComment, token, readOnly, onUpdate }: Props) {
  const [opinion, setOpinion] = useState<ConformanceStatus | null>(initialOpinion);
  const [comment, setComment] = useState(initialComment ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (readOnly) {
    return (
      <div className="space-y-2">
        {opinion ? (
          <>
            <ConformanceBadge status={opinion} />
            {comment && <p className="text-sm text-gray-600 mt-1">{comment}</p>}
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">Awaiting review</span>
        )}
      </div>
    );
  }

  async function save() {
    if (!opinion) return;
    setSaving(true);
    setSaved(false);
    try {
      await api.patch(`/metrics/${metricId}/audit`, { auditorOpinion: opinion, auditorComment: comment }, token);
      setSaved(true);
      onUpdate?.(opinion, comment);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700">Auditor Opinion</h4>

      <div className="flex flex-wrap gap-2">
        {OPINION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setOpinion(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              opinion === opt.value
                ? opt.value === ConformanceStatus.COMPLIANT
                  ? 'bg-green-600 text-white border-green-600'
                  : opt.value === ConformanceStatus.NON_COMPLIANT
                  ? 'bg-red-600 text-white border-red-600'
                  : opt.value === ConformanceStatus.PARTIAL
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-yellow-500 text-white border-yellow-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment or observation…"
        className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving || !opinion}
          className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Opinion'}
        </button>
        {saved && <span className="text-xs text-green-600">Saved</span>}
      </div>
    </div>
  );
}
