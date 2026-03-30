FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc tsconfig.base.json ./
COPY lib/db/ lib/db/
COPY lib/api-zod/ lib/api-zod/
COPY artifacts/api-server/ artifacts/api-server/
RUN echo "node-linker=hoisted" >> .npmrc && pnpm install --prod=false
RUN mkdir -p node_modules/@workspace && \
    ln -s /app/lib/db node_modules/@workspace/db && \
    ln -s /app/lib/api-zod node_modules/@workspace/api-zod
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
