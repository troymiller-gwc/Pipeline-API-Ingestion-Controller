FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY lib/db/package.json lib/db/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/execution-engine/package.json lib/execution-engine/
RUN echo "node-linker=hoisted" >> .npmrc && pnpm install --prod=false

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY lib/db/ lib/db/
COPY lib/api-zod/ lib/api-zod/
COPY lib/execution-engine/ lib/execution-engine/
RUN cd lib/execution-engine && node build.mjs

FROM node:20-slim AS production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser
COPY --from=build /app/lib/execution-engine/dist ./dist
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production

USER appuser
CMD ["node", "--enable-source-maps", "dist/index.mjs"]
