#!/bin/bash

echo "🚀 Force Redeploy - múltiplos métodos disponíveis..."

# Default values
IMAGE_TAG="latest"
METHOD="service-update"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --method)
      METHOD="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--tag IMAGE_TAG] [--method METHOD]"
      echo ""
      echo "Options:"
      echo "  --tag IMAGE_TAG       Docker image tag to deploy (default: latest)"
      echo "  --method METHOD       Deploy method:"
      echo "                          service-update  - Force update services (recommended)"
      echo "                          stack-restart   - Stop and start stack"
      echo "                          git-redeploy    - Git redeploy (only for Git stacks)"
      echo "  -h, --help           Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                                    # Service update with latest"
      echo "  $0 --method stack-restart             # Full stack restart"
      echo "  $0 --tag v1.2.3 --method git-redeploy # Git redeploy with specific tag"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

# Validate method
case "$METHOD" in
    "service-update"|"stack-restart"|"git-redeploy")
        ;;
    *)
        echo "❌ Invalid method: $METHOD"
        echo "Valid methods: service-update, stack-restart, git-redeploy"
        exit 1
        ;;
esac

echo "📦 Image tag: $IMAGE_TAG"
echo "🔧 Method: $METHOD"

case "$METHOD" in
    "service-update")
        echo "💡 Este método força a atualização dos serviços Docker do stack"
        ;;
    "stack-restart")
        echo "💡 Este método para e inicia o stack completo (mais demorado)"
        ;;
    "git-redeploy")
        echo "💡 Este método só funciona se o stack foi criado a partir de Git"
        ;;
esac

echo ""
read -p "Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelado"
    exit 0
fi

# Trigger the workflow
gh workflow run force-redeploy.yml \
  --field image_tag="$IMAGE_TAG" \
  --field method="$METHOD"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Force Redeploy workflow triggered!"
  echo "🔍 Monitor the progress:"
  echo "   gh run list --workflow=force-redeploy.yml --limit=5"
  echo "   gh run watch"
  echo ""
  echo "🐳 Este workflow vai tentar forçar o redeploy usando: $METHOD"
  echo "🌐 Após concluir, verifique se o timestamp no Portainer mudou"
  
  # Wait a bit for the workflow to complete
  echo ""
  echo "⏳ Waiting 45 seconds for workflow to complete..."
  sleep 45
  
  # Trigger Portainer redeploy via webhook
  echo "🔄 Triggering Portainer redeploy via webhook..."
  WEBHOOK_RESPONSE=$(curl -s -w "%{http_code}" \
    -X POST \
    "https://portainer.agentpay.com.br/api/stacks/webhooks/01JGJCNHP6MNBZR4ZRJZDWDGNR" \
    -o /tmp/webhook_response.txt)
  
  if [ "$WEBHOOK_RESPONSE" = "200" ]; then
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
