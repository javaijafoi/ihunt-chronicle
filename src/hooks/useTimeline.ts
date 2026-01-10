import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, writeBatch, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Season, Story, Episode } from '@/types/schema';
import { toast } from '@/hooks/use-toast';

export function useTimeline(campaignId?: string) {
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!campaignId) {
            setSeasons([]);
            setStories([]);
            setEpisodes([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Subscribe to Seasons
        const qSeasons = query(collection(db, 'seasons'), where('campaignId', '==', campaignId));
        const unsubSeasons = onSnapshot(qSeasons, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Season));
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            setSeasons(list);
        });

        // Subscribe to Stories
        const qStories = query(collection(db, 'stories'), where('campaignId', '==', campaignId));
        const unsubStories = onSnapshot(qStories, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Story));
            list.sort((a, b) => (a.order || 0) - (b.order || 0));
            setStories(list);
        });

        // Subscribe to Episodes
        const qEpisodes = query(collection(db, 'episodes'), where('campaignId', '==', campaignId));
        // Note: Episodes might not have 'order' if not strictly linear, or we can sort client side
        // Usually filtering by storyId locally is better for UI tree
        const unsubEpisodes = onSnapshot(qEpisodes, (snap) => {
            setEpisodes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Episode)));
            setLoading(false);
        });

        return () => {
            unsubSeasons();
            unsubStories();
            unsubEpisodes();
        };
    }, [campaignId]);

    const addSeason = useCallback(async (title: string, description: string) => {
        if (!campaignId) return;
        try {
            const order = seasons.length + 1;
            await addDoc(collection(db, 'seasons'), {
                campaignId,
                title,
                description,
                order,
                status: 'active',
                createdAt: serverTimestamp()
            });
            toast({ title: 'Temporada criada!' });
        } catch (e) {
            console.error(e);
            toast({ title: 'Erro ao criar temporada', variant: 'destructive' });
        }
    }, [campaignId, seasons.length]);

    const addStory = useCallback(async (seasonId: string, title: string, description: string) => {
        if (!campaignId) return;
        try {
            // Find max order for this season
            const seasonStories = stories.filter(s => s.seasonId === seasonId);
            const order = seasonStories.length + 1;

            await addDoc(collection(db, 'stories'), {
                campaignId,
                seasonId,
                title,
                description,
                order,
                status: 'active',
                createdAt: serverTimestamp()
            });
            toast({ title: 'História criada!' });
        } catch (e) {
            console.error(e);
            toast({ title: 'Erro ao criar história', variant: 'destructive' });
        }
    }, [campaignId, stories]);

    const addEpisode = useCallback(async (storyId: string, title: string, description: string) => {
        if (!campaignId) return;
        try {
            await addDoc(collection(db, 'episodes'), {
                campaignId,
                storyId,
                title,
                description,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            toast({ title: 'Episódio criado!' });
        } catch (e) {
            console.error(e);
            toast({ title: 'Erro ao criar episódio', variant: 'destructive' });
        }
    }, [campaignId]);

    const activateEpisode = useCallback(async (episodeId: string) => {
        if (!campaignId) return;
        try {
            // Set episode to active
            await updateDoc(doc(db, 'episodes', episodeId), {
                status: 'active',
                startedAt: serverTimestamp()
            });

            // Set campaign current episode
            await updateDoc(doc(db, 'campaigns', campaignId), {
                currentEpisodeId: episodeId
            });
            toast({ title: 'Episódio iniciado!' });
        } catch (e) {
            console.error(e);
            toast({ title: 'Erro ao iniciar episódio', variant: 'destructive' });
        }
    }, [campaignId]);

    const closeEpisode = useCallback(async (episodeId: string) => {
        if (!campaignId) return;
        try {
            const batch = writeBatch(db);

            // 1. Close the episode
            const epRef = doc(db, 'episodes', episodeId);
            batch.update(epRef, {
                status: 'completed',
                endedAt: serverTimestamp()
            });

            // 2. Distribute Selfie Slots to all characters in campaign
            const charsQuery = query(collection(db, 'characters'), where('campaignId', '==', campaignId));
            const charsSnap = await getDocs(charsQuery);

            charsSnap.docs.forEach(charDoc => {
                const charData = charDoc.data();
                const currentSlots = charData.selfieSlots || [];

                const newSlot = {
                    id: crypto.randomUUID(),
                    type: 'mood', // Default reward for episode completion
                    grantedBy: episodeId,
                    used: false,
                    createdAt: new Date() // Firestore converts this
                };

                batch.update(charDoc.ref, {
                    selfieSlots: [...currentSlots, newSlot]
                });
            });

            await batch.commit();
            toast({ title: 'Episódio finalizado!', description: 'Todos os jogadores receberam um slot de Selfie.' });

        } catch (e) {
            console.error(e);
            toast({ title: 'Erro ao finalizar episódio', variant: 'destructive' });
        }
    }, [campaignId]);

    return {
        seasons,
        stories,
        episodes,
        loading,
        addSeason,
        addStory,
        addEpisode,
        activateEpisode,
        closeEpisode
    };
}
