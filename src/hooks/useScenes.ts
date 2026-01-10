import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Scene, SceneAspect } from '@/types/game';
import { toast } from 'sonner';

// Minimum aspects required for a scene
const MIN_ASPECTS = 3;

// Default aspects for new scenes
const DEFAULT_ASPECTS: Omit<SceneAspect, 'id'>[] = [
  { name: 'Aspecto de Cena 1', freeInvokes: 1, createdBy: 'gm', isTemporary: false },
  { name: 'Aspecto de Cena 2', freeInvokes: 0, createdBy: 'gm', isTemporary: false },
  { name: 'Aspecto de Cena 3', freeInvokes: 0, createdBy: 'gm', isTemporary: false },
];

export interface ExtendedScene extends Scene {
  isArchived?: boolean;
}

export function useScenes(episodeId: string | undefined, campaignId: string | undefined, isGM: boolean = false) {
  const [allScenes, setAllScenes] = useState<ExtendedScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to scenes collection
  useEffect(() => {
    if (!episodeId) {
      setAllScenes([]);
      setLoading(false);
      return;
    }

    // Flat collection query
    const scenesRef = collection(db, 'scenes');
    const scenesQuery = query(
      scenesRef,
      where('episodeId', '==', episodeId)
    );

    const unsubscribe = onSnapshot(
      scenesQuery,
      (snapshot) => {
        const scenesData: ExtendedScene[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ExtendedScene[];

        // Sort client-side
        scenesData.sort((a, b) => (a.order || 0) - (b.order || 0));

        setAllScenes(scenesData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar cenas:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [episodeId]);

  // Filter scenes based on user role
  const scenes = useMemo(() => {
    let filtered = allScenes;

    if (!isGM) {
      filtered = allScenes.filter((s) => s.isActive);
    } else {
      filtered = allScenes.filter((s) => !s.isArchived);
    }

    if (isGM && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.aspects?.some((a) => a.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [allScenes, isGM, searchQuery]);

  // Get archived scenes (GM only)
  const archivedScenes = useMemo(() => {
    if (!isGM) return [];
    return allScenes.filter((s) => s.isArchived);
  }, [allScenes, isGM]);

  // Get the active scene
  const activeScene = useMemo(() => {
    return allScenes.find((s) => s.isActive) || null;
  }, [allScenes]);

  const validateAspects = useCallback((aspects: SceneAspect[]): SceneAspect[] => {
    if (aspects.length >= MIN_ASPECTS) return aspects;

    const newAspects = [...aspects];
    while (newAspects.length < MIN_ASPECTS) {
      const defaultAspect = DEFAULT_ASPECTS[newAspects.length] || DEFAULT_ASPECTS[0];
      newAspects.push({
        ...defaultAspect,
        id: crypto.randomUUID(),
        name: `Aspecto ${newAspects.length + 1}`,
      });
    }
    return newAspects;
  }, []);

  const createScene = useCallback(
    async (sceneData: Omit<Scene, 'id' | 'episodeId' | 'campaignId' | 'order'>) => {
      if (!episodeId || !campaignId) return null;

      const validatedAspects = validateAspects(sceneData.aspects || []);

      try {
        const sceneId = crypto.randomUUID();
        const sceneRef = doc(db, 'scenes', sceneId);

        const isFirstScene = allScenes.length === 0;

        await setDoc(sceneRef, {
          ...sceneData,
          episodeId,
          campaignId,
          aspects: validatedAspects,
          isActive: isFirstScene || sceneData.isActive,
          isArchived: false,
          order: allScenes.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // If active, update episode currentSceneId
        if (isFirstScene || sceneData.isActive) {
          const epRef = doc(db, 'episodes', episodeId);
          await updateDoc(epRef, {
            currentSceneId: sceneId,
            // We might not need to duplicate aspect data here anymore if Clients subscribe to Scene directly
          });
        }

        toast.success(`Cena "${sceneData.name}" criada.`);
        return sceneId;
      } catch (error) {
        console.error('Erro ao criar cena:', error);
        toast.error('Erro ao criar cena.');
        return null;
      }
    },
    [episodeId, campaignId, allScenes.length, validateAspects]
  );

  const updateScene = useCallback(
    async (sceneId: string, updates: Partial<ExtendedScene>) => {
      try {
        const sceneRef = doc(db, 'scenes', sceneId);

        if (updates.aspects) {
          updates.aspects = validateAspects(updates.aspects);
        }

        await updateDoc(sceneRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });

        // We don't necessarily update Episode doc here unless we want to cache name/bg
      } catch (error) {
        console.error('Erro ao atualizar cena:', error);
        toast.error('Erro ao atualizar cena.');
      }
    },
    [validateAspects]
  );

  const deleteScene = useCallback(
    async (sceneId: string) => {
      const scene = allScenes.find((s) => s.id === sceneId);
      if (scene?.isActive) {
        toast.error('Ative outra cena antes de excluir esta.');
        return;
      }

      try {
        await deleteDoc(doc(db, 'scenes', sceneId));
        toast.success('Cena removida.');
      } catch (error) {
        console.error('Erro ao deletar cena:', error);
        toast.error('Erro ao remover cena.');
      }
    },
    [allScenes]
  );

  const setActiveScene = useCallback(
    async (sceneId: string) => {
      if (!episodeId) return;

      try {
        const batch = writeBatch(db);
        const targetScene = allScenes.find((s) => s.id === sceneId);

        if (!targetScene) return;

        const validatedAspects = validateAspects(targetScene.aspects || []);

        // Deactivate all matching scenes, activate target
        for (const scene of allScenes) {
          const sceneRef = doc(db, 'scenes', scene.id);
          if (scene.id === sceneId) {
            batch.update(sceneRef, {
              isActive: true,
              isArchived: false,
              aspects: validatedAspects,
            });
          } else {
            // Only update if it was mistakenly active? Or just safe update
            if (scene.isActive) batch.update(sceneRef, { isActive: false });
          }
        }

        const epRef = doc(db, 'episodes', episodeId);
        batch.update(epRef, {
          currentSceneId: sceneId
        });

        await batch.commit();

        toast.success(`Cena ativa: ${targetScene.name}`);
      } catch (error) {
        console.error('Erro ao definir cena ativa:', error);
        toast.error('Erro ao trocar cena.');
      }
    },
    [episodeId, allScenes, validateAspects]
  );

  const archiveScene = useCallback(
    async (sceneId: string) => {
      const scene = allScenes.find((s) => s.id === sceneId);
      if (scene?.isActive) {
        toast.error('Ative outra cena antes de arquivar.');
        return;
      }

      try {
        await updateDoc(doc(db, 'scenes', sceneId), {
          isArchived: true,
          updatedAt: serverTimestamp(),
        });
        toast.success('Cena arquivada.');
      } catch (error) {
        console.error('Erro ao arquivar cena:', error);
      }
    },
    [allScenes]
  );

  const unarchiveScene = useCallback(
    async (sceneId: string) => {
      try {
        await updateDoc(doc(db, 'scenes', sceneId), {
          isArchived: false,
          updatedAt: serverTimestamp(),
        });
        toast.success('Cena restaurada.');
      } catch (error) {
        console.error('Erro ao restaurar cena:', error);
      }
    },
    []
  );

  const updateSceneAspects = useCallback(
    async (sceneId: string, aspects: SceneAspect[]) => {
      const validatedAspects = validateAspects(aspects);
      await updateScene(sceneId, { aspects: validatedAspects });
    },
    [updateScene, validateAspects]
  );

  const duplicateScene = useCallback(
    async (sceneId: string) => {
      const scene = allScenes.find((s) => s.id === sceneId);
      if (!scene) return null;

      return createScene({
        name: `${scene.name} (cópia)`,
        background: scene.background,
        aspects: scene.aspects.map((a) => ({ ...a, id: crypto.randomUUID() })),
        isActive: false,
      });
    },
    [allScenes, createScene]
  );

  return {
    scenes,
    allScenes,
    archivedScenes,
    activeScene,
    loading,
    searchQuery,
    setSearchQuery,
    createScene,
    updateScene,
    deleteScene,
    setActiveScene,
    archiveScene,
    unarchiveScene,
    updateSceneAspects,
    duplicateScene,
    MIN_ASPECTS,
  };
}
