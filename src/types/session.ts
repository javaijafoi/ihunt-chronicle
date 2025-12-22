import { Character, SceneAspect } from './game';

export interface GameSession {
  id: string;
  name: string;
  gmId: string;
  characterIds: string[];
  currentScene: {
    name: string;
    background?: string;
    aspects: SceneAspect[];
  } | null;
  gmFatePool: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionPresence {
  oderId: string;
  ownerName: string;
  characterId: string;
  lastSeen: Date;
  online: boolean;
}

export interface PartyCharacter extends Character {
  oderId: string;
  ownerName: string;
  isOnline: boolean;
}
