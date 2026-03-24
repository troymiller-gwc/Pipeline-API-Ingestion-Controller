FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY lib/db/package.json lib/db/
COPY lib/api-zod/package.json lib/api-zod/
COPY artifacts/api-server/package.json artifacts/api-server/
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/lib/db/node_modules ./lib/db/node_modules
COPY --from=deps /app/lib/api-zod/node_modules ./lib/api-zod/node_modules
COPY --from=deps /app/artifacts/api-server/node_modules ./artifacts/api-server/node_modules
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY lib/db/ lib/db/
COPY lib/api-zod/ lib/api-zod/
COPY artifacts/api-server/ artifacts/api-server/
RUN cd artifacts/api-server && node build.mjs

FROM node:20-slim AS production
WORKDIR /app
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser
COPY --from=build /app/artifacts/api-server/dist ./dist
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

USER appuser
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
