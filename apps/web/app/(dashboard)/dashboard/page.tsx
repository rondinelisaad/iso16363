import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { serverApi } from '../../../lib/server-api';
import { SectionProgress } from '../../../components/dashboard/section-progress';

interface SectionData {
  total: number;
  PENDING: number;
  IN_PROGRESS: number;
  READY: number;
}

const SECTION_TITLES: Record<string, string> = {
  '3': 'Infraestrutura organizacional',
  '4': 'Gestão de objetos digitais',
  '5': 'Gestão de infraestrutura e riscos',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken;

  let summary: Record<string, SectionData> = {
    '3': { total: 28, PENDING: 0, IN_PROGRESS: 0, READY: 0 },
    '4': { total: 50, PENDING: 0, IN_PROGRESS: 0, READY: 0 },
    '5': { total: 23, PENDING: 0, IN_PROGRESS: 0, READY: 0 },
  };

  if (token) {
    summary = await serverApi<Record<string, SectionData>>('/metrics/summary', token).catch(
      () => summary,
    );
  }

  const totalMetrics = 101;
  const totalReady = Object.values(summary).reduce((acc, s) => acc + s.READY, 0);
  const totalInProg = Object.values(summary).reduce((acc, s) => acc + s.IN_PROGRESS, 0);
  const overallPct = Math.round((totalReady / totalMetrics) * 100);
  const orgName = session?.user?.email?.split('@')[1] ?? 'Organização';

  return (
    <div style={{ maxWidth: 720, padding: '24px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          Dashboard
        </p>
        <h1 style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
          Prontidão de conformidade ISO 16363
        </h1>
      </div>

      {/* Overall progress card */}
      <div
        style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '14px 16px',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
              {orgName}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {totalReady} de {totalMetrics} métricas prontas · {totalInProg} em andamento
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 24, fontWeight: 500, color: '#0F6E56', lineHeight: 1, margin: 0 }}>
              {overallPct}%
            </p>
          </div>
        </div>

        {/* Overall progress bar — 4px */}
        <div
          style={{
            width: '100%',
            height: 4,
            background: 'var(--color-border-tertiary)',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          <div style={{ width: `${Math.round((totalReady / totalMetrics) * 100)}%`, background: '#1D9E75', height: '100%', transition: 'width 0.3s' }} />
          <div style={{ width: `${Math.round((totalInProg / totalMetrics) * 100)}%`, background: '#EF9F27', height: '100%', transition: 'width 0.3s' }} />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }} />
            {totalReady} prontas
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF9F27', display: 'inline-block' }} />
            {totalInProg} em andamento
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db', display: 'inline-block' }} />
            {totalMetrics - totalReady - totalInProg} não iniciadas
          </span>
        </div>
      </div>

      {/* Per-section progress */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
        {Object.entries(summary).map(([id, data]) => (
          <SectionProgress key={id} sectionId={id} title={SECTION_TITLES[id]} data={data} />
        ))}
      </div>

      <Link
        href="/standard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          background: '#185FA5',
          color: '#E6F1FB',
          fontSize: 13,
          fontWeight: 500,
          borderRadius: 'var(--border-radius-md)',
          textDecoration: 'none',
        }}
      >
        Navegar no padrão ISO 16363 ↗
      </Link>
    </div>
  );
}
