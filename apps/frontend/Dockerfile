# Multi-stage build for AP Dashboard Frontend
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./
COPY pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/supabase/package.json ./packages/supabase/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Accept build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set environment variables for build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=deps /app/packages/supabase/node_modules ./packages/supabase/node_modules

# Copy source code
COPY . .

# Build the application
RUN pnpm build --filter=@ap-dashboard/frontend

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application - for monorepo with standalone output
# The public folder needs to be copied to the right location
COPY --from=builder /app/apps/frontend/public ./public

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Copy the standalone server and static files
# For monorepo setup, the server.js is in the app root after standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./.next/static

# The standalone build puts server.js in the root of the standalone folder
# But in monorepo, we need to check the actual structure
RUN echo "=== Checking standalone structure ===" && \
    find /app -name "server.js" -type f && \
    echo "=== Contents of /app ===" && \
    ls -la /app/ && \
    echo "=== Contents of apps/frontend ===" && \
    ls -la /app/apps/frontend/ 2>/dev/null || echo "No apps/frontend dir"

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application - try different paths for server.js
CMD if [ -f "/app/server.js" ]; then \
        node server.js; \
    elif [ -f "/app/apps/frontend/server.js" ]; then \
        node apps/frontend/server.js; \
    else \
        echo "ERROR: server.js not found in expected locations" && \
        find /app -name "server.js" -type f && \
        exit 1; \
    fi
