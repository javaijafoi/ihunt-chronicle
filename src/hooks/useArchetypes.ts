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
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Archetype } from '@/types/game';
import { DEFAULT_ARCHETYPES } from '@/data/defaultArchetypes';
import { SCENARIO_ARCHETYPES } from '@/data/scenarioArchetypes';
import { toast } from 'sonner';

export function useArchetypes(sessionId: string) {
  const [customArchetypes, setCustomArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setCustomArchetypes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `sessions/${sessionId}/archetypes`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const archetypes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Archetype[];

      setCustomArchetypes(archetypes);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching archetypes:", error);
      toast.error("Erro ao carregar arquétipos");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  const allGlobalArchetypes = [...DEFAULT_ARCHETYPES, ...SCENARIO_ARCHETYPES];
  const allArchetypes = [...customArchetypes, ...allGlobalArchetypes];

  const createArchetype = async (data: Omit<Archetype, 'id' | 'createdAt' | 'isGlobal'>) => {
    if (!sessionId) return;
    try {
      await addDoc(collection(db, `sessions/${sessionId}/archetypes`), {
        ...data,
        isGlobal: false,
        createdAt: serverTimestamp()
      });
      toast.success("Arquétipo criado com sucesso!");
    } catch (error) {
      console.error("Error creating archetype:", error);
      toast.error("Erro ao criar arquétipo");
    }
  };

  const updateArchetype = async (id: string, updates: Partial<Archetype>) => {
    if (!sessionId) return;
    try {
      // Prevent updating globals (though UI should block this too)
      if (id.startsWith('global_') || id.startsWith('scenario_')) {
        toast.error("Não é possível editar arquétipos globais diretamente. Crie uma cópia.");
        return;
      }

      await updateDoc(doc(db, `sessions/${sessionId}/archetypes`, id), updates);
      toast.success("Arquétipo atualizado!");
    } catch (error) {
      console.error("Error updating archetype:", error);
      toast.error("Erro ao atualizar arquétipo");
    }
  };

  const deleteArchetype = async (id: string) => {
    if (!sessionId) return;
    if (id.startsWith('global_') || id.startsWith('scenario_')) return;

    try {
      await deleteDoc(doc(db, `sessions/${sessionId}/archetypes`, id));
      toast.success("Arquétipo removido!");
    } catch (error) {
      console.error("Error deleting archetype:", error);
      toast.error("Erro ao remover arquétipo");
    }
  };

  return {
    archetypes: allArchetypes,
    customArchetypes,
    globalArchetypes: allGlobalArchetypes,
    loading,
    createArchetype,
    updateArchetype,
    deleteArchetype
  };
}
