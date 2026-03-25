FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY lib/api-client-react/package.json lib/api-client-react/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/api-spec/package.json lib/api-spec/
COPY artifacts/control-plane/package.json artifacts/control-plane/
RUN pnpm install --prod=false

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/lib/api-client-react/node_modules ./lib/api-client-react/node_modules
COPY --from=deps /app/lib/api-zod/node_modules ./lib/api-zod/node_modules
COPY --from=deps /app/lib/api-spec/node_modules ./lib/api-spec/node_modules
COPY --from=deps /app/artifacts/control-plane/node_modules ./artifacts/control-plane/node_modules
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY lib/api-client-react/ lib/api-client-react/
COPY lib/api-zod/ lib/api-zod/
COPY lib/api-spec/ lib/api-spec/
COPY artifacts/control-plane/ artifacts/control-plane/
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN cd artifacts/control-plane && npx vite build --config vite.config.ts

FROM nginx:1.27-alpine AS production
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/nginx.conf.template
COPY --from=build /app/artifacts/control-plane/dist /usr/share/nginx/html

ENV API_UPSTREAM=http://api-server:8080
EXPOSE 8080
CMD ["/bin/sh", "-c", "envsubst '$API_UPSTREAM' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
