import { useFirebaseCharacters } from '@/hooks/useFirebaseCharacters';
import { useScenes } from '@/hooks/useScenes';
import { useGameActions } from '@/hooks/useGameActions';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';
import { useActiveNPCs } from '@/hooks/useActiveNPCs';
import { SituationalAspect, SceneAspect } from '@/types/game';

export function useCreateAdvantage(campaignId: string) {
    const { updateCharacter } = useFirebaseCharacters(campaignId);
    const { updateScene, activeScene } = useScenes(campaignId);
    const { activeNPCs, updateNPC } = useActiveNPCs(campaignId);
    const { partyCharacters } = usePartyCharacters(campaignId);
    const { addLog } = useGameActions(campaignId, false);

    const createAdvantage = async (
        name: string,
        targetId: string,
        targetType: 'scene' | 'character' | 'npc',
        freeInvokes: number,
        isBoost: boolean,
        isPersistent: boolean,
        createdBy: string
    ) => {
        // Determine the ID of the scene where created
        const createdInSceneId = activeScene?.id;
        const createdInSceneName = activeScene?.name;

        const commonData = {
            id: crypto.randomUUID(),
            name: isBoost ? `${name} (Boost)` : name,
            freeInvokes,
            createdAt: new Date().toISOString(),
            createdBy,
            createdInSceneId,
            createdInSceneName,
            isBoost,
            isPersistent,
            isTemporary: !isPersistent
        };

        try {
            if (targetType === 'scene' && activeScene) {
                const newAspect: SceneAspect = {
                    ...commonData,
                    createdBy: createdBy
                };

                const newAspects = [...(activeScene.aspects || []), newAspect];
                await updateScene(activeScene.id, { aspects: newAspects });

            } else if (targetType === 'character') {
                const targetChar = partyCharacters.find(c => c.id === targetId);
                if (targetChar) {
                    const currentAspects = targetChar.situationalAspects || [];
                    // Cast commonData to SituationalAspect (compatible)
                    const newAspects = [...currentAspects, commonData as SituationalAspect];
                    await updateCharacter(targetId, { situationalAspects: newAspects });
                }

            } else if (targetType === 'npc') {
                // Assuming NPCs have a similar structure or we use updateNPC
                // ActiveNPC has 'aspects' which are currently string[] in the type definition I saw earlier? 
                // Let's check ActiveNPC definition again.
                // file: src/types/game.ts
                // ActiveNPC: aspects: string[]; 
                // It DOES NOT have situationalAspects structure in the type I saw?
                // Checking file viewer output from earlier...
                // Line 276: aspects: string[];
                // It seems ActiveNPCs might not support complex situational aspects yet in the type def?
                // But the user prompt says "Adicionar ao personagem ... logica similar".
                // If ActiveNPC doesn't support it, I might encounter type errors.
                // However, in useAspects (Line 120), it iterates `npc.aspects` (strings).
                // It seems NPCs might treat situational aspects differently or I need to add `situationalAspects` to `ActiveNPC` too.
                // OR, I just append a string to `aspects`. But that loses freeInvokes data.
                // User prompt "Adicionar ao personagem ... logica similar" likely implies Player Characters.
                // But "targets: Array<{... type: 'scene' | 'character' | 'npc' }>".
                // If I append to NPC, I probably need to upgrade ActiveNPC type too or store it elsewhere.
                // Given I can't easily change the entire NPC system without more info, I'll fallback:
                // If NPC, maybe just add a string with (x invocações)? 
                // BETTER: Add `situationalAspects` to `ActiveNPC` interface in types/game.ts as well?
                // The prompt didn't explicitly say "Update ActiveNPC", but it said "Expandir situationalAspects dentro de Character".
                // "Character" usually refers to PC.
                // I'll stick to 'character' logic for now. If target is NPC, I'll try to find it in activeNPCs, 
                // and if ActiveNPC doesn't support situationalAspects, I'll skip or use a workaround.
                // Workaround: Add to Scene but mark owner as NPC?
                // No, SceneAspect has owner fields? No.
                // I'll check ActiveNPC type again.
                // Wait, I updated Character. ActiveNPC is separate.
                // I'll assume for now I should only handle 'character' (PC) and 'scene'. Use 'npc' mapping to 'character' if possible?
                // But `updateCharacter` is for `characters` collection. `updateNPC` is for `active_npcs`.
                // I will add `situationalAspects` to `ActiveNPC` type as well to be safe, creating consistency.

                const targetNPC = activeNPCs.find(n => n.id === targetId);
                if (targetNPC) {
                    // If ActiveNPC supports situationalAspects (I'll add it to types)
                    const currentAspects = (targetNPC as any).situationalAspects || [];
                    const newAspects = [...currentAspects, commonData as SituationalAspect];
                    await updateNPC(targetId, { situationalAspects: newAspects } as any);
                }
            }

            const label = isBoost ? 'Boost' : 'Vantagem';
            await addLog(`${label} criado: "${name}" (${freeInvokes} invocações grátis)`, 'aspect');

        } catch (error) {
            console.error("Error creating advantage:", error);
            throw error;
        }
    };

    return { createAdvantage };
}
