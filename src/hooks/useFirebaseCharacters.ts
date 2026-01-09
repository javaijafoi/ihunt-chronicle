import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  type FirestoreError
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Character } from '@/types/game';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { GLOBAL_SESSION_ID } from './useSession';
import { sanitizeFirestoreData } from '@/utils/sanitizeFirestoreData';

interface FirebaseCharacter extends Omit<Character, 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function useFirebaseCharacters(sessionId: string) {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to user's characters
  useEffect(() => {
    if (!user || !sessionId) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'characters'),
      where('sessionId', '==', sessionId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chars: Character[] = snapshot.docs.map(doc => {
          const data = doc.data() as Character & { ownerId?: string };
          return {
            id: doc.id,
            ...data,
            sessionId: data.sessionId || GLOBAL_SESSION_ID,
            createdBy: data.createdBy || data.ownerId || 'desconhecido',
          };
        }).filter(char => !(char as Character).isArchived) as Character[];
        setCharacters(chars);
        setLoading(false);
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
          toast({
            title: 'Acesso negado',
            description: 'Perdemos o acesso aos seus personagens. Entre novamente para continuar.',
            variant: 'destructive',
          });
          setCharacters([]);
        } else {
          console.error('Erro ao escutar personagens do usuário:', error);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, sessionId]);

  const createCharacter = useCallback(async (characterData: Omit<Character, 'id'>): Promise<Character | null> => {
    if (!user || !sessionId) return null;

    try {
      const characterSessionId = characterData.sessionId || sessionId || GLOBAL_SESSION_ID;
      const createdBy = user.uid;

      const payload = sanitizeFirestoreData({
        ...characterData,
        sessionId: characterSessionId,
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }) as FirebaseCharacter;

      const docRef = await addDoc(collection(db, 'characters'), payload);

      return {
        id: docRef.id,
        ...sanitizeFirestoreData({
          ...characterData,
          sessionId: characterSessionId,
          createdBy,
        }),
      };
    } catch (error) {
      console.error('Error creating character:', error);
      return null;
    }
  }, [user, sessionId]);

  const updateCharacter = useCallback(async (id: string, updates: Partial<Character>) => {
    try {
      const docRef = doc(db, 'characters', id);
      const sanitizedUpdates = sanitizeFirestoreData({
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(docRef, sanitizedUpdates);
    } catch (error) {
      console.error('Error updating character:', error);
    }
  }, []);

  const deleteCharacter = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'characters', id));
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  }, []);

  const archiveCharacter = useCallback(async (id: string) => {
    try {
      const docRef = doc(db, 'characters', id);
      await updateDoc(docRef, {
        isArchived: true,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Personagem arquivado',
        description: 'O personagem foi movido para o arquivo.',
      });
    } catch (error) {
      console.error('Error archiving character:', error);
      toast({
        title: 'Erro ao arquivar',
        description: 'Não foi possível arquivar o personagem.',
        variant: 'destructive',
      });
    }
  }, []);

  const unarchiveCharacter = useCallback(async (id: string) => {
    try {
      const docRef = doc(db, 'characters', id);
      await updateDoc(docRef, {
        isArchived: false,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Personagem recuperado',
        description: 'O personagem foi movido de volta para a lista principal.',
      });
    } catch (error) {
      console.error('Error unarchiving character:', error);
      toast({
        title: 'Erro ao desafazer arquivamento',
        description: 'Não foi possível recuperar o personagem.',
        variant: 'destructive',
      });
    }
  }, []);

  const duplicateCharacter = useCallback(async (id: string): Promise<Character | null> => {
    const original = characters.find(c => c.id === id);
    if (!original || !user || !sessionId) return null;

    const { id: _, createdBy: _createdBy, ...characterData } = original;
    return createCharacter({
      ...characterData,
      sessionId: original.sessionId,
      createdBy: user.uid,
      name: `${characterData.name} (cópia)`,
    });
  }, [characters, user, sessionId, createCharacter]);

  return {
    characters,
    loading,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    duplicateCharacter,
    archiveCharacter,
    unarchiveCharacter,
  };
}
