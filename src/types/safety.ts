export type SafetyLevel = 'ok' | 'stage' | 'not_with_me' | 'veil' | 'line';

export interface SafetyTopic {
    id: string;
    name: string;
    icon?: string;
    isCustom?: boolean;
}

export interface PlayerSafetySetting {
    userId: string;
    topicId: string;
    level: SafetyLevel;
}

export interface SafetyState {
    isPaused: boolean;
    xCardTriggeredBy: string | null;
    xCardReason?: string;
    lastUpdated: number;
}

export const DEFAULT_SAFETY_TOPICS: SafetyTopic[] = [
    // Coluna 1
    { id: 'preconceito_racial', name: 'Preconceito: Racial' },
    { id: 'preconceito_religioso', name: 'Preconceito: Religioso' },
    { id: 'preconceito_genero', name: 'Preconceito: Sexualidade e Gênero' },
    { id: 'sangue', name: 'Sangue' },
    { id: 'morte_violenta', name: 'Morte Violenta' },
    { id: 'bullying', name: 'Bullying' },
    { id: 'espacos_confinados', name: 'Espaços Confinados' },
    { id: 'drogas', name: 'Uso de Drogas' },
    { id: 'violencia_grafica', name: 'Violência Gráfica' },
    { id: 'insetos', name: 'Insetos' },
    { id: 'perda_autonomia', name: 'Perda de Autonomia' },
    { id: 'tratamento_medico', name: 'Tratamento Médico' },
    { id: 'desastres_naturais', name: 'Desastres Naturais' },
    { id: 'violencia_politica', name: 'Violência Política e Policial' },
    { id: 'gravidez', name: 'Gravidez (Traumática)' },
    { id: 'restricao_fisica', name: 'Restrição Física ou Paralisia' },

    // Coluna 2
    { id: 'romance', name: 'Romance' },
    { id: 'automutilacao', name: 'Automutilação' },
    { id: 'sexo', name: 'Sexo' },
    { id: 'violencia_sexual', name: 'Violência Sexual' },
    { id: 'fome', name: 'Fome e Privação' },
    { id: 'tortura', name: 'Tortura' },
    { id: 'violencia_animais', name: 'Violência Contra Animais' },
    { id: 'violencia_criancas', name: 'Violência Contra Crianças' },
];

export const SAFETY_LEVELS: { id: SafetyLevel; label: string; color: string; icon: string; severity: number }[] = [
    { id: 'ok', label: 'Tudo OK', color: 'bg-green-500', icon: 'CheckCircle2', severity: 0 },
    { id: 'stage', label: 'OK em Cena', color: 'bg-blue-500', icon: 'Check', severity: 1 },
    { id: 'not_with_me', label: 'Comigo Não', color: 'bg-amber-500', icon: 'UserX', severity: 2 },
    { id: 'veil', label: 'Fora de Cena', color: 'bg-zinc-500', icon: 'EyeOff', severity: 3 },
    { id: 'line', label: 'Limite', color: 'bg-red-600', icon: 'XCircle', severity: 4 },
];
