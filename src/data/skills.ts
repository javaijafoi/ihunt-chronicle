export type SkillAction = 'overcome' | 'createAdvantage' | 'attack' | 'defend';

export interface SkillDefinition {
    name: string;
    description?: string;
    actions: SkillAction[];
}

export const SKILLS: Record<string, SkillDefinition> = {
    'Acadêmico': {
        name: 'Acadêmico',
        actions: ['overcome', 'createAdvantage']
    },
    'Assassino': {
        name: 'Assassino',
        actions: ['createAdvantage', 'attack']
    },
    'Atleta': {
        name: 'Atleta',
        actions: ['overcome', 'createAdvantage', 'defend']
    },
    'Lutador': {
        name: 'Lutador',
        actions: ['overcome', 'createAdvantage', 'attack', 'defend']
    },
    'Trambiqueiro': {
        name: 'Trambiqueiro',
        actions: ['overcome', 'createAdvantage', 'defend']
    },
    'Guerrilheiro': {
        name: 'Guerrilheiro',
        actions: ['overcome', 'createAdvantage']
    },
    'Hacker': {
        name: 'Hacker',
        actions: ['overcome', 'createAdvantage']
    },
    'Influencer': {
        name: 'Influencer',
        actions: ['overcome', 'createAdvantage', 'attack']
    },
    'Investigador': {
        name: 'Investigador',
        actions: ['overcome', 'createAdvantage']
    },
    'Criador': {
        name: 'Criador',
        actions: ['overcome', 'createAdvantage']
    },
    'Médico': {
        name: 'Médico',
        actions: ['overcome', 'createAdvantage']
    },
    'Ocultista': {
        name: 'Ocultista',
        actions: ['overcome', 'createAdvantage']
    },
    'Organizador': {
        name: 'Organizador',
        actions: ['overcome', 'createAdvantage']
    },
    'Profissional': {
        name: 'Profissional',
        actions: ['overcome', 'createAdvantage']
    },
    'Socialite': {
        name: 'Socialite',
        actions: ['overcome', 'createAdvantage', 'defend']
    },
    'Assistente Social': {
        name: 'Assistente Social',
        actions: ['overcome', 'createAdvantage', 'defend']
    },
    'Espião': {
        name: 'Espião',
        actions: ['overcome', 'createAdvantage', 'defend']
    },
    'Sobrevivente': {
        name: 'Sobrevivente',
        actions: ['overcome', 'createAdvantage', 'defend']
    }
};

export const SKILL_NAMES = Object.keys(SKILLS).sort();
