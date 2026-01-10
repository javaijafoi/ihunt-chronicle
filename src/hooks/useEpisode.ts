import { useState, useEffect, useCallback } from 'react';
import {
    doc,
    updateDoc,
    serverTimestamp,
    arrayUnion
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Episode } from '@/types/schema';
import { useCampaign } from '@/contexts/CampaignContext';
import { SceneAspect } from '@/types/game';
import { toast } from 'sonner';

export function useEpisode() {
    const { currentEpisode, isGM, campaign } = useCampaign();
    const [loading, setLoading] = useState(false);

    // Synchronize loading state if needed, mostly derived from Context

    const updateSceneAspects = useCallback(async (aspects: SceneAspect[]) => {
        if (!currentEpisode?.currentSceneId || !isGM) return;

        try {
            await updateDoc(doc(db, 'scenes', currentEpisode.currentSceneId), {
                aspects
            });
        } catch (e) {
            console.error(e);
            toast.error('Erro ao atualizar aspectos da cena');
        }
    }, [currentEpisode, isGM]);

    const updateGmFatePool = useCallback(async (amount: number) => {
        if (!currentEpisode || !isGM) return;
        try {
            await updateDoc(doc(db, 'episodes', currentEpisode.id), {
                gmFatePool: (currentEpisode.gmFatePool || 0) + amount
            });
        } catch (error) {
            console.error("Erro ao atualizar Fate Pool do GM", error);
        }
    }, [currentEpisode, isGM]);

    // Function to create/update scene?
    // Usually scene management might be its own thing or part of this hook

    return {
        episode: currentEpisode,
        loading: !campaign && loading, // Simplified
        updateSceneAspects,
        updateGmFatePool,
        isGM
    };
}
