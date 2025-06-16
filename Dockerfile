# Dockerfile para Next.js (produção)
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install -g pnpm && pnpm install

RUN pnpm build

# Produção: imagem enxuta
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app .

RUN pnpm install --prod

EXPOSE 3000

CMD ["pnpm", "start"]
