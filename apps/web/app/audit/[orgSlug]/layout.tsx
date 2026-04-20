import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth';

export default async function AuditLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  if (!session.user.orgId) redirect('/create-org');

  const email = session.user.email ?? '';
  const orgName = params.orgSlug ?? 'Organização';

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Auditor topbar */}
      <div
        style={{
          height: 48,
          borderBottom: '0.5px solid rgba(0,0,0,0.08)',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Left side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          {/* Role badge */}
          <span
            style={{
              background: '#EAF3DE',
              color: '#27500A',
              border: '0.5px solid #C0DD97',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 8px',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Auditor externo
          </span>

          <span style={{ color: '#9a9a9a', fontSize: 12 }}>·</span>

          <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {orgName}
          </span>

          <span style={{ color: '#9a9a9a', fontSize: 12 }}>·</span>

          <span style={{ fontSize: 11, color: '#9a9a9a', whiteSpace: 'nowrap' }}>
            Ciclo de auditoria 2024
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 11,
              color: '#9a9a9a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 160,
            }}
          >
            {email}
          </span>
          <button
            style={{
              fontSize: 11,
              color: '#5a5a5a',
              background: 'none',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 6,
              padding: '4px 10px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            Resumo da auditoria ↗
          </button>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}
