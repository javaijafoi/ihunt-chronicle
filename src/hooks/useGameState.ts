import { useState, useCallback, useEffect } from 'react';
import { GameState, Character, DiceResult, LogEntry, SceneAspect, ActionType } from '@/types/game';
import sceneBackground from '@/assets/scene-default.jpg';
import { useLocalStorage } from './useLocalStorage';

const GAME_STATE_KEY = 'ihunt-vtt-game-state';

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

export function useGameState(initialCharacter?: Character) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(initialCharacter));
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    initialCharacter || null
  );
  
  // Persist character changes to localStorage
  const [, setSavedCharacters] = useLocalStorage<Character[]>('ihunt-vtt-characters', []);
  
  // Sync character state changes back to localStorage
  useEffect(() => {
    if (selectedCharacter) {
      setSavedCharacters(prev => 
        prev.map(c => c.id === selectedCharacter.id ? selectedCharacter : c)
      );
    }
  }, [selectedCharacter, setSavedCharacters]);

  const rollDice = useCallback((modifier: number = 0, skill: string | undefined, action: ActionType, type: 'normal' | 'advantage' = 'normal'): DiceResult => {
    const faces: ('plus' | 'minus' | 'blank')[] = ['plus', 'minus', 'blank'];
    
    let fateDice: ('plus' | 'minus' | 'blank')[];
    let diceSum: number;
    let d6: number | undefined;
    
    if (type === 'advantage') {
      // 3dF + d6 for advantage
      fateDice = Array.from({ length: 3 }, () => faces[Math.floor(Math.random() * 3)]);
      d6 = Math.floor(Math.random() * 6) + 1;
      diceSum = fateDice.reduce((sum, die) => {
        if (die === 'plus') return sum + 1;
        if (die === 'minus') return sum - 1;
        return sum;
      }, 0) + Math.ceil(d6 / 2); // d6 converted to 1-3 range
    } else {
      // Standard 4dF
      fateDice = Array.from({ length: 4 }, () => faces[Math.floor(Math.random() * 3)]);
      diceSum = fateDice.reduce((sum, die) => {
        if (die === 'plus') return sum + 1;
        if (die === 'minus') return sum - 1;
        return sum;
      }, 0);
    }

    const actionLabels: Record<ActionType, string> = {
      superar: 'Superar',
      criarVantagem: 'Criar Vantagem',
      atacar: 'Atacar',
      defender: 'Defender',
    };

    const result: DiceResult = {
      id: crypto.randomUUID(),
      fateDice,
      d6,
      modifier,
      total: diceSum + modifier,
      character: selectedCharacter?.name || 'Anônimo',
      skill,
      action,
      timestamp: new Date(),
      type,
    };

    const resultText = result.total >= 3 ? 'Sucesso com Estilo!' :
                       result.total >= 0 ? 'Sucesso' : 'Falha';

    const details = {
      kind: 'roll' as const,
      action,
      actionLabel: actionLabels[action],
      skill,
      skillBonus: modifier,
      fateDice: result.fateDice,
      d6: result.d6,
      modifier,
      total: result.total,
      type: result.type,
      outcome: resultText,
    };

    const logEntry: LogEntry = {
      id: crypto.randomUUID(),
      type: 'roll',
      message: `${result.character} rolou ${actionLabels[action]}${skill ? ` com ${skill} (${modifier >= 0 ? '+' : ''}${modifier})` : ''}`,
      character: result.character,
      timestamp: new Date(),
      details,
    };

    setGameState(prev => ({
      ...prev,
      logs: [...prev.logs, logEntry],
    }));

    return result;
  }, [selectedCharacter]);

  const spendFatePoint = useCallback((characterId: string) => {
    setGameState(prev => ({
      ...prev,
      characters: prev.characters.map(c =>
        c.id === characterId && c.fatePoints > 0
          ? { ...c, fatePoints: c.fatePoints - 1 }
          : c
      ),
      gmFatePool: prev.gmFatePool + 1,
      logs: [...prev.logs, {
        id: crypto.randomUUID(),
        type: 'fate',
        message: `${prev.characters.find(c => c.id === characterId)?.name} gastou 1 ponto de destino`,
        timestamp: new Date(),
      }],
    }));

    if (selectedCharacter?.id === characterId) {
      setSelectedCharacter(prev => prev ? { ...prev, fatePoints: prev.fatePoints - 1 } : null);
    }
  }, [selectedCharacter]);

  const gainFatePoint = useCallback((characterId: string) => {
    setGameState(prev => ({
      ...prev,
      characters: prev.characters.map(c =>
        c.id === characterId
          ? { ...c, fatePoints: c.fatePoints + 1 }
          : c
      ),
      gmFatePool: Math.max(0, prev.gmFatePool - 1),
      logs: [...prev.logs, {
        id: crypto.randomUUID(),
        type: 'fate',
        message: `${prev.characters.find(c => c.id === characterId)?.name} ganhou 1 ponto de destino`,
        timestamp: new Date(),
      }],
    }));

    if (selectedCharacter?.id === characterId) {
      setSelectedCharacter(prev => prev ? { ...prev, fatePoints: prev.fatePoints + 1 } : null);
    }
  }, [selectedCharacter]);

  const toggleStress = useCallback((characterId: string, track: 'physical' | 'mental', index: number) => {
    setGameState(prev => ({
      ...prev,
      characters: prev.characters.map(c => {
        if (c.id !== characterId) return c;
        const newStress = { ...c.stress };
        newStress[track] = [...newStress[track]];
        newStress[track][index] = !newStress[track][index];
        return { ...c, stress: newStress };
      }),
    }));

    if (selectedCharacter?.id === characterId) {
      setSelectedCharacter(prev => {
        if (!prev) return null;
        const newStress = { ...prev.stress };
        newStress[track] = [...newStress[track]];
        newStress[track][index] = !newStress[track][index];
        return { ...prev, stress: newStress };
      });
    }
  }, [selectedCharacter]);

  const setConsequence = useCallback(
    (
      characterId: string,
      severity: 'mild' | 'moderate' | 'severe',
      value: string | null
    ) => {
      setGameState(prev => ({
        ...prev,
        characters: prev.characters.map(c =>
          c.id === characterId
            ? {
                ...c,
                consequences: {
                  ...c.consequences,
                  [severity]: value,
                },
              }
            : c
        ),
      }));

      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(prev => {
          if (!prev) return null;
          return {
            ...prev,
            consequences: {
              ...prev.consequences,
              [severity]: value,
            },
          };
        });
      }
    },
    [selectedCharacter]
  );

  const addSceneAspect = useCallback((name: string, freeInvokes: number = 1) => {
    const aspect: SceneAspect = {
      id: crypto.randomUUID(),
      name,
      freeInvokes,
      createdBy: selectedCharacter?.name || 'GM',
      isTemporary: true,
    };

    setGameState(prev => ({
      ...prev,
      currentScene: prev.currentScene ? {
        ...prev.currentScene,
        aspects: [...prev.currentScene.aspects, aspect],
      } : null,
      logs: [...prev.logs, {
        id: crypto.randomUUID(),
        type: 'aspect',
        message: `Aspecto de cena criado: "${name}"`,
        timestamp: new Date(),
      }],
    }));
  }, [selectedCharacter]);

  const invokeAspect = useCallback((aspectName: string, useFreeInvoke: boolean = false) => {
    if (useFreeInvoke) {
      setGameState(prev => ({
        ...prev,
        currentScene: prev.currentScene ? {
          ...prev.currentScene,
          aspects: prev.currentScene.aspects.map(a =>
            a.name === aspectName && a.freeInvokes > 0
              ? { ...a, freeInvokes: a.freeInvokes - 1 }
              : a
          ),
        } : null,
        logs: [...prev.logs, {
          id: crypto.randomUUID(),
          type: 'aspect',
          message: `${selectedCharacter?.name || 'Jogador'} invocou "${aspectName}" (invocação gratuita)`,
          timestamp: new Date(),
        }],
      }));
    } else if (selectedCharacter) {
      spendFatePoint(selectedCharacter.id);
      setGameState(prev => ({
        ...prev,
        logs: [...prev.logs, {
          id: crypto.randomUUID(),
          type: 'aspect',
          message: `${selectedCharacter.name} invocou "${aspectName}" (+2 ou reroll)`,
          timestamp: new Date(),
        }],
      }));
    }
  }, [selectedCharacter, spendFatePoint]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'chat') => {
    setGameState(prev => ({
      ...prev,
      logs: [...prev.logs, {
        id: crypto.randomUUID(),
        type,
        message,
        character: selectedCharacter?.name,
        timestamp: new Date(),
      }],
    }));
  }, [selectedCharacter]);

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
  };
}
