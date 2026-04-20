interface SectionData {
  total: number;
  PENDING: number;
  IN_PROGRESS: number;
  READY: number;
}

interface Props {
  sectionId: string;
  title: string;
  data: SectionData;
}

function semanticColor(pct: number): { fill: string; text: string } {
  if (pct >= 75) return { fill: '#1D9E75', text: '#0F6E56' };
  if (pct >= 25) return { fill: '#EF9F27', text: '#854F0B' };
  return { fill: '#E24B4A', text: '#A32D2D' };
}

export function SectionProgress({ sectionId, title, data }: Props) {
  const tracked = data.READY + data.IN_PROGRESS + data.PENDING;
  const readyPct = data.total > 0 ? Math.round((data.READY / data.total) * 100) : 0;
  const inProgPct = data.total > 0 ? Math.round((data.IN_PROGRESS / data.total) * 100) : 0;
  const { fill, text } = semanticColor(readyPct);

  return (
    <div
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '10px 12px',
      }}
    >
      <div className="flex items-start justify-between" style={{ marginBottom: 8 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 1 }}>
            Seção {sectionId}
          </p>
          <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
            {title}
          </h3>
        </div>
        <div className="text-right">
          <p style={{ fontSize: 22, fontWeight: 500, color: text, lineHeight: 1 }}>{readyPct}%</p>
          <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>Prontas</p>
        </div>
      </div>

      {/* Progress bar — 3px height */}
      <div
        className="flex overflow-hidden"
        style={{
          width: '100%',
          height: 3,
          background: 'var(--color-border-tertiary)',
          borderRadius: 2,
        }}
      >
        <div style={{ width: `${readyPct}%`, background: fill, height: '100%', transition: 'width 0.3s' }} />
        <div style={{ width: `${inProgPct}%`, background: '#EF9F27', height: '100%', transition: 'width 0.3s' }} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4" style={{ marginTop: 8, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <span className="flex items-center gap-1">
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }} />
          {data.READY} prontas
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#EF9F27', display: 'inline-block' }} />
          {data.IN_PROGRESS} em andamento
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d1d5db', display: 'inline-block' }} />
          {data.total - tracked} não iniciadas
        </span>
        <span style={{ marginLeft: 'auto' }}>{data.total} total</span>
      </div>
    </div>
  );
}
