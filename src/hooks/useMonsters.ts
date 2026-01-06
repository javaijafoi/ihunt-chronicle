import { useState, useEffect, useCallback } from 'react';
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
import { Monster } from '@/components/vtt/MonsterDatabase';
import { toast } from '@/hooks/use-toast';
import { sanitizeFirestoreData } from '@/utils/sanitizeFirestoreData';

export function useMonsters(sessionId: string) {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to monsters collection
  useEffect(() => {
    if (!sessionId) {
      setMonsters([]);
      setLoading(false);
      return;
    }

    const monstersRef = collection(db, 'sessions', sessionId, 'monsters');

    const unsubscribe = onSnapshot(
      monstersRef,
      (snapshot) => {
        const monstersData: Monster[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Monster[];
        setMonsters(monstersData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar monstros:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  const createMonster = useCallback(
    async (monsterData: Omit<Monster, 'id'>) => {
      if (!sessionId) return null;

      try {
        const monsterId = crypto.randomUUID();
        const monsterRef = doc(db, 'sessions', sessionId, 'monsters', monsterId);

        const payload = sanitizeFirestoreData({
          ...monsterData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await setDoc(monsterRef, payload);

        toast({
          title: 'Monstro criado',
          description: `"${monsterData.name}" foi adicionado à base.`,
        });

        return monsterId;
      } catch (error) {
        console.error('Erro ao criar monstro:', error);
        toast({
          title: 'Erro ao criar monstro',
          description: 'Não foi possível criar o monstro. Tente novamente.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [sessionId]
  );

  const updateMonster = useCallback(
    async (monsterId: string, updates: Partial<Monster>) => {
      if (!sessionId) return;

      try {
        const monsterRef = doc(db, 'sessions', sessionId, 'monsters', monsterId);
        const sanitizedUpdates = sanitizeFirestoreData({
          ...updates,
          updatedAt: serverTimestamp(),
        });

        await updateDoc(monsterRef, sanitizedUpdates);
      } catch (error) {
        console.error('Erro ao atualizar monstro:', error);
        toast({
          title: 'Erro ao atualizar monstro',
          description: 'Não foi possível salvar as alterações.',
          variant: 'destructive',
        });
      }
    },
    [sessionId]
  );

  const deleteMonster = useCallback(
    async (monsterId: string) => {
      if (!sessionId) return;

      try {
        const monsterRef = doc(db, 'sessions', sessionId, 'monsters', monsterId);
        await deleteDoc(monsterRef);

        toast({
          title: 'Monstro removido',
          description: 'O monstro foi excluído da base.',
        });
      } catch (error) {
        console.error('Erro ao deletar monstro:', error);
        toast({
          title: 'Erro ao remover monstro',
          description: 'Não foi possível excluir o monstro.',
          variant: 'destructive',
        });
      }
    },
    [sessionId]
  );

  const duplicateMonster = useCallback(
    async (monsterId: string) => {
      const monster = monsters.find((m) => m.id === monsterId);
      if (!monster) return null;

      return createMonster({
        name: `${monster.name} (cópia)`,
        description: monster.description,
        aspects: [...monster.aspects],
        skills: { ...monster.skills },
        stress: monster.stress,
        stunts: monster.stunts ? [...monster.stunts] : undefined,
      });
    },
    [monsters, createMonster]
  );

  return {
    monsters,
    loading,
    createMonster,
    updateMonster,
    deleteMonster,
    duplicateMonster,
  };
}
