import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Sparkles, ChevronRight, Eye, Link as LinkIcon, Check, Copy, Crown } from 'lucide-react';
import { PartyCharacter } from '@/types/session';
import { Character } from '@/types/game';
import { isPresenceRecent } from '@/utils/presence';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface PartyPanelProps {
  partyCharacters: PartyCharacter[];
  myCharacterId?: string;
  onViewCharacter: (character: Character) => void;
  onInvokeAspect?: (characterName: string, aspect: string) => void;
  inviteCode?: string;
  gm?: {
    id: string;
    name: string;
    isOnline: boolean;
  };
  isGM?: boolean;
  onAddToScene?: (characterId: string) => void;
  onRemoveFromScene?: (characterId: string) => void;
  isCharacterInScene?: (characterId: string) => boolean;
  onUpdateCharacter?: (id: string, updates: Partial<Character>) => Promise<void>;
}

export function PartyPanel({
  partyCharacters,
  myCharacterId,
  onViewCharacter,
  onInvokeAspect,
  inviteCode,
  gm,
  isGM,
  onAddToScene,
  onRemoveFromScene,
  isCharacterInScene,
  onUpdateCharacter
}: PartyPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newAspectName, setNewAspectName] = useState("");
  const [targetCharId, setTargetCharId] = useState<string | null>(null);

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast({ title: "Código copiado!", description: "Compartilhe com seus jogadores." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Sort characters: Me first, then online, then others
  const sortedCharacters = [...partyCharacters].sort((a, b) => {
    if (a.id === myCharacterId) return -1;
    if (b.id === myCharacterId) return 1;
    // Online first
    if (isPresenceRecent(a.lastSeen) && !isPresenceRecent(b.lastSeen)) return -1;
    if (!isPresenceRecent(a.lastSeen) && isPresenceRecent(b.lastSeen)) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full space-y-4">
      {/* Invite Code */}
      {inviteCode && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Código da Campanha</span>
          <div className="p-2 bg-muted/40 rounded-lg border border-border flex items-center justify-between">
            <code className="text-[10px] font-mono select-all">
              {inviteCode}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopyCode}
              title="Copiar Código"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {/* GM Section */}
        {gm && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-2 flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${gm.isOnline ? 'bg-green-500' : 'bg-muted-foreground'}`}
                title={gm.isOnline ? 'Online' : 'Offline'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-sm font-bold text-primary truncate">{gm.name || 'Mestre'}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Mestre do Jogo</div>
            </div>
          </div>
        )}

        {/* Players Section */}
        {sortedCharacters.map((character) => {
          const isMe = character.id === myCharacterId;
          const isExpanded = expandedId === character.id;
          const isOnline = isPresenceRecent(character.lastSeen);
          const canEdit = isGM || isMe;

          const trackColor = (filled: boolean, type: 'physical' | 'mental') => {
            if (!filled) return 'bg-muted border-muted-foreground/30 hover:bg-muted-foreground/20';
            return type === 'physical' ? 'bg-red-500 border-red-600 hover:bg-red-600' : 'bg-blue-500 border-blue-600 hover:bg-blue-600';
          };

          const handleToggleStress = async (type: 'physical' | 'mental', index: number) => {
            if (!canEdit || !onUpdateCharacter) return;
            const track = character.stress[type];
            const newTrack = [...track];
            newTrack[index] = !newTrack[index];
            await onUpdateCharacter(character.id, {
              stress: { ...character.stress, [type]: newTrack }
            });
          };

          return (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-background/50 border border-border overflow-hidden"
            >
              {/* Character Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : character.id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors"
              >
                {/* Avatar & Presence */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                    {character.avatar ? (
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${isOnline ? 'bg-green-500' : 'bg-muted-foreground'}`}
                    title={isOnline ? 'Online' : 'Offline'}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  {/* Character Name (The Sheet) */}
                  <div className="font-display text-sm font-bold text-foreground leading-none mb-1">
                    {character.name}
                  </div>

                  {/* Player Name (The Person) */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="w-3 h-3 text-muted-foreground/70" />
                    <span className="truncate">
                      {character.ownerName}
                      {isMe && <span className="ml-1 text-[10px] text-primary font-bold">(Você)</span>}
                    </span>
                  </div>
                </div>

                {/* Compact Fate Points (Always Visible) */}
                <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md text-accent border border-accent/20">
                  <Sparkles className="w-3.5 h-3.5 fill-accent/20" />
                  <span className="font-display font-bold text-sm">
                    {character.fatePoints}
                  </span>
                </div>

                {/* Chevron */}
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground/50 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              {/* Expanded Actions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border bg-muted/30"
                  >
                    <div className="p-3 space-y-3">

                      {/* Stats Row: Class & Stress */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Archetype/Drive */}
                        <div className="col-span-2 bg-background/50 p-2 rounded border border-border/50">
                          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Classe / Drive</div>
                          <div className="text-xs font-medium capitalize">{character.drive || 'Desconhecido'}</div>
                        </div>

                        {/* Stress Tracks */}
                        <div className="bg-background/50 p-2 rounded border border-border/50 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold">Físico</span>
                          </div>
                          <div className="flex gap-1">
                            {character.stress.physical.map((filled, i) => (
                              <button
                                key={i}
                                onClick={() => handleToggleStress('physical', i)}
                                disabled={!canEdit}
                                className={`w-4 h-4 rounded-sm border transition-colors ${trackColor(filled, 'physical')} ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="bg-background/50 p-2 rounded border border-border/50 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold">Mental</span>
                          </div>
                          <div className="flex gap-1">
                            {character.stress.mental.map((filled, i) => (
                              <button
                                key={i}
                                onClick={() => handleToggleStress('mental', i)}
                                disabled={!canEdit}
                                className={`w-4 h-4 rounded-sm border transition-colors ${trackColor(filled, 'mental')} ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Consequences Section */}
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1 px-1">Consequências</div>
                        {(['mild', 'moderate', 'severe'] as const).map((severity) => {
                          const value = character.consequences[severity];
                          return (
                            <div key={severity} className="text-xs flex items-center gap-2 p-1.5 bg-background rounded border border-border/50">
                              <span className="text-[10px] font-bold uppercase text-muted-foreground w-12 shrink-0">
                                {severity === 'mild' ? 'Suave' : severity === 'moderate' ? 'Mod.' : 'Severa'}
                              </span>
                              {canEdit ? (
                                <input
                                  className="flex-1 bg-transparent border-none outline-none min-w-0"
                                  placeholder="Nenhuma"
                                  value={value || ''}
                                  onChange={(e) => onUpdateCharacter?.(character.id, {
                                    consequences: { ...character.consequences, [severity]: e.target.value }
                                  })}
                                />
                              ) : (
                                <span className="flex-1 text-muted-foreground italic truncate">{value || 'Nenhuma'}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>



                      {/* Situational Aspects List */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center px-1 mb-1">
                          <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Aspectos Situacionais</div>
                        </div>

                        {character.situationalAspects?.map((aspect) => (
                          <div key={aspect.id} className="flex items-center gap-1 group">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onInvokeAspect?.(character.name, aspect.name);
                              }}
                              className="flex-1 text-left text-xs p-2 rounded bg-background hover:bg-accent/10 hover:text-accent border border-border/50 hover:border-accent/30 transition-all flex items-center justify-between gap-2 shadow-sm"
                              title={`Clique para invocar: ${aspect.name}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Sparkles className="w-3 h-3 text-muted-foreground group-hover:text-accent mt-0.5 shrink-0" />
                                <span className="leading-snug truncate">{aspect.name}</span>
                              </div>
                              {aspect.freeInvokes > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-accent/20 text-accent rounded-full shrink-0">
                                  {aspect.freeInvokes}
                                </span>
                              )}
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => {
                                  const newAspects = character.situationalAspects?.filter(a => a.id !== aspect.id);
                                  onUpdateCharacter?.(character.id, { situationalAspects: newAspects });
                                }}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Check className="w-3 h-3 rotate-45" /> {/* Use X icon if imported, Check rotate is hacky. Let's assume I can import X or reused logic. */}
                              </button>
                            )}
                          </div>
                        ))}

                        {!character.situationalAspects?.length && (
                          <div className="text-xs text-muted-foreground text-center py-2 italic">
                            Sem aspectos situacionais.
                          </div>
                        )}

                        {canEdit && (
                          <div className="flex gap-1 mt-2">
                            <input
                              className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs"
                              placeholder="Novo aspecto..."
                              value={targetCharId === character.id ? newAspectName : ''}
                              onChange={(e) => {
                                setTargetCharId(character.id);
                                setNewAspectName(e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newAspectName.trim()) {
                                  const newAspect = { id: crypto.randomUUID(), name: newAspectName.trim(), freeInvokes: 1 };
                                  const current = character.situationalAspects || [];
                                  onUpdateCharacter?.(character.id, { situationalAspects: [...current, newAspect] });
                                  setNewAspectName("");
                                }
                              }}
                            />
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                              if (targetCharId === character.id && newAspectName.trim()) {
                                const newAspect = { id: crypto.randomUUID(), name: newAspectName.trim(), freeInvokes: 1 };
                                const current = character.situationalAspects || [];
                                onUpdateCharacter?.(character.id, { situationalAspects: [...current, newAspect] });
                                setNewAspectName("");
                              }
                            }}>
                              <Check className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* View Sheet Button */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewCharacter(character);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 p-2 rounded
                                       bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all text-xs font-bold uppercase tracking-wide opacity-80 hover:opacity-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ficha
                        </button>

                        {/* Add to Scene (Only for Owner or GM) */}
                        {(isMe || isGM) && onAddToScene && onRemoveFromScene && isCharacterInScene && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isCharacterInScene(character.id)) {
                                onRemoveFromScene(character.id);
                              } else {
                                onAddToScene(character.id);
                              }
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded border transition-all text-xs font-bold uppercase tracking-wide opacity-80 hover:opacity-100 ${isCharacterInScene(character.id)
                              ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20 hover:border-destructive/40'
                              : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20 hover:border-green-500/40'
                              }`}
                          >
                            {isCharacterInScene(character.id) ? (
                              <>Remover do Jogo</>
                            ) : (
                              <>Entrar no Jogo</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {partyCharacters.length === 0 && !gm && (
          <div className="text-center py-6 text-muted-foreground text-xs">
            Nenhum jogador na mesa.
          </div>
        )}
      </div>
    </div>
  );
}
