import { Character } from '@/types/game';
import { SKILL_NAMES } from '@/data/skills';

const SKILL_MAPPING: Record<string, string> = {
    // Physical & Combat
    'Atirar': 'Assassino',
    'Combate': 'Lutador',
    'Briga': 'Lutador',
    'Atletismo': 'Atleta',
    'Vigor': 'Sobrevivente',

    // Social
    'Enganar': 'Trambiqueiro',
    'Roubo': 'Trambiqueiro',
    'Intimidar': 'Guerrilheiro',
    'Empatia': 'Assistente Social',
    'Serviço Social': 'Assistente Social',
    'Contatos': 'Organizador',
    'Recursos': 'Profissional',
    'Provocar': 'Influencer',
    'Comunicação': 'Influencer',
    'Socialite': 'Socialite',

    // Mental & Utility
    'Vontade': 'Sobrevivente',
    'Percepção': 'Investigador',
    'Investigar': 'Investigador',
    'Investigação': 'Investigador',
    'Tecnologia': 'Hacker',
    'Furtividade': 'Espião',
    'Espionagem': 'Espião',
    'Conhecimento': 'Acadêmico',
    'Erudição': 'Acadêmico',
    'Ofícios': 'Criador',
    'Dirigir': 'Atleta'
};

export const migrateCharacterSkills = (character: Character): Character => {
    const oldSkills = character.skills || {};
    const newSkills: Record<string, number> = {};

    Object.entries(oldSkills).forEach(([skill, value]) => {
        // If it's already a valid new skill, keep it
        if (SKILL_NAMES.includes(skill)) {
            // If we already have a value (from a merged mapping), keep the higher one
            newSkills[skill] = Math.max(newSkills[skill] || 0, value);
            return;
        }

        // Check mapping
        const newName = SKILL_MAPPING[skill];
        if (newName) {
            newSkills[newName] = Math.max(newSkills[newName] || 0, value);
        } else {
            // Fallback: keep it as a custom skill if no mapping found, 
            // but maybe uppercase it or something? No, just keep it.
            // Or we could map unknown to 'Sobrevivente' as a catch-all? 
            // Better to keep it so the user sees it and fixes it manually if needed.
            newSkills[skill] = value;
        }
    });

    return {
        ...character,
        skills: newSkills
    };
};
