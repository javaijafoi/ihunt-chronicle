
export type GiftCategory = 'magia' | 'ritual' | 'sobrenatural' | 'custom';

export interface Gift {
    id: string;
    name: string;
    description: string;
    category: GiftCategory;
    essenceCost?: number;  // Custo em essência (stress para humanos)
    isFromBook: boolean;   // true = do livro, false = customizado
}

export const BOOK_GIFTS: Gift[] = [
    // Dons do livro de monstros que humanos podem acessar via Embruxação
    { id: 'clarividencia', name: 'Clarividência', description: 'Ver eventos distantes ou passados.', category: 'magia', essenceCost: 2, isFromBook: true },
    { id: 'protecao-magica', name: 'Proteção Mágica', description: 'Barreira contra ataques sobrenaturais.', category: 'magia', essenceCost: 1, isFromBook: true },
    { id: 'ritual-banimento', name: 'Ritual de Banimento', description: 'Expulsa entidades sobrenaturais ou desfaz maldições.', category: 'ritual', essenceCost: 3, isFromBook: true },
    { id: 'sentidos-aguçados', name: 'Sentidos Aguçados', description: 'Percepção sobrenatural de cheiros, sons e auras.', category: 'sobrenatural', essenceCost: 1, isFromBook: true },
    { id: 'telecinese-menor', name: 'Telecinese Menor', description: 'Mover pequenos objetos com a mente.', category: 'magia', essenceCost: 1, isFromBook: true },
    { id: 'cura-rapida', name: 'Cura Rápida', description: 'Recuperar uma caixa de stress físico por cena.', category: 'sobrenatural', essenceCost: 2, isFromBook: true },
    { id: 'falar-com-mortos', name: 'Falar com Mortos', description: 'Conversar brevemente com espíritos locais.', category: 'ritual', essenceCost: 2, isFromBook: true },
    { id: 'invisibilidade', name: 'Invisibilidade', description: 'Tornar-se invisível para olhos mortais por um breve período.', category: 'magia', essenceCost: 3, isFromBook: true },
    { id: 'forca-sobrenatural', name: 'Força Sobrenatural', description: 'Realizar feitos de força impossíveis para um humano.', category: 'sobrenatural', essenceCost: 2, isFromBook: true },
    { id: 'protecao-mental', name: 'Proteção Mental', description: 'Imunidade temporária a controle mental ou leitura de pensamentos.', category: 'magia', essenceCost: 1, isFromBook: true }
];
