# ---- Stage 1: build the React app ----
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite outputs optimized, hashed assets to /app/dist
RUN npm run build

# ---- Stage 2: serve with nginx ----
# We can safely keep Alpine here because Nginx doesn't use Node.js
FROM nginx:1.25-alpine AS production
# Copy the built static files
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy our SPA-aware nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
