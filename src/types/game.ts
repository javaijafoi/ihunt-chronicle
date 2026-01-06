// iHUNT VTT Core Types

export type DriveName = 'malina' | 'cavalo' | 'fui' | 'os66';

export interface Maneuver {
  id: string;
  name: string;
  description: string;
  driveExclusive?: DriveName; // undefined = available for all
  cost: number; // 0 = free, 1 = costs 1 refresh
}

export interface Drive {
  id: DriveName;
  name: string;
  icon: string;
  summary: string;
  freeManeuver: Maneuver;
  exclusiveManeuvers: Maneuver[];
}

export interface Character {
  id: string;
  sessionId: string;
  createdBy: string;
  name: string;
  avatar?: string;
  drive?: DriveName;
  aspects: {
    highConcept: string;
    drama: string;
    job: string;
    dreamBoard: string;
    free: string[];
  };
  skills: Record<string, number>;
  maneuvers: string[];
  stress: {
    physical: boolean[];
    mental: boolean[];
  };
  consequences: {
    mild: string | null;
    moderate: string | null;
    severe: string | null;
  };
  fatePoints: number;
  refresh: number;
}

export interface SceneAspect {
  id: string;
  name: string;
  freeInvokes: number;
  createdBy: string;
  isTemporary: boolean;
}

export type ActionType = 'superar' | 'criarVantagem' | 'atacar' | 'defender';

export interface DiceResult {
  id: string;
  fateDice: ('plus' | 'minus' | 'blank')[];
  d6?: number;
  modifier: number;
  diceTotal: number;
  total: number;
  opposition?: number;
  shifts?: number;
  outcome?: 'failure' | 'tie' | 'success' | 'style';
  character: string;
  skill?: string;
  action?: ActionType;
  timestamp: Date | import('firebase/firestore').Timestamp;
  type: 'normal' | 'advantage';
  invocations: number;
}

export interface RollEvent {
  id: string;
  type: 'roll';
  result: DiceResult;
  authorId: string;
  createdAt?: Date | import('firebase/firestore').Timestamp;
}

export interface RollLogDetails {
  kind: 'roll';
  action?: ActionType;
  actionLabel?: string;
  skill?: string;
  skillBonus?: number;
  fateDice: ('plus' | 'minus' | 'blank')[];
  diceTotal: number;
  opposition?: number;
  shifts?: number;
  ladderLabel: string;
  d6?: number;
  modifier: number;
  total: number;
  type: 'normal' | 'advantage';
  outcome: string;
  avatar?: string;
}

export interface LogEntry {
  id: string;
  type: 'roll' | 'aspect' | 'fate' | 'system' | 'chat';
  message: string;
  character?: string;
  timestamp: Date | import('firebase/firestore').Timestamp;
  details?: RollLogDetails | Record<string, unknown>;
}

export interface Scene {
  id: string;
  name: string;
  background?: string;
  aspects: SceneAspect[];
  isActive: boolean;
}

export type TokenType = 'character' | 'monster' | 'npc';

export interface Token {
  id: string;
  characterId?: string; // Reference to character/monster/NPC
  npcId?: string; // Reference to ActiveNPC
  type: TokenType;
  x: number;
  y: number;
  avatar?: string;
  name: string;
  ownerId?: string; // User who controls this token
  currentStress?: number; // Current stress for display
  maxStress?: number;
  isVisible?: boolean; // GM can hide tokens from players
  size?: 'small' | 'medium' | 'large'; // Token size
  color?: string; // Custom border color
}

// ========== ARCHETYPE SYSTEM ==========

export type ArchetypeKind = 'pessoa' | 'monstro';

export interface Archetype {
  id: string;
  name: string;
  kind: ArchetypeKind;
  description?: string;
  aspects: string[];
  skills: Record<string, number>;
  stress: number;
  consequences: {
    mild: string | null;
    moderate: string | null;
    severe: string | null;
  };
  stunts?: string[];
  avatar?: string;
  isGlobal: boolean; // true = template do sistema
  isArchived?: boolean; // true = NPC arquivado que virou template
  archivedFromName?: string; // Nome original quando era NPC ativo
  createdAt?: import('firebase/firestore').Timestamp;
}

export interface ActiveNPC {
  id: string;
  name: string; // Nome único (ex: "Vlad")
  archetypeId: string; // Referência ao arquétipo base
  archetypeName: string; // Cache do nome (ex: "Vampiro Comum")
  kind: ArchetypeKind; // "pessoa" ou "monstro"

  // Ficha completa (copiada do arquétipo, editável)
  aspects: string[];
  skills: Record<string, number>;
  stress: number;
  currentStress: number; // Stress atual (dano recebido)
  consequences: {
    mild: string | null;
    moderate: string | null;
    severe: string | null;
  };
  stunts: string[];
  avatar?: string;

  // Estado
  sceneId: string | null; // null = "guardado" (não está em nenhuma cena)
  hasToken: boolean; // Se tem token visível na cena

  // Anotações
  notes: string;
  sceneTags: string[]; // Ex: ["Beco Escuro", "Clube Noturno"]

  createdAt?: import('firebase/firestore').Timestamp;
  updatedAt?: import('firebase/firestore').Timestamp;
}

// Legacy NPC type for backwards compatibility - will be migrated
export interface NPC {
  id: string;
  name: string;
  description?: string;
  aspects: string[];
  skills: Record<string, number>;
  stress: number;
  consequences: {
    mild: string | null;
    moderate: string | null;
    severe: string | null;
  };
  notes?: string;
  avatar?: string;
  isTemplate?: boolean;
}

export interface GameState {
  currentScene: Scene | null;
  characters: Character[];
  tokens: Token[];
  logs: LogEntry[];
  gmFatePool: number;
}
