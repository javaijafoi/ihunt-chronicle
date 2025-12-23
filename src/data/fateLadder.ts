// Fate Ladder - Escala de adjetivos e presets de oposição

export interface LadderEntry {
  value: number;
  label: string;
}

export const FATE_LADDER: LadderEntry[] = [
  { value: -2, label: 'Terrível' },
  { value: -1, label: 'Ruim' },
  { value: 0, label: 'Medíocre' },
  { value: 1, label: 'Regular' },
  { value: 2, label: 'Razoável' },
  { value: 3, label: 'Bom' },
  { value: 4, label: 'Grande' },
  { value: 5, label: 'Soberbo' },
  { value: 6, label: 'Incrível' },
  { value: 7, label: 'Épico' },
  { value: 8, label: 'Lendário' },
  { value: 9, label: 'Divino' },
];

export const OPPOSITION_PRESETS: LadderEntry[] = [
  { value: 0, label: 'Medíocre (+0)' },
  { value: 1, label: 'Regular (+1)' },
  { value: 2, label: 'Razoável (+2)' },
  { value: 3, label: 'Bom (+3)' },
  { value: 4, label: 'Grande (+4)' },
  { value: 5, label: 'Soberbo (+5)' },
  { value: 6, label: 'Incrível (+6)' },
];

export function getLadderLabel(value: number): string {
  if (value <= -2) return 'Terrível';
  if (value >= 9) return 'Divino';
  const entry = FATE_LADDER.find(e => e.value === value);
  return entry?.label ?? `${value >= 0 ? '+' : ''}${value}`;
}

export type OutcomeType = 'failure' | 'tie' | 'success' | 'style';

export interface OutcomeResult {
  outcome: OutcomeType;
  shifts: number;
  label: string;
}

export function calculateOutcome(total: number, opposition: number | null): OutcomeResult | null {
  if (opposition === null) return null;

  const shifts = total - opposition;

  if (shifts < 0) {
    return { outcome: 'failure', shifts, label: 'FALHA' };
  }
  if (shifts === 0) {
    return { outcome: 'tie', shifts, label: 'EMPATE' };
  }
  if (shifts >= 3) {
    return { outcome: 'style', shifts, label: 'SUCESSO COM ESTILO' };
  }
  return { outcome: 'success', shifts, label: 'SUCESSO' };
}
