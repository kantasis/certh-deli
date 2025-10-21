# Stage 1: Build React app
FROM node:20-bullseye-slim AS builder
WORKDIR /app

COPY spreact_react_app/package*.json ./
RUN npm install
COPY spreact_react_app/ ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Minimal Nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
