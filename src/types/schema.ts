import { Timestamp } from 'firebase/firestore';

export interface CampaignMember {
    userId: string;
    role: 'gm' | 'player';
    characterId: string | null;
    joinedAt: Timestamp;
}

export interface Campaign {
    id: string;
    title: string;
    description: string;
    gmId: string;
    joinCode: string; // indexed, unique
    currentEpisodeId: string | null;
    status: 'active' | 'archived';
    theme: {
        tone: string;
        safetyTools: string[];
        customSetting: string;
    };
    members?: string[]; // For basic querying/indexing
    players?: {
        uid: string;
        displayName: string;
        photoURL?: string | null;
        email?: string | null;
    }[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Season {
    id: string;
    campaignId: string; // indexed
    title: string;
    order: number;
    status: 'active' | 'completed';
    themeAspect?: string;
}

export interface Story {
    id: string;
    seasonId: string; // indexed
    campaignId: string; // indexed
    title: string;
    order: number;
    themeAspect?: string;
}

export type EpisodeStatus = 'draft' | 'active' | 'closed';
export type EpisodeClosingType = 'episode' | 'story_climax' | 'season_finale';

export interface Episode {
    id: string;
    storyId: string; // indexed
    campaignId: string; // indexed
    title: string;
    status: EpisodeStatus;
    closedAs?: EpisodeClosingType;
    currentSceneId: string | null;
    gmFatePool: number;
    createdAt?: Timestamp | Date;
    closedAt?: Timestamp | Date;
}
