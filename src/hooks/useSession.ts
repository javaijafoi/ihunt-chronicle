import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { GameSession } from '@/types/session';
import { SceneAspect } from '@/types/game';

export function useSession() {
  const { user, userProfile } = useAuth();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('ihunt-current-session');
  });

  // Listen to current session
  useEffect(() => {
    if (!sessionId) {
      setCurrentSession(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'sessions', sessionId), (snapshot) => {
      if (snapshot.exists()) {
        setCurrentSession({
          id: snapshot.id,
          ...snapshot.data(),
          createdAt: (snapshot.data().createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (snapshot.data().updatedAt as Timestamp)?.toDate() || new Date(),
        } as GameSession);
      } else {
        setCurrentSession(null);
        localStorage.removeItem('ihunt-current-session');
        setSessionId(null);
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  const createSession = useCallback(async (name: string): Promise<string | null> => {
    if (!user) return null;
    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        name,
        gmId: user.uid,
        characterIds: [],
        currentScene: null,
        gmFatePool: 3,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      localStorage.setItem('ihunt-current-session', docRef.id);
      setSessionId(docRef.id);
      setLoading(false);
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      setLoading(false);
      return null;
    }
  }, [user]);

  const joinSession = useCallback(async (id: string, characterId: string): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);

    try {
      const sessionRef = doc(db, 'sessions', id);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        setLoading(false);
        return false;
      }

      // Add character to session
      await updateDoc(sessionRef, {
        characterIds: arrayUnion(characterId),
        updatedAt: serverTimestamp(),
      });

      // Set presence
      const presenceRef = doc(db, 'sessions', id, 'presence', user.uid);
      await setDoc(presenceRef, {
        oderId: user.uid,
        ownerName: userProfile?.displayName || 'Caçador',
        characterId: characterId,
        lastSeen: serverTimestamp(),
        online: true,
      });

      localStorage.setItem('ihunt-current-session', id);
      setSessionId(id);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error joining session:', error);
      setLoading(false);
      return false;
    }
  }, [user, userProfile]);

  const leaveSession = useCallback(async () => {
    if (!user || !sessionId) return;

    try {
      // Remove presence
      await deleteDoc(doc(db, 'sessions', sessionId, 'presence', user.uid));

      // If GM, don't remove from characterIds (keep session intact)
      // If player, optionally remove character (we'll keep it for now)
      
      localStorage.removeItem('ihunt-current-session');
      setSessionId(null);
      setCurrentSession(null);
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  }, [user, sessionId]);

  const updateSession = useCallback(async (updates: Partial<GameSession>) => {
    if (!sessionId) return;

    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }, [sessionId]);

  const updateGmFatePool = useCallback(async (amount: number) => {
    if (!currentSession) return;
    await updateSession({ gmFatePool: currentSession.gmFatePool + amount });
  }, [currentSession, updateSession]);

  const updateSceneAspects = useCallback(async (aspects: SceneAspect[]) => {
    if (!currentSession) return;
    await updateSession({ 
      currentScene: {
        ...currentSession.currentScene,
        name: currentSession.currentScene?.name || 'Cena Atual',
        aspects,
      }
    });
  }, [currentSession, updateSession]);

  return {
    currentSession,
    sessionId,
    loading,
    createSession,
    joinSession,
    leaveSession,
    updateSession,
    updateGmFatePool,
    updateSceneAspects,
    isGM: currentSession?.gmId === user?.uid,
  };
}
