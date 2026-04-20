'use client';

import { useState } from 'react';
import { ConformanceStatus, ReadinessStatus } from '@iso16363/shared-types';

interface GapItem {
  metricId: string;
  code: string;
  title: string;
  readiness: ReadinessStatus;
  auditorOpinion: ConformanceStatus;
  auditorComment: string | null;
  justification?: string | null;
}

interface GapAnalysis {
  total: number;
  reviewed: number;
  COMPLIANT: number;
  NON_COMPLIANT: number;
  PARTIAL: number;
  OBSERVATION: number;
  items: GapItem[];
}

interface Props {
  data: GapAnalysis;
  orgId: string;
  canExport: boolean;
}

const SEVERITY: Record<string, { label: string; bg: string; color: string }> = {
  NON_COMPLIANT: { label: 'Crítica', bg: '#FCEBEB', color: '#791F1F' },
  PARTIAL: { label: 'Maior', bg: '#FAEEDA', color: '#633806' },
  OBSERVATION: { label: 'Menor', bg: '#E6F1FB', color: '#0C447C' },
  COMPLIANT: { label: 'Conforme', bg: '#EAF3DE', color: '#27500A' },
};

function getSection(code: string): string {
  const first = code.split('.')[0];
  return `Seção ${first}`;
}

const FILTER_PILLS = [
  { key: 'all', label: 'Todas' },
  { key: '3', label: 'Seção 3' },
  { key: '4', label: 'Seção 4' },
  { key: '5', label: 'Seção 5' },
  { key: 'nc', label: 'Somente NC' },
];

