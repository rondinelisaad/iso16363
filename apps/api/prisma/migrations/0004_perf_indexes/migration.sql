-- Performance index: gap-analysis query filters by organizationId + auditorOpinion IS NOT NULL
CREATE INDEX "metric_statuses_organizationId_auditorOpinion_idx"
    ON "metric_statuses"("organizationId", "auditorOpinion");

-- Index on notifications.organizationId for tenant-scoped queries
CREATE INDEX "notifications_organizationId_idx"
    ON "notifications"("organizationId");
