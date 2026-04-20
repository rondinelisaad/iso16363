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

### M2 — Auth & Multi-tenancy (Week 3)
**Goal:** Users can register, belong to an org, and be invited with a role.

- [ ] Implement JWT auth in NestJS (Passport local + JWT strategies)
- [ ] NextAuth.js integration on the frontend calling the NestJS auth endpoints
- [ ] `Organization` creation flow (first user becomes `org_manager`)
- [ ] Invitation system: generate signed invite token → email link → role assignment
- [ ] NestJS middleware that sets `app.current_tenant` from JWT on every request
- [ ] RBAC guards (`@Roles(...)`) applied to all existing routes
- [ ] `TenantContext` React context on the frontend

**Definition of Done:** Invite flow works end-to-end; a contributor cannot access another org's data (verified by test).

---

### M3 — ISO Tree & Evidence Module (Weeks 4–5)
**Goal:** Core product loop — navigate the standard, upload evidence, track readiness.

- [ ] Hierarchical sidebar component (`IsoTreeNav`) reflecting Sections 3 → 3.1 → 3.1.1
- [ ] `MetricCard` component: displays norm text, supporting text, evidence examples, discussion
- [ ] `MetricStatus` CRUD endpoints (NestJS) with tenant isolation
- [ ] Evidence upload: presigned S3 PUT URL flow; store `s3Key` in DB after upload
- [ ] Inline PDF viewer (`react-pdf-viewer`) via presigned GET URL
- [ ] Readiness status toggle (PENDING / IN_PROGRESS / READY) per metric per org
- [ ] Dashboard: progress ring/bar showing % of metrics at READY per section
- [ ] Bulk status filter (show only PENDING, only IN_PROGRESS, etc.)

**Definition of Done:** A contributor can navigate to metric 3.1.1, attach a PDF, write a justification, and mark it READY. Dashboard reflects the change.

---

### M4 — Auditor Module (Week 6)
**Goal:** External auditor can review the full dossier and issue official opinions.

- [ ] Read-only auditor view at `/audit/[orgSlug]` (no upload, no status change by contributor role)
- [ ] Auditor opinion panel per metric: `ConformanceStatus` dropdown + comment textarea
- [ ] Auditor filter: "Show only NON_COMPLIANT", "Show only awaiting review"
- [ ] Audit trail: log every status change (who, when, old value → new value)
- [ ] Notification system (email or in-app): notify `org_manager` when auditor adds a non-conformance
- [ ] Gap Analysis summary view: table of all metrics with non-conformances + auditor comments

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
