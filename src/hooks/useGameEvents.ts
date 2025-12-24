import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DiceResult, RollEvent } from '@/types/game';
import { GLOBAL_SESSION_ID } from './useSession';

const mapDiceResultFromFirestore = (result: DiceResult): DiceResult => ({
  ...result,
  timestamp: result.timestamp instanceof Timestamp
    ? result.timestamp.toDate()
    : new Date(result.timestamp),
});

const mapDiceResultToFirestore = (result: DiceResult): DiceResult => ({
  ...result,
  timestamp: result.timestamp instanceof Date
    ? Timestamp.fromDate(result.timestamp)
    : result.timestamp,
});

export function useGameEvents(sessionId: string = GLOBAL_SESSION_ID, authorId?: string) {
  const [incomingRoll, setIncomingRoll] = useState<RollEvent | null>(null);
  const knownEvents = useRef<Set<string>>(new Set());
  const subscribedAt = useRef<Date>(new Date());

  const eventsRef = useMemo(
    () => collection(db, 'sessions', sessionId, 'events'),
    [sessionId]
  );

  useEffect(() => {
    subscribedAt.current = new Date();
    knownEvents.current.clear();
    setIncomingRoll(null);
  }, [sessionId]);

  useEffect(() => {
    const eventsQuery = query(eventsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type !== 'added') return;

        const data = change.doc.data();
        if (data.type !== 'roll') return;

        const id = change.doc.id;
        if (knownEvents.current.has(id)) return;
        knownEvents.current.add(id);

        const createdAt = data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : data.createdAt
            ? new Date(data.createdAt)
            : null;

        if (createdAt && createdAt < subscribedAt.current) return;

        const eventAuthorId = (data.authorId as string | undefined) || sessionId;
        if (authorId && eventAuthorId === authorId) return;

        const rawResult = data.result as DiceResult | undefined;
        if (!rawResult) return;

        const result = mapDiceResultFromFirestore(rawResult);

        setIncomingRoll({
          id,
          type: 'roll',
          result,
          authorId: eventAuthorId,
          createdAt: createdAt ?? new Date(),
        });
      });
    });

    return () => unsubscribe();
  }, [eventsRef, authorId, sessionId]);

  const emitRollEvent = useCallback(
    async (result: DiceResult) => {
      try {
        await addDoc(eventsRef, {
          type: 'roll',
          result: mapDiceResultToFirestore(result),
          authorId: authorId ?? sessionId,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Erro ao registrar evento de rolagem:', error);
      }
    },
    [authorId, eventsRef, sessionId]
  );

  const acknowledgeRollEvent = useCallback((id?: string) => {
    if (!id) {
      setIncomingRoll(null);
      return;
    }

    setIncomingRoll((current) => (current?.id === id ? null : current));
  }, []);

  return {
    incomingRoll,
    emitRollEvent,
    acknowledgeRollEvent,
  };
}
