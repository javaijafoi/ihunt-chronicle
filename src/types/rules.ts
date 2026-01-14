import { Timestamp } from 'firebase/firestore';

export type SkillAction = 'overcome' | 'createAdvantage' | 'attack' | 'defend';

export type DriveName = 'malina' | 'cavalo' | 'fui' | 'os66';

export type ManeuverType = 'skill' | 'drive_free' | 'drive_exclusive' | 'general';

// Firestore collection: system_skills
export interface SystemSkill {
  id: string;           // slug: 'lutador', 'academico'
  name: string;         // 'Lutador', 'Acadêmico'
  description?: string;
  actions: SkillAction[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Firestore collection: system_maneuvers
export interface SystemManeuver {
  id: string;           // UUID ou slug
  name: string;
  description: string;
  skillId?: string;     // null = manobra geral ou de drive
  driveId?: DriveName;  // null = manobra de skill
  type: ManeuverType;
  cost: number;         // 0 = grátis, 1 = 1 refresh
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Firestore collection: system_gifts
export interface SystemGift {
  id: string;           // slug: 'bencao', 'portal'
  name: string;
  description: string;
  essenceCost: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Firestore collection: system_drives
export interface SystemDrive {
  id: DriveName;
  name: string;
  icon: string;
  summary: string;
  freeManeuverIds: string[];
  exclusiveManeuverIds: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Helper type for drives with resolved maneuvers (used in UI)
export interface ResolvedDrive {
  id: DriveName;
  name: string;
  icon: string;
  summary: string;
  freeManeuvers: SystemManeuver[];
  exclusiveManeuvers: SystemManeuver[];
}
