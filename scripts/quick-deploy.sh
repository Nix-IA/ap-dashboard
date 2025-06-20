#!/bin/bash

echo "🚀 Quick Deploy - usando configuração exata do workflow principal..."

# Default values
IMAGE_TAG="latest"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--tag IMAGE_TAG]"
      echo ""
      echo "Options:"
      echo "  --tag IMAGE_TAG    Docker image tag to deploy (default: latest)"
      echo "  -h, --help        Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "📦 Image tag: $IMAGE_TAG"

# Trigger the workflow
gh workflow run quick-deploy.yml \
  --field image_tag="$IMAGE_TAG"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Quick Deploy workflow triggered!"
  echo "🔍 Monitor the progress:"
  echo "   gh run list --workflow=quick-deploy.yml --limit=5"
  echo "   gh run watch"
  echo ""
  echo "💡 This uses the EXACT same deploy method as the main CI/CD workflow"
  
  # Wait a bit for the workflow to complete
  echo ""
  echo "⏳ Waiting 30 seconds for workflow to complete..."
  sleep 30
  
  # Trigger Portainer redeploy via webhook
  echo "🔄 Triggering Portainer redeploy..."
  WEBHOOK_RESPONSE=$(curl -s -w "%{http_code}" \
    -X POST \
    "https://portainer.agentpay.com.br/api/stacks/webhooks/d70f163c-675f-40b8-9769-8c37b3399cc2" \
    -o /tmp/webhook_response.txt)
  
  if [ "$WEBHOOK_RESPONSE" = "204" ]; then
    echo "✅ Portainer redeploy triggered successfully!"
    echo "🌐 Check the app at: https://app.agentpay.com.br"
  else
    echo "⚠️  Portainer webhook returned status: $WEBHOOK_RESPONSE"
    echo "Response: $(cat /tmp/webhook_response.txt 2>/dev/null || echo 'No response body')"
  fi
  
  # Clean up temp file
  rm -f /tmp/webhook_response.txt
else
  echo "❌ Failed to trigger workflow"
  exit 1
fi
