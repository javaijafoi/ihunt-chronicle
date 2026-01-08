---
description: Atualiza o código em produção (Git Sync Cycle)
---

Siga estes passos quando o usuário pedir para "atualizar em produção" ou "fazer deploy":

1. **Verificar Status**
   - Execute `git status` para ver o que mudou.

2. **Stage Changes**
   - Execute `git add .` para adicionar todas as mudanças.

3. **Commit**
   - Gere uma mensagem de commit descritiva baseada nas mudanças feitas (git diff se necessário) OU pergunte ao usuário se preferir.
   - Execute `git commit -m "Sua mensagem aqui"`.

4. **Sincronizar (Pull)**
   - Execute `git pull` para trazer alterações remotas.
   - Se houver conflitos, **PARE** e resolva-os (ou peça ajuda ao usuário), depois continue.

5. **Enviar (Push)**
   - Execute `git push` para enviar o código atualizado.

6. **Confirmação**
   - Confirme para o usuário que o processo foi concluído e o código está atualizado.
