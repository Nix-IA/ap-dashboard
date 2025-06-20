# Script de Verificação do Status no Portainer

Este script permite verificar o status atual do deploy no Portainer, incluindo informações sobre o stack, serviços e último deployment.

## Como Usar

### 1. Configurar Variáveis de Ambiente

Antes de executar o script, defina as seguintes variáveis de ambiente:

```bash
export PORTAINER_URL="https://your-portainer-url"
export PORTAINER_API_KEY="your-api-key"
export PORTAINER_STACK_ID="your-stack-id"
```

### 2. Executar o Script

```bash
# Dar permissão de execução (apenas na primeira vez)
chmod +x scripts/check-portainer-status.sh

# Executar o script
./scripts/check-portainer-status.sh
```

## O que o Script Verifica

1. **Conectividade**: Testa se consegue conectar na API do Portainer
2. **Informações do Stack**: Nome, status e ID do stack
3. **Status dos Serviços**: Lista todos os serviços do stack com suas réplicas
4. **Último Deploy**: Data e hora do último update do stack

## Exemplo de Output

```
🚀 Verificando status do deploy no Portainer...

🔍 Verificando conectividade com Portainer...
✅ Conectividade com Portainer OK

📋 Obtendo informações do stack...
✅ Stack encontrado:
   Nome: ap-dashboard-frontend
   Status: 1
   ID: 123

🔍 Verificando status dos serviços...
📊 Serviços encontrados:
   - ap-dashboard-frontend_app | Replicas: 1/1 | Updated: 2025-06-20T18:00:00Z

📅 Verificando informações do último deploy...
✅ Último update: Thu Jun 20 15:00:00 BRT 2025
📅 Criado em: Mon Jun 17 10:30:00 BRT 2025

🎉 Verificação concluída!
```

## Obter as Credenciais do Portainer

### PORTAINER_URL
A URL base do seu Portainer (ex: `https://portainer.yourdomain.com`)

### PORTAINER_API_KEY
1. Acesse o Portainer
2. Vá em **User settings** → **Access tokens**
3. Clique em **Add access token**
4. Defina um nome e validade
5. Copie o token gerado

### PORTAINER_STACK_ID
1. No Portainer, vá em **Stacks**
2. Clique no stack desejado
3. O ID aparece na URL: `/stacks/{ID}/`

## Usando com GitHub Actions

Para usar este script em CI/CD, adicione as variáveis como secrets no GitHub:

1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Adicione:
   - `PORTAINER_URL`
   - `PORTAINER_API_KEY`
   - `PORTAINER_STACK_ID`

## Troubleshooting

### Erro de conectividade
- Verifique se a URL está correta
- Verifique se o API key é válido
- Teste se o Portainer está acessível

### Stack não encontrado
- Verifique se o STACK_ID está correto
- Verifique se o API key tem permissão para acessar o stack

### jq não encontrado
Instale o jq:
- **macOS**: `brew install jq`
- **Ubuntu/Debian**: `sudo apt-get install jq`
- **Windows**: Baixe de https://jqlang.github.io/jq/
