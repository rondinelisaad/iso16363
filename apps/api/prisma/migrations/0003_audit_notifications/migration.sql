-- CreateTable: audit_logs
CREATE TABLE "audit_logs" (
    "id"             TEXT         NOT NULL,
    "organizationId" TEXT         NOT NULL,
    "metricId"       TEXT         NOT NULL,
    "userId"         TEXT         NOT NULL,
    "field"          TEXT         NOT NULL,
    "oldValue"       TEXT,
    "newValue"       TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_organizationId_metricId_idx"
    ON "audit_logs"("organizationId", "metricId");

ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: notifications
CREATE TABLE "notifications" (
    "id"             TEXT         NOT NULL,
    "organizationId" TEXT         NOT NULL,
    "recipientId"    TEXT         NOT NULL,
    "type"           TEXT         NOT NULL,
    "metricId"       TEXT         NOT NULL,
    "message"        TEXT         NOT NULL,
    "read"           BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_recipientId_read_idx"
    ON "notifications"("recipientId", "read");

ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_recipientId_fkey"
    FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS: audit_logs (tenant-scoped)
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "audit_logs"
    USING ("organizationId" = current_setting('app.current_tenant', TRUE)::text);

-- RLS: notifications (tenant-scoped; service layer also filters by recipientId)
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "notifications"
    USING ("organizationId" = current_setting('app.current_tenant', TRUE)::text);
