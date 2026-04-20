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
  auditorOpinion?: string | null;
  auditorComment?: string | null;
  evidences: Evidence[];
}

interface Props {
  node: MetricNode;
  initialStatus: MetricStatusData | null;
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#9a9a9a',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
  margin: '0 0 6px',
};

const READINESS_BADGE: Record<ReadinessStatus, React.CSSProperties> = {
  [ReadinessStatus.PENDING]: { background: '#FAEEDA', color: '#854F0B' },
  [ReadinessStatus.IN_PROGRESS]: { background: '#E6F1FB', color: '#0C447C' },
  [ReadinessStatus.READY]: { background: '#EAF3DE', color: '#27500A' },
};

const READINESS_LABEL: Record<ReadinessStatus, string> = {
  [ReadinessStatus.PENDING]: 'Pendente',
  [ReadinessStatus.IN_PROGRESS]: 'Em andamento',
  [ReadinessStatus.READY]: 'Pronta',
};

export function MetricCard({ node, initialStatus }: Props) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? '';

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<MetricStatusData | null>(initialStatus);
  const [justification, setJustification] = useState(initialStatus?.justification ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [discussionOpen, setDiscussionOpen] = useState(false);

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
  const isNC = status?.auditorOpinion === 'NON_COMPLIANT';
  const evidenceCount = status?.evidences?.length ?? 0;

  const cardBorderColor = isNC ? '#F09595' : 'var(--color-border-tertiary)';

  return (
    <div
      style={{
        background: 'white',
        border: `0.5px solid ${cardBorderColor}`,
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        {/* Col 1: metric code badge */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 500,
            color: '#185FA5',
            background: '#E6F1FB',
            borderRadius: 4,
            padding: '2px 7px',
            flexShrink: 0,
            marginTop: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {node.code}
        </span>

        {/* Col 2: title + meta row */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0, lineHeight: 1.4 }}>
            {node.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: '2px 7px',
                borderRadius: 4,
                ...READINESS_BADGE[readiness],
              }}
            >
              {READINESS_LABEL[readiness]}
            </span>
            <span style={{ fontSize: 11, color: '#9a9a9a' }}>Não atribuído</span>
          </div>
        </div>

        {/* Col 3: evidence count + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 11,
              color: evidenceCount > 0 ? '#185FA5' : '#9a9a9a',
            }}
          >
            {evidenceCount > 0 ? `${evidenceCount} arquivo${evidenceCount > 1 ? 's' : ''}` : '0'}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: '#9a9a9a',
              flexShrink: 0,
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Card body — shown when open */}
      {open && (
        <div
          style={{
            borderTop: `0.5px solid ${cardBorderColor}`,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Auditor panel — shown only when NON_COMPLIANT or PARTIAL */}
          {(status?.auditorOpinion === 'NON_COMPLIANT' || status?.auditorOpinion === 'PARTIAL') && (
            <div
              style={{
                background: '#FCEBEB',
                border: '0.5px solid #F7C1C1',
                borderRadius: 'var(--border-radius-md)',
                padding: '8px 10px',
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 500, color: '#A32D2D', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                Parecer do auditor
              </p>
              {status.auditorComment && (
                <p style={{ fontSize: 12, color: '#501313', margin: 0, lineHeight: 1.5 }}>
                  {status.auditorComment}
                </p>
              )}
            </div>
          )}

          {/* Normative text */}
          {node.normText && (
            <section>
              <p style={SECTION_LABEL}>Requisito normativo</p>
              <p
                style={{
                  fontSize: 13,
                  color: '#1a1a1a',
                  lineHeight: 1.6,
                  borderLeft: '2px solid #B5D4F4',
                  paddingLeft: 12,
                  margin: 0,
                }}
              >
                {node.normText}
              </p>
            </section>
          )}

          {/* Supporting text */}
          {node.supportingText && (
            <section>
              <p style={SECTION_LABEL}>Texto de suporte</p>
              <p style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.6, margin: 0 }}>
                {node.supportingText}
              </p>
            </section>
          )}

          {/* Evidence examples */}
          {node.evidenceExamples && (
            <section>
              <p style={SECTION_LABEL}>Exemplos de evidência</p>
              <p
                style={{
                  fontSize: 13,
                  color: '#5a5a5a',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  background: '#f1f0ee',
                  borderLeft: '2px solid #B5D4F4',
                  borderRadius: 0,
                  padding: '8px 12px',
                  margin: 0,
                }}
              >
                {node.evidenceExamples}
              </p>
            </section>
          )}

          {/* Discussion (collapsible) */}
          {node.discussion && (
            <section>
              <button
                onClick={() => setDiscussionOpen((o) => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                  ...SECTION_LABEL,
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{
                    transform: discussionOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <path d="M8 5l8 7-8 7V5z" />
                </svg>
                Discussão
              </button>
              {discussionOpen && (
                <p style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.6, marginTop: 8 }}>
                  {node.discussion}
                </p>
              )}
            </section>
          )}

          {/* Readiness toggle */}
          <section>
            <p style={SECTION_LABEL}>Prontidão</p>
            <ReadinessToggle
              value={readiness}
              disabled={saving}
              onChange={(r) => patch({ readiness: r })}
            />
          </section>

          {/* Evidence list */}
          <EvidenceList
            metricId={node.id}
            evidences={status?.evidences ?? []}
            token={token}
            onUpdate={(evs) => setStatus((s) => s ? { ...s, evidences: evs } : s)}
          />

          {/* Justification textarea */}
          <section>
            <p style={SECTION_LABEL}>Justificativa</p>
            <textarea
              rows={4}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-secondary)';
                e.target.style.boxShadow = 'none';
                if (justification !== (status?.justification ?? '')) {
                  patch({ justification });
                }
              }}
              placeholder="Descreva como seu repositório satisfaz este requisito…"
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 13,
                color: '#1a1a1a',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#185FA5';
                e.target.style.boxShadow = '0 0 0 2px #E6F1FB';
              }}
            />
          </section>

          {/* Action row */}
          <div
            style={{
              borderTop: '0.5px solid var(--color-border-tertiary)',
              paddingTop: 12,
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <button
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                color: '#9a9a9a',
                fontFamily: 'inherit',
                padding: '4px 0',
              }}
            >
              Consultar critérios ↗
            </button>
            <button
              onClick={() => patch({ justification })}
              disabled={saving}
              style={{
                marginLeft: 'auto',
                background: '#185FA5',
                color: '#E6F1FB',
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {saved ? 'Salvo ✓' : saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
