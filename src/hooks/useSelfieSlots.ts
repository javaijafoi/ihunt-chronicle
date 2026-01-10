import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SelfieSlot } from '@/types/game';

export function useSelfieSlots(characterId?: string) {
    const [slots, setSlots] = useState<SelfieSlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!characterId) {
            setSlots([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, `characters/${characterId}/selfieSlots`),
            orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, (snap) => {
            setSlots(snap.docs.map(d => ({ id: d.id, ...d.data() } as SelfieSlot)));
            setLoading(false);
        });

        return () => unsub();
    }, [characterId]);

    return { slots, loading };
}
