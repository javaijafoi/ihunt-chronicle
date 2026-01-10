import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
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
  const [loading, setLoading] = useState(true);

  // Listen to presence (Campaign Level for now, or could be Episode level if passed)
  // For simplicity, let's assume we track presence at Campaign level relative to "active" status
  // or actually, VTTPage usually tracks "Session Presence".
  // Let's use `campaigns/{id}/presence` for now.
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
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [campaignId]);

  // Listen to members and then their characters
  useEffect(() => {
    if (!campaignId) {
      setPartyCharacters([]);
      setLoading(false);
      return;
    }

    // 1. Listen to members collection to get character IDs
    const membersRef = collection(db, 'campaigns', campaignId, 'members');
    const unsubscribeMembers = onSnapshot(membersRef, async (snapshot) => {
      const characterIds: string[] = [];
      const memberMap: Record<string, any> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.characterId) {
          characterIds.push(data.characterId);
          memberMap[data.characterId] = {
            userId: data.userId,
            role: data.role
          };
        }
      });

      if (characterIds.length === 0) {
        setPartyCharacters([]);
        setLoading(false);
        return;
      }

      // 2. Fetch Characters
      // Batch query due to `in` limit of 10
      // We will just do one batch for now or simple loop if small
      const chunks = [];
      for (let i = 0; i < characterIds.length; i += 10) {
        chunks.push(characterIds.slice(i, i + 10));
      }

      try {
        const allChars: any[] = [];

        // Note: Since we need real-time updates for attributes (Stress etc), we should subscribe directly to characters
        // A collection group query might be better: `characters` where `campaignId` == current?
        // Yes! schema says Character has `campaignId`.

        // Let's use that instead of double query if possible.
        // But legacy characters might not have campaignId set?
        // We assume migration handled it or we rely on ids.
        // Let's stick to IDs for safety if we haven't migrated data.
        // But `activePartyCharacters` depends on `characterIds` in `currentSession` previously.
        // Using `where(documentId(), 'in', ids)` is standard.

        // We can't do parallel onSnapshot easily in a loop without managing unsubs carefully.
        // Alternative: snapshot the `characters` collection where `campaignId` == `campaignId`.
        // This assumes all party characters have `campaignId` field set correctly.
        // If they are brought from "Global", they might not.
        // But Step 1 of Schema said `Character` has `campaignId`.

        // Let's try Query by CampaignID first.
        const charQ = query(collection(db, 'characters'), where('campaignId', '==', campaignId));
        // Wait, we can't listen inside this listener easily.
        // Let's just return to the main useEffect structure.

      } catch (e) {
        console.error(e);
      }
    });

    // Better Approach:
    // Just listen to `characters` with `campaignId`.
    // If a member brings an external character, we assume it gets tagged with `campaignId` or copied?
    // Plan says "References to characters".
    // Using `where('campaignId', '==', campaignId)` is cleanest.
    const q = query(collection(db, 'characters'), where('campaignId', '==', campaignId));

    const unsubscribeChars = onSnapshot(q, (snapshot) => {
      const chars = snapshot.docs.map(doc => {
        const data = doc.data() as Character;
        const ownerPresence = Object.values(presenceMap).find(p => p.characterId === doc.id);
        return {
          ...data,
          id: doc.id,
          ownerName: ownerPresence?.ownerName || 'Desconhecido',
          isOnline: isPresenceRecent(ownerPresence?.lastSeen),
          lastSeen: ownerPresence?.lastSeen || null,
        } as PartyCharacter;
      });
      setPartyCharacters(chars);
      setLoading(false);
    });

    return () => {
      unsubscribeMembers(); // We actually don't need members listener if we use `campaignId` on characters
      unsubscribeChars();
    };
  }, [campaignId, presenceMap]);

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
