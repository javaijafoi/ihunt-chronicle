import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/hooks/useSession';
import { db } from '@/lib/firebase';
import { Character } from '@/types/game';

const DEFAULT_SESSION_ID = 'default-session-id';

const SEED_CHARACTERS: Array<Omit<Character, 'id' | 'sessionId' | 'createdBy'>> = [
  {
    name: 'Luna "Hex" Martins',
    avatar: '',
    drive: 'malina',
    aspects: {
      highConcept: 'Pesquisadora arcana freelancer',
      drama: 'Preciso provar que magia é ciência',
      job: 'Bibliotecária noturna',
      dreamBoard: 'Publicar um grimório digital',
      free: ['Sabe onde achar qualquer livro', 'Coleciona artefatos duvidosos'],
    },
    skills: {
      Conhecimento: 3,
      Percepção: 2,
      Vontade: 2,
      Investigação: 1,
      Comunicação: 1,
    },
    maneuvers: ['sabe-das-coisas', 'mestre-pesquisa', 'contatos-submundo'],
    stress: {
      physical: [false, false, false],
      mental: [false, false, false],
    },
    consequences: {
      mild: null,
      moderate: null,
      severe: null,
    },
    fatePoints: 3,
    refresh: 3,
  },
  {
    name: 'Bruno "Martelo" Costa',
    avatar: '',
    drive: 'cavalo',
    aspects: {
      highConcept: 'Segurança de boate que caça monstros',
      drama: 'Nunca recuar de uma briga',
      job: 'Segurança e motorista',
      dreamBoard: 'Abrir uma escolta para caçadores',
      free: ['Corpo fechado por tatuagens', 'Amigos em todas as portarias'],
    },
    skills: {
      Combate: 3,
      Atletismo: 2,
      Intimidação: 2,
      Percepção: 1,
      Mecânica: 1,
    },
    maneuvers: ['melhor-defesa', 'espirito-equipe', 'instinto-sobrevivencia'],
    stress: {
      physical: [false, false, false],
      mental: [false, false, false],
    },
    consequences: {
      mild: null,
      moderate: null,
      severe: null,
    },
    fatePoints: 3,
    refresh: 3,
  },
  {
    name: 'Rafa "Circuito" Alves',
    avatar: '',
    drive: 'fui',
    aspects: {
      highConcept: 'Hacker de campo com ferramentas prontas',
      drama: 'Sempre aceito um desafio impossível',
      job: 'Técnico de redes',
      dreamBoard: 'Construir uma van-lab itinerante',
      free: ['Sempre tem um gadget a mão', 'Amigo de lojistas de eletrônicos'],
    },
    skills: {
      Tecnologia: 3,
      Pilotagem: 2,
      Conhecimento: 2,
      Furtividade: 1,
      Comunicação: 1,
    },
    maneuvers: ['estoque-fui', 'pilotagem-sagaz', 'mecanico-ocasiao'],
    stress: {
      physical: [false, false, false],
      mental: [false, false, false],
    },
    consequences: {
      mild: null,
      moderate: null,
      severe: null,
    },
    fatePoints: 3,
    refresh: 3,
  },
  {
    name: 'Cris "Rede" Santana',
    avatar: '',
    drive: 'os66',
    aspects: {
      highConcept: 'Organizadora que conecta caçadores',
      drama: 'Não posso deixar ninguém para trás',
      job: 'Assistente social',
      dreamBoard: 'Montar um centro comunitário anti-monstros',
      free: ['Tem o contato certo para cada bairro', 'Consegue favores em troca de favores'],
    },
    skills: {
      Comunicação: 3,
      Empatia: 2,
      Estrategia: 2,
      Investigação: 1,
      Atletismo: 1,
    },
    maneuvers: ['pessoas-conhecem-pessoas', 'imunidade-diplomatica', 'contatos-submundo'],
    stress: {
      physical: [false, false, false],
      mental: [false, false, false],
    },
    consequences: {
      mild: null,
      moderate: null,
      severe: null,
    },
    fatePoints: 3,
    refresh: 3,
  },
];

export function CharacterSeeder() {
  const { user } = useAuth();
  const { currentSession } = useSession();
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    setMessage(null);

    const sessionId = currentSession?.id || DEFAULT_SESSION_ID;
    const createdBy = user?.uid || 'seeder';

    try {
      const charactersRef = collection(db, 'characters');

      await Promise.all(
        SEED_CHARACTERS.map((character) =>
          addDoc(charactersRef, {
            ...character,
            sessionId,
            createdBy,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
        ),
      );

      setMessage('Personagens criados com sucesso!');
    } catch (error) {
      console.error('Erro ao criar personagens:', error);
      setMessage('Erro ao criar personagens. Verifique o console.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button variant="secondary" onClick={handleSeed} disabled={isSeeding}>
        {isSeeding ? 'Criando personagens...' : 'Popular personagens padrão'}
      </Button>
      {message && <p className="text-xs text-muted-foreground max-w-xs">{message}</p>}
    </div>
  );
}
