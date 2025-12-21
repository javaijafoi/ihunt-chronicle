import { useState, useCallback } from 'react';
import { GameState, Character, DiceResult, LogEntry, SceneAspect, Token } from '@/types/game';
import sceneBackground from '@/assets/scene-default.jpg';

const createDefaultCharacter = (): Character => ({
  id: crypto.randomUUID(),
  name: 'Nova Caçadora',
  aspects: {
    highConcept: 'Caçadora de Monstros da Gig Economy',
    drama: 'Sempre precisando de grana',
    job: 'Motorista de app de dia, caçadora de noite',
    dreamBoard: 'Um dia vou sair dessa vida',
    free: ['Eu sei onde os monstros se escondem'],
  },
  skills: {
    'Atirar': 3,
    'Combate': 2,
    'Atletismo': 2,
    'Furtividade': 1,
    'Percepção': 1,
  },
  maneuvers: ['Golpe Rasteiro', 'Tiro Certeiro'],
  stress: {
    physical: [false, false, false],
    mental: [false, false, false],
  },
  consequences: {
    mild: null,
    moderate: null,
    severe: null,
  },
  fatePoints: 3,
  refresh: 3,
});

const initialState: GameState = {
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
  characters: [createDefaultCharacter()],
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
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    initialState.characters[0] || null
  );

  const rollDice = useCallback((modifier: number = 0, skill?: string, type: 'normal' | 'advantage' = 'normal'): DiceResult => {
    const faces: ('plus' | 'minus' | 'blank')[] = ['plus', 'minus', 'blank'];
    
    let dice: ('plus' | 'minus' | 'blank')[];
    let diceSum: number;
    
    if (type === 'advantage') {
      // 3dF + d6 for advantage
      dice = Array.from({ length: 3 }, () => faces[Math.floor(Math.random() * 3)]);
      const d6 = Math.floor(Math.random() * 6) + 1;
      diceSum = dice.reduce((sum, die) => {
        if (die === 'plus') return sum + 1;
        if (die === 'minus') return sum - 1;
        return sum;
      }, 0) + Math.ceil(d6 / 2); // d6 converted to 1-3 range
    } else {
      // Standard 4dF
      dice = Array.from({ length: 4 }, () => faces[Math.floor(Math.random() * 3)]);
      diceSum = dice.reduce((sum, die) => {
        if (die === 'plus') return sum + 1;
        if (die === 'minus') return sum - 1;
        return sum;
      }, 0);
    }

    const result: DiceResult = {
      id: crypto.randomUUID(),
      dice,
      modifier,
      total: diceSum + modifier,
      character: selectedCharacter?.name || 'Anônimo',
      skill,
      timestamp: new Date(),
      type,
    };

    const resultText = result.total >= 3 ? 'Sucesso com Estilo!' : 
                       result.total >= 0 ? 'Sucesso' : 'Falha';

    const logEntry: LogEntry = {
      id: crypto.randomUUID(),
      type: 'roll',
      message: `${result.character} rolou ${skill ? skill : 'dados'}: ${result.total} (${resultText})`,
      character: result.character,
      timestamp: new Date(),
      details: { dice: result.dice, modifier, total: result.total },
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
    addSceneAspect,
    invokeAspect,
    addLog,
  };
}
