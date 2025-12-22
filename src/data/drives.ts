import { Drive, Maneuver, DriveName } from '@/types/game';

// Manobras Gerais (disponíveis para qualquer tara)
export const GENERAL_MANEUVERS: Maneuver[] = [
  {
    id: 'golpe-rasteiro',
    name: 'Golpe Rasteiro',
    description: '+2 em ataques corpo a corpo quando o alvo não espera.',
    cost: 1,
  },
  {
    id: 'tiro-certeiro',
    name: 'Tiro Certeiro',
    description: 'Use Percepção no lugar de Combate para ataques à distância.',
    cost: 1,
  },
  {
    id: 'instinto-sobrevivencia',
    name: 'Instinto de Sobrevivência',
    description: '+2 para Defesa quando estiver em desvantagem numérica.',
    cost: 1,
  },
  {
    id: 'contatos-submundo',
    name: 'Contatos no Submundo',
    description: 'Uma vez por sessão, você conhece alguém que pode ajudar.',
    cost: 1,
  },
  {
    id: 'primeiros-socorros',
    name: 'Primeiros Socorros',
    description: 'Use Conhecimento para curar consequências leves fora de combate.',
    cost: 1,
  },
  {
    id: 'mecanico-ocasiao',
    name: 'Mecânico de Ocasião',
    description: '+2 para consertar ou sabotar veículos e equipamentos.',
    cost: 1,
  },
];

// Dados das Taras
export const DRIVES: Drive[] = [
  {
    id: 'malina',
    name: 'Malinas',
    icon: '📚',
    summary: 'Caçam com conhecimento. Estudam os monstros, aprendem como funcionam, e usam isso contra eles. Pesquisa é sua arma mais poderosa.',
    freeManeuver: {
      id: 'sabe-das-coisas',
      name: 'Sabe das Coisas',
      description: 'Você pode usar Conhecimento para criar vantagem ao identificar fraquezas de monstros. +2 quando pesquisar sobre criaturas sobrenaturais.',
      driveExclusive: 'malina',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'mestre-pesquisa',
        name: 'Mestre da Pesquisa',
        description: 'Uma vez por sessão, você pode declarar que já pesquisou sobre o assunto atual e receber uma informação crucial do GM.',
        driveExclusive: 'malina',
        cost: 1,
      },
      {
        id: 'pocoes',
        name: 'Poções',
        description: 'Você pode criar itens consumíveis usando Conhecimento. Comece cada sessão com uma poção gratuita.',
        driveExclusive: 'malina',
        cost: 1,
      },
      {
        id: 'embruxacao',
        name: 'Embruxação',
        description: 'Você aprendeu rituais básicos. Pode gastar um Ponto de Destino para criar efeitos sobrenaturais menores.',
        driveExclusive: 'malina',
        cost: 1,
      },
    ],
  },
  {
    id: 'cavalo',
    name: 'Cavalos',
    icon: '⚔️',
    summary: 'Lutam com força bruta. Vão direto na jugular. Quando a diplomacia falha, eles entram em cena com punhos e determinação.',
    freeManeuver: {
      id: 'melhor-defesa',
      name: 'A Melhor Defesa',
      description: 'Quando você ataca com sucesso, pode escolher receber +2 na defesa até seu próximo turno em vez de causar mais dano.',
      driveExclusive: 'cavalo',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'consciencia-situacional',
        name: 'Consciência Situacional',
        description: '+2 para notar emboscadas e ameaças físicas. Você nunca é pego completamente de surpresa.',
        driveExclusive: 'cavalo',
        cost: 1,
      },
      {
        id: 'machuca-nao-doi',
        name: 'Machuca Mas Não Dói',
        description: 'Uma vez por cena, você pode ignorar uma consequência leve relacionada a dano físico.',
        driveExclusive: 'cavalo',
        cost: 1,
      },
      {
        id: 'espirito-equipe',
        name: 'Espírito de Equipe',
        description: 'Quando defender um aliado, +2 na defesa. Se falhar, você recebe o dano em vez do aliado.',
        driveExclusive: 'cavalo',
        cost: 1,
      },
    ],
  },
  {
    id: 'fui',
    name: 'Fuis',
    icon: '💻',
    summary: 'Lutam com ferramentas. Criam, invadem, consertam e quebram. Tecnologia, gambiarras e criatividade são suas armas.',
    freeManeuver: {
      id: 'estoque-fui',
      name: 'Estoque de Fui',
      description: 'Você sempre tem uma ferramenta ou gadget útil. Uma vez por cena, declare que tem exatamente o que precisa.',
      driveExclusive: 'fui',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'referencia-hacker',
        name: 'Referência Hacker',
        description: '+2 para invadir sistemas, bypassar segurança digital e encontrar informações online.',
        driveExclusive: 'fui',
        cost: 1,
      },
      {
        id: 'pilotagem-sagaz',
        name: 'Pilotagem Sagaz',
        description: '+2 ao dirigir em perseguições ou situações de risco. Você sabe tirar o máximo de qualquer veículo.',
        driveExclusive: 'fui',
        cost: 1,
      },
      {
        id: 'anarquia-ihunt',
        name: 'Anarquia no #iHunt',
        description: 'Você tem reputação na comunidade. +2 em interações sociais com outros caçadores online.',
        driveExclusive: 'fui',
        cost: 1,
      },
    ],
  },
  {
    id: 'os66',
    name: 'Os 66',
    icon: '🤝',
    summary: 'Lutam com comunidade. Organizam pessoas, constroem redes, mobilizam recursos. Juntos somos mais fortes.',
    freeManeuver: {
      id: 'pessoas-conhecem-pessoas',
      name: 'Pessoas Que Conhecem Pessoas',
      description: 'Você sempre conhece alguém. Uma vez por sessão, pode introduzir um PNJ que te deve um favor.',
      driveExclusive: 'os66',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'disfarce-secreto',
        name: 'Disfarce Secreto',
        description: '+2 para se passar por outra pessoa ou se infiltrar em grupos. Você é um camaleão social.',
        driveExclusive: 'os66',
        cost: 1,
      },
      {
        id: 'imunidade-diplomatica',
        name: 'Imunidade Diplomática',
        description: 'Uma vez por sessão, você pode evitar um conflito completamente através de negociação.',
        driveExclusive: 'os66',
        cost: 1,
      },
      {
        id: 'alvo-na-cabeca',
        name: 'Alvo na Cabeça',
        description: 'Quando você marca alguém como alvo, todos os aliados ganham +1 para atacar esse alvo até o fim da cena.',
        driveExclusive: 'os66',
        cost: 1,
      },
    ],
  },
];

export function getDriveById(id: DriveName): Drive | undefined {
  return DRIVES.find(d => d.id === id);
}

export function getAllManeuversForDrive(driveId: DriveName): Maneuver[] {
  const drive = getDriveById(driveId);
  if (!drive) return GENERAL_MANEUVERS;
  
  return [
    drive.freeManeuver,
    ...drive.exclusiveManeuvers,
    ...GENERAL_MANEUVERS,
  ];
}
