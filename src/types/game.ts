// iHUNT VTT Core Types

import { Timestamp } from 'firebase/firestore';

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
  sessionId?: string; // @deprecated use campaignId
  campaignId: string;
  userId: string; // Owner ID (former createdBy, normalized)
  createdBy: string; // Keep for legacy or alias to userId
  name: string;
  avatar?: string;
  isArchived?: boolean; // Soft delete
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
  selfies: Selfie[];
  selfieSlots?: SelfieSlot[]; // New progression system
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
  order: number;
  episodeId: string;
  campaignId: string;
}

export type TokenType = 'character' | 'monster' | 'npc';

export interface Token {
  id: string;
  characterId?: string; // Reference to character/monster/NPC
  campaignId: string;
  sceneId: string;
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

// ========== SELFIE SYSTEM ==========

export type SelfieType = 'mood' | 'auge' | 'mudanca';

export interface Selfie {
  id: string;
  url: string; // URL da imagem (Storage ou Blob local se offline)
  title: string;
  description: string; // Pode conter HTML/Rich Text básico
  type: SelfieType;
  isAvailable: boolean; // Se pode ser usada na sessão atual
  createdAt: string; // ISO Date
  usedAt?: string; // ISO Date da última utilização
}

export interface SelfieSlot {
  id: string;
  type: SelfieType;
  grantedBy: string; // episodeId
  used: boolean;
  usedAt?: Timestamp | Date;
  createdAt: Timestamp | Date;
}

// ========== ARCHETYPE SYSTEM ==========

// ========== ARCHETYPE SYSTEM ==========

export type ArchetypeKind = 'pessoa' | 'monstro';

export interface Archetype {
  id: string;
  campaignId: string | null; // null = global
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
  isGlobal: boolean; // true = template do sistema (apenas leitura para usuários)
  isArchived?: boolean; // true = NPC arquivado que virou um "template de histórico"
  createdAt?: import('firebase/firestore').Timestamp | Date;
}

export interface ActiveNPC {
  id: string;
  campaignId: string;
  episodeId: string | null;
  name: string; // Nome único na sessão (ex: "Vlad")
  archetypeId: string; // Referência ao arquétipo original
  archetypeName: string; // Cache do nome do arquétipo (ex: "Vampiro Comum")
  kind: ArchetypeKind;

  // Ficha completa (clonada do arquétipo, permite divergência)
  aspects: string[];
  skills: Record<string, number>;
  stress: number; // Max stress
  currentStress: number; // Stress atual (boxes marcados)
  consequences: {
    mild: string | null;
    moderate: string | null;
    severe: string | null;
  };
  stunts: string[];
  avatar?: string;

  // Estado na Sessão
  sceneId: string | null; // null = guardado/fora de cena
  hasToken: boolean; // Se tem token renderizado

  // Metadados de Sessão
  notes: string; // Notas do GM
  sceneTags: string[]; // Histórico de cenas (ex: ["Bar do Joe", "Esgotos"])

  createdAt?: import('firebase/firestore').Timestamp | Date;
  updatedAt?: import('firebase/firestore').Timestamp | Date;
}

// Deprecated types (kept temporarily for reference, but should not be used in new code)
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
