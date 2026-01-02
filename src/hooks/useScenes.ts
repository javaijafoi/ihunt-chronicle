import { useState, useEffect, useCallback } from 'react';
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Scene, SceneAspect } from '@/types/game';
import { toast } from '@/hooks/use-toast';

export function useScenes(sessionId: string) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to scenes collection
  useEffect(() => {
    if (!sessionId) {
      setScenes([]);
      setLoading(false);
      return;
    }

    const scenesRef = collection(db, 'sessions', sessionId, 'scenes');
    const scenesQuery = query(scenesRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(
      scenesQuery,
      (snapshot) => {
        const scenesData: Scene[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Scene[];
        setScenes(scenesData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar cenas:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  const createScene = useCallback(
    async (sceneData: Omit<Scene, 'id'>) => {
      if (!sessionId) return null;

      try {
        const sceneId = crypto.randomUUID();
        const sceneRef = doc(db, 'sessions', sessionId, 'scenes', sceneId);

        await setDoc(sceneRef, {
          ...sceneData,
          order: scenes.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        toast({
          title: 'Cena criada',
          description: `"${sceneData.name}" foi adicionada à sessão.`,
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
    [sessionId, scenes.length]
  );

  const updateScene = useCallback(
    async (sceneId: string, updates: Partial<Scene>) => {
      if (!sessionId) return;

      try {
        const sceneRef = doc(db, 'sessions', sessionId, 'scenes', sceneId);
        await updateDoc(sceneRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Erro ao atualizar cena:', error);
        toast({
          title: 'Erro ao atualizar cena',
          description: 'Não foi possível salvar as alterações.',
          variant: 'destructive',
        });
      }
    },
    [sessionId]
  );

  const deleteScene = useCallback(
    async (sceneId: string) => {
      if (!sessionId) return;

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
    [sessionId]
  );

  const setActiveScene = useCallback(
    async (sceneId: string) => {
      if (!sessionId) return;

      try {
        const batch = writeBatch(db);

        // Deactivate all scenes
        for (const scene of scenes) {
          const sceneRef = doc(db, 'sessions', sessionId, 'scenes', scene.id);
          batch.update(sceneRef, { isActive: scene.id === sceneId });
        }

        // Update session's currentScene with the active scene data
        const activeScene = scenes.find((s) => s.id === sceneId);
        if (activeScene) {
          const sessionRef = doc(db, 'sessions', sessionId);
          batch.update(sessionRef, {
            currentScene: {
              name: activeScene.name,
              background: activeScene.background || null,
              aspects: activeScene.aspects || [],
            },
            updatedAt: serverTimestamp(),
          });
        }

        await batch.commit();

        toast({
          title: 'Cena ativa alterada',
          description: `"${activeScene?.name}" agora é a cena ativa.`,
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
    [sessionId, scenes]
  );

  const updateSceneAspects = useCallback(
    async (sceneId: string, aspects: SceneAspect[]) => {
      await updateScene(sceneId, { aspects });

      // Also update session's currentScene if this is the active scene
      const activeScene = scenes.find((s) => s.id === sceneId && s.isActive);
      if (activeScene) {
        const sessionRef = doc(db, 'sessions', sessionId);
        await updateDoc(sessionRef, {
          'currentScene.aspects': aspects,
          updatedAt: serverTimestamp(),
        });
      }
    },
    [sessionId, scenes, updateScene]
  );

  const duplicateScene = useCallback(
    async (sceneId: string) => {
      const scene = scenes.find((s) => s.id === sceneId);
      if (!scene) return null;

      return createScene({
        name: `${scene.name} (cópia)`,
        background: scene.background,
        aspects: scene.aspects.map((a) => ({ ...a, id: crypto.randomUUID() })),
        isActive: false,
      });
    },
    [scenes, createScene]
  );

  return {
    scenes,
    loading,
    createScene,
    updateScene,
    deleteScene,
    setActiveScene,
    updateSceneAspects,
    duplicateScene,
  };
}
