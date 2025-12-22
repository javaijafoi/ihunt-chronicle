import { useState, useEffect } from 'react';
import { 
  collection, 
  query,
  where,
  onSnapshot,
  documentId
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useSession } from './useSession';
import { Character } from '@/types/game';
import { PartyCharacter, SessionPresence } from '@/types/session';

export function usePartyCharacters() {
  const { user } = useAuth();
  const { currentSession, sessionId } = useSession();
  const [partyCharacters, setPartyCharacters] = useState<PartyCharacter[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, SessionPresence>>({});
  const [loading, setLoading] = useState(true);

  // Listen to presence
  useEffect(() => {
    if (!sessionId) {
      setPresenceMap({});
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'sessions', sessionId, 'presence'),
      (snapshot) => {
        const presence: Record<string, SessionPresence> = {};
        snapshot.docs.forEach(doc => {
          presence[doc.id] = doc.data() as SessionPresence;
        });
        setPresenceMap(presence);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  // Listen to party characters
  useEffect(() => {
    if (!currentSession || currentSession.characterIds.length === 0) {
      setPartyCharacters([]);
      setLoading(false);
      return;
    }

    // Firestore 'in' queries are limited to 10 items
    const characterIds = currentSession.characterIds.slice(0, 10);
    
    const q = query(
      collection(db, 'characters'),
      where(documentId(), 'in', characterIds)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chars: PartyCharacter[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data() as Character & { ownerId: string };
        const ownerPresence = Object.values(presenceMap).find(p => p.characterId === docSnap.id);
        
        return {
          ...data,
          id: docSnap.id,
          oderId: data.ownerId,
          ownerName: ownerPresence?.ownerName || 'Desconhecido',
          isOnline: !!ownerPresence?.online,
        };
      });
      
      setPartyCharacters(chars);
      setLoading(false);
    });

    return () => unsubscribe();
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
