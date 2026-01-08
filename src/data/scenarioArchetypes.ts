
import { Archetype } from "@/types/game";

export const SCENARIO_ARCHETYPES: Archetype[] = [
    {
        id: "scenario_euridice",
        name: "Eurídice, A Sereia",
        kind: "monstro",
        description: "Uma vampira ancestral, fria e calculista, que assombra San Jenaro há séculos.",
        aspects: [
            "Cherchez la Femme",
            "Alegria de Viver Após a Morte",
            "Viu a Queda de Impérios",
            "Quebrando o Ciclo Eterno",
            "Perdida e Solitária",
            "Pronta para Correr"
        ],
        skills: {
            "Acadêmica": 1,
            "Assassina": 1,
            "Atleta": 2,
            "Trambiqueira": 3,
            "Influencer": 3,
            "Investigadora": 2,
            "Médica": 1,
            "Ocultista": 1,
            "Serviço Social": 2,
            "Espiã": 1,
            "Sobrevivente": 3
        },
        stress: 5,
        consequences: { mild: null, moderate: null, severe: null },
        stunts: [],
        isGlobal: true,
    },
    {
        id: "scenario_kiki",
        name: "Kiki Parker",
        kind: "pessoa",
        description: "A Malina do grupo Amigues. Consultora de roteiros de terror e ocultista.",
        aspects: [
            "Sempre a Estranha",
            "Resíduo Tóxico da Indústria Cinematográfica",
            "Esse Filme Precisa Sair",
            "Consultora de Roteiros de Terror"
        ],
        skills: {
            "Acadêmica": 3, "Atleta": 1, "Trambiqueira": 2, "Hacker": 2,
            "Influencer": 3, "Médica": 2, "Ocultista": 4, "Socialite": 1,
            "Espiã": 1, "Sobrevivente": 1
        },
        stress: 5,
        consequences: { mild: null, moderate: null, severe: null },
        stunts: [
            "Amuletos de Defesa (Ocultista)",
            "Especialização: Vampiros (Ocultista)",
            "Médica de Combate (Médica)",
            "Sabe das coisas (Malina)",
            "Embruxação x3 (Malina)"
        ],
        isGlobal: true,
    },
    {
        id: "scenario_dana",
        name: "Dana Reges",
        kind: "pessoa",
        description: "A Cavala do grupo Amigues. Aspirante a atriz de ação e barista.",
        aspects: [
            "Aspirante a Heroína de Ação",
            "Sabe Dizer Não",
            "Seu Nome no Cartaz",
            "Barista da Gorgon Grounds"
        ],
        skills: {
            "Acadêmica": 1, "Assassina": 2, "Atleta": 3, "Lutadora": 4,
            "Trambiqueira": 3, "Guerrilheira": 2, "Influencer": 1,
            "Socialite": 2, "Espiã": 1, "Sobrevivente": 1
        },
        stress: 7,
        consequences: { mild: null, moderate: null, severe: null },
        stunts: [
            "Segue o Fluxo (Atleta)",
            "Vença a Dor (Lutadora)",
            "A Melhor Defesa (Cavala)",
            "Consciência Situacional (Cavala)"
        ],
        isGlobal: true,
    },
    {
        id: "scenario_giang",
        name: "Giang Le",
        kind: "pessoa",
        description: "Ê Fui do grupo Amigues. Especialista em efeitos especiais e suporte técnico.",
        aspects: [
            "Mague dos Efeitos Especiais",
            "Ressentimento com a Indústria Cinematográfica",
            "Criar uma Obra-Prima de Efeitos Especiais Independente",
            "Suporte Técnico"
        ],
        skills: {
            "Acadêmique": 2, "Assassine": 2, "Trambiqueire": 1, "Hacker": 3,
            "Investigadore": 3, "Criadore": 4, "Ocultista": 2, "Organizadore": 1,
            "Profissional": 1, "Espiãe": 1, "Sobrevivente": 1
        },
        stress: 3,
        consequences: { mild: null, moderate: null, severe: null },
        stunts: [
            "Drone Utilitário (Criadore)",
            "Tem um Aplicativo Pra Isso (Hacker)",
            "Protocolo Básico (Fui)",
            "Pilotagem Sagaz (Fui)",
            "Desmascarar (Investigadore)"
        ],
        isGlobal: true,
    },
    {
        id: "scenario_aster",
        name: "Aster Morgan",
        kind: "pessoa",
        description: "Ê 66 do grupo Amigues. Ex-paparazzi e jornalista investigative.",
        aspects: [
            "Ex-Paparazzi",
            "Na Lista Negra da Indústria",
            "Derrubar a Igreja",
            "Redatore e Fotógrafe Freelancer"
        ],
        skills: {
            "Acadêmique": 1, "Atleta": 1, "Trambiqueire": 2, "Influencer": 2,
            "Investigadore": 3, "Organizadore": 2, "Profissional": 2, "Socialite": 3,
            "Serviço Social": 1, "Espiãe": 4, "Sobrevivente": 1
        },
        stress: 5,
        consequences: { mild: null, moderate: null, severe: null },
        stunts: [
            "Fuga Impressionante (Espiãe)",
            "Blasé (Socialite)",
            "Pessoas que Conhecem Pessoas (66)",
            "Disfarce Secreto (66)",
            "Vestide para o Sucesso (Influencer)"
        ],
        isGlobal: true,
    },
    {
        id: "scenario_zumbi",
        name: "Zumbi Marinho",
        kind: "monstro",
        description: "Monstro básico. Nojento, molhado e faminto.",
        aspects: [
            "Morte ao Mar",
            "Caindo aos Pedaços",
            "Todo Molhado e Pegajoso"
        ],
        skills: {
            "Assassino": 1,
            "Atleta": 2,
            "Lutador": 2,
            "Sobrevivente": 3
        },
        stress: 5,
        consequences: { mild: null, moderate: null, severe: null },
        stunts: [
            "Insensível (Sobrevivente)"
        ],
        isGlobal: true,
    },
    {
        id: "scenario_super_zumbi",
        name: "Super Zumbi Marinho",
        kind: "monstro",
        description: "Uma versão mais forte e perigosa do Zumbi Marinho.",
        aspects: [
            "Morte ao Mar",
            "Caindo aos Pedaços",
            "Todo Molhado e Pegajoso"
        ],
        skills: {
            "Assassino": 1,
            "Atleta": 4,
            "Lutador": 2,
            "Sobrevivente": 3
        },
        stress: 5,
        consequences: { mild: null, moderate: null, severe: null },
        stunts: [
            "Insensível (Sobrevivente)"
        ],
        isGlobal: true,
    },
    {
        id: "scenario_avon",
        name: "Avon Bronwen",
        kind: "pessoa",
        description: "O Faroleiro. Feiticeiro velho e moribundo.",
        aspects: [
            "Velho e o Mar",
            "Ele Está Morrendo",
            "Alguém Precisa Tomar Seu Lugar...",
            "Faroleiro",
            "Especialista Em Vida Marinha"
        ],
        skills: {
            "Acadêmico": 3, "Trambiqueiro": 2, "Influencer": 1,
            "Investigador": 3, "Criador": 2, "Ocultista": 4, "Sobrevivente": 2
        },
        stress: 3,
        consequences: { mild: null, moderate: null, severe: null },
        stunts: [
            "Amuletos de Defesa (Ocultista)",
            "Especialização (Ocultista)"
        ],
        isGlobal: true,
    },
    {
        id: "scenario_coisa_mar",
        name: "A Coisa que Veio do Mar",
        kind: "monstro",
        description: "Um horror ancestral, enorme e faminto, vindo das profundezas.",
        aspects: [
            "Porque Temos Medo do Mar",
            "Tão Faminta",
            "Filha da Puta Casca-Grossa",
            "Muitos Tentáculos"
        ],
        skills: {
            "Atleta": 4,
            "Lutador": 4,
            "Sobrevivente": 3
        },
        stress: 7,
        consequences: { mild: null, moderate: null, severe: null },
        stunts: [
            "Insensível (Sobrevivente)",
            "Vença a Dor (Lutador)"
        ],
        isGlobal: true,
    },
];
