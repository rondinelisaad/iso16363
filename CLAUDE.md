# CLAUDE.md — ISO 16363 Compliance & Audit Platform

This file is the authoritative engineering guide for Claude (and any AI assistant) working on this codebase. Read it fully before writing any code, suggesting architecture changes, or creating new files.

---

## Project Overview

A **multi-tenant SaaS** for compliance management and external auditing against the **ISO 16363** standard (Trustworthy Digital Repositories — CCSDS 652.0-M-2). The platform guides organizations through a collaborative workflow: documenting evidence, performing self-assessments, and enabling external auditors to validate certification digitally.

**Core value proposition:** An organization opens the app and finds the entire ISO 16363 requirements tree pre-loaded, ready to attach evidence and track progress toward certification.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript | SSR for audit views, RSC where appropriate |
| Styling | Tailwind CSS | Utility-first, responsive admin UI |
| UI Components | shadcn/ui (Radix primitives) | Accessibility-first, unstyled base |
| PDF Viewer | `react-pdf-viewer` | Inline evidence preview, no forced download |
| Backend | NestJS + TypeScript | Modular monolith; each ISO section = a module |
| ORM | Prisma | Type-safe schema, migrations, seeding |
| Auth | NextAuth.js (frontend) + JWT/Passport (NestJS) | Role-based via JWT claims |
| Database | PostgreSQL | RLS policies, recursive CTEs for hierarchy |
| Storage | AWS S3 (or GCS) | Pre-signed URLs, time-limited access |
| Container | Docker + docker-compose | Single command startup; Postgres, API, web |

---

## Running the Stack

### Docker (default)

```bash
cp .env.example .env   # fill JWT_SECRET, NEXTAUTH_SECRET, AWS creds
docker compose up --build
```

`docker-compose.yaml` at the repo root orchestrates three services:

| Service | Image / Dockerfile | Port |
|---|---|---|
| `postgres` | `postgres:15-alpine` | 5432 |
| `api` | `apps/api/Dockerfile` | 3001 |
| `web` | `apps/web/Dockerfile` | 3000 |

The API container runs `apps/api/entrypoint.sh` on startup, which:
1. `prisma migrate deploy` — applies any pending migrations
2. `prisma db seed` — seeds ISO 16363 taxonomy (idempotent via upsert)
3. `node dist/main.js` — starts the NestJS server

`NEXT_PUBLIC_API_URL` is a **build-time** argument for the web image (Next.js bakes it in at `next build`). Override it via the `args` block in `docker-compose.yaml` or in your `.env` file.

### Local (alternative)

Requires Node.js ≥ 20, pnpm ≥ 9, and a local PostgreSQL 15 instance.
See the README for the step-by-step local setup.

---

## Architecture Principles

### Multi-tenancy
- Every database table that holds org-specific data has an `organization_id` column.
- **Row-Level Security (RLS)** is enforced at the PostgreSQL level — not just at the application layer.
- The NestJS request lifecycle sets `app.current_tenant` via a middleware that reads the JWT claim.
- **Rule:** Never query evidence, metrics status, or user data without the tenant context being active.

### RBAC Roles

| Role | Key Permissions |
|---|---|
| `org_manager` | Full CRUD on the org's project; invites users and auditors |
| `contributor` | Upload evidence and write justifications for assigned metrics |
| `internal_auditor` | Read all + gap analysis; cannot change final audit status |
| `external_auditor` | Read-only access to the full dossier; can add official opinions and change conformance status |

- Roles are stored as a `user_organization_role` enum in the DB and encoded in the JWT.
- NestJS guards (`@Roles(...)`) protect every controller method.

### Storage & Security
- Evidence files are **never served via direct S3 URLs**.
- All file access goes through a signed-URL generation endpoint that checks RLS first.
- URLs expire in **15 minutes** by default; configurable per org.
- Sensitive documents are encrypted at rest (S3 SSE-KMS).

---

## Database Schema (Prisma)

