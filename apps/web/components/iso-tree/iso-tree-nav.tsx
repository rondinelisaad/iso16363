'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';

export interface TreeNode {
  id: string;
  code: string;
  title: string;
  level: number;
  parentId: string | null;
  children: TreeNode[];
}

interface StatusMap {
  [metricId: string]: 'PENDING' | 'IN_PROGRESS' | 'READY';
}

const STATUS_DOT: Record<string, string> = {
  READY: 'bg-green-500',
  IN_PROGRESS: 'bg-yellow-400',
  PENDING: 'bg-gray-300',
};

export function IsoTreeNav({
  tree,
  statuses = {},
  filter,
}: {
  tree: TreeNode[];
  statuses?: StatusMap;
  filter?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Expand sections by default; subsections collapsed
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(tree.map((n) => n.id)),
  );

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function isActive(id: string) {
    return pathname === `/standard/${id}`;
  }

  function renderNode(node: TreeNode, depth = 0): React.ReactNode {
    const hasChildren = node.children.length > 0;
    const isOpen = expanded.has(node.id);
    const active = isActive(node.id);
    const status = statuses[node.id];

    // Apply readiness filter on metrics (level 3)
    if (filter && node.level === 3 && status !== filter && status !== undefined) return null;
    if (filter && node.level === 3 && status === undefined && filter !== 'PENDING') return null;

    const children = hasChildren
      ? node.children.map((c) => renderNode(c, depth + 1)).filter(Boolean)
      : [];

    // Hide subsection if all children are filtered out
    if (hasChildren && filter && children.length === 0) return null;

    return (
      <div key={node.id}>
        <button
          onClick={() => {
            if (hasChildren) toggle(node.id);
            router.push(`/standard/${node.id}`);
          }}
          className={[
            'flex items-center w-full text-left py-1 pr-2 rounded text-sm transition-colors',
            active
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100',
          ].join(' ')}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          <span className="mr-1 w-3 shrink-0 text-gray-400">
            {hasChildren ? (
              isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            ) : null}
          </span>
          {node.level === 3 && (
            <span
              className={`w-2 h-2 rounded-full mr-1.5 shrink-0 ${STATUS_DOT[status ?? 'PENDING']}`}
            />
          )}
          <span className="font-mono text-xs text-gray-400 mr-1.5 shrink-0">{node.code}</span>
          <span className="truncate leading-snug">{node.title}</span>
        </button>

        {hasChildren && isOpen && <div>{children}</div>}
      </div>
    );
  }

  return <nav className="py-2 space-y-0.5">{tree.map((n) => renderNode(n))}</nav>;
}
