import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { IsoTreeNav, TreeNode } from '../../../components/iso-tree/iso-tree-nav';
import { serverApi, getToken } from '../../../lib/server-api';
import { authOptions } from '../../../lib/auth';

async function TreeSidebar() {
  const token = await getToken();
  const tree = await serverApi<TreeNode[]>('/iso/tree', token);
  const statuses = await serverApi<{ metricId: string; readiness: string }[]>(
    '/metrics',
    token,
  ).catch(() => []);

  const statusMap = Object.fromEntries(statuses.map((s) => [s.metricId, s.readiness])) as Record<
    string,
    'PENDING' | 'IN_PROGRESS' | 'READY'
  >;

  return <IsoTreeNav tree={tree} statuses={statusMap} />;
}

async function getOrgName(): Promise<string> {
  const session = await getServerSession(authOptions);
  return session?.user?.email?.split('@')[0] ?? 'Organização';
}

export default async function StandardLayout({ children }: { children: React.ReactNode }) {
  const orgName = await getOrgName();

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 44px)', overflow: 'hidden' }}>
      {/* ISO tree sidebar — 240px */}
      <aside
        style={{
          width: 240,
          borderRight: '0.5px solid rgba(0,0,0,0.08)',
          background: 'white',
          overflowY: 'auto',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: 'white',
            borderBottom: '0.5px solid rgba(0,0,0,0.08)',
            padding: 12,
            zIndex: 1,
          }}
        >
          {/* Org avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#E6F1FB',
                color: '#185FA5',
                fontSize: 12,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                textTransform: 'uppercase',
              }}
            >
              {orgName[0] ?? 'O'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {orgName}
            </span>
          </div>

          {/* Overall progress bar placeholder — always teal */}
          <div>
            <div
              style={{
                height: 3,
                background: '#e5e7eb',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: '#1D9E75',
                  borderRadius: 2,
                  width: '30%',
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: '#9a9a9a', margin: '3px 0 0' }}>ISO 16363</p>
          </div>
        </div>

        {/* ISO tree nav (scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Suspense
            fallback={
              <div style={{ padding: 16, fontSize: 13, color: '#9a9a9a' }}>
                Carregando…
              </div>
            }
          >
            <TreeSidebar />
          </Suspense>
        </div>

        {/* Legend pinned bottom */}
        <div
          style={{
            padding: '8px 12px',
            borderTop: '0.5px solid rgba(0,0,0,0.08)',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 500, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Legenda
          </p>
          {[
            { label: 'Pronta', color: '#1D9E75' },
            { label: 'Em andamento', color: '#378ADD' },
            { label: 'Não conforme', color: '#E24B4A' },
            { label: 'Pendente', color: '#EF9F27' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#5a5a5a' }}>{label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content area */}
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