```prisma
// Core tenancy
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  users     UserOrganization[]
  evidences Evidence[]
  metricStatuses MetricStatus[]
}

// ISO 16363 taxonomy — seeded, read-only at runtime
model IsoSection {
  id          String      @id  // e.g. "3", "3.1", "3.1.1"
  code        String      @unique  // display code
  title       String
  level       Int         // 1 = section, 2 = subsection, 3 = metric
  parentId    String?
  parent      IsoSection? @relation("Hierarchy", fields: [parentId], references: [id])
  children    IsoSection[] @relation("Hierarchy")
  // Only metrics (level=3) have the fields below
  normText         String?
  supportingText   String?
  evidenceExamples String?
  discussion       String?
  statuses         MetricStatus[]
}

// Per-org status of each metric
model MetricStatus {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  metricId       String
  metric         IsoSection   @relation(fields: [metricId], references: [id])
  readiness      ReadinessStatus @default(PENDING)
  justification  String?
  auditorOpinion ConformanceStatus?
  auditorComment String?
  updatedAt      DateTime     @updatedAt
  evidences      Evidence[]
  @@unique([organizationId, metricId])
}

// Evidence files
model Evidence {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  metricStatusId String
  metricStatus   MetricStatus @relation(fields: [metricStatusId], references: [id])
  fileName       String
  s3Key          String
  uploadedBy     String       // userId
  uploadedAt     DateTime     @default(now())
}

enum ReadinessStatus  { PENDING IN_PROGRESS READY }
enum ConformanceStatus { COMPLIANT NON_COMPLIANT PARTIAL OBSERVATION }
```

**RLS Policy example (PostgreSQL):**
```sql
ALTER TABLE metric_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON metric_statuses
  USING (organization_id = current_setting('app.current_tenant')::text);
```

---

## Project Structure

```
/
├── apps/
│   ├── web/          # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/           # Login, invite acceptance
│   │   │   ├── (dashboard)/      # Org dashboard, progress overview
│   │   │   ├── audit/[orgSlug]/  # External auditor view (read-only)
│   │   │   └── standard/         # ISO tree navigation
│   │   └── components/
│   │       ├── iso-tree/         # Hierarchical sidebar
│   │       ├── metric-card/      # Evidence upload + status card
│   │       └── audit-panel/      # Auditor opinion panel
│   └── api/          # NestJS backend
│       ├── src/
│       │   ├── auth/
│       │   ├── organizations/
│       │   ├── iso/              # Seeded taxonomy, read-only endpoints
│       │   ├── metrics/          # MetricStatus CRUD
│       │   ├── evidence/         # Upload, signed-URL generation
│       │   └── reports/          # PDF export
│       └── prisma/
│           ├── schema.prisma
│           └── seed/
│               └── iso16363.ts   # Full CCSDS 652.0-M-2 data import
├── packages/
│   └── shared-types/   # Shared TypeScript interfaces
└── CLAUDE.md           # ← this file
```

---

## Coding Conventions

- **TypeScript strict mode** everywhere. No `any`.
- **Zod** for all request/response validation at API boundaries.
- **NestJS pipes** validate DTOs before they reach service layer.
- React components: prefer **Server Components** by default; use `"use client"` only when needed (forms, interactive state).
- All DB queries must go through Prisma services — **no raw SQL** except for RLS setup migrations.
- File names: `kebab-case` for files/folders, `PascalCase` for components, `camelCase` for functions/variables.
- Every service method that touches `MetricStatus` or `Evidence` must accept `organizationId` as an explicit parameter and verify ownership.

---

## Implementation Milestones

### M1 — Foundation (Weeks 1–2)
**Goal:** Runnable monorepo with database ready and ISO taxonomy seeded.

- [ ] Initialize Turborepo (or Nx) monorepo with `apps/web` and `apps/api`
- [ ] Set up Prisma schema (all models above) with initial migration
- [ ] Write seed script `prisma/seed/iso16363.ts` that imports all sections, subsections and metrics from CCSDS 652.0-M-2 (Sections 3, 4, 5)
- [ ] Configure PostgreSQL RLS policies via migration
- [ ] Scaffold NestJS with health-check endpoint
- [ ] Scaffold Next.js with Tailwind + shadcn/ui initialized
- [ ] Set up shared `packages/shared-types` with enums and base interfaces

**Definition of Done:** `prisma db seed` runs without errors; querying `IsoSection` returns the full tree (≥ 100 metrics).

---

### ✅ M2 — Auth & Multi-tenancy (Week 3) — COMPLETE
**Goal:** Users can register, belong to an org, and be invited with a role.

