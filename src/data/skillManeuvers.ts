/**
 * Manobras de Habilidade - #iHunt
 * Manobras específicas para cada habilidade do jogo
 * Baseado no livro oficial
 */

export interface SkillManeuver {
  id: string;
  name: string;
  description: string;
  skillId: string;
  cost: number;
}

export const SKILL_MANEUVERS: Record<string, SkillManeuver[]> = {
  'Acadêmico': [
    {
      id: 'conhecimento-inutil',
      name: 'Conhecimento Inútil',
      description: 'Você sabe um pouquinho sobre muitas coisas. Desde que consiga justificar com um factoide bizarramente relevante, pode gastar um ponto de destino para usar Acadêmico no lugar de qualquer outra habilidade.',
      skillId: 'Acadêmico',
      cost: 1
    },
    {
      id: 'raciocinio-frio',
      name: 'Raciocínio Frio',
      description: 'Você entende como o mundo funciona e consegue usar a lógica frente a uma influência sobrenatural. Pode usar Acadêmico para se Defender contra influências mentais sobrenaturais.',
      skillId: 'Acadêmico',
      cost: 1
    },
    {
      id: 'disciplina-especifica',
      name: 'Disciplina Específica',
      description: 'Escolha uma aplicação restrita para Acadêmico, como Ciência, História, Matemática ou Arte. Sempre que usar Acadêmico dentro dessa disciplina, você ganha +2.',
      skillId: 'Acadêmico',
      cost: 1
    }
  ],
  'Assassino': [
    {
      id: 'tiro-incapacitante',
      name: 'Tiro Incapacitante',
      description: 'Às vezes só um tiro não é suficiente, você precisa tirar um membro, um olho, um tentáculo. Gaste um ponto de destino quando tiver sucesso em um ataque para aplicar um aspecto situacional ao alvo além dos efeitos normais.',
      skillId: 'Assassino',
      cost: 1
    },
    {
      id: 'tiro-para-matar',
      name: 'Tiro para Matar',
      description: 'Contra um alvo completamente indefeso ou desatento, adicione +2 às suas ações de ataque de Assassino.',
      skillId: 'Assassino',
      cost: 1
    },
    {
      id: 'choque-e-pavor',
      name: 'Choque e Pavor',
      description: 'Você tem uma invocação grátis adicional para qualquer consequência causada com a sua habilidade Assassino, desde que você a use para aterrorizar, intimidar ou distrair.',
      skillId: 'Assassino',
      cost: 1
    }
  ],
  'Atleta': [
    {
      id: 'segue-o-fluxo',
      name: 'Segue o Fluxo',
      description: 'Você é um mestre de parkour. Depois da primeira ação de Atleta baseada em parkour ou movimento na cena, todas as outras ganham +2.',
      skillId: 'Atleta',
      cost: 1
    },
    {
      id: 'cara-muito-liso',
      name: 'O Cara É Muito Liso',
      description: 'Ninguém consegue encostar em você se você não quiser. Sempre que usar Atleta para desviar de um ataque, adicione +2.',
      skillId: 'Atleta',
      cost: 1
    },
    {
      id: 'vence-pelo-cansaco',
      name: 'Vence Pelo Cansaço',
      description: 'Depois que você começa, você não para mais. Sempre que ganhar de outro personagem em uma perseguição, você dá a essa pessoa a condição situacional de EXAUSTA.',
      skillId: 'Atleta',
      cost: 1
    },
    {
      id: 'sem-paredes-sem-mestres',
      name: 'Sem Paredes, Sem Mestres',
      description: 'Você pode se mover livremente por uma zona adicional por conflito. Qualquer rolagem para superar obstáculos entre zonas físicas ganha +2.',
      skillId: 'Atleta',
      cost: 1
    }
  ],
  'Lutador': [
    {
      id: 'ma-reputacao',
      name: 'Má Reputação',
      description: 'Você só traz problemas, e todo mundo sabe disso. Ao gastar um ponto de destino, você pode substituir qualquer habilidade por Lutador, desde que esteja usando sua reputação como alguém que sabe meter porrada.',
      skillId: 'Lutador',
      cost: 1
    },
    {
      id: 'finta',
      name: 'Finta',
      description: 'Você dá um drible nos seus oponentes antes de dar o golpe final. Quando criar uma vantagem dando um ataque em falso para deixar seu oponente desprotegido, ganhe uma invocação grátis adicional.',
      skillId: 'Lutador',
      cost: 1
    },
    {
      id: 'venca-a-dor',
      name: 'Vença a Dor',
      description: 'Uma vez por capítulo você pode gastar um ponto de destino para reduzir uma consequência moderada para uma leve, se tiver espaço, ou simplesmente apagar uma consequência leve.',
      skillId: 'Lutador',
      cost: 1
    }
  ],
  'Trambiqueiro': [
    {
      id: 'jogo-da-confianca',
      name: 'O Jogo da Confiança',
      description: 'Em aspectos que você criou com Trambiqueiro, você pode usar invocações grátis para chamar esses aspectos sem gastar pontos de destino, além de invocá-los normalmente.',
      skillId: 'Trambiqueiro',
      cost: 1
    },
    {
      id: 'calunia-difamacao',
      name: 'Calúnia e Difamação',
      description: 'Você pode usar Trambiqueiro para atacar personagens mentalmente, agredindo suas reputações e imagens públicas. Isso entra no lugar da ação de ataque de Influencer.',
      skillId: 'Trambiqueiro',
      cost: 1
    },
    {
      id: 'identidade-secreta-perfeita',
      name: 'Identidade Secreta Perfeita',
      description: 'Você criou e aperfeiçoou uma identidade alternativa específica, e treinou como interpretá-la perfeitamente. Quando estiver usando essa identidade, todas as suas ações de Trambiqueiro são nível +2.',
      skillId: 'Trambiqueiro',
      cost: 1
    }
  ],
  'Guerrilheiro': [
    {
      id: 'taticas-pequenas-unidades',
      name: 'Táticas de Pequenas Unidades',
      description: 'Uma vez por cena, quando criar uma vantagem refletindo táticas de equipe, adicione uma invocação grátis extra. Dois personagens diferentes precisam usar essas invocações.',
      skillId: 'Guerrilheiro',
      cost: 1
    },
    {
      id: 'violencia-desmedida',
      name: 'Violência Desmedida',
      description: 'Sempre que apostar um personagem com um aspecto de Guerrilheiro, aumente o dano causado pela escolha em +2.',
      skillId: 'Guerrilheiro',
      cost: 1
    },
    {
      id: 'sacrificio-pela-equipe',
      name: 'Faça Esse Sacrifício Pela Equipe',
      description: 'Sempre que um colega próximo estiver sofrendo stress, você pode gastar um ponto de destino para pegar para você qualquer quantidade desse stress. Você precisa explicar como seu plano diminuiu o dano.',
      skillId: 'Guerrilheiro',
      cost: 1
    },
    {
      id: 'movimento-de-equipe',
      name: 'Movimento de Equipe',
      description: 'Quando usar uma ação de superar para se mover através de zonas múltiplas ou obstruídas, sua equipe inteira pode fazer o mesmo sem rolar e sem usarem suas ações.',
      skillId: 'Guerrilheiro',
      cost: 1
    }
  ],
  'Hacker': [
    {
      id: 'anonimidade',
      name: 'Anonimidade',
      description: 'Você pode usar Hacker para se defender contra ataques eletrônicos ou baseados na sua identidade, e em ações de criar vantagem. Adicione +2 à oposição ativa ou passiva nesses ataques contra você.',
      skillId: 'Hacker',
      cost: 1
    },
    {
      id: 'tem-um-aplicativo',
      name: 'Tem um Aplicativo Para Isso',
      description: 'Desde que consiga justificar digitalmente, você pode gastar um ponto de destino para usar Hacker no lugar de outra habilidade.',
      skillId: 'Hacker',
      cost: 1
    },
    {
      id: 'forca-bruta',
      name: 'Força Bruta',
      description: 'Quando tiver falhado ao tentar invadir um sistema com Hacker, seja digital ou social, a sua próxima tentativa tem +2.',
      skillId: 'Hacker',
      cost: 1
    },
    {
      id: 'porta-dos-fundos',
      name: 'Porta dos Fundos',
      description: 'Quando estiver explorando zonas no espaço digital, você não precisa rolar para se mover uma zona extra por interação, e rolagens para se mover por zonas obstruídas ganham +2.',
      skillId: 'Hacker',
      cost: 1
    }
  ],
  'Influencer': [
    {
      id: 'vestida-para-sucesso',
      name: 'Vestida(o) para o Sucesso',
      description: 'Quando criar uma vantagem baseada em montar seu look ou sua apresentação pública antes de um evento, você ganha uma invocação grátis adicional para esse aspecto.',
      skillId: 'Influencer',
      cost: 1
    },
    {
      id: 'participe-da-minha-live',
      name: 'Participe da Minha Live',
      description: 'Se você permitir, outros jogadores podem usar a sua habilidade de Influencer em vez de suas próprias. Mas se eles falharem, você também sofre as consequências.',
      skillId: 'Influencer',
      cost: 1
    },
    {
      id: 'meia-volta',
      name: 'Meia-Volta',
      description: 'Uma vez por sessão, quando enfrentar um chamado de um dos seus aspectos, você pode escolher mudar seu aspecto. Se fizer isso, invalida o chamado e quaisquer pontos de destino são devolvidos. O aspecto nunca mais voltará ao que era.',
      skillId: 'Influencer',
      cost: 1
    }
  ],
  'Investigador': [
    {
      id: 'percepcao-de-entropia',
      name: 'Percepção de Entropia',
      description: 'Você é muito bom em encontrar pontos fracos. Quando cria uma vantagem ao indicar um ponto fraco, você ganha uma invocação grátis que só pode ser usada em ações de ataque.',
      skillId: 'Investigador',
      cost: 1
    },
    {
      id: 'desmascarando',
      name: 'Desmascarando',
      description: 'Você consegue perceber o que é besteira rapidinho. Qualquer ação de Investigador para desmascarar (ou confirmar) uma fraude ou teoria da conspiração ganha +2.',
      skillId: 'Investigador',
      cost: 1
    },
    {
      id: 'elementar',
      name: 'Elementar',
      description: 'Você é muito bom em anunciar detalhes aparentemente nada a ver que vão se tornar realidade. Ao gastar um ponto de destino para declarar um detalhe, também pode criar um aspecto com invocação grátis que só pode ser usado em ações de Investigador.',
      skillId: 'Investigador',
      cost: 1
    }
  ],
  'Criador': [
    {
      id: 'plano-reserva',
      name: 'Plano Reserva',
      description: 'Você sempre tem um plano alternativo. Quando criar uma vantagem com Criador, você pode criar dois aspectos, mas só tem uma invocação grátis para usar entre eles.',
      skillId: 'Criador',
      cost: 1
    },
    {
      id: 'manufatura-de-qualidade',
      name: 'Manufatura de Qualidade',
      description: 'Você tem orgulho do seu trabalho e qualquer objeto que você tenha criado é mais difícil de destruir. Ele ganha +2 de defesa ou oposição passiva contra qualquer tentativa de desmontá-lo ou destruí-lo.',
      skillId: 'Criador',
      cost: 1
    },
    {
      id: 'tendencias-de-design',
      name: 'Tendências de Design',
      description: 'Quando estiver lidando com tendências conhecidas de tecnologia e design, você pode usar sua habilidade Criador no lugar de qualquer outra habilidade.',
      skillId: 'Criador',
      cost: 1
    },
    {
      id: 'drone-utilitario',
      name: 'Drone Utilitário',
      description: 'Quando criar um drone para propósitos utilitários, você pode gastar um ponto de destino para dar a ele uma habilidade de nível igual à sua habilidade Criador.',
      skillId: 'Criador',
      cost: 1
    }
  ],
  'Médico': [
    {
      id: 'primeiros-socorros',
      name: 'Primeiros Socorros',
      description: 'Qualquer rolagem de Médico para intervir e diagnosticar ou impedir que um problema médico piore ganha +2.',
      skillId: 'Médico',
      cost: 1
    },
    {
      id: 'melhorar-o-desempenho',
      name: 'Melhorar o Desempenho',
      description: 'Se você adaptar a dosagem de uma droga especialmente para um indivíduo e criar uma vantagem, ele ganha uma invocação grátis adicional.',
      skillId: 'Médico',
      cost: 1
    },
    {
      id: 'primeiro-cause-dano',
      name: 'Primeiro, Cause Dano',
      description: 'Se você não tiver medo de jogar a ética fora, você pode usar a sua habilidade Médico no lugar de Assassino quando estiver tentando causar dano a alguém.',
      skillId: 'Médico',
      cost: 1
    },
    {
      id: 'medico-de-combate',
      name: 'Médico de Combate',
      description: 'Uma vez por sessão, você pode tratar feridas rapidamente. Gaste um ponto de destino para reduzir uma consequência moderada de dano físico para leve, se houver espaço, ou remover uma consequência leve.',
      skillId: 'Médico',
      cost: 1
    },
    {
      id: 'deixa-comigo',
      name: 'Deixa Comigo',
      description: 'Você pode ignorar a penalidade normal de dificuldade +2 ao tratar suas próprias consequências.',
      skillId: 'Médico',
      cost: 1
    }
  ],
  'Ocultista': [
    {
      id: 'amuletos-de-defesa',
      name: 'Amuletos de Defesa',
      description: 'Se você sabe contra o que está lutando e tem pelo menos dez minutos para se preparar antes de um encontro, você pode se defender contra habilidades sobrenaturais com Ocultista.',
      skillId: 'Ocultista',
      cost: 1
    },
    {
      id: 'especializacao-ocultista',
      name: 'Especialização',
      description: 'Escolha um tipo de monstro ou tradição de magia. Você ganha +2 em todas as rolagens de Ocultista relacionadas à sua especialidade.',
      skillId: 'Ocultista',
      cost: 1
    },
    {
      id: 'cacador-de-conhecimento',
      name: 'Caçador de Conhecimento',
      description: 'Seu conhecimento sobre tradições sobrenaturais é profundo. Uma vez por sessão, quando criar uma vantagem com base em um factoide sobre o sobrenatural, você ganha uma invocação grátis adicional.',
      skillId: 'Ocultista',
      cost: 1
    }
  ],
  'Organizador': [
    {
      id: 'discurso-impressionante',
      name: 'Discurso Impressionante',
      description: 'Uma vez por sessão, antes de um grande confronto, se você der um discurso motivacional, o aspecto que criar ganha uma invocação grátis adicional.',
      skillId: 'Organizador',
      cost: 1
    },
    {
      id: 'tamo-junto',
      name: 'Tamo Junto',
      description: 'Se um membro da equipe estiver sofrendo stress mental, ele pode usar sua habilidade de Organizador em vez da original, ou ganhar +2. Se falhar, você ganha o mesmo stress.',
      skillId: 'Organizador',
      cost: 1
    },
    {
      id: 'fardo-dividido',
      name: 'Fardo Dividido',
      description: 'Uma vez por sessão, quando um membro da equipe ganha stress, você pode mover 2 pontos para outro membro que concorde.',
      skillId: 'Organizador',
      cost: 1
    }
  ],
  'Profissional': [
    {
      id: 'especialidade-interdisciplinar',
      name: 'Especialidade Interdisciplinar',
      description: 'Escolha uma área secundária relacionada à sua área de trabalho. Você pode usar as duas áreas com Profissional.',
      skillId: 'Profissional',
      cost: 1
    },
    {
      id: 'especializacao-profissional',
      name: 'Especialização',
      description: 'Escolha uma especialidade mais restrita dentro da sua área. Ganhe +2 quando essa especialidade for utilizada.',
      skillId: 'Profissional',
      cost: 1
    },
    {
      id: 'amigos-do-trabalho',
      name: 'Amigos do Trabalho',
      description: 'Quando gastar um ponto de destino para adicionar um detalhe à história, pode criar um personagem ligado à sua história de trabalho que te deve algo.',
      skillId: 'Profissional',
      cost: 1
    }
  ],
  'Socialite': [
    {
      id: 'blase',
      name: 'Blasé',
      description: 'Você é imperturbável. Pode usar Socialite para se Defender contra esforços para perturbar ou influenciar seu comportamento, sobrenaturais ou não. Se já usava Socialite, ganhe +2.',
      skillId: 'Socialite',
      cost: 1
    },
    {
      id: 'queridinho-de-todos',
      name: 'O(A) Queridinho(a) de Todos',
      description: 'Você é universalmente adorado. A primeira vez que alguém tentar atacar sua reputação, essa pessoa ganha 2 de stress independente do resultado.',
      skillId: 'Socialite',
      cost: 1
    },
    {
      id: 'camaleao-social',
      name: 'Camaleão Social',
      description: 'Em meia hora você consegue disfarçar uma equipe para se encaixar onde não pertence. Eles usam suas habilidades de Socialite para Trambiqueiro, e você ganha +2 enquanto disfarçado.',
      skillId: 'Socialite',
      cost: 1
    }
  ],
  'Assistente Social': [
    {
      id: 'agenda-telefonica',
      name: 'Agenda Telefônica',
      description: 'Quando gastar um ponto de destino para adicionar um detalhe à história, pode criar um personagem que você ajudou no passado e que deve seu sucesso a você.',
      skillId: 'Assistente Social',
      cost: 1
    },
    {
      id: 'palavras-certas',
      name: 'As Palavras Certas',
      description: 'Uma vez por sessão, depois de conversar com alguém por uma hora, pode gastar um ponto de destino para reduzir uma consequência moderada mental para leve.',
      skillId: 'Assistente Social',
      cost: 1
    },
    {
      id: 'apelar-para-empatia',
      name: 'Apelar para a Empatia',
      description: 'Ao apelar para o lado bom de alguém (se possível), pode se defender de seus ataques com Assistente Social.',
      skillId: 'Assistente Social',
      cost: 1
    }
  ],
  'Espião': [
    {
      id: 'fuga-impressionante',
      name: 'Fuga Impressionante',
      description: 'Quando usar Espião para criar uma distração para fuga, ela também pode funcionar como ação de ataque.',
      skillId: 'Espião',
      cost: 1
    },
    {
      id: 'local-seguro',
      name: 'Local Seguro',
      description: 'Quando gastar um ponto de destino para estabelecer um esconderijo, pode usar Espião para se defender de qualquer ataque dentro desse local. Se já usaria Espião, ganhe +2.',
      skillId: 'Espião',
      cost: 1
    },
    {
      id: 'inspecionar-ambiente',
      name: 'Inspecionar o Ambiente',
      description: 'Uma vez por sessão, quando criar uma vantagem de mobilidade e fuga, pode criar dois aspectos com uma invocação grátis entre eles.',
      skillId: 'Espião',
      cost: 1
    }
  ],
  'Sobrevivente': [
    {
      id: 'deixa-pra-la',
      name: 'Deixa Pra Lá',
      description: 'Uma vez por sessão, pode gastar um ponto de destino para reduzir uma consequência mental para leve, ou remover uma consequência leve.',
      skillId: 'Sobrevivente',
      cost: 1
    },
    {
      id: 'ignore-a-dor',
      name: 'Ignore a Dor',
      description: 'Você consegue ignorar as coisas que te machucam. Pode usar Sobrevivente para se defender contra stress físico, além de mental.',
      skillId: 'Sobrevivente',
      cost: 1
    },
    {
      id: 'insensivel',
      name: 'Insensível',
      description: 'Contra habilidades de monstros que influenciam mente e emoções, pode se defender com Sobrevivente, ou ganha +2 se já podia usar.',
      skillId: 'Sobrevivente',
      cost: 1
    }
  ]
};

// Helper para obter todas as manobras como array flat
export function getAllSkillManeuvers(): SkillManeuver[] {
  return Object.values(SKILL_MANEUVERS).flat();
}

// Helper para obter manobras por skill
export function getManeuversBySkill(skillId: string): SkillManeuver[] {
  return SKILL_MANEUVERS[skillId] || [];
}

// Helper para encontrar uma manobra por ID
export function findSkillManeuver(id: string): SkillManeuver | undefined {
  return getAllSkillManeuvers().find(m => m.id === id);
}
