import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
    arrayUnion,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs,
    setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Campaign, Episode, CampaignMember } from '@/types/schema';
import { Character, Scene } from '@/types/game';
import { toast } from 'sonner';

interface CampaignContextValue {
    campaign: Campaign | null;
    currentEpisode: Episode | null;
    currentScene: Scene | null;
    myCharacter: Character | null;
    member: CampaignMember | null;
    isGM: boolean;
    loading: boolean;

    // Actions
    joinCampaign: (code: string) => Promise<boolean>;
    selectCharacter: (characterId: string) => Promise<void>;
    updateCampaign: (data: Partial<Campaign>) => Promise<void>;
}

const CampaignContext = createContext<CampaignContextValue | undefined>(undefined);

export function CampaignProvider({ children, campaignId }: { children: ReactNode; campaignId?: string }) {
    const { user } = useAuth();

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [member, setMember] = useState<CampaignMember | null>(null);
    const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
    const [currentScene, setCurrentScene] = useState<Scene | null>(null);
    const [myCharacter, setMyCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Subscribe to Campaign
    useEffect(() => {
        if (!campaignId || !user) {
            setLoading(false);
            return;
        }

        const unsubCampaign = onSnapshot(doc(db, 'campaigns', campaignId), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setCampaign({ id: snap.id, ...data } as Campaign);
            } else {
                setCampaign(null);
                toast.error("Campanha não encontrada");
            }
            setLoading(false);
        });

        // Subscribe to Member info
        const unsubMember = onSnapshot(doc(db, `campaigns/${campaignId}/members`, user.uid), (snap) => {
            if (snap.exists()) {
                setMember(snap.data() as CampaignMember);
            } else {
                setMember(null);
            }
        });

        return () => {
            unsubCampaign();
            unsubMember();
        };
    }, [campaignId, user]);

    // 2. Subscribe to Active Episode & Scene
    useEffect(() => {
        if (!campaign?.currentEpisodeId) {
            setCurrentEpisode(null);
            return;
        }

        const unsubEpisode = onSnapshot(doc(db, 'episodes', campaign.currentEpisodeId), (snap) => {
            if (snap.exists()) {
                const epData = snap.data();
                const ep = { id: snap.id, ...epData } as Episode;
                setCurrentEpisode(ep);

                // Fetch Current Scene if episode has one
                if (ep.currentSceneId) {
                    // We can optimize this by having a separate subscription or just fetching
                    // Here sticking to subscription to ensure realtime updates
                    const unsubScene = onSnapshot(doc(db, 'scenes', ep.currentSceneId), (sceneSnap) => {
                        if (sceneSnap.exists()) {
                            setCurrentScene({ id: sceneSnap.id, ...sceneSnap.data() } as Scene);
                        } else {
                            setCurrentScene(null);
                        }
                    });
                    return () => unsubScene();
                } else {
                    setCurrentScene(null);
                }
            } else {
                setCurrentEpisode(null);
            }
        });

        return () => unsubEpisode();
    }, [campaign?.currentEpisodeId]);

    // 3. Subscribe to My Character
    useEffect(() => {
        if (!member?.characterId) {
            setMyCharacter(null);
            return;
        }

        const unsubChar = onSnapshot(doc(db, 'characters', member.characterId), (snap) => {
            if (snap.exists()) {
                setMyCharacter({ id: snap.id, ...snap.data() } as Character);
            }
        });

        return () => unsubChar();
    }, [member?.characterId]);

    const joinCampaign = useCallback(async (code: string) => {
        if (!user) return false;

        try {
            // Find campaign by join code
            const campaignsRef = collection(db, 'campaigns');
            const q = query(campaignsRef, where('joinCode', '==', code));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast.error("Código de convite inválido");
                return false;
            }

            const campaignDoc = querySnapshot.docs[0];
            const campId = campaignDoc.id;

            // Register member
            await setDoc(doc(db, `campaigns/${campId}/members`, user.uid), {
                userId: user.uid,
                role: 'player',
                characterId: null,
                joinedAt: serverTimestamp()
            });

            toast.success("Você entrou na crônica!");
            return true;
        } catch (e) {
            console.error(e);
            toast.error("Erro ao entrar na campanha");
            return false;
        }
    }, [user]);

    const selectCharacter = useCallback(async (characterId: string) => {
        if (!user || !campaign?.id) return;

        // Use setDoc with merge to be safe against missing member docs
        await setDoc(doc(db, `campaigns/${campaign.id}/members`, user.uid), {
            characterId
        }, { merge: true });
    }, [user, campaign?.id]);

    const updateCampaign = useCallback(async (data: Partial<Campaign>) => {
        if (!campaign?.id) return;
        await updateDoc(doc(db, 'campaigns', campaign.id), data);
    }, [campaign?.id]);

    return (
        <CampaignContext.Provider value={{
            campaign,
            currentEpisode,
            currentScene,
            myCharacter,
            member,
            isGM: campaign?.gmId === user?.uid,
            loading,
            joinCampaign,
            selectCharacter,
            updateCampaign
        }}>
            {children}
        </CampaignContext.Provider>
    );
}

export function useCampaign() {
    const context = useContext(CampaignContext);
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider');
    }
    return context;
}
