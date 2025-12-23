import { describe, expect, it } from 'bun:test';

import { calculateStressTracks } from './gameRules';
import { Character } from '../types/game';

const buildCharacter = (overrides: Partial<Character> = {}): Character => {
  const base: Character = {
    id: 'character-id',
    sessionId: 'session-id',
    createdBy: 'user-id',
    name: 'Test Character',
    drive: undefined,
    aspects: {
      highConcept: 'High Concept',
      drama: 'Drama',
      job: 'Job',
      dreamBoard: 'Dream Board',
      free: [],
    },
    skills: {},
    maneuvers: [],
    stress: {
      physical: [false, false],
      mental: [false, false],
    },
    consequences: {
      mild: null,
      moderate: null,
      severe: null,
    },
    fatePoints: 0,
    refresh: 0,
  };

  return {
    ...base,
    ...overrides,
    aspects: overrides.aspects ? { ...base.aspects, ...overrides.aspects } : base.aspects,
    skills: overrides.skills ?? base.skills,
    maneuvers: overrides.maneuvers ?? base.maneuvers,
    stress: overrides.stress
      ? {
          physical: overrides.stress.physical ?? base.stress.physical,
          mental: overrides.stress.mental ?? base.stress.mental,
        }
      : base.stress,
    consequences: overrides.consequences
      ? { ...base.consequences, ...overrides.consequences }
      : base.consequences,
  };
};

describe('calculateStressTracks', () => {
  it('uses the highest physical skill to determine track size', () => {
    const character = buildCharacter({
      skills: { Sobrevivente: 1, Atleta: 3, Vontade: 0 },
      stress: { physical: [true, false], mental: [false, false] },
    });

    const tracks = calculateStressTracks(character);

    expect(tracks.physical).toEqual([true, false, false, false]);
    expect(tracks.mental).toEqual([false, false]);
  });

  it('respects mental aliases and preserves saved stress boxes', () => {
    const character = buildCharacter({
      skills: { Acadêmico: 1 },
      stress: { physical: [false, true], mental: [true, false, true] },
    });

    const tracks = calculateStressTracks(character, { mentalAliases: ['Acadêmico'] });

    expect(tracks.mental).toEqual([true, false, true]);
    expect(tracks.physical).toEqual([false, true]);
  });

  it('fills extra boxes with false and trims when needed', () => {
    const character = buildCharacter({
      skills: { Vontade: 3, Sobrevivente: 0 },
      stress: { physical: [true, true, true], mental: [true, true] },
    });

    const tracks = calculateStressTracks(character);

    expect(tracks.mental).toEqual([true, true, false, false]);
    expect(tracks.physical).toEqual([true, true]);
  });
});
