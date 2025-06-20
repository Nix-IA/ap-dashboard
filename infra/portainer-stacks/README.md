# Portainer Stacks Organization

This directory contains Docker Compose configurations for each individual service stack deployed via Portainer.

## Structure

```text
infra/portainer-stacks/
├── agentpay-frontend/           # Next.js Frontend Application
├── agentpay-backend-api/        # Go Backend API
├── agentpay-webhook-service/    # Go Webhook Service
├── agentpay-queue-processor/    # Go Queue Processor
├── databases/                   # PostgreSQL, Redis
├── message-queue/              # RabbitMQ
├── monitoring/                 # Prometheus, Grafana
└── traefik/                    # Reverse Proxy & Load Balancer
```

## Deployment Strategy

### Individual Stacks (Production)

Each service is deployed as a separate Portainer stack:

- **Advantages:**
  - Independent deployment and rollback
  - Granular scaling per service  
  - Isolated failure impact
  - Better resource management
  - GitOps workflow per service

- **Naming Convention:**
  - Stack names: `agentpay-{service-name}`
  - Service names: `{service-name}` (simple)
  - Domains: `{service}.agentpay.com.br`

### Development (Local)

The root `docker-compose.yml` is used for local development with all services together.

## GitOps Workflow

Each stack can be configured with its own GitOps webhook pointing to its specific directory:

1. **Frontend Stack:** `infra/portainer-stacks/agentpay-frontend/`
2. **Backend API Stack:** `infra/portainer-stacks/agentpay-backend-api/`
3. **Webhook Service Stack:** `infra/portainer-stacks/agentpay-webhook-service/`
4. **Queue Processor Stack:** `infra/portainer-stacks/agentpay-queue-processor/`

## Environment Variables

Each stack has its own `.env.example` file with required environment variables. Copy to `.env` and configure for your environment.

## Networks

All application stacks use these external networks:

- `agent_network`: Internal communication between services
- `traefik_public`: External access via Traefik reverse proxy

## Health Checks

All services include health check endpoints:

- Frontend: `http://localhost:3000/api/health`
- Backend API: `http://localhost:8080/health`
- Webhook Service: `http://localhost:8081/health`
- Queue Processor: `http://localhost:8082/health`

## Resource Limits

Each service has defined resource limits appropriate for its workload:

- Frontend: 1 CPU, 1GB RAM
- Backend API: 0.5 CPU, 512MB RAM
- Webhook Service: 0.5 CPU, 256MB RAM
- Queue Processor: 0.5 CPU, 256MB RAM (2 replicas)
