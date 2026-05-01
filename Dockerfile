FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Generate Prisma client (skip database validation at build time)
COPY prisma ./prisma/
ENV SKIP_ENV_VALIDATION=true
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# NEXT_PUBLIC_* vars must be set at build time for client components
ARG NEXT_PUBLIC_DEALER_NAME="E&S Car Sales"
ARG NEXT_PUBLIC_DEALER_PHONE="+1 (941) 499-7415"
ARG NEXT_PUBLIC_DEALER_ADDRESS="1029 Airport-Pulling Rd unit c 49 Naples FL 34104"
ARG NEXT_PUBLIC_DEALER_EMAIL="info@eandscars.com"
ARG NEXT_PUBLIC_SITE_URL="https://eandscars.com"
ARG NEXT_PUBLIC_WHATSAPP_NUMBER="19414997415"

ENV NEXT_PUBLIC_DEALER_NAME=$NEXT_PUBLIC_DEALER_NAME
ENV NEXT_PUBLIC_DEALER_PHONE=$NEXT_PUBLIC_DEALER_PHONE
ENV NEXT_PUBLIC_DEALER_ADDRESS=$NEXT_PUBLIC_DEALER_ADDRESS
ENV NEXT_PUBLIC_DEALER_EMAIL=$NEXT_PUBLIC_DEALER_EMAIL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Install OpenSSL for Prisma and jq for JSON parsing
RUN apt-get update && apt-get install -y openssl ca-certificates jq && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Set environment variables for production
ENV DATABASE_URL="postgresql://postgres:Admin123@/esfront_dev?host=/cloudsql/es-cars-dev:us-east1:es-cars-dev-db"
ENV ADMIN_EMAIL="admin@eandscars.com"
ENV ADMIN_PASSWORD="your-admin-password-here"
ENV ADMIN_SESSION_SECRET="your-32-char-minimum-secret-key-here"
ENV NEXT_PUBLIC_DEALER_NAME="E&S Car Sales"
ENV NEXT_PUBLIC_DEALER_PHONE="+1 (941) 499-7415"
ENV NEXT_PUBLIC_DEALER_ADDRESS="1029 Airport-Pulling Rd unit c 49 Naples FL 34104"
ENV NEXT_PUBLIC_DEALER_EMAIL="info@eandscars.com"
ENV NEXT_PUBLIC_SITE_URL="https://eandscars.com"
ENV NEXT_PUBLIC_WHATSAPP_NUMBER="19414997415"
ENV GCS_BUCKET_NAME="es-cars-dev-images"
ENV GCS_PROJECT_ID="es-cars-dev"
ENV MAX_UPLOAD_SIZE_MB="5"

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
