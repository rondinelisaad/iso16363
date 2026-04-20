import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth';
import { serverApi, getToken } from '../../../lib/server-api';
import { ConformanceBadge } from '../../../components/audit-panel/conformance-badge';
import { ConformanceStatus, ReadinessStatus } from '@iso16363/shared-types';

interface GapItem {
  metricId: string;
  code: string;
  title: string;
  readiness: ReadinessStatus;
  auditorOpinion: ConformanceStatus;
  auditorComment: string | null;
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

const READINESS_LABEL: Record<ReadinessStatus, string> = {
  [ReadinessStatus.PENDING]: 'Pending',
  [ReadinessStatus.IN_PROGRESS]: 'In Progress',
  [ReadinessStatus.READY]: 'Ready',
};

const READINESS_CLASS: Record<ReadinessStatus, string> = {
  [ReadinessStatus.PENDING]: 'text-gray-400',
  [ReadinessStatus.IN_PROGRESS]: 'text-yellow-600',
  [ReadinessStatus.READY]: 'text-green-600',
};

export default async function GapAnalysisPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? '';

  if (!['org_manager', 'internal_auditor', 'external_auditor'].includes(role)) {
    redirect('/dashboard');
  }

  const token = await getToken();
  const data = await serverApi<GapAnalysis>('/metrics/gap-analysis', token).catch(
    (): GapAnalysis => ({ total: 101, reviewed: 0, COMPLIANT: 0, NON_COMPLIANT: 0, PARTIAL: 0, OBSERVATION: 0, items: [] }),
  );

  const pctReviewed = Math.round((data.reviewed / data.total) * 100);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gap Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Metrics with auditor opinions — {data.reviewed} of {data.total} reviewed ({pctReviewed}%)
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {(
          [
            { label: 'Compliant', key: 'COMPLIANT', color: 'text-green-700 bg-green-50 border-green-200' },
            { label: 'Non-Compliant', key: 'NON_COMPLIANT', color: 'text-red-700 bg-red-50 border-red-200' },
            { label: 'Partial', key: 'PARTIAL', color: 'text-orange-700 bg-orange-50 border-orange-200' },
            { label: 'Observation', key: 'OBSERVATION', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
          ] as const
        ).map(({ label, key, color }) => (
          <div key={key} className={`border rounded-lg p-4 ${color}`}>
            <p className="text-2xl font-bold">{data[key]}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {data.items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No metrics have been reviewed by an auditor yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 w-20">Code</th>
                <th className="text-left px-4 py-3">Metric</th>
                <th className="text-left px-4 py-3 w-28">Readiness</th>
                <th className="text-left px-4 py-3 w-36">Opinion</th>
                <th className="text-left px-4 py-3">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.items.map((item) => (
                <tr key={item.metricId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">{item.code}</td>
                  <td className="px-4 py-3 text-gray-800">{item.title}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${READINESS_CLASS[item.readiness]}`}>
                      {READINESS_LABEL[item.readiness]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ConformanceBadge status={item.auditorOpinion} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                    {item.auditorComment ?? <span className="italic text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
