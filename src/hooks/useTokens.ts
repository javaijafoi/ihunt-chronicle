import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Token } from '@/types/game';
import { toast } from '@/hooks/use-toast';

const POSITION_UPDATE_DEBOUNCE = 100; // ms

const removeUndefinedDeep = <T>(value: T): T => {
  if (value === undefined) return undefined as T;
  if (value === null) return null as T;

  if (Array.isArray(value)) {
    const sanitizedArray = value
      .map((item) => removeUndefinedDeep(item))
      .filter((item) => item !== undefined);

    return sanitizedArray as T;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => [k, removeUndefinedDeep(v)])
      .filter(([, v]) => v !== undefined);

    return Object.fromEntries(entries) as T;
  }

  return value;
};

const normalizeOptionalTokenFields = (data: Record<string, unknown>) => {
  const OPTIONAL_FIELDS: Array<keyof Token> = ['avatar', 'color', 'ownerId', 'characterId'];
  const normalized = { ...data };

  for (const field of OPTIONAL_FIELDS) {
    if (!(field in normalized)) continue;

    const value = normalized[field];
    if (value === undefined) {
      delete normalized[field];
      continue;
    }

    if (value === null) {
      normalized[field] = null;
      continue;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      normalized[field] = trimmed.length > 0 ? trimmed : null;
    }
  }

  return normalized;
};

const sanitizeTokenPayload = <T extends Record<string, unknown>>(data: T): T => {
  const cleanedValue = removeUndefinedDeep(data);
  if (!cleanedValue || typeof cleanedValue !== 'object') {
    return cleanedValue as T;
  }

  const cleaned = cleanedValue as Record<string, unknown>;
  const normalized = normalizeOptionalTokenFields(cleaned);

  return normalized as T;
};

export function useTokens(sessionId: string) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const pendingUpdates = useRef<Map<string, { x: number; y: number }>>(new Map());
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to tokens collection
  useEffect(() => {
    if (!sessionId) {
      setTokens([]);
      setLoading(false);
      return;
    }

    const tokensRef = collection(db, 'sessions', sessionId, 'tokens');

    const unsubscribe = onSnapshot(
      tokensRef,
      (snapshot) => {
        const tokensData: Token[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Token[];
        setTokens(tokensData);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar tokens:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  const createToken = useCallback(
    async (tokenData: Omit<Token, 'id'>) => {
      if (!sessionId) return null;

      try {
        const tokenId = crypto.randomUUID();
        const tokenRef = doc(db, 'sessions', sessionId, 'tokens', tokenId);
        const payload = sanitizeTokenPayload(tokenData);

        await setDoc(tokenRef, {
          ...payload,
          createdAt: serverTimestamp(),
        });

        return tokenId;
      } catch (error) {
        console.error('Erro ao criar token:', error);
        toast({
          title: 'Erro ao criar token',
          description: 'Não foi possível adicionar o token à cena.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [sessionId]
  );

  // Flush pending position updates to Firebase
  const flushPositionUpdates = useCallback(async () => {
    if (!sessionId || pendingUpdates.current.size === 0) return;

    const updates = new Map(pendingUpdates.current);
    pendingUpdates.current.clear();

    for (const [tokenId, position] of updates) {
      try {
        const tokenRef = doc(db, 'sessions', sessionId, 'tokens', tokenId);
        await updateDoc(tokenRef, {
          x: position.x,
          y: position.y,
        });
      } catch (error) {
        console.error('Erro ao atualizar posição do token:', error);
      }
    }
  }, [sessionId]);

  // Debounced position update - batches rapid drag movements
  const updateTokenPosition = useCallback(
    (tokenId: string, x: number, y: number) => {
      // Update local state immediately for responsiveness
      setTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, x, y } : t))
      );

      // Queue the update
      pendingUpdates.current.set(tokenId, { x, y });

      // Debounce Firebase writes
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(flushPositionUpdates, POSITION_UPDATE_DEBOUNCE);
    },
    [flushPositionUpdates]
  );

  const updateToken = useCallback(
    async (tokenId: string, updates: Partial<Token>) => {
      if (!sessionId) return;

      try {
        const cleanedUpdates = sanitizeTokenPayload(updates as Record<string, unknown>);
        if (Object.keys(cleanedUpdates).length === 0) return;

        const tokenRef = doc(db, 'sessions', sessionId, 'tokens', tokenId);
        await updateDoc(tokenRef, cleanedUpdates);
      } catch (error) {
        console.error('Erro ao atualizar token:', error);
      }
    },
    [sessionId]
  );

  const deleteToken = useCallback(
    async (tokenId: string) => {
      if (!sessionId) return;

      try {
        const tokenRef = doc(db, 'sessions', sessionId, 'tokens', tokenId);
        await deleteDoc(tokenRef);
      } catch (error) {
        console.error('Erro ao deletar token:', error);
        toast({
          title: 'Erro ao remover token',
          description: 'Não foi possível remover o token da cena.',
          variant: 'destructive',
        });
      }
    },
    [sessionId]
  );

  const clearAllTokens = useCallback(async () => {
    if (!sessionId) return;

    try {
      for (const token of tokens) {
        await deleteToken(token.id);
      }
    } catch (error) {
      console.error('Erro ao limpar tokens:', error);
    }
  }, [sessionId, tokens, deleteToken]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        flushPositionUpdates();
      }
    };
  }, [flushPositionUpdates]);

  return {
    tokens,
    loading,
    createToken,
    updateToken,
    updateTokenPosition,
    deleteToken,
    clearAllTokens,
  };
}