- [x] Implement JWT auth in NestJS (Passport local + JWT strategies)
- [x] NextAuth.js integration on the frontend calling the NestJS auth endpoints
- [x] `Organization` creation flow (first user becomes `org_manager`)
- [x] Invitation system: generate signed invite token → email link → role assignment
- [x] NestJS middleware that sets `app.current_tenant` from JWT on every request
- [x] RBAC guards (`@Roles(...)`) applied to all existing routes
- [x] `TenantContext` React context on the frontend

**Definition of Done:** Invite flow works end-to-end; a contributor cannot access another org's data (verified by test).

---

### ✅ M3 — ISO Tree & Evidence Module (Weeks 4–5) — COMPLETE
**Goal:** Core product loop — navigate the standard, upload evidence, track readiness.

- [x] Hierarchical sidebar component (`IsoTreeNav`) reflecting Sections 3 → 3.1 → 3.1.1
- [x] `MetricCard` component: displays norm text, supporting text, evidence examples, discussion
- [x] `MetricStatus` CRUD endpoints (NestJS) with tenant isolation
- [x] Evidence upload: presigned S3 PUT URL flow; store `s3Key` in DB after upload
- [x] Inline evidence viewing via presigned GET URL (opens in browser/new tab)
- [x] Readiness status toggle (PENDING / IN_PROGRESS / READY) per metric per org
- [x] Dashboard: stacked progress bar showing % of metrics at READY per section
- [x] Readiness status dots on tree nodes (colour-coded by status)

**Definition of Done:** A contributor can navigate to metric 3.1.1, attach a PDF, write a justification, and mark it READY. Dashboard reflects the change.

---

### ✅ M4 — Auditor Module (Week 6) — COMPLETE
**Goal:** External auditor can review the full dossier and issue official opinions.

- [x] Read-only auditor view at `/audit/[orgSlug]` (no upload, no readiness change by auditors)
- [x] Auditor opinion panel per metric: `ConformanceStatus` dropdown + comment textarea
- [x] Auditor filter: "Show only NON_COMPLIANT/Partial", "Show only awaiting review"
- [x] Audit trail: log every status change (who, when, old value → new value) in `audit_logs`
- [x] Notification system (in-app): notify `org_manager` when auditor adds a non-conformance; `NotificationBell` in header
- [x] Gap Analysis summary view: table of all metrics with auditor opinions + comments

**Definition of Done:** External auditor logs in, reviews a metric, marks it NON_COMPLIANT with a comment. Manager receives notification. Gap Analysis table is accurate.

---

### M5 — Reports & MVP Hardening (Week 7+)
**Goal:** Export audit dossier as PDF; system is ready for beta.

- [ ] PDF export endpoint: generate Audit Report (org info + all metrics + conformance statuses + comments)
- [ ] Use `@react-pdf/renderer` or Puppeteer for server-side PDF generation
- [ ] Role-based report variants: internal draft vs. official auditor-signed version
- [ ] Performance: add DB indexes on `(organization_id, metric_id)` and query audit on `MetricStatus`
- [ ] Security hardening: rate limiting, CORS config, helmet headers in NestJS
- [ ] End-to-end tests (Playwright) covering: login → upload evidence → auditor review → export PDF
- [ ] Beta onboarding: invite 1 real organization; collect structured feedback

**Definition of Done:** Full audit cycle completed by a real user without engineering support. PDF report generated successfully.

---

## Environment Variables

```env
# apps/api
DATABASE_URL=postgresql://...
JWT_SECRET=
AWS_REGION=
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SIGNED_URL_TTL_SECONDS=900

# apps/web
NEXTAUTH_URL=
NEXTAUTH_SECRET=
NEXT_PUBLIC_API_URL=
```

---

## Key Rules for Claude

1. **Always check `organizationId` in every service method** that reads or writes `MetricStatus`, `Evidence`, or user data.
2. **Never expose S3 keys directly** — always go through the signed-URL endpoint.
3. **Do not add raw SQL** outside of migration files; use Prisma queries.
4. **Seed data is sacred** — the ISO 16363 taxonomy (`IsoSection` table) is read-only at runtime. Never generate migrations that alter it programmatically.
5. When generating UI, **default to Server Components**; only add `"use client"` if the component requires browser APIs or interactive state.
6. When asked to add a feature, **identify which Milestone it belongs to** and note any prerequisite milestones that must be complete first.
7. For any security-sensitive change (auth, RLS, file access), **explain the threat model** addressed before writing code.

