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
import { Archetype, ArchetypeKind } from '@/types/game';
import { toast } from '@/hooks/use-toast';
import { sanitizeFirestoreData } from '@/utils/sanitizeFirestoreData';

// Default archetypes available to all sessions
const DEFAULT_ARCHETYPES: Omit<Archetype, 'id'>[] = [
  // Pessoas
  {
    name: 'Vítima Indefesa',
    kind: 'pessoa',
    description: 'Alguém no lugar errado, na hora errada.',
    aspects: ['Pânico Total', 'Por que eu?!'],
    skills: { Atletismo: 1 },
    stress: 2,
    consequences: { mild: null, moderate: null, severe: null },
    isGlobal: true,
  },
  {
    name: 'Policial de Ronda',
    kind: 'pessoa',
    description: 'Patrulheiro comum que pode complicar as coisas.',
    aspects: ['Cumpro Ordens', 'Algo não está certo aqui'],
    skills: { Atirar: 2, Percepção: 2, Vigor: 1 },
    stress: 3,
    consequences: { mild: null, moderate: null, severe: null },
    stunts: ['Backup: +2 para criar vantagem chamando reforços'],
    isGlobal: true,
  },
  {
    name: 'Informante',
    kind: 'pessoa',
    description: 'Conhece os segredos das ruas e vende informações.',
    aspects: ['Sempre Tenho Um Preço', 'Ouvidos Por Toda Parte'],
    skills: { Contatos: 3, Enganar: 2, Furtividade: 1 },
    stress: 2,
    consequences: { mild: null, moderate: null, severe: null },
    isGlobal: true,
  },
  {
    name: 'Cultista Fanático',
    kind: 'pessoa',
    description: 'Membro de culto disposto a tudo pelo mestre.',
    aspects: ['Devoção Inabalável', 'A Revelação Está Próxima'],
    skills: { Vontade: 3, Provocar: 2, Lutar: 1 },
    stress: 3,
    consequences: { mild: null, moderate: null, severe: null },
    stunts: ['Fé Inabalável: +2 para defender com Vontade contra intimidação'],
    isGlobal: true,
  },
  // Monstros
  {
    name: 'Vampiro Comum',
    kind: 'monstro',
    description: 'Morto-vivo sedento de sangue com poderes sobrenaturais.',
    aspects: ['Sede de Sangue', 'Mestre das Sombras', 'Aversão à Luz Solar'],
    skills: { Lutar: 4, Atletismo: 3, Provocar: 3, Percepção: 2 },
    stress: 4,
    consequences: { mild: null, moderate: null, severe: null },
    stunts: [
      'Mordida Vampírica: Ao causar stress em Lutar, pode recuperar 1 stress próprio',
      'Forma de Névoa: Gaste 1 turno para se tornar incorpóreo',
    ],
    isGlobal: true,
  },
  {
    name: 'Lobisomem',
    kind: 'monstro',
    description: 'Humano amaldiçoado que se transforma em besta.',
    aspects: ['Fúria Animal', 'Lua Cheia Me Chama', 'Prata Queima'],
    skills: { Lutar: 4, Atletismo: 4, Vigor: 3, Percepção: 2 },
    stress: 5,
    consequences: { mild: null, moderate: null, severe: null },
    stunts: [
      'Garras Afiadas: +2 em Lutar para ataques',
      'Regeneração: No início do turno, remove 1 stress (exceto dano de prata)',
    ],
    isGlobal: true,
  },
  {
    name: 'Fantasma Vingativo',
    kind: 'monstro',
    description: 'Espírito preso por assuntos inacabados.',
    aspects: ['Preso Entre Mundos', 'Dor Que Transcende a Morte', 'Vulnerável a Sal e Ferro'],
    skills: { Provocar: 4, Vontade: 3, Furtividade: 3 },
    stress: 3,
    consequences: { mild: null, moderate: null, severe: null },
    stunts: [
      'Incorpóreo: Imune a dano físico normal',
      'Possessão: Uma vez por cena, tente possuir um alvo (superar com Vontade vs Vontade)',
    ],
    isGlobal: true,
  },
  {
    name: 'Demônio Menor',
    kind: 'monstro',
    description: 'Entidade infernal invocada para causar caos.',
    aspects: ['Servo do Abismo', 'Acordos Sempre Têm Um Custo', 'Nome Verdadeiro É Poder'],
    skills: { Enganar: 4, Provocar: 3, Vontade: 3, Lutar: 2 },
    stress: 4,
    consequences: { mild: null, moderate: null, severe: null },
    stunts: [
      'Pacto Infernal: Pode oferecer "ajuda" em troca de algo valioso',
      'Imunidade ao Fogo: Não recebe dano de chamas normais',
    ],
    isGlobal: true,
  },
  {
    name: 'Zumbi',
    kind: 'monstro',
    description: 'Cadáver reanimado sem mente própria.',
    aspects: ['Fome Insaciável', 'Sem Dor', 'Lento Mas Implacável'],
    skills: { Lutar: 2, Vigor: 3 },
    stress: 2,
    consequences: { mild: null, moderate: null, severe: null },
    stunts: ['Mordida Infecciosa: Feridas podem infectar a vítima'],
    isGlobal: true,
  },
];

