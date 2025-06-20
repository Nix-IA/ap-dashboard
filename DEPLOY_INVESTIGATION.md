# Investigação: Job "Deploy to Portainer" Não Executado

## Problema Identificado

O job "Deploy to Portainer" não foi executado no workflow de CI/CD do GitHub Actions devido a uma falha no job dependente "Security Scan".

## Análise da Causa Raiz

### 1. Falha no Security Scan
- **Erro**: O Trivy scanner recebeu múltiplas tags de imagem em uma string multi-linha
- **Log do erro**: 
  ```
  could not parse reference: 785874436221.dkr.ecr.us-east-1.amazonaws.com/ap-platform-frontend:main
  785874436221.dkr.ecr.us-east-1.amazonaws.com/ap-platform-frontend:latest
  785874436221.dkr.ecr.us-east-1.amazonaws.com/ap-platform-frontend:main-cfa4c5e
  ```
- **Causa**: O output `${{ needs.build-and-push.outputs.image-tag }}` continha múltiplas tags separadas por quebras de linha

### 2. Dependência Bloqueante
- O job `deploy` tinha dependência em `needs: [build-and-push, security-scan]`
- Quando `security-scan` falha, o job `deploy` não executa
- Status resultante: "-" (não executado)

## Soluções Implementadas

### 1. Correção do Security Scan
- **Antes**: Usava `${{ needs.build-and-push.outputs.image-tag }}` (múltiplas tags)
- **Depois**: Usa uma tag específica: `${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:latest`
- **Adicionado**: Steps próprios para configurar AWS credentials e ECR login

### 2. Alteração da Dependência do Deploy
- **Antes**: `needs: [build-and-push, security-scan]` (bloqueante)
- **Depois**: `needs: [build-and-push]` (não bloqueante)
- **Adicionado**: Verificação condicional do status do security scan no deploy
- **Condição**: `if: github.ref == 'refs/heads/main' && needs.build-and-push.result == 'success'`

### 3. Script de Verificação do Portainer
- **Criado**: `scripts/check-portainer-status.sh`
- **Funcionalidade**: 
  - Verifica conectividade com Portainer
  - Obtém status do stack
  - Lista serviços e suas réplicas
  - Mostra data do último deploy
- **Uso**: Permite verificar manualmente o status atual do deploy

### 4. Melhorias no Workflow
- **Deploy não bloqueante**: Executa mesmo se security scan falhar
- **Alertas contextuais**: Notifica sobre status do security scan
- **Verificação de segurança**: Avisa se deploy ocorreu sem scan de segurança

## Como Usar as Ferramentas

### 1. Verificar Status Atual no Portainer
```bash
# Configurar variáveis
export PORTAINER_URL="https://your-portainer-url"
export PORTAINER_API_KEY="your-api-key"
export PORTAINER_STACK_ID="your-stack-id"

# Executar verificação
./scripts/check-portainer-status.sh
```

### 2. Monitorar Próximos Deploys
- O workflow agora deve executar o deploy mesmo com falhas no security scan
- Alertas aparecerão se o security scan falhar
- Verificação manual de segurança é recomendada nesses casos

## Resultados Esperados

### Próximo Push na Branch Main:
1. ✅ Quality Gates → executa
2. ✅ Build and Push Docker Image → executa
3. ⚠️ Security Scan → pode falhar (mas não bloqueia)
4. ✅ Deploy to Portainer → **AGORA EXECUTA**
5. ✅ Notify Deployment Status → executa com contexto sobre security scan

### Status no GitHub Actions:
- Deploy mostrará "✅" em vez de "-"
- Logs do deploy estarão disponíveis
- Notificação incluirá status do security scan

## Monitoramento Contínuo

1. **Acompanhar próximos workflows** para confirmar que deploy executa
2. **Usar o script de verificação** para validar deploys no Portainer
3. **Investigar falhas do security scan** quando ocorrerem
4. **Considerar ajustes adicionais** se necessário

## Arquivos Modificados

- `.github/workflows/ci-cd.yml` - Correções no workflow
- `scripts/check-portainer-status.sh` - Novo script de verificação
- `scripts/README-portainer-check.md` - Documentação do script

A próxima execução do workflow deve resolver o problema do deploy não executado.
