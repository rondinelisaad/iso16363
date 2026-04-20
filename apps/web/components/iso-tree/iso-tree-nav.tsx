'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

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

const STATUS_DOT_COLOR: Record<string, string> = {
  READY: '#1D9E75',
  IN_PROGRESS: '#378ADD',
  PENDING: '#EF9F27',
};

const LEVEL_PADDING: Record<number, number> = { 1: 8, 2: 20, 3: 36 };

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

  function renderNode(node: TreeNode): React.ReactNode {
    const hasChildren = node.children.length > 0;
    const isOpen = expanded.has(node.id);
    const active = pathname === `/standard/${node.id}`;
    const status = statuses[node.id];
    const pl = LEVEL_PADDING[node.level] ?? 8;

    if (filter && node.level === 3 && status !== filter && status !== undefined) return null;
    if (filter && node.level === 3 && status === undefined && filter !== 'PENDING') return null;

    const children = hasChildren
      ? node.children.map((c) => renderNode(c)).filter(Boolean)
      : [];

    if (hasChildren && filter && children.length === 0) return null;

    return (
      <div key={node.id}>
        <button
          onClick={() => {
            if (hasChildren) toggle(node.id);
            router.push(`/standard/${node.id}`);
          }}
          style={{
            paddingLeft: pl,
            paddingTop: 5,
            paddingBottom: 5,
            paddingRight: 6,
            borderRadius: 'var(--border-radius-md)',
            background: active ? '#E6F1FB' : 'transparent',
          }}
          className="flex items-center w-full text-left transition-colors hover:bg-[#f5f6f8]"
        >
          {/* Chevron */}
          <span className="w-3 shrink-0" style={{ color: '#9ca3af' }}>
            {hasChildren ? (
              <ChevronRight
                size={12}
                style={{
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            ) : null}
          </span>

          {/* Status dot (metrics only) */}
          {node.level === 3 && (
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: STATUS_DOT_COLOR[status ?? 'PENDING'],
                flexShrink: 0,
                marginLeft: 2,
                marginRight: 4,
              }}
            />
          )}

          {/* Code */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: active ? '#185FA5' : '#9ca3af',
              flexShrink: 0,
              marginRight: 5,
            }}
          >
            {node.code}
          </span>

          {/* Title */}
          <span
            className="truncate leading-snug"
            style={{
              fontSize: node.level === 3 ? 12 : 13,
              color: active ? '#0C447C' : 'var(--color-text-primary)',
              fontWeight: active ? 500 : 400,
            }}
          >
            {node.title}
          </span>
        </button>

        {hasChildren && isOpen && <div>{children}</div>}
      </div>
    );
  }

  return <nav className="py-2 space-y-0.5">{tree.map((n) => renderNode(n))}</nav>;
}
