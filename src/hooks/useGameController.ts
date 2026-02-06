import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCampaign } from '@/contexts/CampaignContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScenes } from '@/hooks/useScenes';
import { useActiveNPCs } from '@/hooks/useActiveNPCs';
import { useTokens } from '@/hooks/useTokens';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';
import { useGameActions } from '@/hooks/useGameActions';
import { useSafetyTools } from '@/hooks/useSafetyTools';
import { useFirebaseCharacters } from '@/hooks/useFirebaseCharacters';
import { useAspects } from '@/hooks/useAspects';
import { useCreateAdvantage } from '@/hooks/useCreateAdvantage';
import { toast } from '@/hooks/use-toast';
import { ActionType, Character, Selfie } from '@/types/game';
import { isPresenceRecent } from '@/utils/presence';

export function useGameController() {
    const { user, signOut } = useAuth();
    const isMobile = useIsMobile();
    const { campaign, currentScene, isGM, myCharacter, selectCharacter, loading: campaignLoading } = useCampaign();

    const campaignId = campaign?.id;

    // Domain Hooks
    const {
        scenes,
        activeScene,
        createScene,
        updateScene,
        deleteScene,
        setActiveScene,
        archiveScene,
        unarchiveScene,
        searchQuery: sceneSearchQuery,
        setSearchQuery: setSceneSearchQuery,
        MIN_ASPECTS
    } = useScenes(campaignId, isGM);

    const { activeNPCs, updateNPC } = useActiveNPCs(campaignId);
    const { tokens, createToken, updateTokenPosition, updateToken, deleteToken } = useTokens(activeScene?.id, campaignId);
    const { partyCharacters, archivedCharacters, presenceMap } = usePartyCharacters(campaignId);
    const { updateCharacter: updateFirebaseCharacter } = useFirebaseCharacters(undefined);
    const { logs, addLog, createRollLog, updateFate, rollDice } = useGameActions(campaignId, isGM);
    const { allAspects, invokeAspect, revokeInvocation } = useAspects(campaignId || '', activeScene?.id);
    const { createAdvantage } = useCreateAdvantage(campaignId || '');
    const { safetyState, mySettings, aggregatedLevels, updateMySetting, triggerXCard, resolveXCard, togglePause } = useSafetyTools(campaignId, isGM);

    // Derived State
    const activeCharacter = myCharacter as Character | null;

    // Track Last Visited
    useEffect(() => {
        if (campaignId) {
            localStorage.setItem('ihunt_last_campaign', campaignId);
        }
    }, [campaignId]);

    // Logic: Merge Tokens
    const mergedTokens = useMemo(() => {
        return tokens.map(token => {
            if (token.type === 'npc' && token.npcId) {
                const npc = activeNPCs.find(n => n.id === token.npcId);
                if (npc) {
                    return {
                        ...token,
                        name: npc.name,
                        avatar: npc.avatar,
                        currentStress: npc.currentStress,
                        maxStress: npc.stress,
                        npcKind: npc.kind
                    };
                }
            }
            return token;
        });
    }, [tokens, activeNPCs]);

    // Logic: Actions
    const handleRollDice = async (
        modifier: number = 0,
        skill: string | undefined,
        action: ActionType | undefined,
        type: 'normal' | 'advantage' = 'normal',
        opposition?: number,
        isHidden?: boolean,
        characterNameOverride?: string
    ) => {
        try {
            const diceResult = rollDice(modifier, skill, action, type, opposition);
            diceResult.character = characterNameOverride || activeCharacter?.name || 'GM';
            await createRollLog(diceResult);
            return diceResult;
        } catch (e) {
            console.error("Roll failed:", e);
            toast({ title: "Erro na rolagem", variant: "destructive" });
            throw e;
        }
    };

    const spendFatePoint = (charId: string) => updateFate(charId, -1, true);
    const gainFatePoint = (charId: string) => updateFate(charId, 1, true);

    const handleToggleStress = async (characterId: string, track: 'physical' | 'mental', index: number) => {
        const char = partyCharacters.find(c => c.id === characterId) || (activeCharacter?.id === characterId ? activeCharacter : null);
        if (!char) return;

        const currentTrack = char.stress?.[track] || [];
        const newTrack = [...currentTrack];
        while (newTrack.length <= index) newTrack.push(false);

        newTrack[index] = !newTrack[index];

        await updateFirebaseCharacter(characterId, {
            stress: { ...char.stress, [track]: newTrack }
        });
    };

    // Logic: Aspects
    const handleInvokeAspect = (aspectName: string, source: string, useFreeInvoke: boolean) => {
        const aspect = allAspects.find(a => a.name === aspectName);
        if (aspect) {
            invokeAspect(aspect, useFreeInvoke);
        } else {
            // Fallback
            if (useFreeInvoke) {
                addLog(`${activeCharacter?.name || 'GM'} invocou "${aspectName}" (GRÁTIS)`, 'aspect');
                if (activeScene) {
                    const aspectIndex = activeScene.aspects.findIndex(a => a.name === aspectName);
                    if (aspectIndex >= 0 && activeScene.aspects[aspectIndex].freeInvokes > 0) {
                        const newAspects = [...activeScene.aspects];
                        newAspects[aspectIndex] = { ...newAspects[aspectIndex], freeInvokes: newAspects[aspectIndex].freeInvokes - 1 };
                        updateScene(activeScene.id, { aspects: newAspects });
                    }
                }
            } else {
                addLog(`${activeCharacter?.name || 'GM'} invocou "${aspectName}" de ${source}`, 'aspect');
                if (activeCharacter) spendFatePoint(activeCharacter.id);
            }
        }
    };

    const handleManualInvoke = (aspectName: string, characterName: string) => {
        // Used by Sidebar/Legacy hooks
        const aspect = allAspects.find(a => a.name === aspectName);
        if (aspect) {
            invokeAspect(aspect, false);
        } else {
            addLog(`${activeCharacter?.name || 'GM'} invocou "${aspectName}" de ${characterName}`, 'aspect');
            if (activeCharacter) updateFate(activeCharacter.id, -1, true);
        }
    };

    const handleRevokeAspect = (aspectName: string, source: string, wasFree: boolean) => {
        const aspect = allAspects.find(a => a.name === aspectName);
        if (aspect) {
            revokeInvocation(aspect, wasFree);
        } else {
            addLog(`${activeCharacter?.name || 'GM'} desfez invocação de "${aspectName}" (no unified match)`, 'system');
        }
    };

    // Logic: Selfies
    const handleDeleteSelfie = async (selfieId: string, char: Character) => {
        if (!confirm('Tem certeza que deseja apagar esta selfie?')) return;
        const updatedSelfies = (char.selfies || []).filter(s => s.id !== selfieId);
        await updateFirebaseCharacter(char.id, { selfies: updatedSelfies });
        toast({ title: 'Selfie removida' });
    };

    const handleCreateSelfie = async (newSelfie: Selfie, char: Character) => {
        const updatedSelfies = [newSelfie, ...(char.selfies || [])];
        await updateFirebaseCharacter(char.id, { selfies: updatedSelfies });
    };

    // Logic: Scene Switching
    const handleSetActiveScene = async (newSceneId: string) => {
        if (isGM) {
            // Clean Characters
            for (const char of partyCharacters) {
                if (!char.situationalAspects || char.situationalAspects.length === 0) continue;
                const keptAspects = char.situationalAspects.filter(a => a.isPersistent).map(a => ({
                    ...a, freeInvokes: Math.max(a.freeInvokes, 1)
                }));

                if (keptAspects.length !== char.situationalAspects.length) { // Simplified check
                    await updateFirebaseCharacter(char.id, { situationalAspects: keptAspects });
                }
            }

            // Clean Scene
            if (activeScene) {
                const sceneAspects = activeScene.aspects || [];
                const cleanSceneAspects = sceneAspects.filter(a => !a.isTemporary || a.isPersistent).map(a => {
                    return a.isPersistent ? { ...a, freeInvokes: Math.max(a.freeInvokes, 1) } : a;
                });

                if (cleanSceneAspects.length !== sceneAspects.length) { // Simplified check
                    await updateScene(activeScene.id, { aspects: cleanSceneAspects });
                }
            }
        }
        await setActiveScene(newSceneId);
    };

    // Logic: Create Advantage
    const handleConfirmAdvantage = async (
        name: string,
        targetId: string,
        targetType: 'scene' | 'character' | 'npc',
        freeInvokes: number,
        isBoost: boolean,
        isPersistent: boolean,
        creatorId: string
    ) => {
        await createAdvantage(name, targetId, targetType, freeInvokes, isBoost, isPersistent, creatorId);
    };

    const checkMalinaSabeDasCoisas = (char: Character | null) => {
        if (!char) return false;
        return char.maneuvers?.includes('sabe-das-coisas') || char.drive === 'malina';
    };

    // GM Info
    const gmInfo = campaign?.gmId ? {
        id: campaign.gmId,
        name: Object.values(presenceMap).find(p => p.ownerId === campaign.gmId)?.ownerName || 'Mestre',
        isOnline: Object.values(presenceMap).some(p => p.ownerId === campaign.gmId && isPresenceRecent(p.lastSeen))
    } : undefined;

    return {
        // Contexts
        user, signOut, isMobile,
        campaign, campaignId, isGM, myCharacter, activeCharacter, selectCharacter, campaignLoading,

        // Data
        scenes, activeScene, activeNPCs, tokens, partyCharacters, archivedCharacters, mergedTokens,
        allAspects, logs, safetyState, mySettings, aggregatedLevels, gmInfo,

        // Actions & Handlers
        handleRollDice,
        spendFatePoint,
        gainFatePoint,
        handleToggleStress,
        handleInvokeAspect,
        handleManualInvoke,
        handleRevokeAspect,
        handleDeleteSelfie,
        handleCreateSelfie,
        handleSetActiveScene,
        handleConfirmAdvantage,
        checkMalinaSabeDasCoisas,

        // Sub-hooks exposed
        createScene, updateScene, deleteScene, archiveScene, unarchiveScene,
        sceneSearchQuery, setSceneSearchQuery, MIN_ASPECTS,
        createToken, updateTokenPosition, updateToken, deleteToken,
        updateNPC,
        addLog,
        triggerXCard, resolveXCard, togglePause, updateMySetting,
        updateFirebaseCharacter
    };
}
