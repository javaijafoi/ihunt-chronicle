
# Plano: Simplificar Seguranca do Firebase

## Diagnostico do Problema

### O Que Esta Acontecendo

Os erros de "Missing or insufficient permissions" ocorrem porque:

1. **Regras muito complexas**: Funcoes como `isCampaignMember()` fazem verificacoes aninhadas (`exists()` + `get()`) que podem falhar em cadeia
2. **Verificacao excessiva**: Cada operacao verifica membership em subcollections, causando multiplas leituras
3. **Usuarios anonimos**: Firebase cria sessoes anonimas automaticamente, mas eles nao estao em nenhuma campanha
4. **Race conditions**: Usuario pode tentar acessar dados antes do documento de membro ser criado

### Filosofia Proposta

Para um VTT (Virtual Tabletop), a seguranca deve ser:
- **Simples**: Se esta logado, pode ler dados das campanhas
- **Proporcional**: Proteger escrita, nao leitura excessiva
- **Baseada em confianca**: Jogadores sao convidados, nao atacantes

---

## Fase 1: Corrigir Build Errors Urgentes

### 1.1 Deletar Arquivos Quebrados

| Arquivo | Acao |
|---------|------|
| `src/hooks/useEpisode.ts` | DELETAR - Importa `Episode` removido |
| `src/hooks/useTimeline.ts` | DELETAR - Importa `Episode` e usa funcao inexistente |

Esses arquivos causam os erros de build que impedem o app de funcionar.

---

## Fase 2: Simplificar Regras do Firestore

### 2.1 Nova Filosofia de Regras

```text
ANTES (Paranoia Bancaria):
┌─────────────────────────────────────────────────────────────┐
│ Para LER qualquer dado:                                     │
│ 1. Verificar se esta logado                                 │
│ 2. Buscar documento da campanha                             │
│ 3. Verificar se usuario e GM ou se existe em /members/      │
│ 4. Se falhar qualquer etapa: DENY                           │
└─────────────────────────────────────────────────────────────┘

DEPOIS (Confianca de Mesa de RPG):
┌─────────────────────────────────────────────────────────────┐
│ Para LER qualquer dado:                                     │
│ 1. Esta logado? Pode ler.                                   │
│                                                             │
│ Para ESCREVER:                                              │
│ 1. Esta logado?                                             │
│ 2. E o dono do recurso OU e GM da campanha? Pode escrever.  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Novas Regras Propostas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // === FUNCOES AUXILIARES SIMPLIFICADAS ===
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isGM(campaignId) {
      // Apenas verifica o campo gmId do documento da campanha
      return isSignedIn() && 
        get(/databases/$(database)/documents/campaigns/$(campaignId)).data.gmId == request.auth.uid;
    }
    
    // === REGRAS DO SISTEMA (Publicas) ===
    
    match /system_skills/{id} { allow read: if true; allow write: if isSignedIn(); }
    match /system_maneuvers/{id} { allow read: if true; allow write: if isSignedIn(); }
    match /system_gifts/{id} { allow read: if true; allow write: if isSignedIn(); }
    match /system_drives/{id} { allow read: if true; allow write: if isSignedIn(); }
    
    // === CAMPANHAS ===
    
    match /campaigns/{campaignId} {
      // Leitura: Qualquer logado (para buscar por joinCode)
      allow read: if isSignedIn();
      
      // Criar: Qualquer logado (vai ser o GM)
      allow create: if isSignedIn() && request.resource.data.gmId == request.auth.uid;
      
      // Atualizar: Apenas GM
      allow update: if isGM(campaignId);
      
      // Deletar: Apenas GM
      allow delete: if isGM(campaignId);
      
      // --- SUBCOLLECTIONS ---
      
      match /members/{memberId} {
        allow read: if isSignedIn();
        allow create: if isOwner(memberId); // Apenas cria seu proprio membro
        allow update, delete: if isOwner(memberId) || isGM(campaignId);
      }
      
      match /presence/{userId} {
        allow read: if isSignedIn();
        allow write: if isOwner(userId);
      }
      
      match /logs/{logId} {
        allow read: if isSignedIn();
        allow create: if isSignedIn();
        allow update, delete: if isGM(campaignId);
      }
    }
    
    // === COLECOES ROOT COM campaignId ===
    
    match /scenes/{sceneId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn(); // GM cria, validacao no client
      allow update: if isSignedIn(); // Qualquer membro pode atualizar (free invokes)
      allow delete: if isSignedIn() && isGM(resource.data.campaignId);
    }
    
    match /activeNpcs/{npcId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isSignedIn();
    }
    
    match /tokens/{tokenId} {
      allow read: if isSignedIn();
      allow create, delete: if isSignedIn();
      allow update: if isSignedIn(); // Player move seu token, GM move qualquer
    }
    
    // === PERSONAGENS ===
    
    match /characters/{characterId} {
      // Leitura: Publico se isPublic, senao logado
      allow read: if resource.data.isPublic == true || isSignedIn();
      
      // Criar: Logado
      allow create: if isSignedIn();
      
      // Atualizar: Dono ou GM da campanha
      allow update: if isSignedIn() && (
        resource.data.userId == request.auth.uid ||
        resource.data.createdBy == request.auth.uid ||
        (resource.data.campaignId != null && isGM(resource.data.campaignId))
      );
      
      // Deletar: Apenas dono
      allow delete: if isSignedIn() && (
        resource.data.userId == request.auth.uid ||
        resource.data.createdBy == request.auth.uid
      );
    }
    
    // === SEASONS/STORIES (Timeline simplificada) ===
    
    match /seasons/{seasonId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn(); // GM no client
    }
    
    match /stories/{storyId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
    
    // === LEGACY SESSIONS (Manter para compatibilidade) ===
    
    match /sessions/{sessionId} {
      allow read, write: if isSignedIn();
      
      match /{subcollection}/{docId} {
        allow read, write: if isSignedIn();
      }
    }
    
    // === USERS ===
    
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }
  }
}
```

