# Build context: repo root (docker-compose sets context: .)

FROM node:20-alpine AS base
RUN npm install -g pnpm@9.1.4
WORKDIR /app

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
# Copy manifests first — changes here invalidate the install layer
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
RUN pnpm install --frozen-lockfile
# Copy source after deps to keep the install layer cached
COPY . .
WORKDIR /app/apps/api
RUN node_modules/.bin/prisma generate
RUN node_modules/.bin/nest build

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

# Prisma engine binaries require OpenSSL on Alpine
RUN apk add --no-cache openssl

# Install CLI tools globally — prisma and tsx are devDeps and would be skipped
# by pnpm install --prod, but we need them in the entrypoint for migrations + seeding
RUN npm install -g prisma@5 tsx

# Re-install prod deps so pnpm wrapper scripts reference /app paths, not build-host paths
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output and Prisma assets from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

COPY apps/api/entrypoint.sh ./apps/api/entrypoint.sh
RUN chmod +x ./apps/api/entrypoint.sh

WORKDIR /app/apps/api
# Generate Prisma client so @prisma/client has the query engine at runtime
RUN prisma generate

EXPOSE 3001
ENTRYPOINT ["./entrypoint.sh"]
