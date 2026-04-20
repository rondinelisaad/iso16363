'use client';

import { useState } from 'react';
import { ConformanceStatus } from '@iso16363/shared-types';
import { ConformanceBadge } from './conformance-badge';
import { api } from '../../lib/api-client';

const OPINION_OPTIONS: { value: ConformanceStatus; label: string; dot: string; selectedBg: string; selectedBorder: string; selectedColor: string }[] = [
  { value: ConformanceStatus.COMPLIANT,     label: 'Conforme',               dot: '#1D9E75', selectedBg: '#EAF3DE', selectedBorder: '#C0DD97', selectedColor: '#27500A' },
  { value: ConformanceStatus.NON_COMPLIANT, label: 'Não conforme',           dot: '#E24B4A', selectedBg: '#FCEBEB', selectedBorder: '#F09595', selectedColor: '#791F1F' },
  { value: ConformanceStatus.PARTIAL,       label: 'Parcialmente conforme',  dot: '#EF9F27', selectedBg: '#FAEEDA', selectedBorder: '#FAC775', selectedColor: '#633806' },
  { value: ConformanceStatus.OBSERVATION,   label: 'Observação',             dot: '#378ADD', selectedBg: '#E6F1FB', selectedBorder: '#B5D4F4', selectedColor: '#0C447C' },
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

  const showCorrectionField =
    opinion === ConformanceStatus.NON_COMPLIANT || opinion === ConformanceStatus.PARTIAL;

  if (readOnly) {
    return (
      <div className="space-y-2">
        {opinion ? (
          <>
            <ConformanceBadge status={opinion} />
            {comment && (
              <p style={{ fontSize: 13, color: '#501313', marginTop: 4 }}>{comment}</p>
            )}
          </>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            Aguardando revisão
          </span>
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
    <div
      style={{
        background: '#FCEBEB',
        border: '0.5px solid #F7C1C1',
        borderRadius: 'var(--border-radius-lg)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <h4
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: '#A32D2D',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
        }}
      >
        Seu parecer
      </h4>

      {/* Conformance option buttons */}
      <div className="flex flex-wrap gap-2">
        {OPINION_OPTIONS.map((opt) => {
          const isSelected = opinion === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setOpinion(opt.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 4,
                borderWidth: '0.5px',
                borderStyle: 'solid',
                fontSize: 11,
                fontWeight: isSelected ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: isSelected ? opt.selectedBg : 'var(--color-background-primary)',
                borderColor: isSelected ? opt.selectedBorder : 'var(--color-border-secondary)',
                color: isSelected ? opt.selectedColor : 'var(--color-text-secondary)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: opt.dot,
                  flexShrink: 0,
                }}
              />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Main comment textarea */}
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Adicione um comentário ou observação…"
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 'var(--border-radius-md)',
          borderWidth: '0.5px',
          borderStyle: 'solid',
          borderColor: 'var(--color-border-secondary)',
          fontSize: 13,
          color: 'var(--color-text-primary)',
          background: 'var(--color-background-primary)',
          resize: 'none',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#185FA5';
          e.target.style.boxShadow = '0 0 0 2px #E6F1FB';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border-secondary)';
          e.target.style.boxShadow = 'none';
        }}
      />

      {/* Correction field — NC and Partial only */}
      {showCorrectionField && (
        <div style={{ borderTop: '0.5px solid #F09595', paddingTop: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#A32D2D', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Como corrigir
          </p>
          <textarea
            rows={2}
            placeholder="Descreva a correção necessária…"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--border-radius-md)',
              borderWidth: '0.5px',
              borderStyle: 'solid',
              borderColor: '#F09595',
              fontSize: 13,
              color: '#501313',
              background: '#FCEBEB',
              resize: 'none',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#E24B4A';
              e.target.style.boxShadow = '0 0 0 2px #FCEBEB';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#F09595';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving || !opinion}
          style={{
            marginLeft: 'auto',
            padding: '5px 14px',
            background: '#185FA5',
            color: '#E6F1FB',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 12,
            fontWeight: 500,
            border: 'none',
            cursor: saving || !opinion ? 'not-allowed' : 'pointer',
            opacity: saving || !opinion ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {saving ? 'Salvando…' : 'Submeter parecer'}
        </button>
        {saved && (
          <span style={{ fontSize: 11, color: '#1D9E75' }}>Salvo</span>
        )}
      </div>
    </div>
  );
}
