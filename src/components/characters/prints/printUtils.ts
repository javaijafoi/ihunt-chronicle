
import { Character, DriveName, Maneuver, CharacterGift } from '@/types/game';
import { DRIVES, GENERAL_MANEUVERS, getDriveById } from '@/data/drives';
import { SKILL_MANEUVERS } from '@/data/skillManeuvers';

export interface PrintData {
    name: string;
    archetype: string;
    description: string;
    aspects: {
        highConcept: string;
        drama: string;
        job: string;
        dreamBoard: string;
        free: string[];
    };
    skills: {
        superb: string[];
        great: string[];
        fair: string[];
        average: string[];
    };
    maneuvers: { name: string; desc: string }[];
    gifts: { name: string; desc: string; level?: number }[];
    stress: {
        physical: number;
        mental: number;
    };
    fatePoints: number;
    refresh: number;
    notes?: string;
}

export function getCharacterPrintData(
    character: Omit<Character, 'id' | 'campaignId' | 'sessionId' | 'createdBy' | 'userId'>,
    previewRefresh?: number
): PrintData {

    // 1. Resolve Drive/Archetype
    const drive = character.drive ? getDriveById(character.drive) : undefined;
    const archetype = drive ? drive.name : 'Caçador'; // Fallback
    const description = drive ? drive.summary : 'Um caçador sem filiação clara.';

    // 2. Resolve Skills
    const skillsByLevel: Record<number, string[]> = {
        4: [],
        3: [],
        2: [],
        1: []
    };

    Object.entries(character.skills).forEach(([skillName, level]) => {
        if (skillsByLevel[level]) {
            skillsByLevel[level].push(skillName);
        }
    });

    // Sort alphabetically
    [4, 3, 2, 1].forEach(level => skillsByLevel[level].sort());

    // 3. Resolve Maneuvers
    const resolvedManeuvers: { name: string; desc: string }[] = [];

    const allManeuverIds = [...(character.maneuvers || []), ...(character.skillManeuvers || [])];

    // Helper to find maneuver info
    const findManeuver = (id: string): Maneuver | undefined => {
        // Check drive
        if (drive) {
            if (drive.freeManeuver.id === id) return drive.freeManeuver;
            const exclusive = drive.exclusiveManeuvers.find(m => m.id === id);
            if (exclusive) return exclusive;
        }
        // Check general
        const general = GENERAL_MANEUVERS.find(m => m.id === id);
        if (general) return general;

        // Check skills
        for (const maneuvers of Object.values(SKILL_MANEUVERS)) {
            const found = maneuvers.find(m => m.id === id);
            if (found) return found;
        }
        return undefined;
    };

    allManeuverIds.forEach(id => {
        const m = findManeuver(id);
        if (m) {
            resolvedManeuvers.push({ name: m.name, desc: m.description });
        } else {
            resolvedManeuvers.push({ name: id, desc: 'Manobra desconhecida' });
        }
    });

    // 4. Resolve Gifts
    const resolvedGifts = (character.gifts || []).map(g => ({
        name: g.name,
        desc: g.description,
        level: g.level
    }));

    return {
        name: character.name || 'Sem Nome',
        archetype: archetype,
        description: description,
        aspects: {
            highConcept: character.aspects.highConcept || '',
            drama: character.aspects.drama || '',
            job: character.aspects.job || '',
            dreamBoard: character.aspects.dreamBoard || '',
            free: character.aspects.free || []
        },
        skills: {
            superb: skillsByLevel[4],
            great: skillsByLevel[3],
            fair: skillsByLevel[2],
            average: skillsByLevel[1]
        },
        maneuvers: resolvedManeuvers,
        gifts: resolvedGifts,
        stress: {
            // Just the box count, usually 3
            physical: 3,
            mental: 3
        },
        fatePoints: character.fatePoints ?? 3,
        refresh: previewRefresh ?? character.refresh ?? 3,
        notes: character.notes
    };
}
