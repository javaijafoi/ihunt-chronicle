/**
 * Utilitário de migração de personagens
 * Garante compatibilidade com JSONs antigos adicionando campos novos com valores default
 */

import { Character, DriveName } from '@/types/game';
import { CharacterGift } from '@/data/gifts';

// Valid drive names for validation
const VALID_DRIVES: DriveName[] = ['malina', 'cavalo', 'fui', 'os66'];

function isValidDrive(drive: unknown): drive is DriveName {
  return typeof drive === 'string' && VALID_DRIVES.includes(drive as DriveName);
}

interface LegacyCharacter {
  id?: string;
  name?: string;
  avatarUrl?: string;
  drive?: string;
  aspects?: {
    highConcept?: string;
    drama?: string;
    job?: string;
    dreamBoard?: string;
    free?: string[];
  };
  skills?: Record<string, number>;
  maneuvers?: string[];
  stress?: {
    physical?: boolean[];
    mental?: boolean[];
  };
  consequences?: {
    mild?: string;
    moderate?: string;
    severe?: string;
  };
  fatePoints?: number;
  refresh?: number;
  campaignId?: string;
  sessionId?: string;
  createdBy?: string;
  userId?: string;
  // Campos novos que podem não existir em JSONs antigos
  skillManeuvers?: string[];
  gifts?: CharacterGift[];
  notes?: string;
}

/**
 * Migra um personagem de qualquer versão para a versão atual
 * Adiciona campos faltantes com valores default
 */
export function migrateCharacter(data: LegacyCharacter): Partial<Character> {
  // Garantir que aspects existe com estrutura correta
  const aspects = {
    highConcept: data.aspects?.highConcept ?? '',
    drama: data.aspects?.drama ?? '',
    job: data.aspects?.job ?? '',
    dreamBoard: data.aspects?.dreamBoard ?? '',
    free: data.aspects?.free ?? ['', '']
  };

  // Garantir que stress existe com estrutura correta
  const stress = {
    physical: data.stress?.physical ?? [false, false, false],
    mental: data.stress?.mental ?? [false, false, false]
  };

  // Garantir que consequences existe com estrutura correta
  const consequences = {
    mild: data.consequences?.mild ?? '',
    moderate: data.consequences?.moderate ?? '',
    severe: data.consequences?.severe ?? ''
  };

  return {
    // Campos básicos
    id: data.id,
    name: data.name ?? '',
    avatarUrl: data.avatarUrl ?? '',
    drive: isValidDrive(data.drive) ? data.drive : undefined,
    
    // Aspectos migrados
    aspects,
    
    // Skills (pode ser vazio)
    skills: data.skills ?? {},
    
    // Manobras de tara/gerais (campo original)
    maneuvers: data.maneuvers ?? [],
    
    // Stress e consequências migrados
    stress,
    consequences,
    
    // Fate points
    fatePoints: data.fatePoints ?? 3,
    refresh: data.refresh ?? 3,
    
    // IDs de campanha/sessão
    campaignId: data.campaignId,
    sessionId: data.sessionId,
    createdBy: data.createdBy,
    userId: data.userId,
    
    // NOVOS CAMPOS - adicionados com valores default se não existirem
    skillManeuvers: data.skillManeuvers ?? [],
    gifts: data.gifts ?? [],
    notes: data.notes ?? ''
  };
}

/**
 * Valida se um objeto tem a estrutura mínima de um personagem
 */
export function isValidCharacterData(data: unknown): data is LegacyCharacter {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  
  // Pelo menos o nome deve existir ou aspects ou skills
  return (
    typeof obj.name === 'string' ||
    typeof obj.aspects === 'object' ||
    typeof obj.skills === 'object'
  );
}

/**
 * Importa e migra dados de JSON
 */
export function importCharacterFromJson(jsonString: string): Partial<Character> | null {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!isValidCharacterData(parsed)) {
      console.error('JSON não contém dados válidos de personagem');
      return null;
    }
    
    return migrateCharacter(parsed);
  } catch (error) {
    console.error('Erro ao fazer parse do JSON:', error);
    return null;
  }
}

/**
 * Exporta personagem para JSON (compatível com versões futuras)
 */
export function exportCharacterToJson(character: Partial<Character>): string {
  // Garantir que todos os campos novos estejam presentes
  const exportData = {
    ...character,
    skillManeuvers: character.skillManeuvers ?? [],
    gifts: character.gifts ?? [],
    notes: character.notes ?? '',
    // Versão do schema para migrações futuras
    _schemaVersion: 2
  };
  
  return JSON.stringify(exportData, null, 2);
}
