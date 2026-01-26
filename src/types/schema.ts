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
    status: 'active' | 'archived';
    gmFatePool?: number; // Added
    theme: {
        tone: string;
        safetyTools: string[];
        customSetting: string;
    };
    themeAspects: string[];
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


