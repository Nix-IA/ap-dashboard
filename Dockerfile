# Dockerfile para Next.js (produção)

# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install -g pnpm && pnpm install --frozen-lockfile

# NÃO copie .env.production!
RUN pnpm build

# Etapa de produção
FROM node:20-alpine AS runner

WORKDIR /app

# Instala pnpm na imagem final
RUN npm install -g pnpm

COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/node_modules node_modules

# NÃO copie .env.production!

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "start"]
