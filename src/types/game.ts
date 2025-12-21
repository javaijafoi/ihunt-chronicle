// iHunt VTT Core Types

export interface Character {
  id: string;
  name: string;
  avatar?: string;
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

export interface DiceResult {
  id: string;
  dice: ('plus' | 'minus' | 'blank')[];
  modifier: number;
  total: number;
  character: string;
  skill?: string;
  timestamp: Date;
  type: 'normal' | 'advantage';
}

export interface LogEntry {
  id: string;
  type: 'roll' | 'aspect' | 'fate' | 'system' | 'chat';
  message: string;
  character?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
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
