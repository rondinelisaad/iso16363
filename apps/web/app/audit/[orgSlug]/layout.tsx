import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth';
import { NotificationBell } from '../../../components/notifications/notification-bell';

export default async function AuditLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  if (!session.user.orgId) redirect('/create-org');

  const role = session.user.role ?? '';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold text-gray-900 hover:text-blue-600">
            ISO 16363 Platform
          </Link>
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
            Audit Dossier
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            ← Dashboard
          </Link>
          <NotificationBell token={session.accessToken ?? ''} />
          <div className="flex items-center gap-2 text-sm text-gray-500 pl-2 border-l border-gray-200">
            <span className="max-w-[140px] truncate">{session.user.email}</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium whitespace-nowrap">
              {role}
            </span>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
