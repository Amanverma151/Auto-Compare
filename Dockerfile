# syntax=docker/dockerfile:1
# Multi-stage build producing a small, non-root Next.js standalone image.
# Hosting is not decided yet (CLAUDE.md §8); this image runs on any container platform.

ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# ---- dependencies (prisma generate runs via postinstall) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
# prisma.config.ts requires DATABASE_URL to be set, but nothing connects during install/build.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- migrator: runs `prisma migrate deploy` on release ----
FROM deps AS migrator
CMD ["pnpm", "db:deploy"]

# ---- build ----
FROM deps AS build
COPY . .
ENV BUILD_STANDALONE=1 NODE_ENV=production
RUN pnpm build

# ---- runtime ----
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
