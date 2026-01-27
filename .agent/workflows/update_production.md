---
description: Atualiza o código em produção (Git Sync Cycle)
---

Siga estes passos quando o usuário pedir para "atualizar em produção" ou "fazer deploy".
**PADRÃO: O código deve ser sempre sincronizado em AMBOS os repositórios (Principal e Backup).**

1. **Verificar Status**
   - Execute `git status` para ver o que mudou.

2. **Stage Changes**
   - Execute `git add .` para adicionar todas as mudanças.

3. **Commit**
   - Gere uma mensagem de commit descritiva.
   - Execute `git commit -m "Sua mensagem aqui"`.

4. **Sincronizar (Pull)**
   - Execute `git pull origin` para garantir que está atualizado.
   - **Importante:** Se houver conflitos, resolva-os antes de prosseguir.

5. **Enviar (Push) - DUPLO DEPLOY**
   - Execute `git push origin`
   - Execute `git push target_repo`

6. **Confirmação**
   - Confirme para o usuário que o código foi atualizado em **ambos** os repositórios.
