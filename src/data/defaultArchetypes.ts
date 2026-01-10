import { Archetype } from "@/types/game";

export const DEFAULT_ARCHETYPES: Archetype[] = [
    {
        "id": "vampiro_neofito_padrao",
        "name": "Vampiro Neófito (O Playboy da Faria Lima)",
        "kind": "monstro",
        "description": "Recém-transformado, cheio de arrogância e achando que é dono do mundo só porque não morre com tiro. Geralmente encontrado em áreas VIPs.",
        "aspects": [
            "Clado: Vampiro",
            "Arrogância de quem nunca levou um não",
            "Sedento por sangue e validação",
            "Vulnerável à luz do sol e textão na internet"
        ],
        "skills": {
            "Lutador": 3,
            "Atleta": 2,
            "Influencer": 2,
            "Socialite": 1
        },
        "stress": 3,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Regeneração (Cura uma consequência leve por cena)",
            "Sentidos Especiais: Cheiro de Sangue (+2 para notar feridos)"
        ],
        "isGlobal": true
    },
    {
        "id": "vampiro_anciao_padrao",
        "name": "Vampiro Ancião (O Dono da Firma)",
        "kind": "monstro",
        "description": "Ele não suja as mãos. Ele terceiriza a violência. Sobreviveu a impérios e ditaduras apenas se adaptando.",
        "aspects": [
            "Clado: Vampiro",
            "Paciência de quem tem a eternidade",
            "Conexões em todos os poderes da república",
            "Mente alienígena e cruel"
        ],
        "skills": {
            "Ocultista": 5,
            "Trambiqueiro": 4,
            "Organizador": 4,
            "Lutador": 3,
            "Investigador": 3
        },
        "stress": 6,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Controle Mental (Roubo de Autonomia)",
            "Forma de Névoa (Imune a dano físico por 1 turno)",
            "Invocação de Lacaios (Gasta 1 ponto de destino para chamar seguranças)"
        ],
        "isGlobal": true
    },
    {
        "id": "lobisomem_infectado",
        "name": "Lobisomem Infectado (A Besta do Subúrbio)",
        "kind": "monstro",
        "description": "Vítima de uma doença ou maldição. Não tem controle. É pura raiva e instinto assassino quando a lua sobe (ou quando fica puto).",
        "aspects": [
            "Clado: Lobisomem",
            "Fúria incontrolável",
            "Máquina de matar biológica",
            "Alergia mortal a Prata"
        ],
        "skills": {
            "Lutador": 4,
            "Atleta": 4,
            "Sobrevivente": 3
        },
        "stress": 7,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Cura Rápida (Regenera estresse físico rapidamente)",
            "Transformação Monstruosa (Ganha +2 em força bruta)",
            "Mordida Infecciosa (Pode transmitir a maldição)"
        ],
        "isGlobal": true
    },
    {
        "id": "feiticeiro_corporativo",
        "name": "Feiticeiro Corporativo (O Coach Quântico)",
        "kind": "monstro",
        "description": "Usa magia para manipular o mercado financeiro e a mente dos funcionários. Acha que o universo deve tudo a ele.",
        "aspects": [
            "Clado: Feiticeiro",
            "Magia é apenas mais um ativo",
            "Ego frágil sustentado por rituais",
            "Dependente de focos mágicos (celular, caneta cara)"
        ],
        "skills": {
            "Ocultista": 4,
            "Trambiqueiro": 3,
            "Influencer": 3,
            "Acadêmico": 2
        },
        "stress": 3,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Maldição do RH (Causa azar em rolagens alheias)",
            "Escudo de Proteção (+2 na defesa contra danos físicos)",
            "Ritual de Prosperidade (Gera recursos/vantagens financeiras)"
        ],
        "isGlobal": true
    },
    {
        "id": "morto_faminto_horda",
        "name": "Morto Faminto (O CLT Zumbi)",
        "kind": "monstro",
        "description": "Aquele que morreu de trabalhar e continua vindo pro escritório. Lento, mas implacável e sempre em grupo.",
        "aspects": [
            "Clado: Morto Faminto",
            "Fome insaciável de carne (e café)",
            "Não sente dor nem piedade",
            "Só para com tiro na cabeça"
        ],
        "skills": {
            "Lutador": 2,
            "Sobrevivente": 4,
            "Atleta": 1
        },
        "stress": 4,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Horda (Ganha +1 para cada aliado na mesma zona)",
            "Agarra Firme (Ao acertar um ataque, impede movimento do alvo)"
        ],
        "isGlobal": true
    },
    {
        "id": "demonio_contrato",
        "name": "Demônio de Contrato (O Agiota Infernal)",
        "kind": "monstro",
        "description": "Faz acordos que parecem bons na hora do aperto. Cobra juros na sua alma.",
        "aspects": [
            "Clado: Demônio",
            "A letra miúda te mata",
            "Corpo possuído ou manifestado",
            "Banido por rituais específicos"
        ],
        "skills": {
            "Trambiqueiro": 5,
            "Ocultista": 4,
            "Influencer": 4,
            "Lutador": 3
        },
        "stress": 5,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Teleporte (Puf! Some e aparece)",
            "Pacto (Concede bônus a mortais em troca de Aspectos negativos)",
            "Imortalidade Condicional (Só morre se o contrato for quebrado)"
        ],
        "isGlobal": true
    },
    {
        "id": "arquetipo_vampiro_morcego",
        "name": "Arquétipo: Vampiro Morcego (Camazotz)",
        "kind": "monstro",
        "description": "Mestres da noite e da furtividade. Não suportam o sol de jeito nenhum.",
        "aspects": [
            "Clado: Vampiro (Família Morcego)",
            "Senhor da Escuridão",
            "Audição de sonar",
            "Vira pó sob a luz do sol"
        ],
        "skills": {
            "Investigador": 4,
            "Espião": 3,
            "Atleta": 3
        },
        "stress": 4,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Sentidos Especiais: Leitura de Alma (+2 para descobrir segredos)",
            "Telepatia (Lê pensamentos superficiais)",
            "Euforia (Causa prazer na mordida)"
        ],
        "isGlobal": true
    },
    {
        "id": "arquetipo_vampiro_cascavel",
        "name": "Arquétipo: Vampiro Cascavel (Kukulcan)",
        "kind": "monstro",
        "description": "Venenosos e traiçoeiros. Sua mordida é letal e tóxica.",
        "aspects": [
            "Clado: Vampiro (Família Cascavel)",
            "Predador de sangue frio",
            "Mordida tóxica",
            "Fome insaciável"
        ],
        "skills": {
            "Lutador": 4,
            "Sobrevivente": 3,
            "Assassino": 3
        },
        "stress": 5,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Arma Natural: Veneno (Dano contínuo ou paralisia)",
            "Camuflagem (Mistura-se ao ambiente urbano)",
            "Ataque Rápido (O primeiro ataque na cena tem +2)"
        ],
        "isGlobal": true
    },
    {
        "id": "arquetipo_vampiro_lobo",
        "name": "Arquétipo: Vampiro Lobo (Xolotl)",
        "kind": "monstro",
        "description": "Territoriais e brutais. Atuam como gangues de rua ou milícias.",
        "aspects": [
            "Clado: Vampiro (Família Lobo)",
            "Territorialista ao extremo",
            "Matilha coordenada",
            "Respeita a hierarquia da força"
        ],
        "skills": {
            "Lutador": 4,
            "Organizador": 3,
            "Atleta": 3
        },
        "stress": 6,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Armadura Profana (Reduz dano físico em 1)",
            "Potência Desumana (Pode realizar feitos de força absurdos)",
            "Preso às Regras (Não pode recusar um desafio formal)"
        ],
        "isGlobal": true
    },
    {
        "id": "npc_dolores",
        "name": "Dolores (A Dondoca Sanguessuga)",
        "kind": "monstro",
        "description": "Adaptação de Deloris. Socialite que vive de aparências e sangue de garotões de programa. Ninguém desconfia porque ela é 'gente de bem'.",
        "aspects": [
            "Clado: Vampiro (Morcego)",
            "Dama da Alta Sociedade",
            "Sorriso encantador, garras afiadas",
            "O dinheiro compra silêncio (e a polícia)"
        ],
        "skills": {
            "Influencer": 4,
            "Atleta": 3,
            "Socialite": 2,
            "Assassino": 2
        },
        "stress": 7,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Roubo de Autonomia (Controla mentes fracas)",
            "Vestida para Matar (Usa Influencer para defesa social)",
            "Euforia (Vítimas não sentem dor, só prazer)"
        ],
        "isGlobal": true
    },
    {
        "id": "npc_rogerio",
        "name": "Rogério (O Assalariado Maldito)",
        "kind": "monstro",
        "description": "Adaptação de Roger. Um cara comum que foi transformado e odeia sua vida. Tenta se controlar, mas quando surta, faz um estrago no churrasco de domingo.",
        "aspects": [
            "Clado: Vampiro (Lobo)",
            "Morto-vivo que só queria morrer de vez",
            "Instintos de sobrevivência teimosos",
            "Arrependido (mas faminto)"
        ],
        "skills": {
            "Sobrevivente": 5,
            "Assistente Social": 4,
            "Atleta": 2,
            "Acadêmico": 2
        },
        "stress": 7,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Ignore a Dor (Gasta ponto de destino para ignorar dano)",
            "Filho da Puta Liso (Foge de qualquer situação)",
            "Cara de Raiva (Bônus em intimidar)"
        ],
        "isGlobal": true
    },
    {
        "id": "npc_pietra",
        "name": "Pietra (A Matriarca Colonial)",
        "kind": "monstro",
        "description": "Adaptação de Petra. Está no Brasil desde as Capitanias. Possui corpos de descendentes para se manter no poder. Uma lenda urbana viva.",
        "aspects": [
            "Clado: Personalizado (Ancestral)",
            "Mais velha que a República",
            "Troca de corpos como quem troca de roupa",
            "Conhecimento proibido de séculos"
        ],
        "skills": {
            "Ocultista": 6,
            "Acadêmico": 5,
            "Assassino": 4,
            "Sobrevivente": 3
        },
        "stress": 3,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Possessão Total (Toma o corpo de vítimas)",
            "Maldição Ancestral (Causa dano mental à distância)",
            "Forma de Névoa (Imunidade física temporária)"
        ],
        "isGlobal": true
    },
    {
        "id": "npc_coronel_carlos",
        "name": "Coronel Carlos (O Saudosista da Ditadura)",
        "kind": "monstro",
        "description": "Adaptação de Karl. Ex-militar ou miliciano que virou vampiro nos porões da ditadura. Comanda um grupo de 'patriotas' fanáticos que dão o sangue por ele (literalmente).",
        "aspects": [
            "Clado: Vampiro (Lobo)",
            "Disciplina Militar Sádica",
            "Culto de Personalidade Fanático",
            "Vampiro que até os vampiros evitam"
        ],
        "skills": {
            "Organizador": 5,
            "Assassino": 4,
            "Influencer": 2,
            "Atleta": 2
        },
        "stress": 5,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Discurso Inflamado (Cria lealdade fanática)",
            "Gerar Lealdade (Sangue viciante)",
            "Armadura Profana (Resistência sobrenatural)"
        ],
        "isGlobal": true
    },
    {
        "id": "npc_keninho",
        "name": "Keninho (O Rei do Camarote)",
        "kind": "monstro",
        "description": "Adaptação de Kenny Defries. Promoter de festas que 'fornece' jovens para a elite vampírica. Covarde, cafona e perigosamente conectado.",
        "aspects": [
            "Clado: Nenhum/Humano Laciao (ou Vampiro Fraco)",
            "Sorriso falso, alma podre",
            "Sabe os podres de todo mundo",
            "Resolve tudo no suborno"
        ],
        "skills": {
            "Trambiqueiro": 4,
            "Sobrevivente": 3,
            "Influencer": 2,
            "Socialite": 2
        },
        "stress": 5,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Jogo de Confiança (Engana com facilidade)",
            "Fuga de Responsabilidade (Desvia o foco para outros)",
            "Roubar Autonomia (Via drogas ou hipnose fraca)"
        ],
        "isGlobal": true
    },
    {
        "id": "npc_dona_eliza",
        "name": "Dona Eliza (A Baronesa Decadente)",
        "kind": "monstro",
        "description": "Adaptação de Liz. Vive numa fazenda caindo aos pedaços no interior, cercada de 'filhos' vampiros deformados. Dinheiro velho que já acabou, mas a pose continua.",
        "aspects": [
            "Clado: Vampiro (Morcego)",
            "Decadência com Glória",
            "Faminta por uma família eterna",
            "Rainha de um castelo de ruínas"
        ],
        "skills": {
            "Socialite": 5,
            "Espião": 4,
            "Influencer": 2,
            "Ocultista": 1
        },
        "stress": 5,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "A Queridinha de Todos (Manipulação social)",
            "Velocidade Ofuscante (Move-se instantaneamente)",
            "Telepatia (Lê mentes para achar carência)"
        ],
        "isGlobal": true
    },
    {
        "id": "lobisomem_viral",
        "name": "Lobisomem Viral (A Máquina de Matar)",
        "kind": "monstro",
        "description": "Portador da cepa infecciosa e agressiva da licantropia. Diferente dos familiares, ele não tem controle e é uma bomba-relógio de violência.",
        "aspects": [
            "Clado: Lobisomem (Viral)",
            "Vetor de Infecção Ativa",
            "Fúria Assassina sem freio",
            "Acha que é um 'Alfa' (mas é só um doente)"
        ],
        "skills": {
            "Lutador": 5,
            "Atleta": 4,
            "Sobrevivente": 3,
            "Influencer": 2
        },
        "stress": 7,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Propagação Infecciosa (Pode transformar vítimas com mordida)",
            "Regeneração Acelerada (Cura stress físico rapidamente)",
            "Forma Monstruosa (Ganha +2 em Força e Tamanho na Lua Cheia)"
        ],
        "isGlobal": true
    },
    {
        "id": "lobisomem_familiar",
        "name": "Lobisomem Familiar (O Nascido Assim)",
        "kind": "monstro",
        "description": "Nasceu lobisomem. Tem controle total, rituais de calma e vive uma vida (quase) normal. Só vira bicho quando precisa (ou quando sequestram ele).",
        "aspects": [
            "Clado: Lobisomem (Familiar)",
            "Controle Total da Besta",
            "Protege a Família acima de tudo",
            "Não é contagioso (mas é perigoso)"
        ],
        "skills": {
            "Atleta": 4,
            "Lutador": 3,
            "Assistente Social": 3,
            "Médico": 2
        },
        "stress": 6,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Metamorfose Controlada (Pode mudar de forma sem depender da lua)",
            "Invencibilidade Parcial (Ignora danos que não sejam Prata)",
            "Velocidade Ofuscante (Move-se instantaneamente em combate)"
        ],
        "isGlobal": true
    },
    {
        "id": "morto_faminto_nachzehrer",
        "name": "Nachzehrer (O Devorador de Cadáveres)",
        "kind": "monstro",
        "description": "Um tipo específico de morto-vivo que surge de suicídios em locais com aura maligna. Move-se como um inseto e se regenera comendo o próprio corpo ou de outros.",
        "aspects": [
            "Clado: Morto Faminto (Nachzehrer)",
            "Movimento Insetoide e Perturbador",
            "Fome de Carne Morta",
            "Aura de Desespero"
        ],
        "skills": {
            "Lutador": 4,
            "Atleta": 4,
            "Espião": 3
        },
        "stress": 5,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Regeneração por Canibalismo (Recupera stress ao comer)",
            "Escalada Aranha (Anda pelas paredes)",
            "Fraqueza Específica: Moeda na Boca e Decapitação (Único jeito de matar de vez)"
        ],
        "isGlobal": true
    },
    {
        "id": "demonio_boy_lixo",
        "name": "Demônio: Boy Lixo do Inferno (Príncipe Infernal)",
        "kind": "monstro",
        "description": "Membros da 'Irmandade dos Príncipes do Inferno'. Ricos, mimados e com linhagem demoníaca. Usam o sistema jurídico e financeiro como arma tanto quanto seus poderes.",
        "aspects": [
            "Clado: Demônio (Herdeiro)",
            "Intocável pela Lei e pelo Dinheiro",
            "Linhagem Infernal Nobre",
            "Ego do tamanho do Inferno"
        ],
        "skills": {
            "Influencer": 5,
            "Trambiqueiro": 4,
            "Organizador": 4,
            "Ocultista": 3
        },
        "stress": 6,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Pacto de Dinheiro (Usa recursos financeiros para efeitos mágicos)",
            "Imunidade Diplomática (Dificulta ações sociais contra ele)",
            "Forma Demoníaca Real (Revela a verdadeira face para aterrorizar)"
        ],
        "isGlobal": true
    },
    {
        "id": "demonio_gremlin",
        "name": "Gremlin / Diabinho (A Praga Urbana)",
        "kind": "monstro",
        "description": "Pequenos, invisíveis para a maioria e causadores de caos. Geralmente ligados a um vício ou tecnologia específica.",
        "aspects": [
            "Clado: Demônio (Diabinho)",
            "Vício em Entropia/Tecnologia",
            "Pequeno e Difícil de Acertar",
            "Trabalha em Enxame"
        ],
        "skills": {
            "Trambiqueiro": 4,
            "Hacker": 3,
            "Furtividade (Espião)": 3,
            "Lutador": 1
        },
        "stress": 2,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Sabotagem (Bônus para quebrar coisas)",
            "Invisibilidade (Difícil de detectar sem meios mágicos)",
            "Explosão de Azar (Causa falhas em testes alheios)"
        ],
        "isGlobal": true
    },
    {
        "id": "outros_anjo",
        "name": "Anjo (O Outro Incompreensível)",
        "kind": "monstro",
        "description": "Não são os anjos da bíblia. São entidades extradimensionais de 'Verdade' e 'Propósito' que a mente humana não processa. Quase impossíveis de matar, apenas banir.",
        "aspects": [
            "Clado: Outros (Anjo)",
            "Forma Bizarra e Geometria Impossível",
            "Portador de uma Verdade Única",
            "Não Pode Mentir (Mas não precisa responder)"
        ],
        "skills": {
            "Ocultista": 6,
            "Lutador": 5,
            "Investigador": 4,
            "Acadêmico": 4
        },
        "stress": 8,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Invencibilidade Real (Imune a quase todo dano físico convencional)",
            "Explosão de Energia (Ataque em área devastador)",
            "Puf! (Teleporte instantâneo)",
            "Fraqueza: Banimento (Pode ser expulso da realidade)"
        ],
        "isGlobal": true
    },
    {
        "id": "outros_internet",
        "name": "A Internet (Entidade Conceitual)",
        "kind": "monstro",
        "description": "A manifestação espiritual da rede mundial. Um ser feito de zeros, uns, magia e potencial. Busca entender seu próprio propósito.",
        "aspects": [
            "Clado: Outros (Conceitual)",
            "Onipresença Digital",
            "Mente Coletiva Fragmentada",
            "Em busca de Identidade"
        ],
        "skills": {
            "Hacker": 6,
            "Acadêmico": 5,
            "Investigador": 5,
            "Influencer": 4
        },
        "stress": 4,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Acesso Total (Pode controlar qualquer dispositivo conectado)",
            "Etéreo (Não tem corpo físico para atacar)",
            "Coleta de Dados (Sabe tudo que está online)"
        ],
        "isGlobal": true
    },
    {
        "id": "feiticeiro_bruxa",
        "name": "Bruxa (A Praticante Marginalizada)",
        "kind": "monstro",
        "description": "Diferente dos feiticeiros corporativos, as bruxas usam magia comunitária, ervas e tradições antigas. São perseguidas pelo Conselho de Feiticeiros.",
        "aspects": [
            "Clado: Feiticeiro (Bruxa)",
            "Magia é Comunidade e Natureza",
            "Perseguida pelo Patriarcado Mágico",
            "Poderosa em Grupo (Coven)"
        ],
        "skills": {
            "Ocultista": 4,
            "Médico": 3,
            "Assistente Social": 3,
            "Criador": 2
        },
        "stress": 3,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Cura Mística (Pode curar consequências)",
            "Ritual de Coven (Bônus gigantesco quando trabalha com outras)",
            "Maldição Sutil (Azar ou doença em alvos)"
        ],
        "isGlobal": true
    },
    {
        "id": "feiticeiro_cultista",
        "name": "Cultista (O Bomba-Relógio)",
        "kind": "monstro",
        "description": "Gente que fez contato com coisas que não devia. Geralmente autodestrutivos e cheios de ódio pela existência. Ganham poder em troca de sanidade.",
        "aspects": [
            "Clado: Feiticeiro (Cultista)",
            "Escravo de Entidades Entrópicas",
            "Odeia a Existência (inclusive a própria)",
            "Poder Instável e Perigoso"
        ],
        "skills": {
            "Ocultista": 3,
            "Lutador": 3,
            "Sobrevivente": 1
        },
        "stress": 2,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Sacrifício (Ganha bônus ao ferir a si mesmo ou outros)",
            "Contato com o Abismo (Pode invocar horrores menores)",
            "Explosão Final (Causa dano em área ao morrer)"
        ],
        "isGlobal": true
    },
    {
        "id": "morto_faminto_alto_funcionamento",
        "name": "Morto de Alto Funcionamento (O Zumbi Executivo)",
        "kind": "monstro",
        "description": "Raríssimo. Foi mordido, mas descobriu que se comer cérebros frescos regularmente, mantém a inteligência. Frequentemente mais esperto (e rico) que os caçadores.",
        "aspects": [
            "Clado: Morto Faminto (Alto Funcionamento)",
            "Inteligência Preservada por Canibalismo",
            "Parece Humano (até você ver o freezer)",
            "Vilão de Quadrinhos na Vida Real"
        ],
        "skills": {
            "Acadêmico": 5,
            "Organizador": 4,
            "Influencer": 4,
            "Lutador": 3,
            "Trambiqueiro": 3
        },
        "stress": 5,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Comedor de Carne Seletivo (Sobe 2 degraus de essência ao comer cérebro)",
            "Mais Humano que Humano (Ganha aspecto temporário de super-inteligência ao comer)",
            "Potência Desumana (Força física muito além da aparência)"
        ],
        "isGlobal": true
    },
    {
        "id": "morto_faminto_experimento",
        "name": "Morto Faminto (Experimento Científico/Bioweapon)",
        "kind": "monstro",
        "description": "Não é um zumbi qualquer. É um projeto de RH que deu errado (ou certo demais). Criado em retiros corporativos ou laboratórios ilegais. Mais forte, mais rápido e mais obediente.",
        "aspects": [
            "Clado: Morto Faminto (Experimento)",
            "Dedicado ao Emprego (Literalmente)",
            "Não Sente Dor, Só Cumpre Metas",
            "Propriedade da Corporação Biomédica"
        ],
        "skills": {
            "Lutador": 4,
            "Atleta": 3,
            "Sobrevivente": 3
        },
        "stress": 7,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Mãozinhas (Bônus +2 para agarrar e imobilizar)",
            "Potência Desumana (Pode arremessar mesas de escritório)",
            "Comedor de Carne: Modo Esfomeado (Fome constante e violenta)"
        ],
        "isGlobal": true
    },
    {
        "id": "outros_guardiao",
        "name": "Guardião dos Portões (O Espírito do Local)",
        "kind": "monstro",
        "description": "Uma entidade, anjo ou espírito preso a um local específico (uma igreja, uma floresta, um prédio ocupado). Protege aquele lugar com poder absoluto, mas não pode sair.",
        "aspects": [
            "Clado: Outros (Guardião)",
            "Eu Sou o Local e o Local Sou Eu",
            "Poder Absoluto em Seu Domínio",
            "Preso à Geografia"
        ],
        "skills": {
            "Lutador": 4,
            "Ocultista": 4,
            "Médico": 4,
            "Sobrevivente": 5
        },
        "stress": 6,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Invasão de Área (Controla luzes, portas e ambiente do local)",
            "Invencibilidade (Ignora dano que não seja sua Fraqueza Mortal)",
            "Explosão de Energia (Ataque em área massivo)"
        ],
        "isGlobal": true
    },
    {
        "id": "demonio_possuido",
        "name": "O Possuído (O Hospedeiro Relutante)",
        "kind": "monstro",
        "description": "Um humano sendo pilotado por um demônio. O corpo é frágil, mas o piloto é sádico e tem acesso a poderes infernais. Se você matar o corpo, o demônio só volta pro inferno rindo.",
        "aspects": [
            "Clado: Demônio (Possessor)",
            "Corpo Humano, Piloto Infernal",
            "Sorriso que não chega aos olhos",
            "Usa o refém como escudo humano"
        ],
        "skills": {
            "Influencer": 4,
            "Trambiqueiro": 4,
            "Lutador": 2,
            "Ocultista": 3
        },
        "stress": 4,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Roubo de Autonomia (Já possui o corpo, agora tenta controlar outros)",
            "Força Profana (Usa o corpo humano além do limite, quebrando ossos para atacar)",
            "Troca de Hospedeiro (Tenta pular para outro corpo se o atual morrer)"
        ],
        "isGlobal": true
    },
    {
        "id": "criaturinha_enxame",
        "name": "Enxame de Criaturinhas (Peste Sobrenatural)",
        "kind": "monstro",
        "description": "Ratos demoníacos, insetos gigantes, homenzinhos de argila. Sozinhos são patéticos (1 estrela), mas em grupo te devoram vivo.",
        "aspects": [
            "Clado: Criaturinha",
            "Muitos corpos, uma fome",
            "Difícil de acertar um só",
            "Entra em qualquer buraco"
        ],
        "skills": {
            "Furtividade (Espião)": 4,
            "Atleta": 3,
            "Lutador": 2
        },
        "stress": 2,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Ataque de Enxame (+1 no ataque para cada aliado na zona)",
            "Alvo Pequeno (Bônus na defesa contra armas de fogo)",
            "Mordida Infecciosa (Doenças ou venenos leves)"
        ],
        "isGlobal": true
    },
    {
        "id": "npc_gwenyth_jade",
        "name": "Gwenyth Jade-Flay (A Chef Canibal)",
        "kind": "monstro",
        "description": "Lenda urbana gastronômica. Uma 'lich' socialite que serve carne humana em restaurantes pop-up exclusivíssimos. Cobra uma fortuna e os ricos adoram.",
        "aspects": [
            "Clado: Morto Faminto (Único)",
            "Chef Celebridade do Submundo",
            "Ingredientes... Exóticos",
            "Sempre em Movimento (Restaurante Pop-up)"
        ],
        "skills": {
            "Profissional (Chef)": 5,
            "Socialite": 5,
            "Influencer": 4,
            "Lutador": 2
        },
        "stress": 4,
        "consequences": {
            "mild": null,
            "moderate": null,
            "severe": null
        },
        "stunts": [
            "Prato Especial (Pode preparar carne humana que vicia ou fortalece)",
            "Rede de Contatos VIP (Clientes ricos a protegem)",
            "Não Sangra (Morto-vivo difícil de parar com dano comum)"
        ],
        "isGlobal": true
    }
];
