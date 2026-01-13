/**
 * Manobras de Habilidade - #iHunt
 * Manobras específicas para cada habilidade do jogo
 */

export interface SkillManeuver {
  id: string;
  name: string;
  description: string;
  skillId: string;
}

export const SKILL_MANEUVERS: Record<string, SkillManeuver[]> = {
  'Acadêmico': [
    {
      id: 'conhecimento-inutil',
      name: 'Conhecimento Inútil',
      description: 'Você sabe um pouquinho sobre muitas coisas. Desde que consiga justificar com um factoide bizarramente relevante, pode gastar um ponto de destino para usar Acadêmico no lugar de qualquer outra habilidade.',
      skillId: 'Acadêmico'
    },
    {
      id: 'raciocinio-frio',
      name: 'Raciocínio Frio',
      description: 'Você entende como o mundo funciona e consegue usar a lógica frente a uma influência sobrenatural. Pode usar Acadêmico para se Defender contra influências mentais sobrenaturais.',
      skillId: 'Acadêmico'
    },
    {
      id: 'disciplina-especifica',
      name: 'Disciplina Específica',
      description: 'Escolha uma aplicação restrita para Acadêmico, como Ciência, História, Matemática ou Arte. Sempre que usar Acadêmico dentro dessa disciplina, você ganha +2.',
      skillId: 'Acadêmico'
    }
  ],
  'Assassino': [
    {
      id: 'facada-traicoeira',
      name: 'Facada Traiçoeira',
      description: 'Quando atacar com Assassino usando uma arma pequena ou de ocultação fácil, como uma faca ou estilete, você ganha +2.',
      skillId: 'Assassino'
    },
    {
      id: 'sniper-porra',
      name: 'Sniper, Porra',
      description: 'Você ganha +2 em cada rolagem de Assassino em que estiver usando seu rifle de atirador.',
      skillId: 'Assassino'
    },
    {
      id: 'ataque-certeiro',
      name: 'Ataque Certeiro',
      description: 'Uma vez por conflito, quando acertar um ataque com Assassino, você pode gastar um ponto de destino para dobrar o dano causado.',
      skillId: 'Assassino'
    }
  ],
  'Atleta': [
    {
      id: 'segue-o-fluxo',
      name: 'Segue o Fluxo',
      description: 'Depois da primeira ação de parkour bem-sucedida na cena, todas as outras ações de parkour ganham +2.',
      skillId: 'Atleta'
    },
    {
      id: 'cara-muito-liso',
      name: 'O Cara É Muito Liso',
      description: 'Sempre que usar Atleta para desviar de um ataque, você ganha +2.',
      skillId: 'Atleta'
    },
    {
      id: 'vence-pelo-cansaco',
      name: 'Vence Pelo Cansaço',
      description: 'Ao vencer uma perseguição usando Atleta, o oponente ganha a condição EXAUSTO.',
      skillId: 'Atleta'
    },
    {
      id: 'sem-paredes-sem-mestres',
      name: 'Sem Paredes, Sem Mestres',
      description: 'Mova-se por uma zona adicional por conflito. +2 para superar obstáculos entre zonas.',
      skillId: 'Atleta'
    }
  ],
  'Lutador': [
    {
      id: 'artes-marciais',
      name: 'Artes Marciais',
      description: 'Escolha um estilo de luta específico. Quando lutar usando esse estilo, você ganha +2 em rolagens de ataque.',
      skillId: 'Lutador'
    },
    {
      id: 'duro-de-derrubar',
      name: 'Duro de Derrubar',
      description: 'Uma vez por conflito, você pode absorver 2 pontos de stress físico adicional quando atingido.',
      skillId: 'Lutador'
    },
    {
      id: 'golpe-devastador',
      name: 'Golpe Devastador',
      description: 'Quando conseguir um sucesso com estilo em um ataque com Lutador, você pode renunciar ao impulso para causar +2 de dano.',
      skillId: 'Lutador'
    },
    {
      id: 'lutador-de-rua',
      name: 'Lutador de Rua',
      description: 'Você aprendeu a lutar nas ruas. Pode usar objetos do ambiente como armas improvisadas sem penalidade.',
      skillId: 'Lutador'
    }
  ],
  'Trambiqueiro': [
    {
      id: 'jogo-da-confianca',
      name: 'O Jogo da Confiança',
      description: 'Em aspectos que você criou com Trambiqueiro, você pode usar invocações grátis para chamar esses aspectos sem gastar pontos de destino, além de invocá-los normalmente.',
      skillId: 'Trambiqueiro'
    },
    {
      id: 'calunia-difamacao',
      name: 'Calúnia e Difamação',
      description: 'Você pode usar Trambiqueiro para atacar personagens mentalmente, agredindo suas reputações e imagens públicas.',
      skillId: 'Trambiqueiro'
    },
    {
      id: 'identidade-secreta-perfeita',
      name: 'Identidade Secreta Perfeita',
      description: 'Você criou e aperfeiçoou uma identidade alternativa específica. Quando estiver usando essa identidade, todas as suas ações de Trambiqueiro são nível +2.',
      skillId: 'Trambiqueiro'
    }
  ],
  'Guerrilheiro': [
    {
      id: 'taticas-pequenas-unidades',
      name: 'Táticas de Pequenas Unidades',
      description: 'Uma vez por cena, quando criar uma vantagem refletindo táticas de equipe, adicione uma invocação grátis extra. Dois personagens diferentes precisam usar essas invocações.',
      skillId: 'Guerrilheiro'
    },
    {
      id: 'violencia-desmedida',
      name: 'Violência Desmedida',
      description: 'Sempre que apostar um personagem com um aspecto de Guerrilheiro, aumente o dano causado pela escolha em +2.',
      skillId: 'Guerrilheiro'
    },
    {
      id: 'sacrificio-pela-equipe',
      name: 'Faça Esse Sacrifício Pela Equipe',
      description: 'Sempre que um colega próximo estiver sofrendo stress, você pode gastar um ponto de destino para pegar para você qualquer quantidade desse stress.',
      skillId: 'Guerrilheiro'
    },
    {
      id: 'movimento-de-equipe',
      name: 'Movimento de Equipe',
      description: 'Quando usar uma ação de superar para se mover através de zonas múltiplas ou obstruídas, sua equipe inteira pode fazer o mesmo sem rolar.',
      skillId: 'Guerrilheiro'
    }
  ],
  'Hacker': [
    {
      id: 'anonimidade',
      name: 'Anonimidade',
      description: 'Você pode usar Hacker para se defender contra ataques eletrônicos ou baseados na sua identidade. Adicione +2 à oposição em qualquer desses ataques contra você.',
      skillId: 'Hacker'
    },
    {
      id: 'tem-um-aplicativo',
      name: 'Tem um Aplicativo Para Isso',
      description: 'Desde que consiga justificar digitalmente, você pode gastar um ponto de destino para usar Hacker no lugar de outra habilidade.',
      skillId: 'Hacker'
    },
    {
      id: 'forca-bruta',
      name: 'Força Bruta',
      description: 'Quando tiver falhado ao tentar invadir um sistema com Hacker, sua próxima tentativa tem +2.',
      skillId: 'Hacker'
    },
    {
      id: 'porta-dos-fundos',
      name: 'Porta dos Fundos',
      description: 'Quando estiver explorando zonas no espaço digital, você não precisa rolar para se mover uma zona extra, e rolagens para zonas obstruídas ganham +2.',
      skillId: 'Hacker'
    }
  ],
  'Influencer': [
    {
      id: 'vestida-para-sucesso',
      name: 'Vestida(o) para o Sucesso',
      description: 'Quando criar uma vantagem baseada em montar seu look ou apresentação pública antes de um evento, você ganha uma invocação grátis adicional.',
      skillId: 'Influencer'
    },
    {
      id: 'participe-da-minha-live',
      name: 'Participe da Minha Live',
      description: 'Se você permitir, outros jogadores podem usar sua habilidade de Influencer em vez de suas próprias. Mas se falharem, você também sofre as consequências.',
      skillId: 'Influencer'
    },
    {
      id: 'meia-volta',
      name: 'Meia-Volta',
      description: 'Uma vez por sessão, quando enfrentar um chamado de um de seus aspectos, pode escolher mudar seu aspecto, invalidando o chamado. O aspecto nunca mais voltará ao que era.',
      skillId: 'Influencer'
    }
  ],
  'Investigador': [
    {
      id: 'atencao-aos-detalhes',
      name: 'Atenção aos Detalhes',
      description: 'Você sempre nota pequenos detalhes que outros ignoram. +2 quando usar Investigador para criar vantagens baseadas em observação.',
      skillId: 'Investigador'
    },
    {
      id: 'leitura-fria',
      name: 'Leitura Fria',
      description: 'Você pode usar Investigador para criar vantagens sobre pessoas que acabou de conhecer, deduzindo informações sobre elas.',
      skillId: 'Investigador'
    },
    {
      id: 'rede-de-informantes',
      name: 'Rede de Informantes',
      description: 'Quando gastar um ponto de destino para adicionar um detalhe à história, você pode criar um informante que te deve um favor.',
      skillId: 'Investigador'
    }
  ],
  'Criador': [
    {
      id: 'gambiarras',
      name: 'Gambiarras',
      description: 'Você pode criar equipamentos improvisados usando Criador. Esses equipamentos funcionam por uma cena antes de quebrar.',
      skillId: 'Criador'
    },
    {
      id: 'mestre-das-ferramentas',
      name: 'Mestre das Ferramentas',
      description: 'Quando usar ferramentas apropriadas para a tarefa, você ganha +2 em rolagens de Criador.',
      skillId: 'Criador'
    },
    {
      id: 'reparo-rapido',
      name: 'Reparo Rápido',
      description: 'Você pode usar Criador para remover aspectos de equipamentos quebrados ou danificados, sem precisar de oficina.',
      skillId: 'Criador'
    }
  ],
  'Médico': [
    {
      id: 'primeiros-socorros',
      name: 'Primeiros Socorros',
      description: 'Você pode usar Médico para começar a recuperação de consequências físicas uma categoria mais leve que o normal.',
      skillId: 'Médico'
    },
    {
      id: 'diagnostico-preciso',
      name: 'Diagnóstico Preciso',
      description: 'Quando examinar alguém com Médico, você pode descobrir exatamente o que há de errado com a pessoa, ganhando uma invocação grátis em um aspecto revelado.',
      skillId: 'Médico'
    },
    {
      id: 'farmacologia',
      name: 'Farmacologia',
      description: 'Você conhece drogas e medicamentos. Pode usar Médico para criar vantagens relacionadas a sedativos, venenos ou curas.',
      skillId: 'Médico'
    }
  ],
  'Ocultista': [
    {
      id: 'amuletos-de-defesa',
      name: 'Amuletos de Defesa',
      description: 'Se você sabe contra o que está lutando e tem pelo menos dez minutos para se preparar, pode se defender contra habilidades sobrenaturais com Ocultista.',
      skillId: 'Ocultista'
    },
    {
      id: 'especializacao-ocultista',
      name: 'Especialização',
      description: 'Escolha um tipo de monstro ou tradição de magia. Você ganha +2 em todas as rolagens de Ocultista relacionadas à sua especialidade.',
      skillId: 'Ocultista'
    },
    {
      id: 'cacador-de-conhecimento',
      name: 'Caçador de Conhecimento',
      description: 'Uma vez por sessão, quando criar uma vantagem baseada em conhecimento sobrenatural, você ganha uma invocação grátis adicional.',
      skillId: 'Ocultista'
    }
  ],
  'Organizador': [
    {
      id: 'discurso-impressionante',
      name: 'Discurso Impressionante',
      description: 'Uma vez por sessão, antes de um grande confronto, se der um discurso motivacional, o aspecto que criar ganha uma invocação grátis adicional.',
      skillId: 'Organizador'
    },
    {
      id: 'tamo-junto',
      name: 'Tamo Junto',
      description: 'Se um membro da equipe estiver sofrendo stress mental, pode usar sua habilidade de Organizador em vez da original, ou ganhar +2. Se falhar, você ganha o mesmo stress.',
      skillId: 'Organizador'
    },
    {
      id: 'fardo-dividido',
      name: 'Fardo Dividido',
      description: 'Uma vez por sessão, quando um membro da equipe ganha stress, você pode mover 2 pontos para outro membro que concorde.',
      skillId: 'Organizador'
    }
  ],
  'Profissional': [
    {
      id: 'especialidade-interdisciplinar',
      name: 'Especialidade Interdisciplinar',
      description: 'Escolha uma área secundária relacionada à sua área de trabalho. Você pode usar as duas áreas com Profissional.',
      skillId: 'Profissional'
    },
    {
      id: 'especializacao-profissional',
      name: 'Especialização',
      description: 'Escolha uma especialidade mais restrita dentro da sua área. Ganhe +2 quando essa especialidade for utilizada.',
      skillId: 'Profissional'
    },
    {
      id: 'amigos-do-trabalho',
      name: 'Amigos do Trabalho',
      description: 'Quando gastar um ponto de destino para adicionar um detalhe à história, pode criar um personagem ligado à sua história de trabalho que te deve algo.',
      skillId: 'Profissional'
    }
  ],
  'Socialite': [
    {
      id: 'blase',
      name: 'Blasé',
      description: 'Você é imperturbável. Pode usar Socialite para se Defender contra esforços para perturbar ou influenciar seu comportamento, sobrenaturais ou não. Se já usava Socialite, ganhe +2.',
      skillId: 'Socialite'
    },
    {
      id: 'queridinho-de-todos',
      name: 'O(A) Queridinho(a) de Todos',
      description: 'Você é universalmente adorado. A primeira vez que alguém tentar atacar sua reputação, essa pessoa ganha 2 de stress independente do resultado.',
      skillId: 'Socialite'
    },
    {
      id: 'camaleao-social',
      name: 'Camaleão Social',
      description: 'Em meia hora você consegue disfarçar uma equipe para se encaixar onde não pertence. Eles usam suas habilidades de Socialite para Trambiqueiro, e você ganha +2 enquanto disfarçado.',
      skillId: 'Socialite'
    }
  ],
  'Assistente Social': [
    {
      id: 'agenda-telefonica',
      name: 'Agenda Telefônica',
      description: 'Quando gastar um ponto de destino para adicionar um detalhe à história, pode criar um personagem que você ajudou no passado e que deve seu sucesso a você.',
      skillId: 'Assistente Social'
    },
    {
      id: 'palavras-certas',
      name: 'As Palavras Certas',
      description: 'Uma vez por sessão, depois de conversar com alguém por uma hora, pode gastar um ponto de destino para reduzir uma consequência moderada mental para leve.',
      skillId: 'Assistente Social'
    },
    {
      id: 'apelar-para-empatia',
      name: 'Apelar para a Empatia',
      description: 'Ao apelar para o lado bom de alguém (se possível), pode se defender de seus ataques com Assistente Social.',
      skillId: 'Assistente Social'
    }
  ],
  'Espião': [
    {
      id: 'fuga-impressionante',
      name: 'Fuga Impressionante',
      description: 'Quando usar Espião para criar uma distração para fuga, ela também pode funcionar como ação de ataque.',
      skillId: 'Espião'
    },
    {
      id: 'local-seguro',
      name: 'Local Seguro',
      description: 'Quando gastar um ponto de destino para estabelecer um esconderijo, pode usar Espião para se defender de qualquer ataque dentro desse local. Se já usaria Espião, ganhe +2.',
      skillId: 'Espião'
    },
    {
      id: 'inspecionar-ambiente',
      name: 'Inspecionar o Ambiente',
      description: 'Uma vez por sessão, quando criar uma vantagem de mobilidade e fuga, pode criar dois aspectos com uma invocação grátis entre eles.',
      skillId: 'Espião'
    }
  ],
  'Sobrevivente': [
    {
      id: 'deixa-pra-la',
      name: 'Deixa Pra Lá',
      description: 'Uma vez por sessão, pode gastar um ponto de destino para reduzir uma consequência mental para leve, ou remover uma consequência leve.',
      skillId: 'Sobrevivente'
    },
    {
      id: 'ignore-a-dor',
      name: 'Ignore a Dor',
      description: 'Você consegue ignorar as coisas que te machucam. Pode usar Sobrevivente para se defender contra stress físico, além de mental.',
      skillId: 'Sobrevivente'
    },
    {
      id: 'insensivel',
      name: 'Insensível',
      description: 'Contra habilidades de monstros que influenciam mente e emoções, pode se defender com Sobrevivente, ou ganha +2 se já podia usar.',
      skillId: 'Sobrevivente'
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
