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
  '3': 'Organizational Infrastructure',
  '4': 'Digital Object Management',
  '5': 'Infrastructure & Security Risk Management',
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

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalReady} of {totalMetrics} metrics ready · {totalInProg} in progress
        </p>
      </div>

      {/* Overall progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Overall Compliance Readiness</h2>
          <span className="text-2xl font-bold text-gray-900">{overallPct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 h-full transition-all"
            style={{ width: `${Math.round((totalReady / totalMetrics) * 100)}%` }}
          />
          <div
            className="bg-yellow-400 h-full transition-all"
            style={{ width: `${Math.round((totalInProg / totalMetrics) * 100)}%` }}
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />{totalReady} ready</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />{totalInProg} in progress</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-gray-200 mr-1" />{totalMetrics - totalReady - totalInProg} not started</span>
        </div>
      </div>

      {/* Per-section progress */}
      <div className="grid gap-4 mb-8">
        {Object.entries(summary).map(([id, data]) => (
          <SectionProgress key={id} sectionId={id} title={SECTION_TITLES[id]} data={data} />
        ))}
      </div>

      <Link
        href="/standard"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        Browse ISO 16363 Standard →
      </Link>
    </div>
  );
}
