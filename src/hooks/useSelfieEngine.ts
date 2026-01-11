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

    // Chamado quando GM encerra um episódio
    const closeEpisodeAndGrantSlots = async (
        episodeId: string,
        closedAs: 'episode' | 'story_climax' | 'season_finale',
        campaignId: string
    ) => {
        try {
            const batch = writeBatch(db);

            // 1. Atualizar status do episódio
            batch.update(doc(db, 'episodes', episodeId), {
                status: 'closed',
                closedAs,
                closedAt: serverTimestamp()
            });

            // 2. Determinar tipo de slot baseado no encerramento
            const slotType: SelfieType =
                closedAs === 'episode' ? 'mood' :
                    closedAs === 'story_climax' ? 'auge' : 'mudanca';

            // 3. Buscar todos os personagens da campanha
            // Nota: Idealmente filtramos apenas personagens ativos/não arquivados
            const charsQuery = query(
                collection(db, 'characters'),
                where('campaignId', '==', campaignId)
            );
            const charsSnap = await getDocs(charsQuery);

            // 4. Criar slot para cada personagem
            for (const charDoc of charsSnap.docs) {
                const charData = charDoc.data();
                const currentSlots = charData.selfieSlots || [];

                const newSlot = {
                    id: crypto.randomUUID(),
                    type: slotType,
                    grantedBy: episodeId,
                    used: false,
                    createdAt: new Date() // Firestore ok com Date em clients modernos ou converter se necessário
                };

                batch.update(charDoc.ref, {
                    selfieSlots: [...currentSlots, newSlot]
                });
            }

            await batch.commit();
            return true;
        } catch (error) {
            console.error("Error closing episode and granting slots:", error);
            throw error;
        }
    };

    return {
        closeEpisodeAndGrantSlots
    };
}
