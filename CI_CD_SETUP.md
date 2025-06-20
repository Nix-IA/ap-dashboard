# CI/CD Setup - AP Dashboard Frontend

Este documento descreve o fluxo completo de CI/CD implementado para o frontend do AP Dashboard, desde o merge na main até o deploy automático no Portainer.

## 🚀 Fluxo de CI/CD

### 1. Trigger

O pipeline é executado quando:

- **Push para main** com mudanças em:
  - `apps/frontend/**`
  - `packages/**`
  - `.github/workflows/ci-cd.yml`
- **Pull Requests** para main (apenas quality gates)

### 2. Stages do Pipeline

#### Stage 1: Quality Gates

- **Linting**: ESLint nos packages frontend, shared-types e supabase
- **Type Checking**: TypeScript check no frontend
- **Tests**: Execução de testes unitários
- **Build**: Build da aplicação Next.js

#### Stage 2: Build & Push Docker Image

- Build multi-stage do Docker com otimizações
- Push para GitHub Container Registry (GHCR)
- Tags: `latest`, `main-{sha}`, `main`
- Suporte para multi-arquitetura (linux/amd64, linux/arm64)
- Cache layers para builds mais rápidos

#### Stage 3: Security Scan

- Scan de vulnerabilidades com Trivy
- Upload dos resultados para GitHub Security tab
- Falha do pipeline em caso de vulnerabilidades críticas

#### Stage 4: Deploy to Portainer

- Deploy automático via Portainer API
- Update das variáveis de ambiente
- Pull da nova imagem Docker
- Redeploy do stack

#### Stage 5: Health Check

- Verificação da saúde da aplicação via `/api/health`
- 10 tentativas com timeout de 30s cada
- Falha do pipeline se health check não passar

#### Stage 6: Notifications

- Notificação de sucesso/falha do deployment
- Logs detalhados para debugging

## 🔧 Configuração Necessária

### GitHub Secrets

Configure os seguintes secrets no repositório GitHub:

```bash
# Portainer Configuration
PORTAINER_URL=https://your-portainer-url
PORTAINER_API_KEY=your-portainer-api-key
PORTAINER_STACK_ID=your-stack-id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://dashboard.yourdomain.com
FRONTEND_DOMAIN=dashboard.yourdomain.com

# Optional: Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_ORG=your-sentry-org
NEXT_PUBLIC_SENTRY_PROJECT=your-sentry-project
```

### Portainer Stack Configuration

1. Crie um stack no Portainer usando o arquivo `infra/portainer-stacks/agentpay-frontend/docker-compose.yml`
2. Configure as variáveis de ambiente baseadas no `.env.example`
3. Anote o Stack ID para configurar no GitHub

### GitHub Container Registry

1. O pipeline usa o `GITHUB_TOKEN` automático
2. Certifique-se que o repositório tem permissões para write packages
3. A imagem será publicada em: `ghcr.io/nix-ia/ap-dashboard-frontend`

## 📁 Arquivos do CI/CD

### Arquivos Principais

- `.github/workflows/ci-cd.yml` - Pipeline principal
- `apps/frontend/Dockerfile` - Multi-stage Docker build
- `apps/frontend/next.config.ts` - Configuração standalone
- `apps/frontend/src/app/api/health/route.ts` - Health check endpoint

### Arquivos de Deploy

- `infra/portainer-stacks/agentpay-frontend/docker-compose.yml` - Stack do Portainer
- `infra/portainer-stacks/agentpay-frontend/.env.example` - Variáveis de ambiente

### Hooks de Qualidade

- `.husky/pre-commit` - Prettier/formatting
- `.husky/pre-push` - Lint, test, build

## 🐳 Docker Configuration

### Multi-stage Build

1. **deps**: Instala dependências
2. **builder**: Build da aplicação
3. **runner**: Imagem final otimizada

### Otimizações

- Next.js standalone output
- Cache layers
- Multi-arquitetura
- Non-root user
- Health checks integrados

## 🔍 Health Check

Endpoint: `GET /api/health`

Resposta de sucesso:

```json
{
  "status": "healthy",
  "timestamp": "2025-06-20T10:30:00.000Z",
  "uptime": 120.45,
  "environment": "production",
  "version": "1.0.0"
}
```

## 🚦 Monitoramento

### Logs

- GitHub Actions logs para cada stage
- Portainer container logs
- Health check status

### Alertas

- Pipeline failure notifications
- Health check failures
- Security scan alerts

## 🔄 Processo de Deploy

### Automático (Produção)

1. Merge para `main`
2. Pipeline executa automaticamente
3. Deploy no Portainer se todos os checks passarem
4. Health check confirma deploy bem-sucedido

### Manual (Se necessário)

```bash
# Redeployar stack manualmente no Portainer
curl -X POST "$PORTAINER_URL/api/stacks/$STACK_ID/git/redeploy" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prune": true, "pullImage": true}'
```

## 🛡️ Segurança

### Scans Automáticos

- Trivy vulnerability scanner
- Dependency audit
- SARIF upload para GitHub Security

### Best Practices

- Non-root container user
- Minimal base images
- Secret management via GitHub Secrets
- Network isolation no Portainer

## 📊 Métricas

### Performance

- Build time: ~5-8 minutos
- Deploy time: ~2-3 minutos
- Health check: ~1 minuto

### Qualidade

- Code coverage reportado
- Lint/type errors = pipeline failure
- Security vulnerabilities = pipeline failure

## 🔧 Troubleshooting

### Pipeline Failures

1. Verificar logs do GitHub Actions
2. Validar secrets e configurações
3. Testar health check endpoint
4. Verificar conectividade com Portainer

### Deploy Issues

1. Verificar logs do container no Portainer
2. Validar variáveis de ambiente
3. Verificar network connectivity
4. Revisar Traefik routing (se aplicável)

## 🎯 Próximos Passos

1. **Testes E2E**: Adicionar testes end-to-end
2. **Blue-Green Deploy**: Implementar deploy blue-green
3. **Rollback Automático**: Rollback em caso de falha no health check
4. **Monitoring**: Integrar com Prometheus/Grafana
5. **Slack Notifications**: Notificações de deploy no Slack
