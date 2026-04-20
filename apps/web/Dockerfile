# Build context: repo root (docker-compose sets context: .)

FROM node:20-alpine AS base
RUN npm install -g pnpm@9.1.4
WORKDIR /app

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
# Copy manifests first — changes here invalidate the install layer
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
RUN pnpm install --frozen-lockfile
# Copy source after deps to keep the install layer cached
COPY . .
# NEXT_PUBLIC_* vars must be present at build time (Next.js bakes them in)
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
WORKDIR /app/apps/web
RUN node_modules/.bin/next build

# ── Runtime ────────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

# Re-install prod deps so pnpm wrapper scripts reference /app paths
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
RUN pnpm install --frozen-lockfile --prod

# Copy built output from builder
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/next.config.mjs

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
