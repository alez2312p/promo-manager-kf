# ==============================================================================
# Backend Dockerfile (Node.js + TypeScript + Prisma)
# Multi-stage build for a lean, secure production image
# ==============================================================================

# --- Stage 1: Build & Compile ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for node-gyp / alpine if needed
RUN apk add --no-cache openssl

# Copy package descriptors
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source files and build
COPY src ./src
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner

WORKDIR /app

# Install openssl for Prisma engines in alpine
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=4000

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy Prisma schema and generated client from builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Create non-root user for security
USER node

EXPOSE 4000

CMD ["node", "dist/index.js"]
