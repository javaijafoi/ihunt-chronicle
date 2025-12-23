import { Character, SceneAspect } from './game';

export interface GameSession {
  id: string;
  name: string;
  gmId: string | null;
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
  ownerId: string;
  ownerName: string;
  characterId: string;
  lastSeen?: Date | null;
  online: boolean;
}

export interface PartyCharacter extends Character {
  ownerId: string;
  ownerName: string;
  isOnline: boolean;
  lastSeen?: Date | null;
}
