import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth';
import { serverApi, getToken } from '../../../lib/server-api';
import { ExportPdfButton } from '../../../components/reports/export-pdf-button';
import { ConformanceStatus, ReadinessStatus } from '@iso16363/shared-types';
import { GapAnalysisClient } from './gap-analysis-client';

interface GapItem {
  metricId: string;
  code: string;
  title: string;
  readiness: ReadinessStatus;
  auditorOpinion: ConformanceStatus;
  auditorComment: string | null;
  justification?: string | null;
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
  const canExport = ['org_manager', 'internal_auditor'].includes(role);

  return (
    <div style={{ padding: '24px', maxWidth: 900 }}>
      {/* Page header */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#9a9a9a',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
              margin: '0 0 4px',
            }}
          >
            Análise
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 16, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
              Gap analysis
            </h1>
            {data.NON_COMPLIANT > 0 && (
              <span
                style={{
                  background: '#FCEBEB',
                  color: '#791F1F',
                  border: '0.5px solid #F09595',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '2px 8px',
                }}
              >
                {data.NON_COMPLIANT} NC
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#9a9a9a', marginTop: 3 }}>
            {data.reviewed} de {data.total} métricas revisadas ({pctReviewed}%)
          </p>
        </div>
        {canExport && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <ExportPdfButton orgId={session!.user.orgId!} variant="draft" label="Exportar rascunho" />
            <ExportPdfButton orgId={session!.user.orgId!} variant="official" label="Exportar oficial" />
          </div>
        )}
      </div>

      <GapAnalysisClient data={data} orgId={session?.user?.orgId ?? ''} canExport={canExport} />
    </div>
  );
}
