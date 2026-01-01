import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Sparkles, ChevronRight, Eye } from 'lucide-react';
import { PartyCharacter } from '@/types/session';
import { Character } from '@/types/game';
import { isPresenceRecent } from '@/utils/presence';

interface PartyPanelProps {
  partyCharacters: PartyCharacter[];
  myCharacterId?: string;
  onViewCharacter: (character: Character) => void;
  onInvokeAspect?: (characterName: string, aspect: string) => void;
}

export function PartyPanel({ 
  partyCharacters, 
  myCharacterId,
  onViewCharacter,
  onInvokeAspect 
}: PartyPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const freshCharacters = partyCharacters.filter((character) => {
    return isPresenceRecent(character.lastSeen);
  });

  if (freshCharacters.length === 0) {
    return (
      <div className="glass-panel p-4 w-72">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-display text-sm">Grupo</span>
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">
          Nenhum personagem na sessão
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 w-72 max-h-[60vh] overflow-y-auto">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-primary" />
        <span className="font-display text-sm">Grupo</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {freshCharacters.length} caçador{freshCharacters.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {freshCharacters.map((character) => {
            const isMe = character.id === myCharacterId;
            const isExpanded = expandedId === character.id;
            
            // Get visible aspects for invocation
            const visibleAspects = [
              character.aspects.highConcept,
              character.aspects.drama,
              character.aspects.job,
            ].filter(Boolean);

            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-lg bg-background/50 border border-border overflow-hidden"
              >
                {/* Character Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : character.id)}
                  className="w-full flex items-center gap-2 p-2 hover:bg-muted/50 transition-colors"
                >
                  {/* Online Indicator */}
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      isPresenceRecent(character.lastSeen) ? 'bg-green-500' : 'bg-muted-foreground'
                    }`} 
                    title={isPresenceRecent(character.lastSeen) ? 'Online' : 'Offline'}
                  />
                  
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {character.avatar ? (
                      <img 
                        src={character.avatar} 
                        alt={character.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  
                  {/* Name */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-1">
                      <span 
                        className="font-display text-sm truncate"
                        title={character.name}
                      >
                        {character.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-primary/20 text-primary shrink-0">
                          você
                        </span>
                      )}
                    </div>
                    <span 
                      className="text-[10px] text-muted-foreground line-clamp-1 block"
                      title={character.ownerName}
                    >
                      {character.ownerName}
                    </span>
                  </div>

                  {/* Fate Points */}
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span className="font-display text-sm text-accent">
                      {character.fatePoints}
                    </span>
                  </div>

                  <ChevronRight 
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border"
                    >
                      <div className="p-2 space-y-2">
                        {/* Visible Aspects */}
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Aspectos
                          </span>
                          <div className="space-y-1 mt-1">
                            {visibleAspects.map((aspect, i) => (
                              <button
                                key={i}
                                onClick={() => onInvokeAspect?.(character.name, aspect)}
                                className="w-full text-left text-xs p-1.5 rounded bg-muted/50 
                                         hover:bg-primary/20 transition-colors flex items-center gap-1"
                                title={`Clique para invocar: ${aspect}`}
                              >
                                <Sparkles className="w-3 h-3 text-accent flex-shrink-0" />
                                <span className="line-clamp-2 leading-snug">{aspect}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* View Full Sheet */}
                        <button
                          onClick={() => onViewCharacter(character)}
                          className="w-full flex items-center justify-center gap-1 p-1.5 rounded
                                   bg-primary/10 hover:bg-primary/20 transition-colors text-xs"
                        >
                          <Eye className="w-3 h-3" />
                          Ver Ficha Completa
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
