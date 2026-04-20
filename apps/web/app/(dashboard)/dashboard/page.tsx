import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">
        Role: <span className="font-medium text-gray-700">{session?.user.role}</span>
      </p>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">
          ISO 16363 compliance tracking — M3 coming next.
        </p>
      </div>
    </div>
  );
}
