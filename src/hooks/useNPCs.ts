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
import { NPC } from '@/types/game';
import { toast } from '@/hooks/use-toast';
import { sanitizeFirestoreData } from '@/utils/sanitizeFirestoreData';

// Default NPCs for iHUNT
export const DEFAULT_NPCS: NPC[] = [
  {
    id: 'fixer-maria',
    name: 'Maria "A Conectora"',
    description: 'Uma intermediária que conhece todos os caçadores da região.',
    aspects: ['Conhece Todo Mundo', 'Nunca Trabalha de Graça', 'Informação é Poder'],
    skills: { Contatos: 4, Enganar: 3, Recursos: 2, Percepção: 2 },
    stress: 2,
    consequences: { mild: null, moderate: null, severe: null },
    notes: 'Cobra 10% de cada trabalho que intermedia.',
    isTemplate: true,
  },
  {
    id: 'cop-detective',
    name: 'Detetive Santos',
    description: 'Um policial que suspeita de atividades sobrenaturais.',
    aspects: ['Cético Mas Curioso', 'A Lei Acima de Tudo', 'Dívida Com Um Caçador'],
    skills: { Investigar: 3, Percepção: 3, Provocar: 2, Atirar: 2 },
    stress: 2,
    consequences: { mild: null, moderate: null, severe: null },
    notes: 'Pode ser um aliado ou problema dependendo das ações dos caçadores.',
    isTemplate: true,
  },
  {
    id: 'bartender-joe',
    name: 'Joe do Bar',
    description: 'O dono do bar onde os caçadores se encontram.',
    aspects: ['Ouço Tudo', 'Bar é Território Neutro', 'Veterano de Guerra'],
    skills: { Empatia: 3, Contatos: 2, Lutar: 2, Vontade: 2 },
    stress: 2,
    consequences: { mild: null, moderate: null, severe: null },
    notes: 'Serve de ponto de encontro e fonte de rumores.',
    isTemplate: true,
  },
  {
    id: 'victim-generic',
    name: 'Vítima em Perigo',
    description: 'Uma pessoa comum que precisa de ajuda.',
    aspects: ['Assustado', 'Não Entende O Que Está Acontecendo'],
    skills: { Atletismo: 1 },
    stress: 1,
    consequences: { mild: null, moderate: null, severe: null },
    isTemplate: true,
  },
];

export function useNPCs(sessionId: string) {
  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to NPCs collection
  useEffect(() => {
    if (!sessionId) {
      setNPCs([]);
      setLoading(false);
      return;
    }

    const npcsRef = collection(db, 'sessions', sessionId, 'npcs');

    const unsubscribe = onSnapshot(
      npcsRef,
      (snapshot) => {
        const npcsData: NPC[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NPC[];
        setNPCs(npcsData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar NPCs:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  const createNPC = useCallback(
    async (npcData: Omit<NPC, 'id'>) => {
      if (!sessionId) return null;

      try {
        const npcId = crypto.randomUUID();
        const npcRef = doc(db, 'sessions', sessionId, 'npcs', npcId);

        const payload = sanitizeFirestoreData({
          ...npcData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await setDoc(npcRef, payload);

        toast({
          title: 'NPC criado',
          description: `"${npcData.name}" foi adicionado.`,
        });

        return npcId;
      } catch (error) {
        console.error('Erro ao criar NPC:', error);
        toast({
          title: 'Erro ao criar NPC',
          description: 'Não foi possível criar o NPC. Tente novamente.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [sessionId]
  );

  const updateNPC = useCallback(
    async (npcId: string, updates: Partial<NPC>) => {
      if (!sessionId) return;

      try {
        const npcRef = doc(db, 'sessions', sessionId, 'npcs', npcId);
        const sanitizedUpdates = sanitizeFirestoreData({
          ...updates,
          updatedAt: serverTimestamp(),
        });
        await updateDoc(npcRef, sanitizedUpdates);
      } catch (error) {
        console.error('Erro ao atualizar NPC:', error);
        toast({
          title: 'Erro ao atualizar NPC',
          description: 'Não foi possível salvar as alterações.',
          variant: 'destructive',
        });
      }
    },
    [sessionId]
  );

  const deleteNPC = useCallback(
    async (npcId: string) => {
      if (!sessionId) return;

      try {
        const npcRef = doc(db, 'sessions', sessionId, 'npcs', npcId);
        await deleteDoc(npcRef);

        toast({
          title: 'NPC removido',
          description: 'O NPC foi excluído.',
        });
      } catch (error) {
        console.error('Erro ao deletar NPC:', error);
        toast({
          title: 'Erro ao remover NPC',
          description: 'Não foi possível excluir o NPC.',
          variant: 'destructive',
        });
      }
    },
    [sessionId]
  );

  const duplicateNPC = useCallback(
    async (npcId: string) => {
      const npc = [...DEFAULT_NPCS, ...npcs].find((n) => n.id === npcId);
      if (!npc) return null;

      return createNPC({
        name: `${npc.name} (cópia)`,
        description: npc.description,
        aspects: [...npc.aspects],
        skills: { ...npc.skills },
        stress: npc.stress,
        consequences: { ...npc.consequences },
        notes: npc.notes,
        avatar: npc.avatar,
      });
    },
    [npcs, createNPC]
  );

  return {
    npcs,
    allNPCs: [...DEFAULT_NPCS, ...npcs.filter(n => !n.isTemplate)],
    loading,
    createNPC,
    updateNPC,
    deleteNPC,
    duplicateNPC,
  };
}
