# ==============================================================================
# Frontend Dockerfile (React + Vite + TypeScript + Nginx)
# Multi-stage build for optimized production serving
# ==============================================================================

# --- Stage 1: Build Application ---
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vite environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install

# Copy source and config files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src

# Build production bundle
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine AS runner

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
