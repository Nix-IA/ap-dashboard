#!/bin/bash

# Script para triggerar deploy manual no Portainer
# Uso: ./trigger-deploy.sh [tag]

set -e

# Default tag
TAG="${1:-latest}"

echo "🚀 Triggering manual deploy to Portainer..."
echo "📦 Image tag: $TAG"
echo ""

# Trigger the workflow
gh workflow run deploy-only.yml --field image_tag="$TAG" --field force_pull=true

echo "✅ Deploy workflow triggered!"
echo "🔍 Monitor the progress:"
echo "   gh run list --workflow=deploy-only.yml --limit=5"
echo "   gh run watch"
echo ""
echo "🌐 Once deployed, check: https://<your-domain>"
echo ""
echo "💡 Available commands:"
echo "   gh run list --workflow=deploy-only.yml    # List deploy runs"
echo "   gh run view <run-id>                      # View specific run"
echo "   gh run view <run-id> --log                # View logs"
