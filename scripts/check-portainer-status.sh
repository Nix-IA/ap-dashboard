#!/bin/bash

# Script para verificar o status do deploy no Portainer
# Este script consulta a API do Portainer para verificar o status atual do stack

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

# Verificar se as variáveis de ambiente necessárias estão definidas
check_env_vars() {
    local required_vars=("PORTAINER_URL" "PORTAINER_API_KEY" "PORTAINER_STACK_ID")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log $RED "❌ Variáveis de ambiente necessárias não estão definidas:"
        for var in "${missing_vars[@]}"; do
            log $RED "   - $var"
        done
        log $YELLOW "💡 Configure essas variáveis antes de executar o script:"
        log $YELLOW "   export PORTAINER_URL='https://your-portainer-url'"
        log $YELLOW "   export PORTAINER_API_KEY='your-api-key'"
        log $YELLOW "   export PORTAINER_STACK_ID='your-stack-id'"
        exit 1
    fi
}

# Verificar conectividade com o Portainer
check_portainer_connectivity() {
    log $BLUE "🔍 Verificando conectividade com Portainer..."
    
    local response
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "X-API-Key: $PORTAINER_API_KEY" \
        "$PORTAINER_URL/api/status" || echo "000")
    
    if [[ "$response" == "200" ]]; then
        log $GREEN "✅ Conectividade com Portainer OK"
    else
        log $RED "❌ Falha na conectividade com Portainer (HTTP $response)"
        log $YELLOW "   Verifique se PORTAINER_URL e PORTAINER_API_KEY estão corretos"
        exit 1
    fi
}

# Obter informações do stack
get_stack_info() {
    log $BLUE "📋 Obtendo informações do stack..."
    
    local stack_info
    stack_info=$(curl -s \
        -H "X-API-Key: $PORTAINER_API_KEY" \
        "$PORTAINER_URL/api/stacks/$PORTAINER_STACK_ID" || echo "")
    
    if [[ -z "$stack_info" ]] || echo "$stack_info" | grep -q '"error"'; then
        log $RED "❌ Erro ao obter informações do stack ID: $PORTAINER_STACK_ID"
        log $YELLOW "   Verifique se o PORTAINER_STACK_ID está correto"
        return 1
    fi
    
    local stack_name status
    stack_name=$(echo "$stack_info" | jq -r '.Name // "N/A"')
    status=$(echo "$stack_info" | jq -r '.Status // "N/A"')
    
    log $GREEN "✅ Stack encontrado:"
    log $GREEN "   Nome: $stack_name"
    log $GREEN "   Status: $status"
    log $GREEN "   ID: $PORTAINER_STACK_ID"
    
    return 0
}

# Verificar status dos serviços do stack
check_services_status() {
    log $BLUE "🔍 Verificando status dos serviços..."
    
    # Obter endpoint ID (assumindo que é o primeiro endpoint)
    local endpoint_id
    endpoint_id=$(curl -s \
        -H "X-API-Key: $PORTAINER_API_KEY" \
        "$PORTAINER_URL/api/endpoints" | jq -r '.[0].Id // 1')
    
    # Obter serviços do stack
    local services
    services=$(curl -s \
        -H "X-API-Key: $PORTAINER_API_KEY" \
        "$PORTAINER_URL/api/endpoints/$endpoint_id/docker/services" || echo "[]")
    
    if [[ "$services" == "[]" ]] || [[ -z "$services" ]]; then
        log $YELLOW "⚠️  Nenhum serviço encontrado ou erro ao obter serviços"
        return 1
    fi
    
    log $GREEN "📊 Serviços encontrados:"
    echo "$services" | jq -r '.[] | select(.Spec.Labels."com.docker.stack.namespace" != null) | 
        "   - " + .Spec.Name + 
        " | Replicas: " + (.Spec.Mode.Replicated.Replicas // 0 | tostring) + 
        "/" + (.Status.RunningTasks // 0 | tostring) + 
        " | Updated: " + (.UpdatedAt // "N/A")'
    
    return 0
}

# Verificar último deploy
check_last_deployment() {
    log $BLUE "📅 Verificando informações do último deploy..."
    
    local stack_info
    stack_info=$(curl -s \
        -H "X-API-Key: $PORTAINER_API_KEY" \
        "$PORTAINER_URL/api/stacks/$PORTAINER_STACK_ID")
    
    local updated_at creation_date
    updated_at=$(echo "$stack_info" | jq -r '.UpdateDate // .CreationDate // 0')
    creation_date=$(echo "$stack_info" | jq -r '.CreationDate // 0')
    
    if [[ "$updated_at" != "0" ]] && [[ "$updated_at" != "null" ]]; then
        local updated_human
        updated_human=$(date -r "$updated_at" 2>/dev/null || echo "N/A")
        log $GREEN "✅ Último update: $updated_human"
    else
        log $YELLOW "⚠️  Data do último update não disponível"
    fi
    
    if [[ "$creation_date" != "0" ]] && [[ "$creation_date" != "null" ]]; then
        local created_human
        created_human=$(date -r "$creation_date" 2>/dev/null || echo "N/A")
        log $GREEN "📅 Criado em: $created_human"
    fi
}

# Função principal
main() {
    log $BLUE "🚀 Verificando status do deploy no Portainer..."
    echo
    
    check_env_vars
    echo
    
    check_portainer_connectivity
    echo
    
    if get_stack_info; then
        echo
        check_services_status
        echo
        check_last_deployment
        echo
        log $GREEN "🎉 Verificação concluída!"
    else
        log $RED "❌ Falha na verificação do stack"
        exit 1
    fi
}

# Verificar se jq está instalado
if ! command -v jq &> /dev/null; then
    log $RED "❌ jq não está instalado. Instale com:"
    log $YELLOW "   macOS: brew install jq"
    log $YELLOW "   Ubuntu/Debian: sudo apt-get install jq"
    exit 1
fi

# Executar apenas se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
