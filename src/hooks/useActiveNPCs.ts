import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ActiveNPC, Archetype } from '@/types/game';
import { toast } from '@/hooks/use-toast';
import { sanitizeFirestoreData } from '@/utils/sanitizeFirestoreData';

export function useActiveNPCs(sessionId: string, currentSceneId?: string | null) {
  const [allActiveNPCs, setAllActiveNPCs] = useState<ActiveNPC[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to activeNpcs collection
  useEffect(() => {
    if (!sessionId) {
      setAllActiveNPCs([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, 'sessions', sessionId, 'activeNpcs');

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data: ActiveNPC[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ActiveNPC[];
        setAllActiveNPCs(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar NPCs ativos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  // Filtered lists
  const activeNPCs = useMemo(
    () => allActiveNPCs.filter((n) => !n.sceneId || n.sceneId !== null),
    [allActiveNPCs]
  );

  const npcsInCurrentScene = useMemo(
    () => (currentSceneId ? allActiveNPCs.filter((n) => n.sceneId === currentSceneId) : []),
    [allActiveNPCs, currentSceneId]
  );

  const npcsInOtherScenes = useMemo(
    () =>
      currentSceneId
        ? allActiveNPCs.filter((n) => n.sceneId && n.sceneId !== currentSceneId)
        : allActiveNPCs.filter((n) => n.sceneId),
    [allActiveNPCs, currentSceneId]
  );

  const storedNPCs = useMemo(
    () => allActiveNPCs.filter((n) => !n.sceneId),
    [allActiveNPCs]
  );

  // Create NPC from archetype
  const createFromArchetype = useCallback(
    async (archetype: Archetype, customName: string, sceneId?: string | null) => {
      if (!sessionId) return null;

      try {
        const npcId = crypto.randomUUID();
        const ref = doc(db, 'sessions', sessionId, 'activeNpcs', npcId);

        const npc: Omit<ActiveNPC, 'id' | 'createdAt' | 'updatedAt'> = {
          name: customName.trim(),
          archetypeId: archetype.id,
          archetypeName: archetype.name,
          kind: archetype.kind,
          aspects: [...archetype.aspects],
          skills: { ...archetype.skills },
          stress: archetype.stress,
          currentStress: 0,
          consequences: archetype.consequences || {
            mild: null,
            moderate: null,
            severe: null,
          },
          stunts: archetype.stunts ? [...archetype.stunts] : [],
          avatar: archetype.avatar,
          sceneId: sceneId || null,
          hasToken: false,
          notes: '',
          sceneTags: [],
        };

        await setDoc(
          ref,
          sanitizeFirestoreData({
            ...npc,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );

        toast({
          title: 'NPC criado',
          description: `"${customName}" foi adicionado como NPC ativo.`,
        });

        return npcId;
      } catch (error) {
        console.error('Erro ao criar NPC:', error);
        toast({
          title: 'Erro ao criar NPC',
          description: 'Não foi possível criar o NPC.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [sessionId]
  );

  // Update NPC
  const updateNPC = useCallback(
    async (npcId: string, updates: Partial<ActiveNPC>) => {
      if (!sessionId) return;

      try {
        const ref = doc(db, 'sessions', sessionId, 'activeNpcs', npcId);
        await updateDoc(
          ref,
          sanitizeFirestoreData({
            ...updates,
            updatedAt: serverTimestamp(),
          })
        );
      } catch (error) {
        console.error('Erro ao atualizar NPC:', error);
        toast({
          title: 'Erro ao atualizar',
          description: 'Não foi possível salvar as alterações.',
          variant: 'destructive',
        });
      }
    },
    [sessionId]
  );

  // Move to scene
  const moveToScene = useCallback(
    async (npcId: string, sceneId: string | null, sceneName?: string) => {
      const npc = allActiveNPCs.find((n) => n.id === npcId);
      if (!npc) return;

      const updates: Partial<ActiveNPC> = { sceneId };

      // Add scene tag if moving to a named scene
      if (sceneName && !npc.sceneTags.includes(sceneName)) {
        updates.sceneTags = [...npc.sceneTags, sceneName];
      }

      await updateNPC(npcId, updates);
    },
    [allActiveNPCs, updateNPC]
  );

  // Place token in scene
  const placeToken = useCallback(
    async (npcId: string) => {
      await updateNPC(npcId, { hasToken: true });
    },
    [updateNPC]
  );

  // Remove token from scene
  const removeToken = useCallback(
    async (npcId: string) => {
      await updateNPC(npcId, { hasToken: false });
    },
    [updateNPC]
  );

  // Archive NPC (convert back to archetype)
  const archiveNPC = useCallback(
    async (npcId: string, createArchetype: (data: Omit<Archetype, 'id' | 'isGlobal'>) => Promise<string | null>) => {
      const npc = allActiveNPCs.find((n) => n.id === npcId);
      if (!npc || !sessionId) return;

      try {
        // Create archetype from NPC
        await createArchetype({
          name: `${npc.archetypeName} (${npc.name})`,
          kind: npc.kind,
          aspects: npc.aspects,
          skills: npc.skills,
          stress: npc.stress,
          consequences: npc.consequences,
          stunts: npc.stunts,
          avatar: npc.avatar,
          isArchived: true,
          archivedFromName: npc.name,
        });

        // Delete active NPC
        const ref = doc(db, 'sessions', sessionId, 'activeNpcs', npcId);
        await deleteDoc(ref);

        toast({
          title: 'NPC arquivado',
          description: `"${npc.name}" foi movido para a Base de Arquétipos.`,
        });
      } catch (error) {
        console.error('Erro ao arquivar NPC:', error);
        toast({
          title: 'Erro ao arquivar',
          description: 'Não foi possível arquivar o NPC.',
          variant: 'destructive',
        });
      }
    },
    [allActiveNPCs, sessionId]
  );

  // Delete NPC permanently
  const deleteNPC = useCallback(
    async (npcId: string) => {
      if (!sessionId) return;

      try {
        const ref = doc(db, 'sessions', sessionId, 'activeNpcs', npcId);
        await deleteDoc(ref);

        toast({
          title: 'NPC removido',
          description: 'O NPC foi excluído permanentemente.',
        });
      } catch (error) {
        console.error('Erro ao deletar NPC:', error);
        toast({
          title: 'Erro ao remover',
          description: 'Não foi possível excluir o NPC.',
          variant: 'destructive',
        });
      }
    },
    [sessionId]
  );

  // Add scene tag
  const addSceneTag = useCallback(
    async (npcId: string, tag: string) => {
      const npc = allActiveNPCs.find((n) => n.id === npcId);
      if (!npc || npc.sceneTags.includes(tag)) return;

      await updateNPC(npcId, {
        sceneTags: [...npc.sceneTags, tag],
      });
    },
    [allActiveNPCs, updateNPC]
  );

  return {
    activeNPCs,
    allActiveNPCs,
    npcsInCurrentScene,
    npcsInOtherScenes,
    storedNPCs,
    loading,
    createFromArchetype,
    updateNPC,
    moveToScene,
    placeToken,
    removeToken,
    archiveNPC,
    deleteNPC,
    addSceneTag,
  };
}
