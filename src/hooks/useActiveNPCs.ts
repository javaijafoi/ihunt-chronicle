import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ActiveNPC, Archetype } from '@/types/game';
import { toast } from 'sonner';

export function useActiveNPCs(campaignId: string | undefined) {
  const [activeNPCs, setActiveNPCs] = useState<ActiveNPC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) {
      setActiveNPCs([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'activeNpcs'),
      where('campaignId', '==', campaignId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const npcs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActiveNPC[];

      setActiveNPCs(npcs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching Active NPCs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [campaignId]);

  const createFromArchetype = async (archetype: Archetype, customName: string) => {
    if (!campaignId) return;
    try {
      const newNPC = {
        name: customName || archetype.name,
        archetypeId: archetype.id,
        archetypeName: archetype.name,
        kind: archetype.kind,
        aspects: [...archetype.aspects],
        skills: { ...archetype.skills },
        stress: archetype.stress,
        currentStress: 0,
        consequences: { ...archetype.consequences },
        stunts: archetype.stunts ? [...archetype.stunts] : [],
        avatar: archetype.avatar,
        campaignId,

        sceneId: null, // Starts "guarded" / off-scene
        episodeId: null,
        hasToken: false,
        notes: "",
        sceneTags: [],

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'activeNpcs'), newNPC);
      toast.success(`${customName} adicionado à sessão!`);
    } catch (error) {
      console.error("Error creating Active NPC:", error);
      toast.error("Erro ao adicionar NPC");
    }
  };

  const updateNPC = async (id: string, updates: Partial<ActiveNPC>) => {
    try {
      await updateDoc(doc(db, 'activeNpcs', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      // Silent success for frequent updates (like stress)
    } catch (error) {
      console.error("Error updating NPC:", error);
      toast.error("Erro ao atualizar NPC");
    }
  };

  const deleteNPC = async (id: string) => {
    if (window.confirm("Isso removerá permanentemente este NPC e todo seu histórico. Tem certeza?")) {
      try {
        await deleteDoc(doc(db, 'activeNpcs', id));
        toast.success("NPC removido permanentemente.");
      } catch (error) {
        console.error("Error deleting NPC:", error);
        toast.error("Erro ao remover NPC");
      }
    }
  };

  const moveToScene = async (npcId: string, sceneId: string | null) => {
    await updateNPC(npcId, {
      sceneId,
      hasToken: sceneId !== null // Auto-enable token if moving to a scene, disable if removing
    });
    if (sceneId) toast.success("NPC movido para a cena.");
    else toast.success("NPC guardado (removido da cena).");
  };

  const toggleToken = async (npcId: string, hasToken: boolean) => {
    await updateNPC(npcId, { hasToken });
  };

  return {
    activeNPCs,
    loading,
    createFromArchetype,
    updateNPC,
    deleteNPC,
    moveToScene,
    toggleToken
  };
}
