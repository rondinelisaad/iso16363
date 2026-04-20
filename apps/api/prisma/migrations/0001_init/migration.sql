-- CreateEnum
CREATE TYPE "ReadinessStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'READY');
CREATE TYPE "ConformanceStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'PARTIAL', 'OBSERVATION');
CREATE TYPE "UserOrganizationRole" AS ENUM ('org_manager', 'contributor', 'internal_auditor', 'external_auditor');

-- CreateTable: users
CREATE TABLE "users" (
    "id"           TEXT         NOT NULL,
    "email"        TEXT         NOT NULL,
    "name"         TEXT,
    "passwordHash" TEXT         NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable: organizations
CREATE TABLE "organizations" (
    "id"        TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "slug"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateTable: user_organizations
CREATE TABLE "user_organizations" (
    "id"             TEXT                   NOT NULL,
    "userId"         TEXT                   NOT NULL,
    "organizationId" TEXT                   NOT NULL,
    "role"           "UserOrganizationRole" NOT NULL,
    "createdAt"      TIMESTAMP(3)           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_organizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_organizations_userId_organizationId_key"
    ON "user_organizations"("userId", "organizationId");

-- CreateTable: iso_sections
CREATE TABLE "iso_sections" (
    "id"               TEXT    NOT NULL,
    "code"             TEXT    NOT NULL,
    "title"            TEXT    NOT NULL,
    "level"            INTEGER NOT NULL,
    "parentId"         TEXT,
    "normText"         TEXT,
    "supportingText"   TEXT,
    "evidenceExamples" TEXT,
    "discussion"       TEXT,
    CONSTRAINT "iso_sections_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "iso_sections_code_key" ON "iso_sections"("code");

-- CreateTable: metric_statuses
CREATE TABLE "metric_statuses" (
    "id"             TEXT                NOT NULL,
    "organizationId" TEXT                NOT NULL,
    "metricId"       TEXT                NOT NULL,
    "readiness"      "ReadinessStatus"   NOT NULL DEFAULT 'PENDING',
    "justification"  TEXT,
    "auditorOpinion" "ConformanceStatus",
    "auditorComment" TEXT,
    "updatedAt"      TIMESTAMP(3)        NOT NULL,
    CONSTRAINT "metric_statuses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "metric_statuses_organizationId_metricId_key"
    ON "metric_statuses"("organizationId", "metricId");
CREATE INDEX "metric_statuses_organizationId_metricId_idx"
    ON "metric_statuses"("organizationId", "metricId");

-- CreateTable: evidences
CREATE TABLE "evidences" (
    "id"             TEXT         NOT NULL,
    "organizationId" TEXT         NOT NULL,
    "metricStatusId" TEXT         NOT NULL,
    "uploadedBy"     TEXT         NOT NULL,
    "fileName"       TEXT         NOT NULL,
    "s3Key"          TEXT         NOT NULL,
    "uploadedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evidences_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "evidences_organizationId_idx" ON "evidences"("organizationId");

-- AddForeignKey constraints
ALTER TABLE "user_organizations"
    ADD CONSTRAINT "user_organizations_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_organizations"
    ADD CONSTRAINT "user_organizations_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "iso_sections"
    ADD CONSTRAINT "iso_sections_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "iso_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "metric_statuses"
    ADD CONSTRAINT "metric_statuses_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "metric_statuses"
    ADD CONSTRAINT "metric_statuses_metricId_fkey"
    FOREIGN KEY ("metricId") REFERENCES "iso_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "evidences"
    ADD CONSTRAINT "evidences_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evidences"
    ADD CONSTRAINT "evidences_metricStatusId_fkey"
    FOREIGN KEY ("metricStatusId") REFERENCES "metric_statuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evidences"
    ADD CONSTRAINT "evidences_uploadedBy_fkey"
    FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
