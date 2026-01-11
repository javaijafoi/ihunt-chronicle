import { useMemo } from 'react';
import { useSession } from './useSession';
import { usePartyCharacters } from './usePartyCharacters';
import { useActiveNPCs } from './useActiveNPCs';
import { useScenes } from './useScenes';
import { UnifiedAspect } from '@/types/game';
import { useAuth } from './useAuth';
import { useCampaign } from '@/contexts/CampaignContext';
import { useGameActions } from './useGameActions';
import { useFirebaseCharacters } from './useFirebaseCharacters';

export function useAspects(campaignId: string, episodeId: string, sceneId?: string) {
    const { user } = useAuth();
    const { campaign } = useCampaign();
    const { currentSession } = useSession();
    const { partyCharacters } = usePartyCharacters(campaignId);
    const { activeNPCs } = useActiveNPCs(campaignId);
    // useScenes returns activeScene as the current active scene
    const { activeScene, updateScene } = useScenes(episodeId, campaignId);
    const currentScene = activeScene; // Alias for compatibility

    // Hooks for actions
    const { updateFate, addLog } = useGameActions(episodeId, campaignId, currentSession?.gmId === user?.uid);
    const { updateCharacter } = useFirebaseCharacters(currentSession?.id);

    // Identify my character
    const myCharacter = useMemo(() =>
        partyCharacters.find(c => c.userId === user?.uid),
        [partyCharacters, user?.uid]);

    // Agregar TODOS os aspectos em jogo
    const allAspects = useMemo((): UnifiedAspect[] => {
        const aspects: UnifiedAspect[] = [];

        // 1. Aspectos de Tema (Campanha)
        const themeAspects = campaign?.themeAspects || [];

        themeAspects.forEach(name => {
            aspects.push({
                id: `theme-${name}`,
                name,
                source: 'theme',
                ownerType: 'campaign',
                ownerName: currentSession?.name || 'Campanha',
                freeInvokes: 0,
                usedThisScene: false,
                createdBy: currentSession?.gmId || '',
                isTemporary: false,
                scope: 'campaign'
            });
        });

        // 2. Aspectos de Personagens
        partyCharacters.forEach(char => {
            // High Concept, Drama, Job, DreamBoard, Free
            const charAspects = [
                { name: char.aspects.highConcept, label: 'Alto Conceito' },
                { name: char.aspects.drama, label: 'Drama' },
                { name: char.aspects.job, label: 'Emprego' },
                { name: char.aspects.dreamBoard, label: 'Sonhos' },
                ...char.aspects.free.map(f => ({ name: f, label: 'Livre' }))
            ];

            charAspects.forEach(({ name }) => {
                if (name) {
                    aspects.push({
                        id: `char-${char.id}-${name}`,
                        name,
                        source: 'character',
                        ownerId: char.id,
                        ownerName: char.name,
                        ownerType: 'character',
                        freeInvokes: 0,
                        usedThisScene: false,
                        createdBy: char.userId,
                        isTemporary: false
                    });
                }
            });

            // Consequências (funcionam como aspectos)
            Object.entries(char.consequences).forEach(([severity, value]) => {
                if (value) {
                    aspects.push({
                        id: `conseq-${char.id}-${severity}`,
                        name: value,
                        source: 'consequence',
                        ownerId: char.id,
                        ownerName: char.name,
                        ownerType: 'character',
                        freeInvokes: 0,
                        usedThisScene: false,
                        createdBy: char.userId,
                        isTemporary: false,
                        severity: severity as 'mild' | 'moderate' | 'severe'
                    });
                }
            });

            // Aspectos Situacionais
            char.situationalAspects?.forEach(sa => {
                aspects.push({
                    id: sa.id,
                    name: sa.name,
                    source: 'situational',
                    ownerId: char.id,
                    ownerName: char.name,
                    ownerType: 'character',
                    freeInvokes: sa.freeInvokes,
                    usedThisScene: false,
                    createdBy: char.userId,
                    isTemporary: true
                });
            });
        });

        // 3. Aspectos de NPCs ativos
        activeNPCs.forEach(npc => {
            npc.aspects.forEach(name => {
                aspects.push({
                    id: `npc-${npc.id}-${name}`,
                    name,
                    source: 'character',
                    ownerId: npc.id,
                    ownerName: npc.name,
                    ownerType: 'npc',
                    freeInvokes: 0,
                    usedThisScene: false,
                    createdBy: currentSession?.gmId || '',
                    isTemporary: false
                });
            });

            // Consequências de NPCs
            Object.entries(npc.consequences).forEach(([severity, value]) => {
                if (value) {
                    aspects.push({
                        id: `npc-conseq-${npc.id}-${severity}`,
                        name: value,
                        source: 'consequence',
                        ownerId: npc.id,
                        ownerName: npc.name,
                        ownerType: 'npc',
                        freeInvokes: 1, // Consequências vêm com 1 free invoke
                        usedThisScene: false,
                        createdBy: currentSession?.gmId || '',
                        isTemporary: false,
                        severity: severity as 'mild' | 'moderate' | 'severe'
                    });
                }
            });
        });

        // 4. Aspectos de Cena
        currentScene?.aspects?.forEach(sa => {
            aspects.push({
                id: sa.id,
                name: sa.name,
                source: sa.isTemporary ? 'situational' : 'location',
                ownerType: 'scene',
                ownerName: currentScene.name,
                freeInvokes: sa.freeInvokes,
                usedThisScene: false,
                createdBy: sa.createdBy,
                isTemporary: sa.isTemporary
            });
        });

        return aspects;
    }, [currentSession, partyCharacters, activeNPCs, currentScene]);

    // Funções de ação
    const invokeAspect = async (aspect: UnifiedAspect, useFree: boolean) => {
        const actingCharacter = myCharacter; // Quem está invocando? Assumimos o usuário logado

        // Log inicial
        let method = useFree ? '(GRÁTIS)' : '(1 Ponto de Destino)';
        await addLog(`${actingCharacter?.name || 'Alguém'} invocou "${aspect.name}" ${method}`, 'aspect');

        // 1. Gastar Free Invoke (se aplicável)
        if (useFree) {
            if (aspect.ownerType === 'scene' && currentScene) {
                // Atualizar cena
                const sceneAspects = [...(currentScene.aspects || [])];
                const idx = sceneAspects.findIndex(a => a.id === aspect.id);
                if (idx >= 0) {
                    sceneAspects[idx] = { ...sceneAspects[idx], freeInvokes: Math.max(0, sceneAspects[idx].freeInvokes - 1) };
                    await updateScene(currentScene.id, { aspects: sceneAspects });
                }
            } else if (aspect.ownerType === 'character' && aspect.source === 'situational') {
                // Atualizar personagem (situational)
                const targetChar = partyCharacters.find(c => c.id === aspect.ownerId);
                if (targetChar) {
                    const sitAspects = [...(targetChar.situationalAspects || [])];
                    const idx = sitAspects.findIndex(a => a.id === aspect.id);
                    if (idx >= 0) {
                        sitAspects[idx] = { ...sitAspects[idx], freeInvokes: Math.max(0, sitAspects[idx].freeInvokes - 1) };
                        await updateCharacter(targetChar.id, { situationalAspects: sitAspects });
                    }
                }
            }
        } else {
            // 2. Gastar Fate Point (se não for free)
            if (actingCharacter) {
                await updateFate(actingCharacter.id, -1, true); // true = sync?
            }
        }
    };

    const compelAspect = async (aspect: UnifiedAspect, targetCharacterId: string) => {
        // Quem ganha o ponto de destino é o ALVO do compel
        await updateFate(targetCharacterId, 1, true);

        // Log
        const targetName = partyCharacters.find(c => c.id === targetCharacterId)?.name || 'Alvo';
        await addLog(`GM forçou o aspecto "${aspect.name}" contra ${targetName}`, 'fate');
    };

    const rejectCompel = async (targetCharacterId: string) => {
        // Rejeitar custa 1 ponto de destino
        await updateFate(targetCharacterId, -1, true);

        const targetName = partyCharacters.find(c => c.id === targetCharacterId)?.name || 'Alvo';
        await addLog(`${targetName} recusou a forçada de aspecto. (-1 Ponto de Destino)`, 'fate');
    };

    const createBoost = async (name: string, targetId: string) => {
        const newBoost = {
            id: crypto.randomUUID(),
            name: `${name} (Boost)`,
            type: 'situational' as const,
            freeInvokes: 1,
            isTemporary: true,
            createdBy: user?.uid || 'system',
            createdAt: new Date().toISOString()
        };

        // Check if target is a character
        const targetChar = partyCharacters.find(c => c.id === targetId);
        if (targetChar) {
            const currentAspects = targetChar.situationalAspects || [];
            await updateCharacter(targetChar.id, { situationalAspects: [...currentAspects, newBoost] });
            await addLog(`Boost criado em ${targetChar.name}: "${name}"`, 'aspect');
        } else if (currentScene) {
            // Default to Scene
            const newAspects = [...(currentScene.aspects || []), newBoost];
            await updateScene(currentScene.id, { aspects: newAspects });
            await addLog(`Boost criado na Cena: "${name}"`, 'aspect');
        }
    };

    return {
        allAspects,

        // Filtros prontos
        themeAspects: allAspects.filter(a => a.source === 'theme'),
        sceneAspects: allAspects.filter(a => a.ownerType === 'scene'),
        characterAspects: allAspects.filter(a => a.ownerType === 'character'),
        npcAspects: allAspects.filter(a => a.ownerType === 'npc'),
        consequences: allAspects.filter(a => a.source === 'consequence'),
        situationalAspects: allAspects.filter(a => a.source === 'situational'),
        boosts: allAspects.filter(a => a.source === 'boost'),

        // Ações
        invokeAspect,
        compelAspect,
        rejectCompel,
        createBoost
    };
}
