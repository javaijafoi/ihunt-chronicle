
export interface SkillManeuver {
    id: string;
    name: string;
    description: string;
    skillId: string;
    cost: number; // 0 = free, 1 = costs 1 refresh
}

export const SKILL_MANEUVERS: Record<string, SkillManeuver[]> = {
    'Acadêmico': [
        { id: 'conhecimento-inutil', name: 'Conhecimento Inútil', description: 'Gaste 1 PD para usar Acadêmico no lugar de qualquer outra habilidade.', skillId: 'Acadêmico', cost: 1 },
        { id: 'raciocinio-frio', name: 'Raciocínio Frio', description: 'Pode usar Acadêmico para se Defender contra influências mentais sobrenaturais.', skillId: 'Acadêmico', cost: 1 },
        { id: 'disciplina-especifica', name: 'Disciplina Específica', description: 'Escolha uma aplicação restrita (Ciência, História, etc). +2 quando usar Acadêmico dentro dessa disciplina.', skillId: 'Acadêmico', cost: 1 },
    ],
    'Atleta': [
        { id: 'segue-o-fluxo', name: 'Segue o Fluxo', description: 'Depois da primeira ação de parkour na cena, todas as outras ganham +2.', skillId: 'Atleta', cost: 1 },
        { id: 'cara-muito-liso', name: 'O Cara É Muito Liso', description: 'Sempre que usar Atleta para desviar de um ataque, +2.', skillId: 'Atleta', cost: 1 },
        { id: 'vence-pelo-cansaco', name: 'Vence Pelo Cansaço', description: 'Ao vencer uma perseguição, o oponente ganha a condição EXAUSTA.', skillId: 'Atleta', cost: 1 },
        { id: 'sem-paredes-sem-mestres', name: 'Sem Paredes, Sem Mestres', description: 'Mova-se por uma zona adicional por conflito. +2 para superar obstáculos entre zonas.', skillId: 'Atleta', cost: 1 },
    ],
    'Assassino': [
        { id: 'all-access', name: 'Acesso Total', description: 'Gaste 1 PD para entrar em qualquer lugar que você absolutamente não deveria estar.', skillId: 'Assassino', cost: 1 },
        { id: 'face-audience', name: 'Um Rosto na Multidão', description: '+2 para Criar Vantagem para se misturar ou desaparecer em uma multidão.', skillId: 'Assassino', cost: 1 },
        { id: 'scout', name: 'Batedor', description: 'Você sempre age primeiro em um conflito físico se estiver atacando de surpresa.', skillId: 'Assassino', cost: 1 },
    ],
    'Lutador': [
        { id: 'brawler', name: 'Brigão de Bar', description: '+2 para Atacar com Lutador quando estiver em um ambiente confinado e cheio de objetos improvisados.', skillId: 'Lutador', cost: 1 },
        { id: 'heavy-hitter', name: 'Bata com Força', description: 'Quando tiver sucesso com estilo em um ataque de Lutador, você pode reduzir o valor do impulso para aumentar o dano em 1.', skillId: 'Lutador', cost: 1 },
        { id: 'bodyguard', name: 'Guarda-Costas', description: 'Você pode usar Lutador para Defender outra pessoa que esteja na mesma zona.', skillId: 'Lutador', cost: 1 },
    ],
    'Trambiqueiro': [
        { id: 'silver-tongue', name: 'Língua de Prata', description: '+2 para Superar usando Trambiqueiro quando estiver mentindo para alguém em uma posição de autoridade.', skillId: 'Trambiqueiro', cost: 1 },
        { id: 'sticky-fingers', name: 'Mãos Leves', description: 'Você pode bater carteiras ou plantar objetos pequenos sem ser notado se tiver sucesso em um teste de Trambiqueiro.', skillId: 'Trambiqueiro', cost: 1 },
        { id: 'connection', name: 'Eu Conheço um Cara', description: 'Uma vez por sessão, declare que você conhece alguém útil na situação atual.', skillId: 'Trambiqueiro', cost: 1 },
    ],
    'Guerrilheiro': [
        { id: 'demolitions', name: 'Demolições', description: '+2 para Atacar ou Criar Vantagem usando explosivos ou sabotagem.', skillId: 'Guerrilheiro', cost: 1 },
        { id: 'ambush', name: 'Emboscada', description: '+2 para Atacar com Guerrilheiro se o alvo não souber que você está lá.', skillId: 'Guerrilheiro', cost: 1 },
        { id: 'scavenger', name: 'Sucateiro', description: 'Você sempre consegue encontrar munição ou suprimentos básicos em qualquer lugar urbano.', skillId: 'Guerrilheiro', cost: 1 },
    ],
    'Hacker': [
        { id: 'backdoor', name: 'Backdoor', description: '+2 para Superar segurança digital se você tiver tempo para preparar.', skillId: 'Hacker', cost: 1 },
        { id: 'drone-pilot', name: 'Piloto de Drone', description: 'Você pode usar Hacker para pilotar drones para reconhecimento ou ataque remoto.', skillId: 'Hacker', cost: 1 },
        { id: 'black-hat', name: 'Chapéu Preto', description: 'Ganhe +2 para Ataques mentais usando Hacker para expor segredos ou destruir reputações online.', skillId: 'Hacker', cost: 1 },
    ],
    'Influencer': [
        { id: 'viral', name: 'Viralizar', description: 'Uma vez por sessão, você pode fazer uma informação (verdadeira ou falsa) se espalhar rapidamente pela cidade.', skillId: 'Influencer', cost: 1 },
        { id: 'fanbase', name: 'Fandom', description: 'Você pode usar sua fama para obter favores pequenos ou acesso a lugares exclusivos.', skillId: 'Influencer', cost: 1 },
        { id: 'cancel-culture', name: 'Cancelamento', description: 'Use Influencer para atacar a reputação de alguém. Sucesso com estilo causa uma consequência social imediata.', skillId: 'Influencer', cost: 1 },
    ],
    'Investigador': [
        { id: 'cold-read', name: 'Leitura Fria', description: '+2 para Criar Vantagem ao tentar descobrir o Aspecto de alguém observando-o.', skillId: 'Investigador', cost: 1 },
        { id: 'scene-crime', name: 'Cena do Crime', description: 'Você nunca falha em encontrar as pistas básicas em uma cena de crime. Rolle apenas para ver quão rápido ou detalhado é.', skillId: 'Investigador', cost: 1 },
        { id: 'interrogation', name: 'Interrogatório', description: '+2 para Superar a resistência de alguém em responder perguntas.', skillId: 'Investigador', cost: 1 },
    ],
    'Criador': [
        { id: 'macgyver', name: 'Gambiarra', description: 'Você pode criar ferramentas ou armas improvisadas com materiais disponíveis. Elas duram uma cena.', skillId: 'Criador', cost: 1 },
        { id: 'repair', name: 'Reparos de Campo', description: 'Gaste 1 PD para remover uma consequência Moderada de um veículo ou equipamento imediatamente (mas temporariamente).', skillId: 'Criador', cost: 1 },
        { id: 'artist', name: 'Obra Prima', description: '+2 para Criar Vantagem ao criar algo que evoque emoções fortes.', skillId: 'Criador', cost: 1 },
    ],
    'Médico': [
        { id: 'first-aid', name: 'Primeiros Socorros', description: 'Você pode usar Médico para iniciar a recuperação de consequências Físicas.', skillId: 'Médico', cost: 1 },
        { id: 'combat-medic', name: 'Médico de Combate', description: 'Você não sofre penalidades por tentar tratar alguém em meio a um conflito.', skillId: 'Médico', cost: 1 },
        { id: 'forensics', name: 'Medicina Legal', description: '+2 para Investigar causas de morte ou patologias.', skillId: 'Médico', cost: 1 },
    ],
    'Ocultista': [
        { id: 'warding', name: 'Proteção Mágica', description: 'Você pode usar Ocultismo para Defender contra ataques sobrenaturais.', skillId: 'Ocultista', cost: 1 },
        { id: 'ritual', name: 'Ritualista', description: '+2 para Criar Vantagem quando tiver tempo e materiais para realizar um ritual mágico.', skillId: 'Ocultista', cost: 1 },
        { id: 'lore', name: 'Conhecimento Proibido', description: 'Você sabe os pontos fracos de monstros (Vampiros, Lobisomens, etc). Gaste 1 PD para revelar um Aspecto de monstro.', skillId: 'Ocultista', cost: 1 },
    ],
    'Organizador': [
        { id: 'logistics', name: 'Logística', description: 'Você sempre tem o equipamento certo para o trabalho. Gaste 1 PD para produzir um item comum instantaneamente.', skillId: 'Organizador', cost: 1 },
        { id: 'plan', name: 'O Plano', description: '+2 para Criar Vantagem "Bem Preparado" para o grupo antes de uma missão.', skillId: 'Organizador', cost: 1 },
        { id: 'network', name: 'Rede de Contatos', description: 'Você sabe quem chamar. +2 para Superar obstáculos burocráticos.', skillId: 'Organizador', cost: 1 },
    ],
    'Profissional': [
        { id: 'corporate', name: 'Mundo Corporativo', description: '+2 em disputas verbais dentro de um ambiente de escritório ou negócios.', skillId: 'Profissional', cost: 1 },
        { id: 'resources', name: 'Orçamento', description: 'Use Profissional no lugar de Recursos para adquirir bens ou serviços relacionados ao seu trabalho.', skillId: 'Profissional', cost: 1 },
        { id: 'cool', name: 'Sangue Frio', description: '+2 para Defender contra medo ou intimidação em situações profissionais.', skillId: 'Profissional', cost: 1 },
    ],
    'Socialite': [
        { id: 'party-animal', name: 'Alma da Festa', description: '+2 para Criar Vantagem em situações sociais festivas ou de gala.', skillId: 'Socialite', cost: 1 },
        { id: 'gossip', name: 'Fofoca', description: 'Você sempre ouve os rumores. +2 para descobrir Aspectos sociais.', skillId: 'Socialite', cost: 1 },
        { id: 'vip', name: 'VIP', description: 'Gaste 1 PD para entrar em qualquer evento exclusivo ou clube.', skillId: 'Socialite', cost: 1 },
    ],
    'Assistente Social': [
        { id: 'empathy', name: 'Empatia', description: 'Use Assistente Social para Defender contra ataques mentais/emocionais, ajudando outros a processarem traumas.', skillId: 'Assistente Social', cost: 1 },
        { id: 'de-escalate', name: 'Desescalar', description: '+2 para Superar tensão em uma situação hostil antes que vire violência.', skillId: 'Assistente Social', cost: 1 },
        { id: 'system', name: 'O Sistema', description: '+2 para navegar na burocracia governamental e encontrar ajuda para os necessitados.', skillId: 'Assistente Social', cost: 1 },
    ],
    'Espião': [
        { id: 'cover-id', name: 'Identidade Falsa', description: 'Você tem uma identidade falsa estabelecida. Gaste 1 PD para que ela resista a um escrutínio intenso.', skillId: 'Espião', cost: 1 },
        { id: 'surveillance', name: 'Vigilância', description: '+2 para Criar Vantagem ao observar um alvo sem ser visto.', skillId: 'Espião', cost: 1 },
        { id: 'lip-reading', name: 'Leitura Labial', description: 'Você pode "ouvir" conversas à distância se puder ver os lábios de quem fala.', skillId: 'Espião', cost: 1 },
    ],
    'Sobrevivente': [
        { id: 'tough', name: 'Duro de Matar', description: 'Ganhe uma caixa extra de Stress Físico leve (1).', skillId: 'Sobrevivente', cost: 1 },
        { id: 'tracker', name: 'Rastreador', description: '+2 para Superar testes para seguir alguém ou encontrar rastros.', skillId: 'Sobrevivente', cost: 1 },
        { id: 'danger-sense', name: 'Sentido de Perigo', description: '+2 para Defender contra armadilhas ou emboscadas.', skillId: 'Sobrevivente', cost: 1 },
    ],
};
