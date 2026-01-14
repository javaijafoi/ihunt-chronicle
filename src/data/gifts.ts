/**
 * Dons Mágicos - #iHunt
 * Sistema de dons sobrenaturais para personagens
 * 
 * Humanos podem aprender dons gastando 1 retorno por nível.
 * Malinas com a manobra "Embruxação" ganham 2 níveis por 1 retorno.
 * Dons usam stress como custo de essência.
 */

export interface Gift {
  id: string;
  name: string;
  description: string;
  essenceCost: number;
  isFromBook: boolean;
}

export interface CharacterGift {
  giftId: string;       // ID do dom ou 'custom-{uuid}'
  name: string;         // Nome do dom
  description: string;  // Descrição
  level: number;        // Nível atual (1-5)
  isCustom: boolean;    // true = criado pelo usuário
  essenceCost?: number; // Custo de essência (para customs)
}

// Dons do livro - baseados no PDF oficial
export const BOOK_GIFTS: Gift[] = [
  {
    id: 'bencao',
    name: 'Bênção',
    description: 'Cria um aspecto com o nome da frase da bênção (ex: "Você terá sorte no amor"). O aspecto tem invocações grátis equivalentes ao nível do dom. Se permanente, as invocações são por episódio.',
    essenceCost: 3,
    isFromBook: true
  },
  {
    id: 'encantamento',
    name: 'Encantamento',
    description: 'Compra as boas graças de uma pessoa - a famosa "poção do amor". Cria um aspecto "Nas boas graças de..." que pode ser invocado um número de vezes igual ao nível do feitiço. Requer objeto pessoal de ambas as partes.',
    essenceCost: 3,
    isFromBook: true
  },
  {
    id: 'portal',
    name: 'Portal',
    description: 'Designa um local e permite transportar uma pessoa por nível instantaneamente até lá. Se permanente, pode escolher dois locais e transportar pessoas entre eles a cada cena.',
    essenceCost: 5,
    isFromBook: true
  },
  {
    id: 'maldicao',
    name: 'Maldição',
    description: 'Cria um aspecto de azar com invocações ou chamados equivalentes ao nível. Com sucesso, podem ser dilemas. Se permanente, as invocações são por episódio.',
    essenceCost: 4,
    isFromBook: true
  },
  {
    id: 'ressurreicao',
    name: 'Ressurreição',
    description: 'Ressuscita um corpo intacto que tenha morrido recentemente, por uma hora para cada nível do feitiço.',
    essenceCost: 10,
    isFromBook: true
  },
  {
    id: 'visoes-de-sonhos',
    name: 'Visões de Sonhos',
    description: 'Permite ver os sonhos de uma pessoa específica como se estivesse lá. Os níveis podem ser divididos como invocações em vantagens relacionadas à mente da pessoa. Se permanente, permite acesso ilimitado aos sonhos.',
    essenceCost: 2,
    isFromBook: true
  },
  {
    id: 'escudo',
    name: 'Escudo',
    description: 'Protege o alvo de danos físicos ou mentais (escolha ao lançar). Os níveis agem como caixas de stress de 2 pontos cada, que não se restabelecem. Se permanente, restabelecem a cada episódio.',
    essenceCost: 3,
    isFromBook: true
  },
  {
    id: 'manipular-sonhos',
    name: 'Manipular Sonhos',
    description: 'Permite manipular sonhos de alguém para criar vantagem ou atacar mentalmente. Requer Visões de Sonhos ativo. Ações dentro do sonho ganham bônus igual ao nível. Se permanente, pode ser reativado por 1 essência.',
    essenceCost: 2,
    isFromBook: true
  },
  {
    id: 'visao-alem-da-visao',
    name: 'Visão Além da Visão',
    description: 'Permite ver o mundo dos espíritos, dos mortos, ou outro plano da existência. Cada nível permite dar essa habilidade a uma pessoa adicional. Se permanente, 1 essência reativa o feitiço.',
    essenceCost: 2,
    isFromBook: true
  },
  {
    id: 'falar-com-os-mortos',
    name: 'Falar com os Mortos',
    description: 'Permite falar com fantasmas e fazer uma pergunta por nível, recebendo respostas honestas. Perguntas adicionais requerem superar com dificuldade +2 cumulativa. Se permanente, 1 essência reativa.',
    essenceCost: 3,
    isFromBook: true
  },
  {
    id: 'convocar-espirito',
    name: 'Convocar Espírito',
    description: 'Convoca um espírito genérico ou específico com avaliação igual ou menor que o nível. Requer superar com dificuldade = dobro das estrelas do espírito. Se permanente, deve ser ligado a um único espírito.',
    essenceCost: 4,
    isFromBook: true
  },
  {
    id: 'transmutacao',
    name: 'Transmutação',
    description: 'Transmuta algo não-vivo em outra coisa. Nível 1: minerais. Nível 2: ligas metálicas. Nível 3: máquinas simples. Nível 4: máquinas complexas. Nível 5: computadores. Cada virada = ~5kg de massa.',
    essenceCost: 2,
    isFromBook: true
  },
  {
    id: 'protecao',
    name: 'Proteção',
    description: 'Cria uma barreira mágica. Escolha um tipo de criatura ou característica que não pode passar. Para entrar, deve superar dificuldade = 2x nível. Pode gastar invocações para causar 4 de dano.',
    essenceCost: 3,
    isFromBook: true
  },
  {
    id: 'uso-da-forca',
    name: 'Uso da Força',
    description: 'Gera um golpe de força primitiva. Funciona como arma que adiciona dados iguais ao nível, alcance de até 2 zonas. Dois níveis podem ser trocados para criar aspecto contra o alvo.',
    essenceCost: 3,
    isFromBook: true
  }
];

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
