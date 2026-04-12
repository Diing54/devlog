# ---- Stage 1: install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# npm ci is faster and stricter than npm install (uses lockfile exactly)
RUN npm ci --only=production

# ---- Stage 2: production image ----
FROM node:20-alpine AS production
WORKDIR /app

# Copy only production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy application source
COPY src ./src

EXPOSE 3000

# Drop root privileges — run as the built-in 'node' user
USER node

CMD ["node", "src/index.js"]
