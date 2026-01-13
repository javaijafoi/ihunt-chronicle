/**
 * Dons Mágicos - #iHunt
 * Sistema de dons sobrenaturais para personagens
 * 
 * Humanos podem aprender dons gastando 1 retorno por nível.
 * Malinas com a manobra "Embruxação" ganham 2 níveis por 1 retorno.
 * Dons usam stress como custo de essência.
 */

export type GiftCategory = 'protecao' | 'percepcao' | 'manipulacao' | 'destruicao' | 'cura' | 'custom';

export interface Gift {
  id: string;
  name: string;
  description: string;
  category: GiftCategory;
  levels: GiftLevel[];
  isFromBook: boolean;
}

export interface GiftLevel {
  level: number;
  effect: string;
  essenceCost: number;
}

export interface CharacterGift {
  giftId: string;       // ID do dom ou 'custom-{uuid}'
  name: string;         // Nome do dom
  description: string;  // Descrição
  level: number;        // Nível atual (1-5)
  isCustom: boolean;    // true = criado pelo usuário
  essenceCost?: number; // Custo de essência (para customs)
}

// Dons do livro disponíveis para personagens humanos (via Embruxação ou compra direta)
export const BOOK_GIFTS: Gift[] = [
  {
    id: 'protecao-magica',
    name: 'Proteção Mágica',
    description: 'Cria barreiras e escudos contra ataques sobrenaturais.',
    category: 'protecao',
    isFromBook: true,
    levels: [
      { level: 1, effect: 'Pode se defender contra um ataque sobrenatural por cena.', essenceCost: 1 },
      { level: 2, effect: 'Pode proteger um aliado adjacente também.', essenceCost: 2 },
      { level: 3, effect: 'A proteção dura uma cena inteira.', essenceCost: 3 },
      { level: 4, effect: 'Pode proteger todos os aliados na zona.', essenceCost: 4 },
      { level: 5, effect: 'A proteção reflete ataques de volta ao atacante.', essenceCost: 5 }
    ]
  },
  {
    id: 'clarividencia',
    name: 'Clarividência',
    description: 'Ver eventos distantes, passados ou escondidos.',
    category: 'percepcao',
    isFromBook: true,
    levels: [
      { level: 1, effect: 'Pode ver através de paredes e obstáculos próximos.', essenceCost: 1 },
      { level: 2, effect: 'Pode ver eventos que aconteceram nas últimas 24 horas no local.', essenceCost: 2 },
      { level: 3, effect: 'Pode ver lugares distantes que você conhece.', essenceCost: 3 },
      { level: 4, effect: 'Pode ver eventos de até uma semana atrás.', essenceCost: 4 },
      { level: 5, effect: 'Pode ver o passado distante ou lugares que nunca visitou.', essenceCost: 5 }
    ]
  },
  {
    id: 'maldicao',
    name: 'Maldição',
    description: 'Causar azar e desgraça aos inimigos.',
    category: 'manipulacao',
    isFromBook: true,
    levels: [
      { level: 1, effect: 'O alvo sofre -1 em sua próxima rolagem.', essenceCost: 1 },
      { level: 2, effect: 'O alvo sofre -2 em todas as rolagens por um turno.', essenceCost: 2 },
      { level: 3, effect: 'Cria um aspecto de maldição no alvo com uma invocação grátis.', essenceCost: 3 },
      { level: 4, effect: 'A maldição persiste por uma cena inteira.', essenceCost: 4 },
      { level: 5, effect: 'A maldição é permanente até ser removida magicamente.', essenceCost: 5 }
    ]
  },
  {
    id: 'projecao-astral',
    name: 'Projeção Astral',
    description: 'Separar o espírito do corpo para explorar.',
    category: 'percepcao',
    isFromBook: true,
    levels: [
      { level: 1, effect: 'Pode enviar seu espírito a uma zona adjacente.', essenceCost: 1 },
      { level: 2, effect: 'Pode atravessar paredes no plano astral.', essenceCost: 2 },
      { level: 3, effect: 'Pode viajar até 1km do seu corpo.', essenceCost: 3 },
      { level: 4, effect: 'Pode interagir levemente com o mundo físico.', essenceCost: 4 },
      { level: 5, effect: 'Pode possuir temporariamente corpos desocupados.', essenceCost: 5 }
    ]
  },
  {
    id: 'ritual-banimento',
    name: 'Ritual de Banimento',
    description: 'Expulsar entidades sobrenaturais de um local ou pessoa.',
    category: 'protecao',
    isFromBook: true,
    levels: [
      { level: 1, effect: 'Pode criar uma zona de exclusão temporária (1 turno).', essenceCost: 1 },
      { level: 2, effect: 'Pode forçar uma entidade a se afastar por uma cena.', essenceCost: 2 },
      { level: 3, effect: 'Pode banir uma entidade do local por 24 horas.', essenceCost: 3 },
      { level: 4, effect: 'Pode exorcizar possessões.', essenceCost: 4 },
      { level: 5, effect: 'Pode banir permanentemente entidades menores.', essenceCost: 5 }
    ]
  },
  {
    id: 'cura-magica',
    name: 'Cura Mágica',
    description: 'Curar ferimentos e doenças através de magia.',
    category: 'cura',
    isFromBook: true,
    levels: [
      { level: 1, effect: 'Pode remover 1 ponto de stress físico.', essenceCost: 1 },
      { level: 2, effect: 'Pode remover 2 pontos de stress físico.', essenceCost: 2 },
      { level: 3, effect: 'Pode começar a cura de uma consequência leve imediatamente.', essenceCost: 3 },
      { level: 4, effect: 'Pode reduzir uma consequência moderada para leve.', essenceCost: 4 },
      { level: 5, effect: 'Pode curar uma consequência severa para moderada.', essenceCost: 5 }
    ]
  },
  {
    id: 'ilusao',
    name: 'Ilusão',
    description: 'Criar imagens e sons falsos para enganar os sentidos.',
    category: 'manipulacao',
    isFromBook: true,
    levels: [
      { level: 1, effect: 'Pode criar pequenos sons ou luzes.', essenceCost: 1 },
      { level: 2, effect: 'Pode criar uma ilusão visual do tamanho de uma pessoa.', essenceCost: 2 },
      { level: 3, effect: 'A ilusão inclui som e movimento.', essenceCost: 3 },
      { level: 4, effect: 'Pode criar ilusões complexas que cobrem uma zona.', essenceCost: 4 },
      { level: 5, effect: 'As ilusões podem causar dano psíquico se acreditadas.', essenceCost: 5 }
    ]
  },
  {
    id: 'telecinese',
    name: 'Telecinese',
    description: 'Mover objetos com a mente.',
    category: 'manipulacao',
    isFromBook: true,
    levels: [
      { level: 1, effect: 'Pode mover objetos pequenos (até 1kg) lentamente.', essenceCost: 1 },
      { level: 2, effect: 'Pode mover objetos médios (até 10kg).', essenceCost: 2 },
      { level: 3, effect: 'Pode arremessar objetos como ataque (+2 de dano).', essenceCost: 3 },
      { level: 4, effect: 'Pode mover objetos grandes (até 100kg) ou múltiplos objetos.', essenceCost: 4 },
      { level: 5, effect: 'Pode voar levitando a si mesmo.', essenceCost: 5 }
    ]
  },
  {
    id: 'fogo-magico',
    name: 'Fogo Mágico',
    description: 'Conjurar e controlar chamas sobrenaturais.',
    category: 'destruicao',
    isFromBook: true,
    levels: [
      { level: 1, effect: 'Pode criar uma pequena chama (como um isqueiro).', essenceCost: 1 },
      { level: 2, effect: 'Pode lançar uma bola de fogo (+2 de ataque).', essenceCost: 2 },
      { level: 3, effect: 'Pode controlar fogo existente em uma zona.', essenceCost: 3 },
      { level: 4, effect: 'Pode criar uma parede de fogo.', essenceCost: 4 },
      { level: 5, effect: 'Pode conjurar uma explosão que afeta toda a zona.', essenceCost: 5 }
    ]
  },
  {
    id: 'dominacao-mental',
    name: 'Dominação Mental',
    description: 'Influenciar e controlar mentes fracas.',
    category: 'manipulacao',
    isFromBook: true,
    levels: [
      { level: 1, effect: 'Pode plantar uma sugestão sutil.', essenceCost: 1 },
      { level: 2, effect: 'Pode causar medo ou atração no alvo.', essenceCost: 2 },
      { level: 3, effect: 'Pode dar uma ordem simples que deve ser obedecida.', essenceCost: 3 },
      { level: 4, effect: 'Pode apagar memórias recentes (últimas horas).', essenceCost: 4 },
      { level: 5, effect: 'Pode controlar completamente o alvo por uma cena.', essenceCost: 5 }
    ]
  }
];

// Categorias para organização visual
export const GIFT_CATEGORIES: Record<GiftCategory, { name: string; icon: string; color: string }> = {
  'protecao': { name: 'Proteção', icon: '🛡️', color: 'blue' },
  'percepcao': { name: 'Percepção', icon: '👁️', color: 'purple' },
  'manipulacao': { name: 'Manipulação', icon: '✨', color: 'pink' },
  'destruicao': { name: 'Destruição', icon: '🔥', color: 'red' },
  'cura': { name: 'Cura', icon: '💚', color: 'green' },
  'custom': { name: 'Personalizado', icon: '⚡', color: 'yellow' }
};

// Helper para encontrar dom por ID
export function findGift(id: string): Gift | undefined {
  return BOOK_GIFTS.find(g => g.id === id);
}

// Helper para calcular custo total de dons
export function calculateGiftsCost(gifts: CharacterGift[], hasEmbruxacao: boolean): number {
  return gifts.reduce((total, gift) => {
    // Malinas com Embruxação pagam 1 retorno por 2 níveis
    // Humanos normais pagam 1 retorno por 1 nível
    const levelCost = hasEmbruxacao ? Math.ceil(gift.level / 2) : gift.level;
    return total + levelCost;
  }, 0);
}