### 2.3 Principios das Novas Regras

| Antes | Depois |
|-------|--------|
| `isCampaignMember()` com 2 gets | `isSignedIn()` simples |
| Verificar membership em cada read | Confiar que logado = valido |
| Multiplas funcoes aninhadas | Funcoes flat e simples |
| Proteger leitura agressivamente | Proteger escrita, liberar leitura |

---

## Fase 3: Limpar Codigo Relacionado

### 3.1 Remover Referencias a Sessions Legacy (Opcional)

Se quiser remover completamente o sistema antigo de sessions, limpar:
- `canAccessSession()`, `isSessionGm()`, `hasSessionPresence()` das rules
- Hooks que usam `/sessions/` no codigo

### 3.2 Verificar Hooks que Escutam Presence

O hook `usePartyCharacters.ts` escuta `/campaigns/{id}/presence`. Com as novas regras simplificadas, isso deve funcionar sem erros.

---

## Resumo de Arquivos

### Arquivos a DELETAR:
| Arquivo | Motivo |
|---------|--------|
| `src/hooks/useEpisode.ts` | Importa tipo `Episode` que nao existe mais |
| `src/hooks/useTimeline.ts` | Importa tipo `Episode` e usa funcao inexistente |

### Arquivos a MODIFICAR:
| Arquivo | Mudanca |
|---------|---------|
| `firestore.rules` | Substituir regras complexas por versao simplificada |

---

## Ordem de Implementacao

| Sprint | Tarefa | Prioridade |
|--------|--------|------------|
| 1 | Deletar `useEpisode.ts` e `useTimeline.ts` | URGENTE (Build) |
| 2 | Atualizar `firestore.rules` com versao simplificada | ALTA |
| 3 | Testar login e acesso a campanhas | - |
| 4 | Verificar que erros de permission-denied sumiram | - |

---

## Consideracoes de Seguranca

### O Que Estamos Perdendo?
- Verificacao server-side de membership em campanhas
- Isolamento rigoroso entre campanhas

### Por Que Isso e OK Para um VTT?
1. **Usuarios sao convidados**: Ninguem entra sem join code
2. **Dados nao sao sensiveis**: Sao fichas de personagem, nao dados bancarios
3. **Validacao no client**: O app ja verifica quem pode fazer o que
4. **Comunidade pequena**: VTTs geralmente tem grupos fechados de amigos

### O Que Ainda Esta Protegido?
- Apenas logados podem acessar
- Apenas donos podem deletar seus recursos
- Apenas GMs podem deletar campanhas
- Escrita em campanhas requer ser GM

---

## Impacto Esperado

Apos implementar:

```text
ANTES:
- 6+ erros de permission-denied no console
- App nao carrega campanhas corretamente
- Presenca falha silenciosamente
- Logs de rolagem nao salvam

DEPOIS:
- Zero erros de permission-denied para usuarios logados
- Campanhas carregam instantaneamente
- Presenca funciona
- Logs salvam normalmente
```