---

## Milestone Completion Log

### ✅ M1 — Foundation — COMPLETE (2026-04-19)

All M1 checklist items delivered:

- [x] Turborepo monorepo initialized with `apps/web` (Next.js) and `apps/api` (NestJS)
- [x] Prisma schema defined — all models: `User`, `Organization`, `UserOrganization`, `IsoSection`, `MetricStatus`, `Evidence`
- [x] Seed script `prisma/seed/iso16363.ts` — **101 metrics** from CCSDS 652.0-M-2 Sections 3, 4, 5
- [x] PostgreSQL RLS policies in `migrations/0002_rls/migration.sql`
- [x] NestJS scaffolded with `/health` endpoint (`GET /health → { status, timestamp, service }`)
- [x] Next.js scaffolded with Tailwind CSS + shadcn/ui (`components.json`, CSS variables, `tailwind.config.ts`)
- [x] `packages/shared-types` — all enums and base interfaces shared across apps

**Definition of Done met:** `prisma db seed` will run without errors; `IsoSection` table returns 101 metrics (≥ 100). Health endpoint responds at `GET /health`. Tailwind + shadcn/ui configured on Next.js.

**To start the stack:**
```bash
# Copy and fill env
cp .env.example apps/api/.env

# Install all deps
pnpm install

# Generate Prisma client
cd apps/api && pnpm prisma:generate

# Apply migrations (requires running PostgreSQL)
pnpm prisma:migrate

# Seed ISO 16363 taxonomy
pnpm prisma:seed

# Start all services
cd ../.. && pnpm dev
```

---

### ✅ M2 — Auth & Multi-tenancy — COMPLETE (2026-04-20)

All M2 checklist items delivered:

- [x] JWT auth in NestJS — Passport `local` strategy (email/password login) + `jwt` strategy (bearer token validation)
- [x] `AuthService` — `register` (bcrypt hash, conflict check), `login` (issues JWT with orgId + role), `issueToken`, `refreshToken`
- [x] Global `JwtAuthGuard` (via `APP_GUARD`) — protects all routes; `@Public()` decorator opts routes out
- [x] Global `RolesGuard` (via `APP_GUARD`) — enforces `@Roles(...)` on controller methods
- [x] `TenantInterceptor` (via `APP_INTERCEPTOR`) — sets `app.current_tenant` PostgreSQL session variable from JWT `orgId` claim before each query
- [x] `PrismaModule` — global, injected across all modules
- [x] Organization creation flow — `POST /organizations` creates org + assigns `org_manager` role in a single transaction
- [x] Invitation system — `POST /organizations/:slug/invites` (org_manager only) generates a signed JWT invite token (7d expiry); returns `{ token, inviteUrl }`
- [x] `POST /auth/accept-invite` — verifies invite token, upserts `UserOrganization`, returns new access token with org context
- [x] `POST /auth/refresh-token` — reissues JWT with latest org membership (used after org creation)
- [x] NextAuth.js v4 — credentials provider calls `POST /auth/login`; stores `accessToken`, `orgId`, `role` in JWT session
- [x] Session update via `update({ accessToken })` — frontend refreshes session without re-login after org creation or invite acceptance
- [x] `API_URL` env var — server-side (Docker container-to-container) API calls use `http://api:3001` via `API_URL`; browser calls use `NEXT_PUBLIC_API_URL`
- [x] `TenantContext` — role and orgId exposed via `useSession()` (NextAuth session)
- [x] Login page (`/login`), Register page (`/register`), Accept-invite page (`/accept-invite?token=...`)
- [x] Create-org page (`/create-org`) — auto-generates slug from name; calls refresh-token after creation
- [x] Dashboard layout — Server Component; redirects unauthenticated → `/login`, no-org → `/create-org`