export function useArchetypes(sessionId: string) {
  const [customArchetypes, setCustomArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to custom archetypes collection
  useEffect(() => {
    if (!sessionId) {
      setCustomArchetypes([]);
      setLoading(false);
      return;
    }

    const archetypesRef = collection(db, 'sessions', sessionId, 'archetypes');

    const unsubscribe = onSnapshot(
      archetypesRef,
      (snapshot) => {
        const data: Archetype[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Archetype[];
        setCustomArchetypes(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar arquétipos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  // Combine global + custom archetypes
  const archetypes = useMemo(() => {
    const globals: Archetype[] = DEFAULT_ARCHETYPES.map((a, idx) => ({
      ...a,
      id: `global-${idx}`,
    }));
    return [...globals, ...customArchetypes];
  }, [customArchetypes]);

  // Search archetypes
  const searchArchetypes = useCallback(
    (query: string, kind?: ArchetypeKind) => {
      const lowerQuery = query.toLowerCase();
      return archetypes.filter((a) => {
        const matchesKind = !kind || a.kind === kind;
        const matchesQuery =
          !query ||
          a.name.toLowerCase().includes(lowerQuery) ||
          a.aspects.some((asp) => asp.toLowerCase().includes(lowerQuery)) ||
          a.description?.toLowerCase().includes(lowerQuery);
        return matchesKind && matchesQuery;
      });
    },
    [archetypes]
  );

  // Create new archetype
  const createArchetype = useCallback(
    async (data: Omit<Archetype, 'id' | 'isGlobal'>) => {
      if (!sessionId) return null;

      try {
        const archetypeId = crypto.randomUUID();
        const ref = doc(db, 'sessions', sessionId, 'archetypes', archetypeId);

        const payload = sanitizeFirestoreData({
          ...data,
          isGlobal: false,
          createdAt: serverTimestamp(),
        });

        await setDoc(ref, payload);

        toast({
          title: 'Arquétipo criado',
          description: `"${data.name}" foi adicionado à base.`,
        });

        return archetypeId;
      } catch (error) {
        console.error('Erro ao criar arquétipo:', error);
        toast({
          title: 'Erro ao criar arquétipo',
          description: 'Não foi possível criar o arquétipo.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [sessionId]
  );

  // Update archetype
  const updateArchetype = useCallback(
    async (archetypeId: string, updates: Partial<Archetype>) => {
      if (!sessionId || archetypeId.startsWith('global-')) return;

      try {
        const ref = doc(db, 'sessions', sessionId, 'archetypes', archetypeId);
        await updateDoc(ref, sanitizeFirestoreData(updates));
      } catch (error) {
        console.error('Erro ao atualizar arquétipo:', error);
        toast({
          title: 'Erro ao atualizar',
          description: 'Não foi possível salvar as alterações.',
          variant: 'destructive',
        });
      }
    },
    [sessionId]
  );

  // Delete archetype (only non-global)
  const deleteArchetype = useCallback(
    async (archetypeId: string) => {
      if (!sessionId || archetypeId.startsWith('global-')) return;

      try {
        const ref = doc(db, 'sessions', sessionId, 'archetypes', archetypeId);
        await deleteDoc(ref);

        toast({
          title: 'Arquétipo removido',
          description: 'O arquétipo foi excluído da base.',
        });
      } catch (error) {
        console.error('Erro ao deletar arquétipo:', error);
        toast({
          title: 'Erro ao remover',
          description: 'Não foi possível excluir o arquétipo.',
          variant: 'destructive',
        });
      }
    },
    [sessionId]
  );

  return {
    archetypes,
    customArchetypes,
    loading,
    searchArchetypes,
    createArchetype,
    updateArchetype,
    deleteArchetype,
  };
}
