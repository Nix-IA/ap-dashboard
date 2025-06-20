#!/bin/bash

# GitHub Secrets Setup Script for AP Dashboard CI/CD
# This script helps you configure the required GitHub secrets for the CI/CD pipeline

set -e

echo "🔧 AP Dashboard - GitHub Secrets Setup"
echo "======================================"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it first: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ You are not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository info
REPO=$(git remote get-url origin | sed 's/.*github.com[:/]\([^.]*\).*/\1/')
echo "📁 Repository: $REPO"
echo ""

# Function to set secret
set_secret() {
    local name=$1
    local description=$2
    local default_value=$3
    
    echo "🔐 Setting up: $name"
    echo "Description: $description"
    
    if [ -n "$default_value" ]; then
        echo "Default/Example: $default_value"
    fi
    
    read -p "Enter value (or press Enter to skip): " value
    
    if [ -n "$value" ]; then
        echo "$value" | gh secret set "$name" --repo "$REPO"
        echo "✅ Secret '$name' set successfully"
    else
        echo "⏭️ Skipped '$name'"
    fi
    echo ""
}

echo "Required secrets for CI/CD pipeline:"
echo ""

# Portainer Configuration
echo "🚢 PORTAINER CONFIGURATION"
echo "=========================="
set_secret "PORTAINER_URL" "Your Portainer instance URL" "https://portainer.yourdomain.com"
set_secret "PORTAINER_API_KEY" "API key for Portainer access" ""
set_secret "PORTAINER_STACK_ID" "Stack ID from Portainer (numeric)" ""

# AWS Configuration
echo "☁️ AWS CONFIGURATION"
echo "===================="
set_secret "AWS_ACCESS_KEY_ID" "AWS Access Key ID for ECR access" ""
set_secret "AWS_SECRET_ACCESS_KEY" "AWS Secret Access Key for ECR access" ""

# Supabase Configuration
echo "🗃️ SUPABASE CONFIGURATION"
echo "========================="
set_secret "NEXT_PUBLIC_SUPABASE_URL" "Your Supabase project URL" "https://your-project.supabase.co"
set_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anonymous key" ""

# Application Configuration
echo "🌐 APPLICATION CONFIGURATION"
echo "============================"
set_secret "NEXT_PUBLIC_APP_URL" "Public URL for your application" "https://dashboard.yourdomain.com"
set_secret "FRONTEND_DOMAIN" "Domain for frontend service" "dashboard.yourdomain.com"

# Optional: Sentry Configuration
echo "📊 SENTRY CONFIGURATION (Optional)"
echo "=================================="
echo "These are optional for error monitoring:"
set_secret "NEXT_PUBLIC_SENTRY_DSN" "Sentry DSN for error tracking (optional)" ""
set_secret "NEXT_PUBLIC_SENTRY_ORG" "Sentry organization slug (optional)" ""
set_secret "NEXT_PUBLIC_SENTRY_PROJECT" "Sentry project slug (optional)" ""

echo "🎉 GitHub Secrets setup completed!"
echo ""
echo "Next steps:"
echo "1. Create a Portainer stack using: infra/portainer-stacks/agentpay-frontend/"
echo "2. Configure your .env variables in Portainer based on .env.example"
echo "3. Note the Stack ID and update PORTAINER_STACK_ID secret if needed"
echo "4. Test the pipeline by pushing to main branch"
echo ""
echo "📚 For detailed instructions, see: CI_CD_SETUP.md"
