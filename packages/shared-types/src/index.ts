export enum ReadinessStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
}

export enum ConformanceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PARTIAL = 'PARTIAL',
  OBSERVATION = 'OBSERVATION',
}

export enum UserOrganizationRole {
  org_manager = 'org_manager',
  contributor = 'contributor',
  internal_auditor = 'internal_auditor',
  external_auditor = 'external_auditor',
}

export interface IsoSectionBase {
  id: string;
  code: string;
  title: string;
  level: number;
  parentId: string | null;
}

export interface IsoMetric extends IsoSectionBase {
  level: 3;
  normText: string;
  supportingText: string | null;
  evidenceExamples: string | null;
  discussion: string | null;
}

export interface OrganizationBase {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface MetricStatusBase {
  id: string;
  organizationId: string;
  metricId: string;
  readiness: ReadinessStatus;
  justification: string | null;
  auditorOpinion: ConformanceStatus | null;
  auditorComment: string | null;
  updatedAt: Date;
}

export interface EvidenceBase {
  id: string;
  organizationId: string;
  metricStatusId: string;
  fileName: string;
  s3Key: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface UserBase {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface UserOrganizationBase {
  id: string;
  userId: string;
  organizationId: string;
  role: UserOrganizationRole;
  createdAt: Date;
}

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};
