import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User, Trash2, Copy, Download, Upload, Play, Edit, Sparkles, Loader2, Users, ArrowLeft, Crown, Sword, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, Timestamp, type FirestoreError } from 'firebase/firestore';
import { Character } from '@/types/game';
import { useFirebaseCharacters } from '@/hooks/useFirebaseCharacters';
import { useCampaign } from '@/contexts/CampaignContext';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';
import { useAuth } from '@/hooks/useAuth';
import { CharacterCreator } from './CharacterCreator';
// Removed GMClaimDialog content
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { PRESENCE_STALE_MS } from '@/constants/presence';
import { Button } from '@/components/ui/button';

interface CharacterSelectProps {
  onSelectCharacter: (character: Character) => void;
}

type CharacterPresence = {
  ownerId: string;
  lastSeen: number;
};

type CharacterOccupancyStatus = 'free' | 'mine' | 'occupied' | 'stale';

type ViewState = 'lobby' | 'selection';

export function CharacterSelect({ onSelectCharacter }: CharacterSelectProps) {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { campaign, currentScene, selectCharacter: contextSelectCharacter, isGM } = useCampaign();
  const { partyCharacters } = usePartyCharacters(campaign?.id);

  const {
    characters,
    loading,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    duplicateCharacter,
  } = useFirebaseCharacters(campaign?.id); // Use campaign ID for characters

  const [view, setView] = useState<ViewState>('lobby');
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... (Presence Logic remains the same)
  // Placeholder for any other side effects, presence is now handled by partyCharacters hook
  useEffect(() => {
    // no-op
  }, []);

  const charactersTaken = useMemo<Map<string, CharacterPresence | null>>(() => {
    const map = new Map<string, CharacterPresence | null>();
    partyCharacters.forEach(pc => {
      if (pc.id) {
        map.set(pc.id, {
          ownerId: pc.ownerId,
          lastSeen: pc.lastSeen instanceof Date ? pc.lastSeen.getTime() : 0
        });
      }
    });
    return map;
  }, [partyCharacters]);

  const isPresencActive = (presence?: CharacterPresence | null) => {
    if (!presence) return false;
    return Date.now() - presence.lastSeen <= PRESENCE_STALE_MS;
  };

  const isCharacterInUse = (characterId: string) => isPresencActive(charactersTaken.get(characterId));
  const characterOwnerId = (characterId: string) => {
    const presence = charactersTaken.get(characterId);
    if (!isPresencActive(presence)) return null;
    return presence?.ownerId ?? null;
  };
  const isCharacterOwnedByCurrentUser = (characterId: string) => {
    if (!user?.uid) return false;
    return characterOwnerId(characterId) === user.uid;
  };

  const getCharacterOccupancyStatus = (characterId: string): CharacterOccupancyStatus => {
    const presence = charactersTaken.get(characterId);
    if (!presence) return 'free';
    if (!isPresencActive(presence)) return 'stale';
    if (presence.ownerId === user?.uid) return 'mine';
    return 'occupied';
  };

  const selectedCharacter = useMemo(
    () => characters.find((c) => c.id === selectedId) || null,
    [characters, selectedId]
  );

  const selectedStatus = selectedCharacter ? getCharacterOccupancyStatus(selectedCharacter.id) : null;
  const joinCtaLabel =
    selectedStatus === 'mine'
      ? 'Retomar'
      : selectedStatus === 'occupied'
        ? 'Forçar Entrada'
        : 'Entrar';

  const joinCtaClasses: Record<CharacterOccupancyStatus, string> = {
    mine: 'bg-blue-600 hover:bg-blue-500 text-white',
    occupied: 'bg-red-600 hover:bg-red-500 text-white',
    free: 'bg-green-600 hover:bg-green-500 text-white',
    stale: 'bg-green-600 hover:bg-green-500 text-white',
  };
  const joinButtonTone = selectedStatus ? joinCtaClasses[selectedStatus] : 'bg-primary hover:bg-primary/90 text-primary-foreground';
  const isJoinDisabled = !selectedCharacter || isJoining;

  const handleCreate = async (characterData: Omit<Character, 'id'>) => {
    if (editingCharacter) {
      await updateCharacter(editingCharacter.id, characterData);
      setEditingCharacter(undefined);
    } else {
      await createCharacter(characterData);
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setIsCreatorOpen(true);
  };

  const handleExport = () => {
    const json = JSON.stringify(characters, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ihunt-characters.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingCharacter(undefined); // Clear any active edit just in case
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        const imported = JSON.parse(json) as Character[];
        if (Array.isArray(imported)) {
          for (const char of imported) {
            const { id, ...data } = char;
            await createCharacter(data);
          }
        }
      } catch (error) {
        console.error('Error importing characters:', error);
        toast({ title: 'Erro ao importar', description: 'Arquivo inválido', variant: 'destructive' });
      }
      setIsImporting(false);
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePlay = async () => {
    const character = selectedCharacter;
    if (!character) return;
    // const shouldForceJoin = selectedStatus === 'occupied'; // Logic simplified

    setIsJoining(true);
    await contextSelectCharacter(character.id);
    setIsJoining(false);

    onSelectCharacter(character);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  // --- LOBBY VIEW ---
  if (view === 'lobby') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1614726365723-49cfae968602?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5" />

        <div className="relative z-10 w-full max-w-2xl space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-xl bg-card/80 border border-border backdrop-blur-md shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-display text-foreground">{campaign?.title || "Minha Campanha"}</h1>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Sessão Ativa</span>
                </div>
              </div>
            </div>

            <div className="flex-1 px-8">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Cena Atual
                  </div>
                  <div className="font-medium text-foreground">{currentScene?.name || "Sem cena ativa"}</div>
                </div>

                <div className="h-8 w-px bg-border/50" />

                <div>
                  <div className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Jogadores
                  </div>
                  <div className="font-medium text-foreground text-sm">
                    {partyCharacters.length} online
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2">Aspectos da Cena</div>
              <div className="flex gap-2 justify-end">
                {currentScene?.aspects && currentScene.aspects.length > 0 ? (
                  currentScene.aspects.slice(0, 3).map((aspect) => (
                    <span key={aspect.id} className="text-[10px] bg-cyan-950/50 text-cyan-400 border border-cyan-800/50 px-2 py-1 rounded">
                      {aspect.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">Nenhum aspecto</span>
                )}
              </div>
            </div>
          </div>

          {/* User Card */}
          <div className="p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="font-medium">{userProfile?.displayName || "Visitante"}</div>
                <div className="text-xs text-muted-foreground">Conectado</div>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-6">
            <h2 className="text-center text-xl font-display text-muted-foreground">Escolha como entrar</h2>

            <div className="grid gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('selection')}
                className="group relative p-6 h-24 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/50 transition-all text-left flex items-center gap-4 overflow-hidden"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sword className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-indigo-100">Jogar como Caçador</h3>
                  <p className="text-sm text-indigo-300/70">Entrar como jogador na sessão</p>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SELECTION VIEW ---
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-5xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl flex items-center gap-3">
              <span className="text-primary">#iHUNT</span>
              <span className="text-muted-foreground text-xl border-l border-border pl-3">Seleção de Personagem</span>
            </h1>
          </div>
          <Button variant="ghost" onClick={() => setView('lobby')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Lobby
          </Button>
        </div>

        {/* Character Grid */}
        <div className="glass-panel p-6 mb-6 min-h-[400px]">
          {characters.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <User className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-display text-xl text-muted-foreground mb-2">
                Nenhum personagem criado
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Crie seu primeiro caçador para começar a jogar
              </p>
              <Button
                onClick={() => {
                  setEditingCharacter(undefined);
                  setIsCreatorOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Personagem
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* New Character Card */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingCharacter(undefined);
                  setIsCreatorOpen(true);
                }}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg 
                         border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/5
                         transition-all min-h-[220px] group"
              >
                <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="font-ui text-muted-foreground group-hover:text-foreground">Novo Personagem</span>
              </motion.button>

              {/* Character Cards */}
              <AnimatePresence>
                {characters.map((character) => {
                  const canManage = !!user && (user.uid === character.createdBy || isGM);
                  const isInUse = isCharacterInUse(character.id);
                  const ownedByCurrentUser = isCharacterOwnedByCurrentUser(character.id);

                  return (
                    <motion.div
                      key={character.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedId(character.id === selectedId ? null : character.id)}
                      className={`relative flex flex-col p-4 rounded-lg cursor-pointer
                               transition-all min-h-[220px] ${character.id === selectedId
                          ? 'glass-panel border-2 border-primary shadow-lg shadow-primary/20'
                          : 'bg-muted/30 border border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                    >
                      {/* Avatar & Name */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border shrink-0 overflow-hidden">
                          {character.avatar ? (
                            <img
                              src={character.avatar}
                              alt={character.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-display text-base text-primary line-clamp-1 leading-tight mb-0.5"
                            title={character.name}
                          >
                            {character.name}
                          </h3>
                          <p
                            className="text-[10px] text-muted-foreground line-clamp-1 uppercase tracking-wider"
                            title={character.aspects.job || 'Sem emprego'}
                          >
                            {character.aspects.job || 'Desempregado'}
                          </p>
                        </div>
                      </div>

                      {isInUse && (
                        <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ownedByCurrentUser
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                          {ownedByCurrentUser ? 'Seu' : 'Ocupado'}
                        </div>
                      )}

                      {/* Aspects */}
                      <div className="flex-1 space-y-2 mb-2">
                        <div className="bg-background/50 p-2 rounded text-xs text-muted-foreground line-clamp-3 italic">
                          "{character.aspects.highConcept || 'Conceito indefinido'}"
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 pt-3 border-t border-border mt-auto">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                          <span className="font-display text-sm text-accent">{character.fatePoints}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground ml-auto">
                          {Object.keys(character.skills).length} Habilidades
                        </div>
                      </div>

                      {/* Actions (visible when selected) */}
                      {character.id === selectedId && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-14 left-0 right-0 z-20 flex flex-col gap-2 p-2 bg-background/95 backdrop-blur border border-border rounded-lg shadow-xl"
                        >
                          <Button
                            size="sm"
                            className={`w-full ${joinButtonTone}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlay();
                            }}
                            disabled={isJoinDisabled}
                          >
                            {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                            {joinCtaLabel}
                          </Button>

                          <div className="flex gap-2">
                            {canManage && (
                              <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(character);
                              }}>
                                <Edit className="w-3 h-3 mr-1" /> Editar
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="px-2" onClick={(e) => {
                              e.stopPropagation();
                              duplicateCharacter(character.id);
                            }}>
                              <Copy className="w-3 h-3" />
                            </Button>
                            {canManage && (
                              <Button size="sm" variant="destructive" className="px-2" onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Deletar personagem?')) {
                                  deleteCharacter(character.id);
                                  setSelectedId(null);
                                }
                              }}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={characters.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="gap-2"
            >
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Importar
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            {characters.length} personagens disponíveis
          </div>
        </div>
      </motion.div>

      {/* Character Creator Modal */}
      <CharacterCreator
        isOpen={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setEditingCharacter(undefined);
        }}
        onSave={handleCreate}
        editingCharacter={editingCharacter}
      />
    </div>
  );
}

