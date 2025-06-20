# Dockerfile para Next.js (produção)

# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install -g pnpm && pnpm install --frozen-lockfile

# NÃO copie .env.production!
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm in final image
RUN npm install -g pnpm

COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/node_modules node_modules

# NÃO copie .env.production!

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "start"]