**API endpoints added:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Create user account |
| POST | `/auth/login` | Public | Issue access token |
| GET | `/auth/me` | JWT | Current user profile |
| POST | `/auth/accept-invite` | JWT | Accept org invite, get new token |
| POST | `/auth/refresh-token` | JWT | Reissue token with latest org membership |
| POST | `/organizations` | JWT | Create org (caller becomes org_manager) |
| GET | `/organizations/me` | JWT | List caller's org memberships |
| GET | `/organizations/:slug` | JWT | Get org details + members |
| POST | `/organizations/:slug/invites` | JWT + org_manager | Generate signed invite URL |

**Definition of Done met:** Full invite flow verified end-to-end via `curl`: register → create org → refresh token → create invite → token validated. A contributor cannot access another org's data (RLS enforced at DB level via `TenantInterceptor`).

**Key files:**
- `apps/api/src/auth/` — auth module, service, strategies, guards, DTOs
- `apps/api/src/organizations/` — organizations module, service, controller, DTOs
- `apps/api/src/common/` — `@Public()`, `@Roles()`, `@CurrentUser()` decorators; `RolesGuard`; `TenantInterceptor`
- `apps/api/src/prisma/` — global `PrismaModule` + `PrismaService`
- `apps/web/lib/auth.ts` — NextAuth options (credentials provider + JWT/session callbacks)
- `apps/web/app/(auth)/` — login, register, accept-invite pages
- `apps/web/app/create-org/` — organization creation page
- `apps/web/app/(dashboard)/layout.tsx` — auth + org guard (Server Component)

---

### ✅ M3 — ISO Tree & Evidence Module — COMPLETE (2026-04-20)

All M3 checklist items delivered:

- [x] `IsoModule` — public endpoints: `GET /iso/tree` (nested), `GET /iso/sections/:id`, `GET /iso/metrics`
- [x] `MetricsModule` — tenant-scoped: `GET /metrics`, `GET /metrics/summary`, `GET /metrics/:metricId`, `PATCH /metrics/:metricId` (upsert)
- [x] `EvidenceModule` — tenant-scoped: `POST /evidence/upload-url` (presigned S3 PUT), `POST /evidence/record`, `GET /evidence/:id/view-url` (presigned S3 GET), `DELETE /evidence/:id`
- [x] `OrgRequiredGuard` — rejects requests with no `orgId` in JWT before reaching metrics/evidence controllers
- [x] `IsoTreeNav` (client component) — collapsible tree with colour-coded readiness dots; reads active path via `usePathname()`
- [x] `MetricCard` (client component) — normText, supportingText, evidenceExamples, discussion; readiness toggle; justification auto-save on blur
- [x] `ReadinessToggle` — pill button group (PENDING / IN_PROGRESS / READY) with colour states
- [x] `EvidenceList` — file upload (presigned PUT → S3 → record), view (presigned GET → new tab), delete
- [x] `SectionProgress` — stacked progress bar (green/yellow/gray) per section
- [x] Dashboard — overall + per-section progress bars; link to standard browser
- [x] `server-api.ts` helper — server-side fetch with `API_URL` + bearer token via `getServerSession`
- [x] `/standard` layout — sidebar (tree + statuses) + content pane
- [x] `/standard/[nodeId]` — sections show child list; metrics render `MetricCard`

