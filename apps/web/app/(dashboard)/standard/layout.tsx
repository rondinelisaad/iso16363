import { Suspense } from 'react';
import { IsoTreeNav, TreeNode } from '../../../components/iso-tree/iso-tree-nav';
import { serverApi, getToken } from '../../../lib/server-api';

async function TreeSidebar() {
  const token = await getToken();
  const tree = await serverApi<TreeNode[]>('/iso/tree', token);
  // Fetch all metric statuses to colour the tree dots
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

export default function StandardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      <aside className="w-72 border-r border-gray-200 bg-white overflow-y-auto shrink-0">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            ISO 16363 Standard
          </p>
        </div>
        <Suspense
          fallback={
            <div className="p-4 text-sm text-gray-400 animate-pulse">Loading tree…</div>
          }
        >
          <TreeSidebar />
        </Suspense>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
