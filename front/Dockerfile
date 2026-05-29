FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_KEYCLOAK_URL=http://localhost:8080
ARG VITE_KEYCLOAK_REALM=shaderlab
ARG VITE_KEYCLOAK_CLIENT_ID=shaderlab_client

ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL
ENV VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM
ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

ENV BACKEND_URL=http://api:3000

COPY --from=build /app/dist /usr/share/nginx/html

RUN cat > /docker-entrypoint.d/99-frontend-config.sh <<'EOF_SCRIPT' \
  && chmod +x /docker-entrypoint.d/99-frontend-config.sh
#!/bin/sh
set -eu

cat > /etc/nginx/conf.d/default.conf <<EOF_NGINX
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass ${BACKEND_URL}/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location = /api {
        proxy_pass ${BACKEND_URL}/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF_NGINX
EOF_SCRIPT
