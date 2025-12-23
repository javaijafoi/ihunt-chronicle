// iHunt VTT Core Types

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

export interface Token {
  id: string;
  characterId: string;
  x: number;
  y: number;
  avatar?: string;
  name: string;
}

export interface GameState {
  currentScene: Scene | null;
  characters: Character[];
  tokens: Token[];
  logs: LogEntry[];
  gmFatePool: number;
}
