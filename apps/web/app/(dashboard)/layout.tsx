import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  if (!session.user.orgId) redirect('/create-org');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-gray-900">ISO 16363 Platform</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{session.user.email}</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            {session.user.role}
          </span>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
