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
      <div style={{ padding: '20px 24px', maxWidth: 720 }}>
        <MetricCard node={node} initialStatus={status} />
      </div>
    );
  }

  // Section or subsection: show children list
  return (
    <div style={{ padding: '20px 24px', maxWidth: 680 }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 500,
            color: '#185FA5',
            background: '#E6F1FB',
            borderRadius: 4,
            padding: '2px 7px',
            flexShrink: 0,
            marginTop: 3,
          }}
        >
          {node.code}
        </span>
        <h1 style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a', margin: 0, lineHeight: 1.4 }}>
          {node.title}
        </h1>
      </div>

      {/* Children list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {node.children.map((child) => (
          <Link
            key={child.id}
            href={`/standard/${child.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 6,
                padding: '8px 12px',
                background: 'white',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              className="hover:bg-[#f5f6f8]"
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: '#9a9a9a',
                  minWidth: 36,
                  flexShrink: 0,
                }}
              >
                {child.code}
              </span>
              <span style={{ fontSize: 13, color: '#1a1a1a', flex: 1 }}>
                {child.title}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9a9a9a"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
