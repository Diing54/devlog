# ---- Stage 1: install dependencies ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Replaced --only=production to fix the npm deprecation warning
RUN npm ci --omit=dev

# ---- Stage 2: production image ----
FROM node:24-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling (graceful shutdowns)
RUN apk add --no-cache dumb-init

# Enforce production configurations at the engine level
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src

# Ensure the node user owns the working directory
RUN chown -R node:node /app

EXPOSE 3000

# Drop root privileges
USER node

# Wrap the node process in dumb-init
CMD ["dumb-init", "node", "src/index.js"]
