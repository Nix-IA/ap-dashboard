# Dockerfile para Next.js (produção)
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm && pnpm install --frozen-lockfile

RUN pnpm build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "start"]
