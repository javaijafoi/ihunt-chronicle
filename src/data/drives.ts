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
    name: 'Malinas (Os Sabichões)',
    icon: '📚',
    summary: 'Lutam com conhecimento, segredos e o profano. Estudam monstros e usam o conhecimento das sombras contra elas.',
    freeManeuver: {
      id: 'sabe-das-coisas',
      name: 'Sabe das Coisas',
      description: '“Segura” um aspecto situacional de conhecimento com 1 invocação grátis. Só pode ter um por vez.',
      driveExclusive: 'malina',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'mestre-pesquisa',
        name: 'Mestre da Pesquisa',
        description: 'Vantagem em pesquisa. Pode defender com Acadêmico/Ocultista se tiver aspecto de pesquisa.',
        driveExclusive: 'malina',
        cost: 1,
      },
      {
        id: 'pocoes',
        name: 'Poções',
        description: 'Gaste 1 PD para criar poção. Quem beber ganha Aspecto + 2 invocações (ou penalidades se veneno).',
        driveExclusive: 'malina',
        cost: 1,
      },
      {
        id: 'embruxacao',
        name: 'Embruxação',
        description: 'Acesso a dons mágicos. Pague custos de essência com estresse físico ou mental (1 por 1).',
        driveExclusive: 'malina',
        cost: 1,
      },
    ],
  },
  {
    id: 'cavalo',
    name: 'Cavalos (Os Porradeiros)',
    icon: '👊',
    summary: 'Lutam com força bruta e violência. O corpo é uma ferramenta descartável para resolver problemas na porrada.',
    freeManeuver: {
      id: 'melhor-defesa',
      name: 'A Melhor Defesa',
      description: 'Gaste 1 PD para “guardar” uma boa rolagem de ataque e usá-la como defesa depois.',
      driveExclusive: 'cavalo',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'consciencia-situacional',
        name: 'Consciência Situacional',
        description: 'Ganha impulso ao usar aspecto de ambiente. Aspecto de cenário como arma invoca com +3.',
        driveExclusive: 'cavalo',
        cost: 1,
      },
      {
        id: 'machuca-nao-doi',
        name: 'Machuca Mas Não Dói',
        description: 'Gaste 1 PD para reduzir dano físico em 2 e ganhar impulso. Vantagem em consequência grave.',
        driveExclusive: 'cavalo',
        cost: 1,
      },
      {
        id: 'espirito-equipe',
        name: 'Espírito de Equipe',
        description: 'Invocação grátis se aliado seguir plano. 1x/sessão: gaste PD para refazer ação (rollback).',
        driveExclusive: 'cavalo',
        cost: 1,
      },
    ],
  },
  {
    id: 'fui',
    name: 'Fuis (Os Techs)',
    icon: '💻',
    summary: 'Lutam com tecnologia. Hackers, pilotos e anarquistas que resolvem tretas com gadgets e explosivos.',
    freeManeuver: {
      id: 'protocolo-basico',
      name: 'Protocolo Básico',
      description: 'Elimina automaticamente aspectos situacionais simples se tiver ferramentas apropriadas.',
      driveExclusive: 'fui',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'referencia-hacker',
        name: 'Referência Hacker',
        description: 'Vantagem com computadores. Dificuldade para te impedir = sua perícia Hacker. Se opor, +2.',
        driveExclusive: 'fui',
        cost: 1,
      },
      {
        id: 'pilotagem-sagaz',
        name: 'Pilotagem Sagaz',
        description: 'Aspectos de veículo/drones ganham +1 invocação grátis. +2 na defesa pilotando.',
        driveExclusive: 'fui',
        cost: 1,
      },
      {
        id: 'anarquia-ihunt',
        name: 'Anarquia no #iHunt',
        description: '+2 para destruir/criar vantagem destruindo. Sucesso cria aspecto extra de distração grátis.',
        driveExclusive: 'fui',
        cost: 1,
      },
    ],
  },
  {
    id: 'os66',
    name: 'Os 66 (O Social)',
    icon: '🤝',
    summary: 'Lutam com pessoas. Usam lábia, contatos e a opinião pública contra os monstros.',
    freeManeuver: {
      id: 'pessoas-conhecem-pessoas',
      name: 'Pessoas Que Conhecem Pessoas',
      description: 'Gaste 1 PD para criar NPC especialista (+4 ou +3/grupo) com aspecto e 1 invocação.',
      driveExclusive: 'os66',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'disfarce-secreto',
        name: 'Disfarce Secreto',
        description: 'Aspecto de infiltração dá acesso a perícia relevante no nível +3 ou manobra da perícia.',
        driveExclusive: 'os66',
        cost: 1,
      },
      {
        id: 'imunidade-diplomatica',
        name: 'Imunidade Diplomática',
        description: 'Aspecto de aceitação social ganha 1 invocação/cena. Defesas sociais bem sucedidas têm Estilo.',
        driveExclusive: 'os66',
        cost: 1,
      },
      {
        id: 'alvo-na-cabeca',
        name: 'Alvo na Cabeça',
        description: 'Inimigo público ganha aspecto com invocação + dilema. Se desconhecido, +1 invocação extra.',
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
