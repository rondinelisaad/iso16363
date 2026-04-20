---
name: M2 Auth & Multi-tenancy Complete
description: M2 Auth & Multi-tenancy finished 2026-04-20; JWT auth, RBAC, tenant isolation, invite flow, NextAuth
type: project
---

M2 Auth & Multi-tenancy milestone completed on 2026-04-20.

**Why:** Building toward a working SaaS platform for ISO 16363 compliance auditing.

**How to apply:** M3 (ISO Tree & Evidence) is next. It depends on M2's auth/RBAC infrastructure (JwtAuthGuard, RolesGuard, TenantInterceptor are all wired globally).

**Key additions:**
- `apps/api/src/auth/` — Passport local+JWT, AuthService (bcrypt), guards, DTOs
- `apps/api/src/organizations/` — create org (transaction), invite tokens (7d JWT), accept-invite
- `apps/api/src/common/` — @Public(), @Roles(), @CurrentUser(), RolesGuard, TenantInterceptor
- `apps/api/src/prisma/` — global PrismaModule + PrismaService
- `apps/web/lib/auth.ts` — NextAuth credentials provider + session callbacks
- `apps/web/app/(auth)/` — login, register, accept-invite pages
- `apps/web/app/create-org/` — org creation with slug auto-generation
- `apps/web/app/(dashboard)/layout.tsx` — Server Component auth guard
- Docker: API_URL env var for container-to-container NextAuth calls (http://api:3001)
- Docker: shared-types built in builder stage + copied to runner
