# AP Dashboard Monorepo

A modern monorepo architecture for the AP Dashboard system, built with Turbo, pnpm workspaces, and a clear separation between frontend, backend, and auxiliary services.

## 🏗️ Architecture

```text
ap-dashboard/
├── apps/                    # Main applications
│   ├── frontend/           # Next.js frontend
│   ├── backend-api/        # Go backend API
│   └── webhook-service/    # Go webhook service
├── packages/               # Shared packages
│   ├── shared-types/       # Shared TypeScript types
│   └── supabase/          # Supabase configuration
├── services/               # Auxiliary services
│   ├── queue-processor/    # Go queue processor
│   └── ai-agents/         # AI agents
└── infra/                 # Infrastructure and deployment
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Go 1.21+ (for backend services)
- Docker (optional)

### Installation

```bash
# Install dependencies for all packages
pnpm install

# Verify monorepo configuration
pnpm exec turbo build --filter="@ap-dashboard/shared-types"
```

### Main Scripts

```bash
# Development
pnpm dev                    # All services
pnpm frontend:dev          # Frontend only
pnpm backend:dev           # Backend API only
pnpm webhook:dev           # Webhook service only

# Build
pnpm build                 # Complete build
pnpm build --filter="frontend"  # Specific build

# Lint and formatting
pnpm lint                  # Lint all packages
pnpm format               # Format code

# Docker
pnpm docker:build         # Build Docker images
pnpm docker:up            # Start complete stack
```

## 📦 Packages

### @ap-dashboard/frontend

- **Technology**: Next.js 15, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **State**: Zustand
- **Authentication**: Supabase Auth

### @ap-dashboard/backend-api

- **Technology**: Go, Gin framework
- **Database**: PostgreSQL via Supabase
- **Port**: 8080

### @ap-dashboard/webhook-service

- **Technology**: Go, RabbitMQ
- **Port**: 8081

### @ap-dashboard/shared-types

- **Purpose**: Shared TypeScript types between frontend and backend
- **Includes**: User, API, Dashboard, Product, Webhook, Queue types

### @ap-dashboard/supabase

- **Purpose**: Supabase configuration and utilities
- **Includes**: Database types, migrations, configuration

## 🛠️ Development

### Features Structure

```text
src/features/
├── auth/                  # Authentication and authorization
├── profile/              # User profile
├── products/             # Product management
├── overview/             # Dashboard overview
├── integrations/         # Integrations
└── whatsapp/            # WhatsApp specific
```

### Shared Components

```text
src/components/
├── ui/                   # Base components (shadcn/ui)
├── layout/              # Layout components
└── ...                  # Other components
```

### Main Implemented Features

#### ✅ Authentication System

- Login/Signup with Supabase
- Secure password change
- User profile management

#### ✅ Dashboard Interface

- Responsive navigation with sidebar
- Dark/light theme mode
- Complete user profile

#### ✅ Monorepo Architecture

- Optimized build with Turbo
- Shared types
- Docker containerization

## 🔧 Environment Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Local Development

1. **Frontend only**:
   ```bash
   cd apps/frontend
   pnpm dev
   ```

2. **Complete stack**:
   ```bash
   pnpm dev
   ```

3. **With Docker**:
   ```bash
   docker-compose up -d
   ```

## 📊 Performance and Caching

- **Turbo Cache**: Automatic build and lint caching
- **Next.js**: Static generation and ISR
- **pnpm**: Efficient package management
- **Shared Dependencies**: Duplication reduction

## 🚦 CI/CD

### GitHub Actions
- Lint and type checking
- Build verification
- Automated testing
- Docker image building

### Deployment
- **Frontend**: Vercel/Netlify
- **Backend**: Railway/Render
- **Database**: Supabase

## 📁 Commit Structure

```text
feat: implement comprehensive monorepo architecture with Turbo
fix: correct logout redirect path from /login to /auth/sign-in
chore: update layout and optimize public assets
```

## 🔄 Migration Guide

To migrate existing code:

1. Move frontend code to `apps/frontend/`
2. Move backend code to `apps/backend-api/`
3. Extract shared types to `packages/shared-types/`
4. Configure Supabase in `packages/supabase/`

## 🤝 Contributing

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Create feature branch: `git checkout -b feature/my-feature`
4. Make changes and test: `pnpm build && pnpm lint`
5. Commit: `git commit -m "feat: add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create Pull Request

## 📝 Roadmap

- [ ] Complete Go services implementation
- [ ] Add comprehensive testing
- [ ] Implement real-time features
- [ ] Add monitoring and logging
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Internationalization

## 🏆 Benefits

✅ **Type Safety**: Shared types between frontend and backend  
✅ **Performance**: Parallel builds and intelligent cache  
✅ **Developer Experience**: Hot reload, automatic lint  
✅ **Scalability**: Microservices architecture  
✅ **Maintainability**: Organized and reusable code  

---

**Stack**: Next.js + Go + TypeScript + Supabase + Turbo + pnpm
