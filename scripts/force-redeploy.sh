#!/bin/bash

echo "🚀 Force Redeploy - múltiplos métodos disponíveis..."

# Default value  echo ""
  echo "🐳  echo ""
  echo "✅ Force Redeploy workflow triggered!"
  echo "🔍 Monitor the progress:"
  echo "   gh run list --workflow=force-redeploy.yml --limit=5"
  echo "   gh run watch"
  echo ""
  echo "🐳 Este workflow vai tentar forçar o redeploy usando: $METHOD"
  
  # Wait a bit for the workflow to complete
  echo ""
  echo "⏳ Waiting 45 seconds for workflow to complete..."
  sleep 45
  
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
  rm -f /tmp/webhook_response.txttentar forçar o redeploy usando: $METHOD"
  echo "🌐 Após concluir, verifique se o timestamp no Portainer mudou"
  
  # Wait a bit for the workflow to complete
  echo ""
  echo "⏳ Waiting 45 seconds for workflow to complete..."
  sleep 45
  
  # Trigger Portainer redeploy via stack ID
  echo "🔄 Triggering Portainer redeploy for stack ID 30..."
  WEBHOOK_RESPONSE=$(curl -s -w "%{http_code}" \
    -X POST \
    "https://portainer.agentpay.com.br/api/stacks/30/redeploy" \
    -H "X-API-Key: ptr_5uIDyNgV9X5I2FEOaQVEjKJQ5pKB/s6g" \
    -o /tmp/webhook_response.txt)
  
  if [ "$WEBHOOK_RESPONSE" = "200" ] || [ "$WEBHOOK_RESPONSE" = "202" ]; then
    echo "✅ Portainer redeploy triggered successfully!"
    echo "🌐 Check the app at: https://app.agentpay.com.br"
  else
    echo "⚠️  Portainer redeploy returned status: $WEBHOOK_RESPONSE"
    echo "Response: $(cat /tmp/webhook_response.txt 2>/dev/null || echo 'No response body')"
  fi
  
  # Clean up temp file
  rm -f /tmp/webhook_response.txtatest"
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
  
  echo ""
  echo "🚨 Manual action needed:"
  echo "� Access Portainer at: https://portainer.agentpay.com.br"
  echo "🔄 Manually redeploy the 'frontend' stack to pull the new image"
  echo "🌐 Then check the app at: https://app.agentpay.com.br"
  
  # TODO: Fix webhook ID and re-enable automatic redeploy
  # echo "⏳ Waiting 45 seconds for workflow to complete..."
  # sleep 45
  # echo "🔄 Triggering Portainer redeploy via webhook..."
else
  echo "❌ Failed to trigger workflow"
  exit 1
fi
