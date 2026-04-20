import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';
import { AppNav } from '../../components/nav/app-nav';
import { NotificationBell } from '../../components/notifications/notification-bell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  if (!session.user.orgId) redirect('/create-org');

  const role = session.user.role ?? '';
  const email = session.user.email ?? '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AppNav role={role} email={email} orgId={session.user.orgId} />
      <main style={{ marginLeft: 200, flex: 1, background: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Slim top bar for notifications */}
        <div
          style={{
            height: 44,
            borderBottom: '0.5px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 16px',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <NotificationBell token={session.accessToken ?? ''} />
        </div>
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
