FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc tsconfig.base.json ./
COPY lib/api-client-react/ lib/api-client-react/
COPY lib/api-zod/ lib/api-zod/
COPY lib/api-spec/ lib/api-spec/
COPY artifacts/control-plane/ artifacts/control-plane/
RUN echo "node-linker=hoisted" >> .npmrc && pnpm install --frozen-lockfile=false
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm --filter @workspace/control-plane run build

FROM nginx:1.27-alpine AS production
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/*
COPY docker/nginx-main.conf /etc/nginx/nginx.conf.template
COPY --from=build /app/artifacts/control-plane/dist/public /usr/share/nginx/html

ENV API_UPSTREAM=http://api-server:8080
EXPOSE 8080
CMD ["/bin/sh", "-c", "API_HOST=$(echo $API_UPSTREAM | sed 's|https://||') && sed -e \"s|API_UPSTREAM_PLACEHOLDER|$API_UPSTREAM|g\" -e \"s|API_UPSTREAM_HOST_PLACEHOLDER|$API_HOST|g\" /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]
