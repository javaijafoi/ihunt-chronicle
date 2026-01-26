import { db } from '@/lib/firebase';
import { SelfieType } from '@/types/game';
import {
    writeBatch,
    doc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

export function useSelfieEngine() {


    // Manually grant slots to all characters or specific ones
    const grantSelfieSlotToAll = async (
        campaignId: string,
        slotType: SelfieType,
        reason: string // e.g., "Sessão encerrada", "Auge da História"
    ) => {
        try {
            const batch = writeBatch(db);

            // 1. Buscar todos os personagens da campanha
            const charsQuery = query(
                collection(db, 'characters'),
                where('campaignId', '==', campaignId)
            );
            const charsSnap = await getDocs(charsQuery);

            // 2. Criar slot para cada personagem
            for (const charDoc of charsSnap.docs) {
                const charData = charDoc.data();
                const currentSlots = charData.selfieSlots || [];

                const newSlot = {
                    id: crypto.randomUUID(),
                    type: slotType,
                    grantedBy: reason, // Was episodeId
                    used: false,
                    createdAt: serverTimestamp()
                };

                batch.update(charDoc.ref, {
                    selfieSlots: [...currentSlots, newSlot]
                });
            }

            await batch.commit();
            return true;
        } catch (error) {
            console.error("Error granting slots:", error);
            throw error;
        }
    };

    return {
        grantSelfieSlotToAll
    };
}
