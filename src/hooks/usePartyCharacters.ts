import { useState, useEffect } from 'react';
import { 
  collection, 
  query,
  where,
  onSnapshot,
  documentId,
  type FirestoreError
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { GLOBAL_SESSION_ID, useSession } from './useSession';
import { Character } from '@/types/game';
import { PartyCharacter, SessionPresence } from '@/types/session';
import { toast } from '@/hooks/use-toast';

export function usePartyCharacters() {
  const { user } = useAuth();
  const { currentSession } = useSession();
  const [partyCharacters, setPartyCharacters] = useState<PartyCharacter[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, SessionPresence>>({});
  const [loading, setLoading] = useState(true);

  // Listen to presence
  useEffect(() => {
    if (!currentSession) {
      setPresenceMap({});
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'sessions', GLOBAL_SESSION_ID, 'presence'),
      (snapshot) => {
        const presence: Record<string, SessionPresence> = {};
        snapshot.docs.forEach(doc => {
          presence[doc.id] = doc.data() as SessionPresence;
        });
        setPresenceMap(presence);
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
          toast({
            title: 'Acesso negado',
            description: 'Perdemos o acesso à sessão. Entre novamente para continuar acompanhando o grupo.',
            variant: 'destructive',
          });
          setPresenceMap({});
          setPartyCharacters([]);
        } else {
          console.error('Erro ao escutar presença da sessão:', error);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentSession]);

  // Listen to party characters
  useEffect(() => {
    if (!currentSession || currentSession.characterIds.length === 0) {
      setPartyCharacters([]);
      setLoading(false);
      return;
    }

    // Firestore 'in' queries are limited to 10 items, so we batch them
    const characterIdChunks: string[][] = [];
    for (let i = 0; i < currentSession.characterIds.length; i += 10) {
      characterIdChunks.push(currentSession.characterIds.slice(i, i + 10));
    }

    const batchCharacters: Record<string, PartyCharacter> = {};

    const unsubscribes = characterIdChunks.map(ids => {
      const q = query(
        collection(db, 'characters'),
        where(documentId(), 'in', ids)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          snapshot.docs.forEach(docSnap => {
            const data = docSnap.data() as Character & { ownerId: string };
            const ownerPresence = Object.values(presenceMap).find(p => p.characterId === docSnap.id);
            const sessionId = data.sessionId || currentSession?.id || GLOBAL_SESSION_ID;
            const createdBy = data.createdBy || data.ownerId || 'desconhecido';

            batchCharacters[docSnap.id] = {
              ...data,
              id: docSnap.id,
              sessionId,
              createdBy,
              oderId: data.ownerId,
              ownerName: ownerPresence?.ownerName || 'Desconhecido',
              isOnline: !!ownerPresence?.online,
            };
          });

          const mergedCharacters = currentSession.characterIds
            .map(id => batchCharacters[id])
            .filter((character): character is PartyCharacter => Boolean(character));

          setPartyCharacters(mergedCharacters);
          setLoading(false);
        },
        (error: FirestoreError) => {
          if (error.code === 'permission-denied') {
            toast({
              title: 'Acesso negado',
              description: 'Perdemos o acesso aos personagens do grupo. Entre novamente para continuar.',
              variant: 'destructive',
            });
            setPartyCharacters([]);
            localStorage.removeItem('ihunt-current-session');
          } else {
            console.error('Erro ao escutar personagens do grupo:', error);
          }
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [currentSession, presenceMap]);

  const myCharacter = partyCharacters.find(c => c.oderId === user?.uid) || null;
  const otherCharacters = partyCharacters.filter(c => c.oderId !== user?.uid);

  return {
    partyCharacters,
    myCharacter,
    otherCharacters,
    loading,
  };
}
