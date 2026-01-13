export type SkillAction = 'overcome' | 'createAdvantage' | 'attack' | 'defend';

export interface SkillDefinition {
    name: string;
    description: string;
    actions: SkillAction[];
    special?: string;
}

export const SKILLS: Record<string, SkillDefinition> = {
    'Acadêmico': {
        name: 'Acadêmico',
        description: 'Conhecimento é poder. Você sabe coisas.',
        actions: ['overcome', 'createAdvantage']
    },
    'Assassino': {
        name: 'Assassino',
        description: 'A arte de tirar vidas de forma fria e eficiente.',
        actions: ['createAdvantage', 'attack']
    },
    'Atleta': {
        name: 'Atleta',
        description: 'Corpo são, mente sã. Capacidade física superior.',
        actions: ['overcome', 'createAdvantage', 'defend'],
        special: 'Pode ter caixas de stress físico adicionais.'
    },
    'Lutador': {
        name: 'Lutador',
        description: 'Quando as palavras falham, os punhos resolvem.',
        actions: ['overcome', 'createAdvantage', 'attack', 'defend']
    },
    'Trambiqueiro': {
        name: 'Trambiqueiro',
        description: 'A arte da enganação, roubo e subterfúgio.',
        actions: ['overcome', 'createAdvantage', 'defend']
    },
    'Guerrilheiro': {
        name: 'Guerrilheiro',
        description: 'Combate tático, emboscadas e uso de explosivos.',
        actions: ['overcome', 'createAdvantage']
    },
    'Hacker': {
        name: 'Hacker',
        description: 'Invasão de sistemas, segurança digital e drones.',
        actions: ['overcome', 'createAdvantage']
    },
    'Influencer': {
        name: 'Influencer',
        description: 'Poder social, fama e manipulação de massas.',
        actions: ['overcome', 'createAdvantage', 'attack']
    },
    'Investigador': {
        name: 'Investigador',
        description: 'Percepção, busca por pistas e dedução.',
        actions: ['overcome', 'createAdvantage']
    },
    'Criador': {
        name: 'Criador',
        description: 'Engenharia, artesanato e consertos rápidos.',
        actions: ['overcome', 'createAdvantage']
    },
    'Médico': {
        name: 'Médico',
        description: 'Primeiros socorros, cirurgia e anatomia.',
        actions: ['overcome', 'createAdvantage']
    },
    'Ocultista': {
        name: 'Ocultista',
        description: 'Conhecimento do sobrenatural e rituais.',
        actions: ['overcome', 'createAdvantage']
    },
    'Organizador': {
        name: 'Organizador',
        description: 'Liderança, gestão de recursos e burocracia.',
        actions: ['overcome', 'createAdvantage']
    },
    'Profissional': {
        name: 'Profissional',
        description: 'Ética de trabalho, conexões corporativas e renda.',
        actions: ['overcome', 'createAdvantage']
    },
    'Socialite': {
        name: 'Socialite',
        description: 'Festas, etiqueta e conexões na alta sociedade.',
        actions: ['overcome', 'createAdvantage', 'defend']
    },
    'Assistente Social': {
        name: 'Assistente Social',
        description: 'Empatia, acalmar ânimos e conexões comunitárias.',
        actions: ['overcome', 'createAdvantage', 'defend']
    },
    'Espião': {
        name: 'Espião',
        description: 'Infiltração, disfarces e vigilância.',
        actions: ['overcome', 'createAdvantage', 'defend']
    },
    'Sobrevivente': {
        name: 'Sobrevivente',
        description: 'Resistência, caça e vida nas ruas.',
        actions: ['overcome', 'createAdvantage', 'defend'],
        special: 'Pode ter caixas de stress físico adicionais.'
    }
};

export const SKILL_NAMES = Object.keys(SKILLS).sort();
