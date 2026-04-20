-- Row-Level Security (RLS) policies for multi-tenant isolation.
-- The NestJS tenant middleware sets app.current_tenant via:
--   SET LOCAL "app.current_tenant" = '<organizationId>';
-- before executing any query in a transaction.

-- metric_statuses
ALTER TABLE "metric_statuses" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "metric_statuses"
    USING (
        "organizationId" = current_setting('app.current_tenant', TRUE)::text
    );

-- evidences
ALTER TABLE "evidences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "evidences"
    USING (
        "organizationId" = current_setting('app.current_tenant', TRUE)::text
    );

-- Superuser/service-role bypass so Prisma migrations and seed scripts still work.
-- The application role (e.g. "iso16363_app") must NOT have BYPASSRLS.
-- Migrations are run as the superuser or a role with BYPASSRLS.
