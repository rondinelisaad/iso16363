import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ReadinessStatus } from '@iso16363/shared-types';
import { MetricCard } from '../../../../components/metric-card/metric-card';
import { serverApi, getToken } from '../../../../lib/server-api';

interface IsoNode {
  id: string;
  code: string;
  title: string;
  level: number;
  normText: string | null;
  supportingText: string | null;
  evidenceExamples: string | null;
  discussion: string | null;
  children: Array<{ id: string; code: string; title: string; level: number }>;
}

interface MetricStatus {
  id: string;
  readiness: ReadinessStatus;
  justification: string | null;
  evidences: Array<{ id: string; fileName: string; uploadedAt: string }>;
}

export default async function NodePage({ params }: { params: { nodeId: string } }) {
  const token = await getToken();
  let node: IsoNode;
  try {
    node = await serverApi<IsoNode>(`/iso/sections/${params.nodeId}`, token);
  } catch {
    notFound();
  }

  let status: MetricStatus | null = null;
  if (node.level === 3 && token) {
    status = await serverApi<MetricStatus | null>(`/metrics/${params.nodeId}`, token).catch(
      () => null,
    );
  }

  if (node.level === 3) {
    return (
      <div className="max-w-3xl">
        <MetricCard node={node} initialStatus={status} />
      </div>
    );
  }

  // Section or subsection: show children list
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-mono text-gray-400">{node.code}</p>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{node.title}</h1>

      <ul className="space-y-2">
        {node.children.map((child) => (
          <li key={child.id}>
            <Link
              href={`/standard/${child.id}`}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <span className="font-mono text-xs text-gray-400 w-12 shrink-0">{child.code}</span>
              <span className="text-sm text-gray-800">{child.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
