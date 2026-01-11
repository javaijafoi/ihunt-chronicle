import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  arrayUnion,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GameState, Character, DiceResult, LogEntry, SceneAspect, ActionType } from '@/types/game';
import sceneBackground from '@/assets/scene-default.jpg';
import { GLOBAL_SESSION_ID } from './useSession';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { PRESENCE_STALE_MS } from '@/constants/presence';

const ACTION_LABELS: Record<ActionType, string> = {
  superar: 'Superar',
  criarVantagem: 'Criar Vantagem',
  atacar: 'Atacar',
  defender: 'Defender',
};

const createInitialState = (character?: Character): GameState => ({
  currentScene: {
    id: '1',
    name: 'Beco Escuro',
    background: sceneBackground,
    aspects: [
      { id: '1', name: 'Poças de água refletindo neon', freeInvokes: 1, createdBy: 'GM', isTemporary: true },
      { id: '2', name: 'Saída de emergência bloqueada', freeInvokes: 0, createdBy: 'GM', isTemporary: true },
    ],
    isActive: true,
    order: 0,
    episodeId: '',
    campaignId: '',
  },
  characters: character ? [character] : [],
  tokens: [],
  logs: [
    {
      id: '1',
      type: 'system',
      message: 'Sessão iniciada. Bem-vindo ao iHunt VTT.',
      timestamp: new Date(),
    },
  ],
  gmFatePool: 3,
});

type FirestoreLogEntry = Omit<LogEntry, 'timestamp'> & { timestamp: Date | Timestamp };
type FirestoreSessionData = Partial<GameState> & {
  logs?: FirestoreLogEntry[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type PresenceData = {
  characterId?: string | null;
  online?: boolean;
  lastSeen?: Timestamp | Date | number | null;
};

const CHARACTER_SELECTION_ERROR = 'CharacterSelectionRequired';

const mapLogFromFirestore = (entry: FirestoreLogEntry): LogEntry => ({
  ...entry,
  timestamp: entry.timestamp instanceof Timestamp
    ? entry.timestamp.toDate()
    : new Date(entry.timestamp),
});

const isTransientError = (error: unknown): boolean => {
  if (!error) return false;

  const transientCodes = ['aborted', 'unavailable', 'deadline-exceeded', 'resource-exhausted'];
  if (typeof error === 'object' && 'code' in (error as Record<string, unknown>)) {
    const code = (error as { code?: string }).code;
    if (code && transientCodes.includes(code)) return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const transientKeywords = ['network', 'timeout', 'unavailable', 'resource exhausted'];
    return transientKeywords.some((keyword) => message.includes(keyword));
  }

  return false;
};

const withRetry = async <T>(fn: () => Promise<T>, attempts: number = 3): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientError(error) || attempt === attempts) {
        throw error;
      }

      const delay = 100 * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

const removeUndefinedDeep = <T>(value: T): T => {
  if (value === undefined || value === null) return value;

  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => removeUndefinedDeep(item)) as T;
  }

  if (value instanceof Timestamp || value instanceof Date) {
    return value;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, removeUndefinedDeep(v)]);

    return Object.fromEntries(entries) as T;
  }

  return value;
};

const mapLogToFirestore = (entry: LogEntry): FirestoreLogEntry => {
  const timestamp = entry.timestamp instanceof Date
    ? Timestamp.fromDate(entry.timestamp)
    : entry.timestamp;

  const sanitizedEntry = removeUndefinedDeep({
    ...entry,
    timestamp,
    details: entry.details ? removeUndefinedDeep(entry.details) : undefined,
  });

  return sanitizedEntry as FirestoreLogEntry;
};

const normalizeScene = (scene: GameState['currentScene']): GameState['currentScene'] => {
  if (!scene) return null;
  return {
    id: scene.id || 'scene-1',
    name: scene.name,
    background: scene.background,
    aspects: scene.aspects || [],
    isActive: scene.isActive ?? true,
  };
};

const isCharacterSelectionError = (error: unknown): error is Error =>
  error instanceof Error && error.message === CHARACTER_SELECTION_ERROR;

