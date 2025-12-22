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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Character } from '@/types/game';
import { useAuth } from './useAuth';

interface FirebaseCharacter extends Omit<Character, 'id'> {
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function useFirebaseCharacters() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to user's characters
  useEffect(() => {
    if (!user) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'characters'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chars: Character[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Character));
      setCharacters(chars);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createCharacter = useCallback(async (characterData: Omit<Character, 'id'>): Promise<Character | null> => {
    if (!user) return null;

    try {
      const docRef = await addDoc(collection(db, 'characters'), {
        ...characterData,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as FirebaseCharacter);

      return {
        id: docRef.id,
        ...characterData,
      };
    } catch (error) {
      console.error('Error creating character:', error);
      return null;
    }
  }, [user]);

  const updateCharacter = useCallback(async (id: string, updates: Partial<Character>) => {
    try {
      const docRef = doc(db, 'characters', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
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

  const duplicateCharacter = useCallback(async (id: string): Promise<Character | null> => {
    const original = characters.find(c => c.id === id);
    if (!original || !user) return null;

    const { id: _, ...characterData } = original;
    return createCharacter({
      ...characterData,
      name: `${characterData.name} (cópia)`,
    });
  }, [characters, user, createCharacter]);

  return {
    characters,
    loading,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    duplicateCharacter,
  };
}
