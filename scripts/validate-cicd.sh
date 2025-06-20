#!/bin/bash

# CI/CD Pipeline Validation Script
# This script validates that all components are properly configured

set -e

echo "🔍 AP Dashboard - CI/CD Pipeline Validation"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" = "ok" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️ $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# Function to check file exists
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        print_status "ok" "$description: $file"
        return 0
    else
        print_status "error" "$description: $file (NOT FOUND)"
        return 1
    fi
}

# Function to check directory exists
check_directory() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        print_status "ok" "$description: $dir"
        return 0
    else
        print_status "error" "$description: $dir (NOT FOUND)"
        return 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/frontend" ]; then
    print_status "error" "Please run this script from the root of the AP Dashboard repository"
    exit 1
fi

echo "📁 Repository Structure"
echo "======================"

# Check main directories
check_directory "apps/frontend" "Frontend app directory"
check_directory "packages" "Packages directory"
check_directory "infra" "Infrastructure directory"
check_directory ".github/workflows" "GitHub workflows directory"

echo ""
echo "📄 CI/CD Files"
echo "=============="

# Check CI/CD files
check_file ".github/workflows/ci-cd.yml" "Main CI/CD workflow"
check_file "apps/frontend/Dockerfile" "Frontend Dockerfile"
check_file "apps/frontend/next.config.ts" "Next.js configuration"
check_file "apps/frontend/src/app/api/health/route.ts" "Health check endpoint"

echo ""
echo "🐳 Docker & Portainer Files"
echo "=========================="

# Check Docker and Portainer files
check_file "infra/portainer-stacks/agentpay-frontend/docker-compose.yml" "Portainer Docker Compose"
check_file "infra/portainer-stacks/agentpay-frontend/.env.example" "Environment variables example"

echo ""
echo "🪝 Git Hooks"
echo "==========="

# Check Git hooks
check_file ".husky/pre-commit" "Pre-commit hook"
check_file ".husky/pre-push" "Pre-push hook"

echo ""
echo "📋 Package Configuration"
echo "======================="

# Check package.json files
check_file "package.json" "Root package.json"
check_file "apps/frontend/package.json" "Frontend package.json"

# Check if pnpm is configured
if grep -q "pnpm" package.json; then
    print_status "ok" "PNPM configuration found in package.json"
else
    print_status "warning" "PNPM configuration not found in package.json"
fi

echo ""
echo "🔧 Next.js Configuration"
echo "======================="

# Check Next.js standalone configuration
if grep -q "standalone" apps/frontend/next.config.ts; then
    print_status "ok" "Next.js standalone output configured"
else
    print_status "error" "Next.js standalone output NOT configured"
fi

echo ""
echo "🏥 Health Check"
echo "============="

# Check if health endpoint is properly set up
if [ -f "apps/frontend/src/app/api/health/route.ts" ]; then
    if grep -q "NextResponse" apps/frontend/src/app/api/health/route.ts; then
        print_status "ok" "Health check endpoint properly configured"
    else
        print_status "warning" "Health check endpoint might need review"
    fi
fi

echo ""
echo "📦 Dependencies Check"
echo "==================="

# Check if required tools are available
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "ok" "Node.js installed: $NODE_VERSION"
else
    print_status "error" "Node.js not installed"
fi

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    print_status "ok" "PNPM installed: $PNPM_VERSION"
else
    print_status "warning" "PNPM not installed locally (CI will install it)"
fi

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    print_status "ok" "Docker installed: $DOCKER_VERSION"
else
    print_status "warning" "Docker not installed locally (only needed for local testing)"
fi

if command -v gh &> /dev/null; then
    print_status "ok" "GitHub CLI installed"
else
    print_status "warning" "GitHub CLI not installed (helpful for secrets management)"
fi

echo ""
echo "🔐 GitHub Secrets"
echo "================"

echo "Required secrets for CI/CD:"
echo "- PORTAINER_URL"
echo "- PORTAINER_API_KEY" 
echo "- PORTAINER_STACK_ID"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- NEXT_PUBLIC_APP_URL"
echo "- FRONTEND_DOMAIN"

if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    echo ""
    echo "💡 You can use the setup script to configure secrets:"
    echo "   ./scripts/setup-github-secrets.sh"
else
    print_status "warning" "GitHub CLI not configured - manual secret setup required"
fi

echo ""
echo "🚀 Ready to Deploy?"
echo "=================="

# Final validation
if [ -f ".github/workflows/ci-cd.yml" ] && [ -f "apps/frontend/Dockerfile" ] && grep -q "standalone" apps/frontend/next.config.ts; then
    print_status "ok" "Pipeline files are configured correctly"
    echo ""
    echo "🎉 Your CI/CD pipeline is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Configure GitHub secrets (use ./scripts/setup-github-secrets.sh)"
    echo "2. Set up Portainer stack with the docker-compose.yml"
    echo "3. Push to main branch to trigger the pipeline"
    echo "4. Monitor the deployment in GitHub Actions"
else
    print_status "error" "Some critical files are missing or misconfigured"
    echo ""
    echo "Please review the errors above and fix them before deploying."
fi

echo ""
echo "📚 For detailed setup instructions, see: CI_CD_SETUP.md"