export function useGameState(
  sessionId: string = GLOBAL_SESSION_ID,
  initialCharacter?: Character,
  isGM: boolean = false,
) {
  const { user } = useAuth();
  const initialState = useMemo(() => createInitialState(initialCharacter), [initialCharacter]);
  const sessionRef = useMemo(() => doc(db, 'sessions', sessionId), [sessionId]);

  const [gameState, setGameState] = useState<GameState>(initialState);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    initialCharacter || null
  );

  // Keep selected character in sync with the session state
  useEffect(() => {
    if (!initialCharacter) {
      setSelectedCharacter(null);
      return;
    }

    const sessionCharacter = gameState.characters.find((c) => c.id === initialCharacter.id);
    const ownedCharacter = gameState.characters.find((c) => c.createdBy === user?.uid);
    setSelectedCharacter(sessionCharacter || ownedCharacter || initialCharacter);
  }, [gameState.characters, initialCharacter, user?.uid]);

  // Ensure the session exists and hydrate game state from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(sessionRef, async (snapshot) => {
      if (!snapshot.exists()) {
        await setDoc(
          sessionRef,
          {
            ...initialState,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        return;
      }

      const data = snapshot.data() as FirestoreSessionData;
      const logs = (data.logs && data.logs.length > 0
        ? data.logs
        : initialState.logs
      ).map(mapLogFromFirestore);

      setGameState({
        currentScene: normalizeScene(data.currentScene ?? initialState.currentScene),
        characters: data.characters?.length ? data.characters : initialState.characters,
        tokens: data.tokens ?? initialState.tokens,
        logs,
        gmFatePool: typeof data.gmFatePool === 'number' ? data.gmFatePool : initialState.gmFatePool,
      });
    });

    return () => unsubscribe();
  }, [initialState, sessionRef]);

  // Make sure the chosen character is available inside the session document
  useEffect(() => {
    if (!initialCharacter) return;

    const ensureCharacterInSession = async () => {
      try {
        await runTransaction(db, async (transaction) => {
          const snapshot = await transaction.get(sessionRef);
          const data = snapshot.data() as FirestoreSessionData | undefined;
          const characters = data?.characters || [];
          const hasCharacter = characters.some((c) => c.id === initialCharacter.id);

          if (!hasCharacter) {
            const updatedCharacters = [...characters, initialCharacter];

            if (snapshot.exists()) {
              transaction.update(sessionRef, {
                characters: updatedCharacters,
                updatedAt: serverTimestamp(),
              });
            } else {
              transaction.set(
                sessionRef,
                {
                  ...initialState,
                  characters: updatedCharacters,
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
            }
          }
        });
      } catch (error) {
        console.error('Erro ao sincronizar personagem na sessão:', error);
      }
    };

    ensureCharacterInSession();
  }, [initialCharacter, initialState, sessionRef]);

  const addLocalLogEntry = useCallback((logEntry: LogEntry) => {
    setGameState((prev) =>
      prev.logs.some((log) => log.id === logEntry.id)
        ? prev
        : { ...prev, logs: [...prev.logs, logEntry] }
    );
  }, []);

  const getAppendLogErrorMessage = useCallback((error: unknown, fallback: string) => {
    if (error instanceof Error) {
      const errorMessage = error.message;

      if (isCharacterSelectionError(error)) {
        return 'Selecione um personagem ou reentre na sessão para registrar ações.';
      }

      if (errorMessage === 'PresenceMissing' || errorMessage === 'PresenceInactive') {
        return 'Falha ao reconectar sua presença na sessão. Entre novamente para continuar.';
      }

      if (errorMessage === 'Usuário não autenticado na sessão.') {
        return 'Faça login e entre novamente na sessão para reconectar sua presença e registrar ações.';
      }

      return errorMessage || fallback;
    }

    return fallback;
  }, []);

  const getResolvedCharacterId = useCallback(
    (presenceData?: PresenceData | null): string | null => {
      const presenceCharacterId = typeof presenceData?.characterId === 'string'
        ? presenceData.characterId.trim()
        : null;

      if (selectedCharacter?.id) return selectedCharacter.id;
      if (initialCharacter?.id) return initialCharacter.id;
      if (presenceCharacterId) return presenceCharacterId;
      if (isGM) return 'gm';

      return null;
    },
    [initialCharacter?.id, isGM, selectedCharacter?.id]
  );

  const ensurePresence = useCallback(async () => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado na sessão.');
    }

    const presenceRef = doc(db, 'sessions', sessionId, 'presence', user.uid);
    try {
      await runTransaction(db, async (transaction) => {
        const presenceSnap = await transaction.get(presenceRef);
        const presenceData = presenceSnap.exists() ? (presenceSnap.data() as PresenceData) : undefined;
        const resolvedCharacterId = getResolvedCharacterId(presenceData);

        if (!resolvedCharacterId) {
          throw new Error(CHARACTER_SELECTION_ERROR);
        }

        const presencePayload = {
          ownerId: user.uid,
          ownerName: user.displayName || user.email || 'Jogador',
          characterId: resolvedCharacterId,
          online: true,
          lastSeen: serverTimestamp(),
        } as const;

        if (!presenceSnap.exists()) {
          transaction.set(presenceRef, presencePayload, { merge: true });
          return;
        }

        const lastSeenMs =
          presenceData.lastSeen instanceof Timestamp
            ? presenceData.lastSeen.toMillis()
            : presenceData.lastSeen instanceof Date
              ? presenceData.lastSeen.getTime()
              : typeof presenceData.lastSeen === 'number'
                ? presenceData.lastSeen
                : null;

        const isRecent = typeof lastSeenMs === 'number' && Date.now() - lastSeenMs <= PRESENCE_STALE_MS;

        if (presenceData.online && isRecent) {
          transaction.update(presenceRef, presencePayload);
          return;
        }

        transaction.set(presenceRef, presencePayload, { merge: true });
      });
    } catch (error) {
      if (isCharacterSelectionError(error)) {
        toast({
          title: 'Personagem necessário',
          description: isGM
            ? 'Selecione um personagem ou atue como GM para continuar.'
            : 'Selecione um personagem para continuar.',
          variant: 'destructive',
        });
      }

      throw error;
    }
  }, [getResolvedCharacterId, isGM, sessionId, user?.displayName, user?.email, user?.uid]);

  const appendLog = useCallback(async (logEntry: LogEntry) => {
    try {
      await ensurePresence();

      await withRetry(
        () => updateDoc(sessionRef, {
          logs: arrayUnion(mapLogToFirestore(logEntry)),
          updatedAt: serverTimestamp(),
        })
      );

      addLocalLogEntry(logEntry);
    } catch (error) {
      console.error('Erro ao registrar log da sessão:', error);

      if (!isCharacterSelectionError(error)) {
        addLocalLogEntry(logEntry);
      }

      throw error;
    }
  }, [addLocalLogEntry, ensurePresence, sessionRef]);

  const updateCharactersTransaction = useCallback(
    async (
      updater: (characters: Character[], gmFatePool: number) => {
        characters: Character[];
        gmFatePool?: number;
        logEntry?: LogEntry;
      }
    ) => {
      try {
        const result = await runTransaction(db, async (transaction) => {
          const snapshot = await transaction.get(sessionRef);
          const data = snapshot.data() as FirestoreSessionData | undefined;

          const currentCharacters = data?.characters?.length
            ? data.characters
            : initialState.characters;
          const currentFatePool = typeof data?.gmFatePool === 'number'
            ? data.gmFatePool
            : initialState.gmFatePool;

          const { characters, gmFatePool, logEntry } = updater(currentCharacters, currentFatePool);

          const updatePayload: Record<string, unknown> = {
            characters,
            gmFatePool: gmFatePool ?? currentFatePool,
            updatedAt: serverTimestamp(),
          };

          if (logEntry) {
            updatePayload.logs = arrayUnion(mapLogToFirestore(logEntry));
          }
          transaction.set(sessionRef, updatePayload, { merge: true });

          const currentCharacterMap = new Map(currentCharacters.map((character) => [character.id, character]));

          characters.forEach((character) => {
            const previous = currentCharacterMap.get(character.id);
            const hasChanged = !previous || JSON.stringify(previous) !== JSON.stringify(character);

            if (!hasChanged) return;

            const characterRef = doc(db, 'characters', character.id);
            transaction.set(
              characterRef,
              {
                ...character,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          });

          return {
            characters,
            gmFatePool: gmFatePool ?? currentFatePool,
            logEntry,
          };
        });

        setGameState((prev) => ({
          ...prev,
          characters: result.characters,
          gmFatePool: result.gmFatePool,
          logs:
            result.logEntry && !prev.logs.some((log) => log.id === result.logEntry?.id)
              ? [...prev.logs, result.logEntry]
              : prev.logs,
        }));
      } catch (error) {
        console.error('Erro ao atualizar personagens da sessão:', error);
      }
    },
    [initialState.characters, initialState.gmFatePool, sessionRef]
  );

  const rollDice = useCallback((
    modifier: number = 0,
    skill: string | undefined,
    action: ActionType | undefined,
    type: 'normal' | 'advantage' = 'normal',
    opposition?: number
  ): DiceResult => {
    const faces: ('plus' | 'minus' | 'blank')[] = ['plus', 'minus', 'blank'];

    let fateDice: ('plus' | 'minus' | 'blank')[];
    let diceTotal: number;
    let d6: number | undefined;

    if (type === 'advantage') {
      // 3dF + d6 for advantage (d6 value used directly, range 1-6)
      fateDice = Array.from({ length: 3 }, () => faces[Math.floor(Math.random() * 3)]);
      d6 = Math.floor(Math.random() * 6) + 1;
      const fateSum = fateDice.reduce((sum, die) => {
        if (die === 'plus') return sum + 1;
        if (die === 'minus') return sum - 1;
        return sum;
      }, 0);
      diceTotal = fateSum + d6; // Range: -3 to +9
    } else {
      // Standard 4dF
      fateDice = Array.from({ length: 4 }, () => faces[Math.floor(Math.random() * 3)]);
      diceTotal = fateDice.reduce((sum, die) => {
        if (die === 'plus') return sum + 1;
        if (die === 'minus') return sum - 1;
        return sum;
      }, 0);
    }

    const total = diceTotal + modifier;

    // Calculate shifts and outcome if opposition is provided
    let shifts: number | undefined;
    let outcome: DiceResult['outcome'];

    if (opposition !== undefined) {
      shifts = total - opposition;
      if (shifts < 0) {
        outcome = 'failure';
      } else if (shifts === 0) {
        outcome = 'tie';
      } else if (shifts >= 3) {
        outcome = 'style';
      } else {
        outcome = 'success';
      }
    }

    const result: DiceResult = {
      id: crypto.randomUUID(),
      fateDice,
      d6,
      modifier,
      diceTotal,
      total,
      opposition,
      shifts,
      outcome,
      character: selectedCharacter?.name || 'Anônimo',
      skill,
      action,
      timestamp: new Date(),
      type,
      invocations: 0,
    };

    return result;
  }, [selectedCharacter]);

  const createRollLog = useCallback(async (result: DiceResult) => {
    const getOutcomeLabel = () => {
      if (result.outcome === 'style') return 'SUCESSO COM ESTILO';
      if (result.outcome === 'success') return 'SUCESSO';
      if (result.outcome === 'tie') return 'EMPATE';
      if (result.outcome === 'failure') return 'FALHA';
      // No opposition set - use simple logic
      if (result.total >= 3) return 'Sucesso com Estilo!';
      if (result.total >= 0) return 'Sucesso';
      return 'Falha';
    };

    const getLadderLabel = (value: number): string => {
      if (value <= -2) return 'Terrível';
      if (value === -1) return 'Ruim';
      if (value === 0) return 'Medíocre';
      if (value === 1) return 'Regular';
      if (value === 2) return 'Razoável';
      if (value === 3) return 'Bom';
      if (value === 4) return 'Grande';
      if (value === 5) return 'Soberbo';
      if (value === 6) return 'Incrível';
      if (value === 7) return 'Épico';
      if (value >= 8) return 'Lendário';
      return `${value >= 0 ? '+' : ''}${value}`;
    };

    const details = {
      kind: 'roll' as const,
      action: result.action,
      actionLabel: result.action ? ACTION_LABELS[result.action] : undefined,
      skill: result.skill,
      skillBonus: result.modifier,
      fateDice: result.fateDice,
      diceTotal: result.diceTotal,
      opposition: result.opposition,
      shifts: result.shifts,
      ladderLabel: getLadderLabel(result.total),
      d6: result.d6,
      modifier: result.modifier,
      total: result.total,
      type: result.type,
      outcome: getOutcomeLabel(),
      avatar: selectedCharacter?.avatar,
    };

    const actionText = result.action ? ACTION_LABELS[result.action] : 'Rolagem Livre';
    const logEntry: LogEntry = {
      id: crypto.randomUUID(),
      type: 'roll',
      message: `${result.character} rolou ${actionText}${result.skill ? ` com ${result.skill} (${result.modifier >= 0 ? '+' : ''}${result.modifier})` : ''}`,
      character: result.character,
      timestamp: new Date(),
      details,
    };

    try {
      await appendLog(logEntry);
    } catch (error) {
      console.error('Erro ao publicar log de rolagem:', error);
      if (!isCharacterSelectionError(error)) {
        addLocalLogEntry(logEntry);
      }
      toast({
        title: 'Rolagem não publicada',
        description: getAppendLogErrorMessage(
          error,
          'Falha ao reconectar sua presença. Entre novamente na sessão para publicar a rolagem.'
        ),
        variant: 'destructive',
      });
    }
  }, [addLocalLogEntry, appendLog, getAppendLogErrorMessage, selectedCharacter?.avatar]);

  const spendFatePoint = useCallback(
    async (characterId: string) => {
      const logEntry: LogEntry = {
        id: crypto.randomUUID(),
        type: 'fate',
        message: `${gameState.characters.find((c) => c.id === characterId)?.name || 'Personagem'} gastou 1 ponto de destino`,
        timestamp: new Date(),
      };

      await updateCharactersTransaction((characters, gmFatePool) => {
        let delta = 0;
        const updated = characters.map((character) => {
          if (character.id !== characterId || character.fatePoints <= 0) return character;
          delta = 1;
          return { ...character, fatePoints: character.fatePoints - 1 };
        });

        return {
          characters: updated,
          gmFatePool: gmFatePool + delta,
          logEntry: delta > 0 ? logEntry : undefined,
        };
      });
    },
    [gameState.characters, updateCharactersTransaction]
  );

  const gainFatePoint = useCallback(
    async (characterId: string) => {
      const logEntry: LogEntry = {
        id: crypto.randomUUID(),
        type: 'fate',
        message: `${gameState.characters.find((c) => c.id === characterId)?.name || 'Personagem'} ganhou 1 ponto de destino`,
        timestamp: new Date(),
      };

      await updateCharactersTransaction((characters, gmFatePool) => {
        let delta = 0;
        const updated = characters.map((character) => {
          if (character.id !== characterId) return character;
          delta = -1;
          return { ...character, fatePoints: character.fatePoints + 1 };
        });

        return {
          characters: updated,
          gmFatePool: Math.max(0, gmFatePool + delta),
          logEntry,
        };
      });
    },
    [gameState.characters, updateCharactersTransaction]
  );

  const toggleStress = useCallback(
    async (characterId: string, track: 'physical' | 'mental', index: number) => {
      await updateCharactersTransaction((characters, gmFatePool) => {
        const updated = characters.map((character) => {
          if (character.id !== characterId) return character;
          const newStressTrack = [...(character.stress?.[track] ?? [])];
          while (newStressTrack.length <= index) {
            newStressTrack.push(false);
          }
          newStressTrack[index] = !newStressTrack[index];

          return {
            ...character,
            stress: {
              ...character.stress,
              [track]: newStressTrack,
            },
          };
        });

        return { characters: updated, gmFatePool };
      });
    },
    [updateCharactersTransaction]
  );

  const setConsequence = useCallback(
    async (
      characterId: string,
      severity: 'mild' | 'moderate' | 'severe',
      value: string | null
    ) => {
      await updateCharactersTransaction((characters, gmFatePool) => {
        const updated = characters.map((character) =>
          character.id === characterId
            ? {
              ...character,
              consequences: {
                ...character.consequences,
                [severity]: value,
              },
            }
            : character
        );

        return { characters: updated, gmFatePool };
      });
    },
    [updateCharactersTransaction]
  );

  const addSceneAspect = useCallback(
    async (name: string, freeInvokes: number = 1) => {
      const aspect: SceneAspect = {
        id: crypto.randomUUID(),
        name,
        freeInvokes,
        createdBy: selectedCharacter?.name || 'GM',
        isTemporary: true,
      };

      const logEntry: LogEntry = {
        id: crypto.randomUUID(),
        type: 'aspect',
        message: `Aspecto de cena criado: "${name}"`,
        timestamp: new Date(),
      };

      try {
        await runTransaction(db, async (transaction) => {
          const snapshot = await transaction.get(sessionRef);
          const data = snapshot.data() as FirestoreSessionData | undefined;
          const scene = normalizeScene(data?.currentScene ?? initialState.currentScene);

          if (!scene) return;

          const updatedScene = {
            ...scene,
            aspects: [...scene.aspects, aspect],
          };

          transaction.set(
            sessionRef,
            {
              currentScene: updatedScene,
              logs: arrayUnion(mapLogToFirestore(logEntry)),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        });

        setGameState((prev) => ({
          ...prev,
          currentScene: prev.currentScene
            ? { ...prev.currentScene, aspects: [...prev.currentScene.aspects, aspect] }
            : prev.currentScene,
          logs: prev.logs.some((log) => log.id === logEntry.id)
            ? prev.logs
            : [...prev.logs, logEntry],
        }));
      } catch (error) {
        console.error('Erro ao adicionar aspecto de cena:', error);
      }
    },
    [initialState.currentScene, selectedCharacter?.name, sessionRef]
  );

  const invokeAspect = useCallback(
    async (aspectName: string, useFreeInvoke: boolean = false) => {
      if (useFreeInvoke) {
        const logEntry: LogEntry = {
          id: crypto.randomUUID(),
          type: 'aspect',
          message: `${selectedCharacter?.name || 'Jogador'} invocou "${aspectName}" (invocação gratuita)`,
          timestamp: new Date(),
        };

        try {
          await runTransaction(db, async (transaction) => {
            const snapshot = await transaction.get(sessionRef);
            const data = snapshot.data() as FirestoreSessionData | undefined;
            const scene = normalizeScene(data?.currentScene ?? initialState.currentScene);

            if (!scene) return;

            const updatedScene = {
              ...scene,
              aspects: scene.aspects.map((aspect) =>
                aspect.name === aspectName && aspect.freeInvokes > 0
                  ? { ...aspect, freeInvokes: aspect.freeInvokes - 1 }
                  : aspect
              ),
            };

            transaction.set(
              sessionRef,
              {
                currentScene: updatedScene,
                logs: arrayUnion(mapLogToFirestore(logEntry)),
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          });

          setGameState((prev) => ({
            ...prev,
            currentScene: prev.currentScene
              ? {
                ...prev.currentScene,
                aspects: prev.currentScene.aspects.map((aspect) =>
                  aspect.name === aspectName && aspect.freeInvokes > 0
                    ? { ...aspect, freeInvokes: aspect.freeInvokes - 1 }
                    : aspect
                ),
              }
              : prev.currentScene,
            logs: prev.logs.some((log) => log.id === logEntry.id)
              ? prev.logs
              : [...prev.logs, logEntry],
          }));
        } catch (error) {
          console.error('Erro ao invocar aspecto com uso gratuito:', error);
        }
      } else if (selectedCharacter) {
        await spendFatePoint(selectedCharacter.id);

        const logEntry: LogEntry = {
          id: crypto.randomUUID(),
          type: 'aspect',
          message: `${selectedCharacter.name} invocou "${aspectName}" (+2 ou reroll)`,
          timestamp: new Date(),
        };

        try {
          await appendLog(logEntry);
        } catch (error) {
          console.error('Erro ao publicar invocação de aspecto:', error);
          if (!isCharacterSelectionError(error)) {
            addLocalLogEntry(logEntry);
          }
          toast({
            title: 'Invocação não publicada',
            description: getAppendLogErrorMessage(
              error,
              'Não foi possível reconectar sua presença. Entre novamente na sessão e tente registrar a invocação.'
            ),
            variant: 'destructive',
          });
        }
      }
    },
    [addLocalLogEntry, appendLog, getAppendLogErrorMessage, initialState.currentScene, selectedCharacter, sessionRef, spendFatePoint]
  );

  const addLog = useCallback(
    async (message: string, type: LogEntry['type'] = 'chat') => {
      const logEntry: LogEntry = {
        id: crypto.randomUUID(),
        type,
        message,
        character: selectedCharacter?.name,
        timestamp: new Date(),
      };

      try {
        await appendLog(logEntry);
      } catch (error) {
        console.error('Erro ao publicar log da sessão:', error);
        if (!isCharacterSelectionError(error)) {
          addLocalLogEntry(logEntry);
        }
        toast({
          title: 'Mensagem não publicada',
          description: getAppendLogErrorMessage(
            error,
            'Não foi possível reconectar sua presença. Entre novamente na sessão e tente enviar a mensagem.'
          ),
          variant: 'destructive',
        });
      }
    },
    [addLocalLogEntry, appendLog, getAppendLogErrorMessage, selectedCharacter?.name]
  );

  return {
    gameState,
    selectedCharacter,
    setSelectedCharacter,
    rollDice,
    spendFatePoint,
    gainFatePoint,
    toggleStress,
    setConsequence,
    addSceneAspect,
    invokeAspect,
    addLog,
    createRollLog,
  };
}
