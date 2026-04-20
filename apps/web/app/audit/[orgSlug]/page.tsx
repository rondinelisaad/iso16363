import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ConformanceStatus } from '@iso16363/shared-types';
import { authOptions } from '../../../lib/auth';
import { serverApi, getToken } from '../../../lib/server-api';
import { AuditDossierClient } from './audit-dossier-client';

interface DossierMetric {
  metricId: string;
  code: string;
  title: string;
  normText: string | null;
  readiness: string;
  justification: string | null;
  auditorOpinion: ConformanceStatus | null;
  auditorComment: string | null;
  evidences: { id: string; fileName: string; uploadedAt: string }[];
}

interface DossierSection {
  id: string;
  code: string;
  title: string;
  subsections: { id: string; code: string; title: string; metrics: DossierMetric[] }[];
}

interface DossierResponse {
  org: { id: string; name: string; slug: string };
  sections: DossierSection[];
}

export default async function AuditPage({ params }: { params: { orgSlug: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  if (!session.user.orgId) redirect('/create-org');

  const token = await getToken();
  let dossier: DossierResponse;

  try {
    dossier = await serverApi<DossierResponse>(`/audit/${params.orgSlug}`, token);
  } catch {
    notFound();
  }

  const isAuditor = session.user.role === 'external_auditor';

  return (
    <AuditDossierClient
      sections={dossier.sections}
      orgName={dossier.org.name}
      orgSlug={dossier.org.slug}
      token={session.accessToken ?? ''}
      isAuditor={isAuditor}
    />
  );
}
