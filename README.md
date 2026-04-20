# ISO 16363 Compliance & Audit Platform

A **multi-tenant SaaS** for compliance management and external auditing against the **ISO 16363** standard — *Trustworthy Digital Repositories* (CCSDS 652.0-M-2).

Organizations open the platform and find the entire ISO 16363 requirements tree pre-loaded. They attach evidence, track readiness, and invite external auditors to validate certification — all in one place.

---

## Features

- **Full ISO 16363 taxonomy pre-loaded** — all 101 mandatory requirements across Sections 3, 4, and 5 with normative text, supporting guidance, evidence examples, and discussion
- **Multi-tenant isolation** — PostgreSQL Row-Level Security enforced at the database layer, not just the application layer
- **Role-based access** — `org_manager`, `contributor`, `internal_auditor`, `external_auditor`
- **Evidence management** — upload PDFs and documents per metric; inline viewer via pre-signed S3 URLs (never exposed directly)
- **Readiness tracking** — per-metric status (`PENDING → IN_PROGRESS → READY`) with justification text
- **Auditor workflow** — external auditors issue official conformance opinions (`COMPLIANT`, `NON_COMPLIANT`, `PARTIAL`, `OBSERVATION`) per metric
- **Gap analysis** — summary view of all non-conformances with auditor comments
- **PDF export** — full audit dossier report, role-based variants (draft vs. official)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Auth | NextAuth.js (frontend) + JWT/Passport (NestJS) |
| Database | PostgreSQL 15 with RLS |
| Storage | AWS S3 — pre-signed URLs, SSE-KMS encryption |
| Monorepo | Turborepo + pnpm workspaces |

---

## Project Structure

```
/
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── organizations/
│   │   │   ├── iso/          # Read-only taxonomy endpoints
│   │   │   ├── metrics/      # MetricStatus CRUD
│   │   │   ├── evidence/     # Upload + signed-URL generation
│   │   │   └── reports/      # PDF export
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       ├── migrations/
│   │       │   ├── 0001_init/        # Tables, indexes, FK constraints
│   │       │   └── 0002_rls/         # PostgreSQL RLS tenant isolation
│   │       └── seed/
│   │           └── iso16363.ts       # Full CCSDS 652.0-M-2 taxonomy
│   └── web/                  # Next.js frontend
│       └── app/
│           ├── (auth)/               # Login, invite acceptance
│           ├── (dashboard)/          # Org dashboard, progress overview
│           ├── audit/[orgSlug]/      # External auditor view (read-only)
│           └── standard/             # ISO tree navigation
└── packages/
    └── shared-types/         # Shared TypeScript enums and interfaces
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 9 (`npm install -g pnpm`)
- PostgreSQL 15

### 1. Clone and install

```bash
git clone https://github.com/rondinelisaad/iso16363.git
cd iso16363
pnpm install
```

### 2. Configure environment

```bash
cp .env.example apps/api/.env
# Edit apps/api/.env with your database URL and secrets
```

### 3. Set up the database

```bash
cd apps/api

# Generate Prisma client
pnpm prisma:generate

# Apply migrations (creates all tables + RLS policies)
pnpm prisma:migrate

# Seed the ISO 16363 taxonomy (101 metrics)
pnpm prisma:seed
```

### 4. Start the stack

```bash
# From the repo root — starts both API and web in watch mode
pnpm dev
```

| Service | URL |
|---|---|
| API | http://localhost:3001 |
| Web | http://localhost:3000 |
| Health check | http://localhost:3001/health |

---

## Environment Variables

Copy `.env.example` to `apps/api/.env` and fill in the values.

```env
# apps/api
DATABASE_URL=postgresql://user:password@localhost:5432/iso16363
JWT_SECRET=
AWS_REGION=
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SIGNED_URL_TTL_SECONDS=900

# apps/web
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## ISO 16363 Coverage

The seed script loads the full CCSDS 652.0-M-2 mandatory requirements:

| Section | Title | Metrics |
|---|---|---|
| 3 | Organizational Infrastructure | 28 |
| 4 | Digital Object Management | 50 |
| 5 | Infrastructure and Security Risk Management | 23 |
| **Total** | | **101** |

Each metric includes:
- **Normative text** — the exact "shall" requirement
- **Supporting text** — implementation guidance
- **Evidence examples** — accepted types of evidence
- **Discussion** — context and rationale

---

## Architecture Highlights

### Multi-tenancy

Every table holding org-specific data carries an `organization_id` column. PostgreSQL RLS enforces isolation at the database level:

```sql
ALTER TABLE metric_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON metric_statuses
  USING (organization_id = current_setting('app.current_tenant', TRUE)::text);
```

The NestJS request lifecycle sets `app.current_tenant` from the JWT claim before any query executes.

### Evidence Security

Evidence files are never served via direct S3 URLs. Every file access goes through a signed-URL endpoint that validates RLS first. URLs expire after 15 minutes (configurable per org). Files are encrypted at rest with S3 SSE-KMS.

### RBAC

| Role | Permissions |
|---|---|
| `org_manager` | Full CRUD; invite users and auditors |
| `contributor` | Upload evidence; write justifications for assigned metrics |
| `internal_auditor` | Read all + gap analysis; cannot change final audit status |
| `external_auditor` | Read-only dossier; add official opinions and conformance status |

---

## Roadmap

| Milestone | Status | Goal |
|---|---|---|
| M1 — Foundation | ✅ Complete | Monorepo, schema, seed, scaffolding |
| M2 — Auth & Multi-tenancy | 🔜 Next | JWT auth, org creation, invite flow, RBAC |
| M3 — ISO Tree & Evidence | ⬜ Planned | Navigate standard, upload evidence, track readiness |
| M4 — Auditor Module | ⬜ Planned | Conformance opinions, gap analysis, notifications |
| M5 — Reports & Hardening | ⬜ Planned | PDF export, E2E tests, beta onboarding |

---

## License

MIT
