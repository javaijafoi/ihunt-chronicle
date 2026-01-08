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
            "Serviço Social": 4,
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
    }
];
