#!/bin/bash

echo "🔍 Verificando se o deploy foi efetivado no Portainer..."

# Check if we have the required secrets to verify
if [ -z "$PORTAINER_URL" ] || [ -z "$PORTAINER_API_KEY" ] || [ -z "$PORTAINER_STACK_ID" ]; then
    echo "⚠️  Para verificar programaticamente, você precisa das variáveis:"
    echo "   export PORTAINER_URL='https://your-portainer.com'"
    echo "   export PORTAINER_API_KEY='your-api-key'"
    echo "   export PORTAINER_STACK_ID='123'"
    echo ""
    echo "💡 Alternativas para verificar:"
    echo "1. 🌐 Acesse o frontend: https://seu-dominio.com"
    echo "2. 🐳 Vá no Portainer UI > Stacks > seu-stack"
    echo "3. 📊 Veja se os containers foram reiniciados"
    echo "4. 🕒 Verifique se o timestamp de 'last updated' mudou"
    exit 0
fi

echo "📡 Consultando Portainer API..."

# Get stack info
STACK_INFO=$(curl -s -H "X-API-Key: $PORTAINER_API_KEY" \
    "$PORTAINER_URL/api/stacks/$PORTAINER_STACK_ID")

if [[ $? -ne 0 ]] || [[ -z "$STACK_INFO" ]]; then
    echo "❌ Erro ao conectar com Portainer"
    exit 1
fi

echo "✅ Stack encontrado!"

# Extract last update time (if available in the response)
UPDATED_AT=$(echo "$STACK_INFO" | grep -o '"UpdatedAt":"[^"]*' | cut -d'"' -f4)
STATUS=$(echo "$STACK_INFO" | grep -o '"Status":[0-9]*' | cut -d':' -f2)

if [[ -n "$UPDATED_AT" ]]; then
    echo "🕒 Última atualização: $UPDATED_AT"
else
    echo "🕒 Timestamp de atualização não disponível na resposta"
fi

if [[ -n "$STATUS" ]]; then
    case $STATUS in
        1) echo "📊 Status: Running ✅" ;;
        2) echo "📊 Status: Stopped ⛔" ;;
        *) echo "📊 Status: $STATUS" ;;
    esac
fi

# Get containers from the stack
echo ""
echo "🐳 Verificando containers do stack..."
SERVICES=$(curl -s -H "X-API-Key: $PORTAINER_API_KEY" \
    "$PORTAINER_URL/api/stacks/$PORTAINER_STACK_ID/services")

if [[ $? -eq 0 ]] && [[ "$SERVICES" != "null" ]]; then
    echo "✅ Serviços encontrados"
    # Try to extract service names or count
    SERVICE_COUNT=$(echo "$SERVICES" | grep -o '"Name":"[^"]*' | wc -l)
    echo "📈 Número de serviços: $SERVICE_COUNT"
else
    echo "⚠️  Não foi possível obter informações dos serviços"
fi

echo ""
echo "🎯 Para confirmar o deploy:"
echo "1. ✅ Workflow GitHub Actions passou"
echo "2. ✅ Curl para Portainer retornou sucesso"
echo "3. 🔍 Verifique manualmente:"
echo "   - Acesse https://seu-dominio.com"
echo "   - Vá no Portainer UI e veja os containers"
echo "   - Verifique se há mudanças visuais/funcionais"
