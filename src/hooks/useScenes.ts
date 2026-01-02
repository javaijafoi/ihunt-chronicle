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
  orderBy,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Scene, SceneAspect } from '@/types/game';
import { toast } from '@/hooks/use-toast';

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
  order?: number;
}

export function useScenes(sessionId: string, isGM: boolean = false) {
  const [allScenes, setAllScenes] = useState<ExtendedScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to scenes collection
  useEffect(() => {
    if (!sessionId) {
      setAllScenes([]);
      setLoading(false);
      return;
    }

    const scenesRef = collection(db, 'sessions', sessionId, 'scenes');
    const scenesQuery = query(scenesRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(
      scenesQuery,
      (snapshot) => {
        const scenesData: ExtendedScene[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ExtendedScene[];
        setAllScenes(scenesData);
        setLoading(false);
      },
      (error) => {
        // Permission denied is expected when user hasn't joined session yet
        if (error.code === 'permission-denied') {
          setAllScenes([]);
        } else {
          console.error('Erro ao carregar cenas:', error);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  // Filter scenes based on user role
  // - Everyone sees the active scene
  // - Only GM sees inactive/archived scenes
  const scenes = useMemo(() => {
    let filtered = allScenes;

    // Non-GM users only see active scene
    if (!isGM) {
      filtered = allScenes.filter((s) => s.isActive);
    } else {
      // GM sees all non-archived scenes (archived are hidden by default)
      filtered = allScenes.filter((s) => !s.isArchived);
    }

    // Apply search filter (GM only)
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

  // Validate aspects - ensure minimum count
  const validateAspects = useCallback((aspects: SceneAspect[]): SceneAspect[] => {
    if (aspects.length >= MIN_ASPECTS) return aspects;

    // Add default aspects to reach minimum
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
    async (sceneData: Omit<Scene, 'id'>) => {
      if (!sessionId) return null;

      // Ensure minimum aspects
      const validatedAspects = validateAspects(sceneData.aspects || []);

      try {
        const sceneId = crypto.randomUUID();
        const sceneRef = doc(db, 'sessions', sessionId, 'scenes', sceneId);

        const isFirstScene = allScenes.length === 0;

        await setDoc(sceneRef, {
          ...sceneData,
          aspects: validatedAspects,
          isActive: isFirstScene || sceneData.isActive, // First scene is always active
          isArchived: false,
          order: allScenes.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // If this is the first/active scene, sync to session
        if (isFirstScene || sceneData.isActive) {
          const sessionRef = doc(db, 'sessions', sessionId);
          await updateDoc(sessionRef, {
            currentScene: {
              id: sceneId,
              name: sceneData.name,
              background: sceneData.background || null,
              aspects: validatedAspects,
            },
            updatedAt: serverTimestamp(),
          });
        }

        toast({
          title: 'Cena criada',
          description: `"${sceneData.name}" foi adicionada com ${validatedAspects.length} aspectos.`,
        });

        return sceneId;
      } catch (error) {
        console.error('Erro ao criar cena:', error);
        toast({
          title: 'Erro ao criar cena',
          description: 'Não foi possível criar a cena. Tente novamente.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [sessionId, allScenes.length, validateAspects]
  );

  const updateScene = useCallback(
    async (sceneId: string, updates: Partial<ExtendedScene>) => {
      if (!sessionId) return;

      try {
        const sceneRef = doc(db, 'sessions', sessionId, 'scenes', sceneId);

        // If updating aspects, validate them
        if (updates.aspects) {
          updates.aspects = validateAspects(updates.aspects);
        }

        await updateDoc(sceneRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });

        // Sync to session if this is the active scene
        const scene = allScenes.find((s) => s.id === sceneId);
        if (scene?.isActive) {
          const sessionRef = doc(db, 'sessions', sessionId);
          await updateDoc(sessionRef, {
            currentScene: {
              id: sceneId,
              name: updates.name || scene.name,
              background: updates.background !== undefined ? updates.background : scene.background,
              aspects: updates.aspects || scene.aspects,
            },
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar cena:', error);
        toast({
          title: 'Erro ao atualizar cena',
          description: 'Não foi possível salvar as alterações.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, allScenes, validateAspects]
  );

  const deleteScene = useCallback(
    async (sceneId: string) => {
      if (!sessionId) return;

      const scene = allScenes.find((s) => s.id === sceneId);
      if (scene?.isActive) {
        toast({
          title: 'Não é possível excluir',
          description: 'Ative outra cena antes de excluir esta.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const sceneRef = doc(db, 'sessions', sessionId, 'scenes', sceneId);
        await deleteDoc(sceneRef);

        toast({
          title: 'Cena removida',
          description: 'A cena foi excluída da sessão.',
        });
      } catch (error) {
        console.error('Erro ao deletar cena:', error);
        toast({
          title: 'Erro ao remover cena',
          description: 'Não foi possível excluir a cena.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, allScenes]
  );

  const setActiveScene = useCallback(
    async (sceneId: string) => {
      if (!sessionId) return;

      try {
        const batch = writeBatch(db);
        const targetScene = allScenes.find((s) => s.id === sceneId);

        if (!targetScene) return;

        // Validate aspects before activating
        const validatedAspects = validateAspects(targetScene.aspects || []);

        // Deactivate all scenes, activate target
        for (const scene of allScenes) {
          const sceneRef = doc(db, 'sessions', sessionId, 'scenes', scene.id);
          if (scene.id === sceneId) {
            batch.update(sceneRef, { 
              isActive: true, 
              isArchived: false, // Unarchive if archived
              aspects: validatedAspects,
            });
          } else {
            batch.update(sceneRef, { isActive: false });
          }
        }

        // Update session's currentScene with the active scene data
        const sessionRef = doc(db, 'sessions', sessionId);
        batch.update(sessionRef, {
          currentScene: {
            id: sceneId,
            name: targetScene.name,
            background: targetScene.background || null,
            aspects: validatedAspects,
          },
          updatedAt: serverTimestamp(),
        });

        await batch.commit();

        toast({
          title: 'Cena ativa alterada',
          description: `"${targetScene.name}" agora é a cena ativa para todos.`,
        });
      } catch (error) {
        console.error('Erro ao definir cena ativa:', error);
        toast({
          title: 'Erro ao trocar cena',
          description: 'Não foi possível alterar a cena ativa.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, allScenes, validateAspects]
  );

  const archiveScene = useCallback(
    async (sceneId: string) => {
      if (!sessionId) return;

      const scene = allScenes.find((s) => s.id === sceneId);
      if (scene?.isActive) {
        toast({
          title: 'Não é possível arquivar',
          description: 'Ative outra cena antes de arquivar esta.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const sceneRef = doc(db, 'sessions', sessionId, 'scenes', sceneId);
        await updateDoc(sceneRef, {
          isArchived: true,
          updatedAt: serverTimestamp(),
        });

        toast({
          title: 'Cena arquivada',
          description: 'A cena foi movida para o arquivo.',
        });
      } catch (error) {
        console.error('Erro ao arquivar cena:', error);
      }
    },
    [sessionId, allScenes]
  );

  const unarchiveScene = useCallback(
    async (sceneId: string) => {
      if (!sessionId) return;

      try {
        const sceneRef = doc(db, 'sessions', sessionId, 'scenes', sceneId);
        await updateDoc(sceneRef, {
          isArchived: false,
          updatedAt: serverTimestamp(),
        });

        toast({
          title: 'Cena restaurada',
          description: 'A cena foi removida do arquivo.',
        });
      } catch (error) {
        console.error('Erro ao restaurar cena:', error);
      }
    },
    [sessionId]
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
    scenes, // Filtered based on user role
    allScenes, // All scenes (for GM reference)
    archivedScenes, // Archived scenes (GM only)
    activeScene, // Current active scene
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
