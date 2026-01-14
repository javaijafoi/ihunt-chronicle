import { Drive, Maneuver, DriveName } from '@/types/game';

// Manobras Gerais - removidas, pois não existem no livro como "gerais"
// O livro menciona que cada personagem pode criar suas próprias manobras
export const GENERAL_MANEUVERS: Maneuver[] = [];

// Dados das Taras - Baseado no livro oficial
export const DRIVES: Drive[] = [
  {
    id: 'malina',
    name: 'Malinas (Os Sabichões)',
    icon: '📚',
    summary: 'Lutam com conhecimento, segredos e o profano. Estudam monstros e usam o conhecimento das sombras contra elas.',
    freeManeuver: {
      id: 'sabe-das-coisas',
      name: 'Sabe das Coisas',
      description: 'Permite "segurar" um aspecto situacional relacionado ao seu conhecimento sobre monstros. Você pode manter um aspecto como esse por quanto tempo quiser, e ele tem uma invocação grátis em qualquer cena em que for relevante. Para usar um novo aspecto, precisa abandonar o outro.',
      driveExclusive: 'malina',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'mestre-pesquisa',
        name: 'Mestre da Pesquisa',
        description: 'Quando você tem uma cena dedicada à pesquisa, você sempre tem a vantagem. Enquanto tiver acesso a um aspecto situacional de pesquisa, pode usar Acadêmico ou Ocultista para ações de defesa.',
        driveExclusive: 'malina',
        cost: 1,
      },
      {
        id: 'pocoes',
        name: 'Poções',
        description: 'Pode fazer "poções" investindo um ponto de destino e ligando a um aspecto. Quem beber ganha aquele aspecto e duas invocações de graça. Se for veneno, o aspecto existe só para chamados.',
        driveExclusive: 'malina',
        cost: 1,
      },
      {
        id: 'embruxacao',
        name: 'Embruxação',
        description: 'Permite escolher dois pontos de dons mágicos. Pague custos de essência com stress mental ou físico, 1 para 1. Cada vez que pegar esta manobra, ganha 2 níveis de dons mágicos.',
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
      description: 'Quando tirar uma boa rolagem de ataque, pode gastar um ponto de destino para "guardar" essa rolagem. Em qualquer momento da mesma sessão, pode "gastar" a rolagem guardada para usá-la como defesa, substituindo o resultado.',
      driveExclusive: 'cavalo',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'consciencia-situacional',
        name: 'Consciência Situacional',
        description: 'Quando um aspecto situacional seu relacionado ao ambiente físico for chamado ou apostado, você ganha um impulso. Aspectos de cenário como arma são invocados como +3 em vez de +2.',
        driveExclusive: 'cavalo',
        cost: 1,
      },
      {
        id: 'machuca-nao-doi',
        name: 'Machuca Mas Não Dói',
        description: 'Quando for atingido por dano físico, pode gastar um ponto de destino para reduzir o golpe em 2 e ganhar um impulso. Cada vez que pegar consequência grave, ganha a vantagem imediatamente.',
        driveExclusive: 'cavalo',
        cost: 1,
      },
      {
        id: 'espirito-equipe',
        name: 'Espírito de Equipe',
        description: 'Quando alguém da equipe gastar um ponto de destino para invocar um aspecto situacional que você criou, ganha uma invocação de graça. Uma vez por sessão, pode gastar pontos de destino para reverter uma ação após a rolagem.',
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
      description: 'Se tiver acesso a ferramentas, uma vez por cena pode eliminar um aspecto situacional sem precisar superá-lo nem nada. Liga um interruptor, aperta um botão, conserta, desde que seja algo que dê para consertar com ferramenta.',
      driveExclusive: 'fui',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'referencia-hacker',
        name: 'Referência Hacker',
        description: 'Com ações ligadas a computadores, você começa com a vantagem. Aspectos criados via sistema conectam a outro personagem com dificuldade igual a sua habilidade Hacker. Se opondo ativamente, +2.',
        driveExclusive: 'fui',
        cost: 1,
      },
      {
        id: 'pilotagem-sagaz',
        name: 'Pilotagem Sagaz',
        description: 'Qualquer aspecto relacionado a veículos ou drones ganha uma invocação adicional grátis. Ação de defesa enquanto pilotando ganha +2.',
        driveExclusive: 'fui',
        cost: 1,
      },
      {
        id: 'anarquia-ihunt',
        name: 'Anarquia no #iHunt',
        description: 'Qualquer superação ou criação de vantagem baseada em destruição ganha +2. Se tiver sucesso, pode fazer um aspecto adicional com uma invocação grátis relacionado a distrações ou confusões.',
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
      description: 'Quando gastar um ponto de destino para declarar um detalhe que seja um personagem que você conhece, essa pessoa é especialista: habilidade 4 ou habilidade 3 + grupo pequeno. Crie aspecto situacional com uma invocação grátis.',
      driveExclusive: 'os66',
      cost: 0,
    },
    exclusiveManeuvers: [
      {
        id: 'disfarce-secreto',
        name: 'Disfarce Secreto',
        description: 'Quando criar vantagem para se misturar a um grupo, escolha uma habilidade relevante - você tem acesso a ela no nível 3 enquanto o aspecto existir. Ou escolha uma manobra daquela habilidade.',
        driveExclusive: 'os66',
        cost: 1,
      },
      {
        id: 'imunidade-diplomatica',
        name: 'Imunidade Diplomática',
        description: 'Se criar vantagem de aceitação de um grupo, o aspecto permanece enquanto relevante e a cada cena você ganha uma invocação grátis. Defesas sociais bem-sucedidas são consideradas com estilo.',
        driveExclusive: 'os66',
        cost: 1,
      },
      {
        id: 'alvo-na-cabeca',
        name: 'Alvo na Cabeça',
        description: 'Lidando com inimigo conhecido com espectadores, você sempre tem um aspecto situacional com invocação e dilema grátis. Se o inimigo ainda não for conhecido, ao criar vantagem ganha invocação extra.',
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
