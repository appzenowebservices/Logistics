# Production image for ALMS logistics (Next.js standalone).
# Build with:  docker compose build
# Run with:    docker compose up -d
# Requires `.env` next to docker-compose.yml with at least:
#   DATABASE_URL, AUTH_SECRET
# MONGODB_URI is an optional alias — if unset it defaults to DATABASE_URL.

# ---------- deps ----------
FROM docker.io/library/node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# ---------- builder ----------
FROM docker.io/library/node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 \
  NODE_OPTIONS="--max-old-space-size=2048"
# Build-time env (used by env validation; NOT baked from a file —
# compose passes these from the host `.env` via build.args).
ARG DATABASE_URL=""
ARG MONGODB_URI=""
ARG AUTH_SECRET=""
ARG SKIP_ENV_VALIDATION=""
ENV DATABASE_URL=$DATABASE_URL \
  MONGODB_URI=$MONGODB_URI \
  AUTH_SECRET=$AUTH_SECRET \
  SKIP_ENV_VALIDATION=$SKIP_ENV_VALIDATION
RUN npx prisma generate
RUN npm run build

# ---------- runner (Next.js standalone) ----------
FROM docker.io/library/node:20-alpine AS runner
RUN apk add --no-cache openssl wget
WORKDIR /app
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000 \
  HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