export function GapAnalysisClient({ data }: Props) {
  const [sectionFilter, setSectionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = data.items.filter((item) => {
    if (sectionFilter === 'nc' && item.auditorOpinion !== ConformanceStatus.NON_COMPLIANT) return false;
    if (sectionFilter === '3' && !item.code.startsWith('3')) return false;
    if (sectionFilter === '4' && !item.code.startsWith('4')) return false;
    if (sectionFilter === '5' && !item.code.startsWith('5')) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.code.toLowerCase().includes(q) || item.title.toLowerCase().includes(q);
    }
    return true;
  });

  // Reactive counts based on filtered items
  const filteredNC = filtered.filter((i) => i.auditorOpinion === ConformanceStatus.NON_COMPLIANT).length;
  const filteredPartial = filtered.filter((i) => i.auditorOpinion === ConformanceStatus.PARTIAL).length;
  const filteredObs = filtered.filter((i) => i.auditorOpinion === ConformanceStatus.OBSERVATION).length;

  const statCards = [
    { label: 'NC', value: filteredNC, bg: '#FCEBEB', color: '#791F1F' },
    { label: 'Críticas', value: filteredNC, bg: '#FCEBEB', color: '#791F1F' },
    { label: 'Maiores', value: filteredPartial, bg: '#FAEEDA', color: '#633806' },
    { label: 'Menores', value: filteredObs, bg: '#E6F1FB', color: '#0C447C' },
  ];

  const pillActive: React.CSSProperties = {
    background: '#E6F1FB',
    border: '0.5px solid #B5D4F4',
    color: '#0C447C',
    fontWeight: 500,
  };
  const pillInactive: React.CSSProperties = {
    background: 'white',
    border: '0.5px solid var(--color-border-secondary)',
    color: '#9a9a9a',
    fontWeight: 400,
  };

  return (
    <div>
      {/* Summary stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, marginBottom: 20 }}>
        {statCards.map(({ label, value, bg, color }) => (
          <div
            key={label}
            style={{
              background: bg,
              border: '0.5px solid transparent',
              borderRadius: 'var(--border-radius-lg)',
              padding: '10px 12px',
            }}
          >
            <p style={{ fontSize: 22, fontWeight: 500, color, margin: 0, lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 11, color, marginTop: 3, opacity: 0.8 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
        {/* Section filter pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.key}
              onClick={() => setSectionFilter(pill.key)}
              style={{
                borderRadius: 20,
                fontSize: 11,
                padding: '3px 10px',
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'inherit',
                ...(sectionFilter === pill.key ? pillActive : pillInactive),
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9a9a9a"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar métrica…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 180,
              padding: '6px 10px 6px 28px',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 6,
              fontSize: 12,
              outline: 'none',
              fontFamily: 'inherit',
              color: '#1a1a1a',
            }}
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#9a9a9a', margin: 0 }}>Nenhum resultado encontrado.</p>
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '68px 1fr 88px 100px 88px',
              background: 'var(--color-background-secondary)',
              borderBottom: '0.5px solid var(--color-border-tertiary)',
              padding: '8px 12px',
            }}
          >
            {['Código', 'Métrica', 'Seção', 'Severidade', ''].map((h, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#9a9a9a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {filtered.map((item, i) => {
            const sev = SEVERITY[item.auditorOpinion] ?? SEVERITY.COMPLIANT;
            const isExpanded = expandedRows.has(item.metricId);
            const isLast = i === filtered.length - 1;

            return (
              <div key={item.metricId}>
                {/* Main row */}
                <div
                  onClick={() => toggleRow(item.metricId)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '68px 1fr 88px 100px 88px',
                    padding: '8px 12px',
                    borderBottom: (!isLast || isExpanded) ? '0.5px solid var(--color-border-tertiary)' : 'none',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--color-background-secondary)' : 'white',
                    minHeight: 40,
                  }}
                  className="hover:bg-[#f5f6f8]"
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9a9a9a', whiteSpace: 'nowrap' }}>
                    {item.code}
                  </span>
                  <span style={{ fontSize: 13, color: '#1a1a1a', paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>
                  <span style={{ fontSize: 11, color: '#9a9a9a' }}>
                    {getSection(item.code)}
                  </span>
                  <span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '2px 7px',
                        borderRadius: 4,
                        background: sev.bg,
                        color: sev.color,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sev.label}
                    </span>
                  </span>
                  <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9a9a9a"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>

                {/* Expanded row detail */}
                {isExpanded && (
                  <div
                    style={{
                      background: 'var(--color-background-secondary)',
                      borderBottom: !isLast ? '0.5px solid var(--color-border-tertiary)' : 'none',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      {/* Justification */}
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 500, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 5px' }}>
                          Justificativa
                        </p>
                        <div
                          style={{
                            background: 'var(--color-background-secondary)',
                            border: '0.5px solid var(--color-border-tertiary)',
                            borderRadius: 'var(--border-radius-md)',
                            padding: 8,
                            fontSize: 12,
                            color: '#5a5a5a',
                            lineHeight: 1.5,
                            minHeight: 56,
                          }}
                        >
                          {item.justification ?? <span style={{ color: '#9a9a9a', fontStyle: 'italic' }}>Sem justificativa</span>}
                        </div>
                      </div>

                      {/* Auditor comment */}
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 500, color: '#A32D2D', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 5px' }}>
                          Comentário do auditor
                        </p>
                        <div
                          style={{
                            background: '#FCEBEB',
                            border: '0.5px solid #F7C1C1',
                            borderRadius: 'var(--border-radius-md)',
                            padding: 8,
                            fontSize: 12,
                            color: '#501313',
                            lineHeight: 1.5,
                            minHeight: 56,
                          }}
                        >
                          {item.auditorComment ?? <span style={{ color: '#A32D2D', opacity: 0.6, fontStyle: 'italic' }}>Sem comentário</span>}
                        </div>
                      </div>
                    </div>

                    {/* Action row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6 }}>
                      <button
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 11,
                          color: '#9a9a9a',
                          fontFamily: 'inherit',
                          padding: '4px 0',
                        }}
                      >
                        Como corrigir ↗
                      </button>
                      <button
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 11,
                          color: '#9a9a9a',
                          fontFamily: 'inherit',
                          padding: '4px 0',
                        }}
                      >
                        Abrir card completo ↗
                      </button>
                      <button
                        style={{
                          marginLeft: 'auto',
                          background: '#185FA5',
                          color: '#E6F1FB',
                          border: 'none',
                          borderRadius: 6,
                          padding: '5px 12px',
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Resubmeter para revisão ↗
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
