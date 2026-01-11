import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  documentId,
  type FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { Character } from '@/types/game';
import { PartyCharacter, SessionPresence } from '@/types/session';
import { toast } from '@/hooks/use-toast';
import { isPresenceRecent, normalizePresenceDate } from '@/utils/presence';

export function usePartyCharacters(campaignId: string | undefined) {
  const { user } = useAuth();
  const [partyCharacters, setPartyCharacters] = useState<PartyCharacter[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, SessionPresence>>({});
  const [playerMap, setPlayerMap] = useState<Record<string, { displayName: string }>>({});
  const [loading, setLoading] = useState(true);

  // 1. Listen to presence (Active Sessions)
  useEffect(() => {
    if (!campaignId) {
      setPresenceMap({});
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'campaigns', campaignId, 'presence'),
      (snapshot) => {
        const presence: Record<string, SessionPresence> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          presence[doc.id] = {
            ...(data as SessionPresence),
            lastSeen: normalizePresenceDate((data as SessionPresence).lastSeen),
            online: !!(data as SessionPresence).online,
          };
        });
        setPresenceMap(presence);
      },
      (error: FirestoreError) => {
        console.error('Erro ao escutar presença:', error);
      }
    );

    return () => unsubscribe();
  }, [campaignId]);

  // 2. Listen to Campaign Players (for offline name resolution)
  useEffect(() => {
    if (!campaignId) return;

    const unsubCampaign = onSnapshot(doc(db, 'campaigns', campaignId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const players = data.players || [];
        const map: Record<string, { displayName: string }> = {};
        players.forEach((p: any) => {
          if (p.uid) map[p.uid] = { displayName: p.displayName };
        });
        setPlayerMap(map);
      }
    });

    return () => unsubCampaign();
  }, [campaignId]);


  // 3. Listen to Characters and Map Names
  useEffect(() => {
    if (!campaignId) {
      setPartyCharacters([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'characters'), where('campaignId', '==', campaignId));

    const unsubscribeChars = onSnapshot(q, (snapshot) => {
      const chars = snapshot.docs.map(doc => {
        const data = doc.data() as Character;
        const ownerPresence = Object.values(presenceMap).find(p => p.characterId === doc.id);

        let ownerName = 'Desconhecido';

        // Try Presence first (most up to date for session)
        if (ownerPresence?.ownerName) {
          ownerName = ownerPresence.ownerName;
        }
        // Fallback to Player Map using createdBy or userId
        else if (data.createdBy && playerMap[data.createdBy]) {
          ownerName = playerMap[data.createdBy].displayName;
        }
        else if (data.userId && playerMap[data.userId]) {
          ownerName = playerMap[data.userId].displayName;
        }
        else if (data.createdBy === 'gm') {
          ownerName = 'GM';
        }

        return {
          ...data,
          id: doc.id,
          ownerName: ownerName,
          isOnline: isPresenceRecent(ownerPresence?.lastSeen),
          lastSeen: ownerPresence?.lastSeen || null,
        } as PartyCharacter;
      });
      setPartyCharacters(chars);
      setLoading(false);
    });

    return () => unsubscribeChars();
  }, [campaignId, presenceMap, playerMap]);

  // Separate active and archived characters
  const activePartyCharacters = partyCharacters.filter(c => !c.isArchived);
  const archivedPartyCharacters = partyCharacters.filter(c => c.isArchived);

  const myCharacter = activePartyCharacters.find(c => c.ownerId === user?.uid) || null;
  const otherCharacters = activePartyCharacters.filter(c => c.ownerId !== user?.uid);

  return {
    partyCharacters: activePartyCharacters,
    archivedCharacters: archivedPartyCharacters,
    presenceMap,
    myCharacter,
    otherCharacters,
    loading,
  };
}