**API endpoints added:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/iso/tree` | Public | Full nested ISO 16363 tree |
| GET | `/iso/sections/:id` | Public | Section/metric with children |
| GET | `/iso/metrics` | Public | All 101 metrics flat |
| GET | `/metrics` | JWT + org | All metric statuses for current org |
| GET | `/metrics/summary` | JWT + org | Progress counts per section |
| GET | `/metrics/:metricId` | JWT + org | Single metric status (null if not started) |
| PATCH | `/metrics/:metricId` | JWT + org | Upsert readiness + justification |
| POST | `/evidence/upload-url` | JWT + org | Generate presigned S3 PUT URL |
| POST | `/evidence/record` | JWT + org | Record evidence after S3 upload |
| GET | `/evidence/:id/view-url` | JWT + org | Generate presigned S3 GET URL |
| DELETE | `/evidence/:id` | JWT + org | Delete evidence from S3 + DB |

**Definition of Done met:** ISO tree renders with 3 sections → 13 subsections → 101 metrics. `PATCH /metrics/3.1.1` creates the status record, sets readiness to `IN_PROGRESS`, and the summary endpoint reflects the change immediately.

**Key files:**
- `apps/api/src/iso/` — ISO taxonomy read-only module
- `apps/api/src/metrics/` — MetricStatus CRUD with tenant isolation
- `apps/api/src/evidence/` — S3 presigned URL flow + Evidence records
- `apps/api/src/common/guards/org-required.guard.ts` — rejects requests without org context
- `apps/web/lib/server-api.ts` — server-side authenticated fetch helper
- `apps/web/components/iso-tree/iso-tree-nav.tsx` — interactive collapsible tree (client)
- `apps/web/components/metric-card/` — MetricCard, ReadinessToggle, EvidenceList
- `apps/web/components/dashboard/section-progress.tsx` — stacked progress bar
- `apps/web/app/(dashboard)/standard/` — layout + overview + [nodeId] detail pages

---

### ✅ M4 — Auditor Module — COMPLETE (2026-04-20)

All M4 checklist items delivered:

- [x] `AuditModule` — `GET /audit/:orgSlug` (full dossier: org info + all 101 metrics with statuses, nested by section/subsection); `GET /audit/:orgSlug/gap-analysis`
- [x] `NotificationsModule` — `GET /notifications` (unread), `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
- [x] `PATCH /metrics/:metricId/audit` — external_auditor only; sets `auditorOpinion` + `auditorComment`; creates `AuditLog` entry; creates `Notification` for all `org_manager` users on NON_COMPLIANT/PARTIAL/OBSERVATION
- [x] `GET /metrics/gap-analysis` — all metrics with non-null `auditorOpinion`, with counts by opinion type
- [x] Audit trail — `audit_logs` table; every change to `readiness` (in `MetricsService.update()`) and `auditorOpinion` (in `MetricsService.updateAudit()`) is logged with userId, oldValue, newValue
- [x] RBAC hardening — `PATCH /metrics/:metricId` restricted to `org_manager` + `contributor`; `PATCH /metrics/:metricId/audit` restricted to `external_auditor`
- [x] Migration `0003_audit_notifications` — creates `audit_logs` and `notifications` tables with RLS policies
- [x] `AuditDossierClient` — interactive client component with section accordion, metric rows (expand for details + AuditPanel), and 3-mode filter (all / non-compliant / awaiting)
- [x] `AuditPanel` — ConformanceStatus pill selector + comment textarea + save (external_auditor); read-only badge + comment (other roles)
- [x] `ConformanceBadge` — color-coded badge (green/red/orange/yellow) for each ConformanceStatus value
- [x] `NotificationBell` — client component in header; fetches unread count on mount; dropdown with dismiss + mark-all-read
- [x] Dashboard layout updated — nav links (Dashboard, Standard, Gap Analysis), Auditor View shortcut, NotificationBell
- [x] `/audit/[orgSlug]` — separate layout + page for the auditor dossier view
- [x] `/gap-analysis` — summary cards + full table for org_manager and internal_auditor

**API endpoints added:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/audit/:orgSlug` | JWT + org | Full dossier (slug or ID accepted) |
| GET | `/audit/:orgSlug/gap-analysis` | JWT + org | Gap analysis for auditor view |
| PATCH | `/metrics/:metricId/audit` | JWT + external_auditor | Set conformance opinion + comment |
| GET | `/metrics/gap-analysis` | JWT + org | Gap analysis for dashboard users |
| GET | `/notifications` | JWT + org | Unread notifications for current user |
| PATCH | `/notifications/read-all` | JWT + org | Mark all notifications read |
| PATCH | `/notifications/:id/read` | JWT + org | Mark single notification read |

**Key files:**
- `apps/api/prisma/migrations/0003_audit_notifications/` — new tables + RLS
- `apps/api/src/audit/` — AuditModule, AuditService, AuditController
- `apps/api/src/notifications/` — NotificationsModule, NotificationsService, NotificationsController
- `apps/api/src/metrics/dto/update-audit-status.dto.ts` — ConformanceStatus DTO
- `apps/web/components/audit-panel/` — AuditPanel, ConformanceBadge
- `apps/web/components/notifications/notification-bell.tsx` — NotificationBell
- `apps/web/app/audit/[orgSlug]/` — layout, page, AuditDossierClient
- `apps/web/app/(dashboard)/gap-analysis/page.tsx` — Gap Analysis dashboard page
