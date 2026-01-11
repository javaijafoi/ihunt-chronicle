
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
import { sanitizeFirestoreData } from '@/utils/sanitizeFirestoreData';

interface FirebaseCharacter extends Omit<Character, 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function useFirebaseCharacters(campaignId: string | undefined) {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to user's characters in the campaign
  useEffect(() => {
    if (!user || !campaignId) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query characters in this campaign (assuming validation is done elsewhere or we check ownerId matches user for edit rights later)
    // Actually, this hook seems to fetch "My Characters" usually?
    // "Listen to user's characters" -> comment says so.
    // If it's listening to ALL characters in campaign, that's different.
    // The previous code had:  where('sessionId', '==', sessionId)
    // And filtered: filter(char => !(char as Character).isArchived)
    // It didn't filter by ownerId in the query, but maybe in logic?
    // Wait, let's look at previous code:
    // It fetched ALL characters in session.

    const q = query(
      collection(db, 'characters'),
      where('campaignId', '==', campaignId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chars: Character[] = snapshot.docs.map(doc => {
          const data = doc.data() as Character;
          return {
            id: doc.id,
            ...data,
          };
        }) as Character[];
        setCharacters(chars);
        setLoading(false);
      },
      (error: FirestoreError) => {
        console.error('Erro ao escutar personagens:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, campaignId]);

  const createCharacter = useCallback(async (characterData: Omit<Character, 'id'>): Promise<Character | null> => {
    if (!user || !campaignId) return null;

    try {
      const createdBy = user.uid;

      const payload = sanitizeFirestoreData({
        ...characterData,
        campaignId,
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }) as FirebaseCharacter;

      const docRef = await addDoc(collection(db, 'characters'), payload);

      return {
        id: docRef.id,
        ...sanitizeFirestoreData({
          ...characterData,
          campaignId,
          createdBy,
        }),
      };
    } catch (error) {
      console.error('Error creating character:', error);
      return null;
    }
  }, [user, campaignId]);

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
    if (!original || !user || !campaignId) return null;

    const { id: _, ...characterData } = original;
    return createCharacter({
      ...characterData,
      campaignId,
      createdBy: user.uid,
      name: `${characterData.name} (cópia)`,
    });
  }, [characters, user, campaignId, createCharacter]);

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
