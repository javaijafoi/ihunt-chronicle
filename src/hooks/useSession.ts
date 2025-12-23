import { useState, useEffect, useCallback } from 'react';
import { 
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  arrayUnion,
  getDocs,
  query,
  Timestamp,
  runTransaction,
  where,
  type FirestoreError
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { GameSession } from '@/types/session';
import { SceneAspect } from '@/types/game';
import { toast } from '@/hooks/use-toast';

export const GLOBAL_SESSION_ID = 'sessao-principal';

type JoinAsPlayerOptions = {
  force?: boolean;
  lastSeen?: number | null;
  ownerId?: string | null;
  timeoutMs?: number;
};

export function useSession() {
  const { user, userProfile } = useAuth();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !currentSession) return;

    let isMounted = true;

    const presenceInterval = setInterval(() => {
      if (!isMounted) return;

      updateDoc(doc(db, 'sessions', GLOBAL_SESSION_ID, 'presence', user.uid), {
        lastSeen: serverTimestamp(),
        online: true,
      }).catch((error) => {
        console.error('Erro ao atualizar presença do usuário:', error);
      });
    }, 60_000);

    return () => {
      isMounted = false;
      clearInterval(presenceInterval);
    };
  }, [currentSession?.id, user?.uid]);

  // Listen to current session
  useEffect(() => {
    const sessionRef = doc(db, 'sessions', GLOBAL_SESSION_ID);
    const unsubscribe = onSnapshot(
      sessionRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          try {
            await setDoc(sessionRef, {
              name: 'Sessão Principal',
              gmId: user?.uid ?? null,
              characterIds: [],
              currentScene: null,
              gmFatePool: 3,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (error) {
            console.error('Erro ao criar sessão padrão:', error);
          }
          return;
        }

        const data = snapshot.data();
        setCurrentSession({
          id: snapshot.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        } as GameSession);
        setLoading(false);
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
          toast({
            title: 'Sessão expirada',
            description: 'Perdemos o acesso à sessão. Entre novamente para continuar.',
            variant: 'destructive',
          });
          setCurrentSession(null);
        } else {
          console.error('Erro ao escutar sessão:', error);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const joinAsPlayer = useCallback(async (characterId: string, options?: JoinAsPlayerOptions): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);

    const sessionRef = doc(db, 'sessions', GLOBAL_SESSION_ID);
    const presenceRef = doc(sessionRef, 'presence', user.uid);
    const presenceCollection = collection(sessionRef, 'presence');
    const presenceTimeoutMs = options?.timeoutMs ?? 60_000;

    try {
      const characterPresenceQuery = query(
        presenceCollection,
        where('characterId', '==', characterId),
      );
      const existingPresenceSnapshot = await getDocs(characterPresenceQuery);
      const existingPresenceDoc = existingPresenceSnapshot.docs[0];

      await runTransaction(db, async (transaction) => {
        const sessionSnap = await transaction.get(sessionRef);

        if (!sessionSnap.exists()) {
          throw new Error('Sessão não encontrada.');
        }

        const characterPresenceSnap = existingPresenceDoc
          ? await transaction.get(existingPresenceDoc.ref)
          : null;
        const characterPresenceData = characterPresenceSnap?.data() as
          | { ownerId?: string; characterId?: string; lastSeen?: Timestamp | number }
          | undefined;

        const presenceLastSeen =
          characterPresenceData?.lastSeen instanceof Timestamp
            ? characterPresenceData.lastSeen.toMillis()
            : typeof characterPresenceData?.lastSeen === 'number'
            ? characterPresenceData.lastSeen
            : options?.lastSeen ?? null;

        const ownerId = characterPresenceData?.ownerId ?? options?.ownerId ?? null;
        const isPresenceStale =
          presenceLastSeen === null ? true : Date.now() - presenceLastSeen > presenceTimeoutMs;

        if (ownerId && ownerId !== user.uid && !options?.force && !isPresenceStale) {
          throw new Error('CharacterAlreadyInUse');
        }

        const presencePayload = {
          ownerId: user.uid,
          ownerName: userProfile?.displayName || 'Caçador',
          characterId,
        };

        if (characterPresenceData?.ownerId === user.uid && existingPresenceDoc) {
          transaction.update(existingPresenceDoc.ref, {
            ...presencePayload,
            lastSeen: serverTimestamp(),
            online: true,
          });
          return;
        }

        transaction.set(
          presenceRef,
          {
            ...presencePayload,
            lastSeen: serverTimestamp(),
            online: true,
          },
          { merge: true },
        );

        transaction.update(sessionRef, {
          characterIds: arrayUnion(characterId),
          updatedAt: serverTimestamp(),
        });
      });

      return true;
    } catch (error) {
      console.error('Error joining global session:', error);

      if (error instanceof Error && error.message === 'CharacterAlreadyInUse') {
        toast({
          title: 'Personagem em uso',
          description: 'Esse personagem já está conectado à sessão.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao entrar na sessão',
          description: 'Não foi possível entrar na sessão. Tente novamente.',
          variant: 'destructive',
        });
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  const claimGmRole = useCallback(async () => {
    if (!user) return false;

    const sessionRef = doc(db, 'sessions', GLOBAL_SESSION_ID);

    try {
      const wasClaimed = await runTransaction(db, async (transaction) => {
        const sessionSnap = await transaction.get(sessionRef);

        if (!sessionSnap.exists()) {
          throw new Error('Sessão não encontrada.');
        }

        const sessionData = sessionSnap.data() as Partial<GameSession>;

        if (sessionData.gmId) {
          throw new Error('GMAlreadyAssigned');
        }

        transaction.update(sessionRef, {
          gmId: user.uid,
          updatedAt: serverTimestamp(),
        });

        return true;
      });

      return wasClaimed;
    } catch (error) {
      if (error instanceof Error && error.message === 'GMAlreadyAssigned') {
        toast({
          title: 'Mestre já definido',
          description: 'Já existe um Mestre de Jogo controlando a sessão.',
          variant: 'destructive',
        });
      } else {
        console.error('Error claiming GM role:', error);
        toast({
          title: 'Erro ao assumir como Mestre',
          description: 'Não foi possível assumir a função de Mestre. Tente novamente.',
          variant: 'destructive',
        });
      }

      return false;
    }
  }, [user]);

  const leaveSession = useCallback(async () => {
    if (!user) return;

    try {
      // Remove presence
      await deleteDoc(doc(db, 'sessions', GLOBAL_SESSION_ID, 'presence', user.uid));

      // If GM, don't remove from characterIds (keep session intact)
      // If player, optionally remove character (we'll keep it for now)
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  }, [user]);

  const updateSession = useCallback(async (updates: Partial<GameSession>) => {
    if (!currentSession) return;

    try {
      await updateDoc(doc(db, 'sessions', GLOBAL_SESSION_ID), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }, [currentSession]);

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
    loading,
    joinAsPlayer,
    leaveSession,
    updateSession,
    updateGmFatePool,
    updateSceneAspects,
    claimGmRole,
    isGM: currentSession?.gmId === user?.uid,
  };
}
