import { Archetype } from "@/types/game";

export const DEFAULT_ARCHETYPES: Archetype[] = [
    {
        id: "global_vampiro_comum",
        name: "Vampiro Comum",
        kind: "monstro",
        description: "Um sanguessuga padrão, forte mas vulnerável à luz.",
        aspects: [
            "Predador Noturno",
            "Sede de Sangue Incontrolável",
            "Vulnerável ao Sol",
            "Força Sobrenatural"
        ],
        skills: {
            "Físico": 3,
            "Lutar": 3,
            "Provocar": 2,
            "Furtividade": 2
        },
        stress: 2,
        consequences: {
            mild: null,
            moderate: null,
            severe: null
        },
        stunts: [
            "Cura Acelerada: Pode limpar uma consequência leve por cena gastando 1 ponto de destino."
        ],
        isGlobal: true,
    },
    {
        id: "global_capanga",
        name: "Capanga",
        kind: "pessoa",
        description: "Um segurança ou bandido contratado para fazer o trabalho sujo.",
        aspects: [
            "Obedece ordens (na maioria das vezes)",
            "Armado e Perigoso",
            "Não é pago o suficiente para morrer"
        ],
        skills: {
            "Atirar": 2,
            "Lutar": 2,
            "Vigor": 1
        },
        stress: 2,
        consequences: {
            mild: null,
            moderate: null,
            severe: null
        },
        isGlobal: true,
    },
    {
        id: "global_vitima",
        name: "Vítima Inocente",
        kind: "pessoa",
        description: "Alguém que estava no lugar errado, na hora errada.",
        aspects: [
            "Assustado",
            "Em busca de ajuda",
            "Testemunha ocular"
        ],
        skills: {
            "Percepção": 2,
            "Furtividade": 1
        },
        stress: 2,
        consequences: {
            mild: null,
            moderate: null,
            severe: null
        },
        isGlobal: true,
    }
];
