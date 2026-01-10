import { Character } from '../types/game';

type StressTracks = {
  physical: boolean[];
  mental: boolean[];
};

export interface StressTrackOptions {
  mentalAliases?: string[];
}

const BASE_STRESS_BOXES = 2;
const DEFAULT_MENTAL_ALIASES = ['Vontade', 'Ocultista', 'Acadêmico', 'Sobrevivente'];

const calculateTrackSize = (skillValue: number): number => {
  if (skillValue >= 3) return 4;
  if (skillValue >= 1) return 3;
  return BASE_STRESS_BOXES;
};

const getHighestSkillValue = (skills: Record<string, number>, aliases: string[]): number =>
  aliases.reduce((highest, alias) => {
    const value = skills[alias];
    return typeof value === 'number' ? Math.max(highest, value) : highest;
  }, 0);

const buildTrack = (savedTrack: boolean[] = [], size: number): boolean[] => {
  const preserved = savedTrack.slice(0, size);

  while (preserved.length < size) {
    preserved.push(false);
  }

  return preserved;
};

export const calculateStressTracks = (
  character: Character,
  options: StressTrackOptions = {}
): StressTracks => {
  const mentalAliases = options.mentalAliases?.length
    ? options.mentalAliases
    : DEFAULT_MENTAL_ALIASES;

  const physicalSkillValue = Math.max(
    character.skills?.['Atleta'] ?? 0,
    character.skills?.['Atletismo'] ?? 0,
    character.skills?.['Vigor'] ?? 0
  );
  const mentalSkillValue = getHighestSkillValue(character.skills ?? {}, mentalAliases);

  const physicalTrackSize = calculateTrackSize(physicalSkillValue);
  const mentalTrackSize = calculateTrackSize(mentalSkillValue);

  return {
    physical: buildTrack(character.stress?.physical, physicalTrackSize),
    mental: buildTrack(character.stress?.mental, mentalTrackSize),
  };
};

export const validateSkillPyramid = (skills: Record<string, number>): { valid: boolean; error?: string } => {
  const counts: Record<number, number> = {};
  let maxRank = 0;

  // Count skills per rank
  Object.values(skills).forEach(rank => {
    if (rank > 0) {
      counts[rank] = (counts[rank] || 0) + 1;
      maxRank = Math.max(maxRank, rank);
    }
  });

  // Check pyramid structure (Rank N <= Rank N-1)
  for (let rank = maxRank; rank > 1; rank--) {
    const higherCount = counts[rank] || 0;
    const lowerCount = counts[rank - 1] || 0;

    if (higherCount > lowerCount) {
      return {
        valid: false,
        error: `Quebra da Pirâmide: Você tem ${higherCount} perícias no nível ${rank}, mas apenas ${lowerCount} no nível ${rank - 1}.`
      };
    }
  }

  return { valid: true };
};
