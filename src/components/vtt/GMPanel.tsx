import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, MapPin, Database, Users, Users2, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { SceneManager } from './SceneManager';
import { ArchetypeDatabase } from './ArchetypeDatabase';
import { ActiveNPCsPanel } from './ActiveNPCsPanel';
import { ActiveNPCSheet } from './ActiveNPCSheet';
import { Scene, Character, ActiveNPC } from '@/types/game';
import { PartyCharacter } from '@/types/session';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface GMPanelProps {
  sessionId: string;
  scenes: Scene[];
  archivedScenes?: Scene[];
  currentScene: Scene | null;
  sceneSearchQuery?: string;
  onSceneSearchChange?: (query: string) => void;
  onCreateScene: (scene: Omit<Scene, 'id'>) => void | Promise<string | null>;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void | Promise<void>;
  onDeleteScene: (sceneId: string) => void | Promise<void>;
  onSetActiveScene: (sceneId: string) => void | Promise<void>;
  onArchiveScene?: (sceneId: string) => void | Promise<void>;
  onUnarchiveScene?: (sceneId: string) => void | Promise<void>;
  minAspects?: number;
  // Characters
  partyCharacters: PartyCharacter[];
  onEditCharacter: (character: Character) => void;
}

type PanelSection = 'scenes' | 'active_npcs' | 'archetypes' | 'characters';

export function GMPanel({
  sessionId,
  scenes,
  archivedScenes = [],
  currentScene,
  sceneSearchQuery = '',
  onSceneSearchChange,
  onCreateScene,
  onUpdateScene,
  onDeleteScene,
  onSetActiveScene,
  onArchiveScene,
  onUnarchiveScene,
  minAspects = 3,
  partyCharacters,
  onEditCharacter,
}: GMPanelProps) {
  const [expandedSection, setExpandedSection] = useState<PanelSection | null>('scenes');
  const [selectedNPC, setSelectedNPC] = useState<ActiveNPC | null>(null);

  const toggleSection = (section: PanelSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const SectionHeader = ({
    section,
    icon: Icon,
    label,
    count
  }: {
    section: PanelSection;
    icon: any;
    label: string;
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors rounded-lg"
    >
      <Icon className="w-5 h-5 text-secondary" />
      <span className="font-display text-base flex-1 text-left">{label}</span>
      {typeof count === 'number' && (
        <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
          {count}
        </span>
      )}
      {expandedSection === section ? (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="space-y-1 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-secondary/10 rounded-lg border border-secondary/20 mb-3 flex-shrink-0">
        <Crown className="w-5 h-5 text-secondary" />
        <span className="font-display text-base text-secondary">Painel do GM</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {/* Scenes Section */}
        <div className="bg-muted/30 rounded-lg overflow-hidden flex-shrink-0">
          <SectionHeader section="scenes" icon={MapPin} label="Cenas" count={scenes.length} />
          {expandedSection === 'scenes' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="px-3 pb-3"
            >
              <SceneManager
                scenes={scenes}
                archivedScenes={archivedScenes}
                currentScene={currentScene}
                searchQuery={sceneSearchQuery}
                onSearchChange={onSceneSearchChange}
                onCreateScene={onCreateScene}
                onUpdateScene={onUpdateScene}
                onDeleteScene={onDeleteScene}
                onSetActiveScene={onSetActiveScene}
                onArchiveScene={onArchiveScene}
                onUnarchiveScene={onUnarchiveScene}
                minAspects={minAspects}
              />
            </motion.div>
          )}
        </div>

        {/* Active NPCs Section */}
        <div className="bg-muted/30 rounded-lg overflow-hidden flex-shrink-0">
          <SectionHeader section="active_npcs" icon={Users2} label="NPCs Ativos" />
          {expandedSection === 'active_npcs' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="px-3 pb-3"
            >
              <ActiveNPCsPanel
                sessionId={sessionId}
                currentSceneId={currentScene?.id || null}
                onSelectNPC={setSelectedNPC}
              />
            </motion.div>
          )}
        </div>

        {/* Archetypes Section */}
        <div className="bg-muted/30 rounded-lg overflow-hidden flex-shrink-0">
          <SectionHeader section="archetypes" icon={Database} label="Base de Arquétipos" />
          {expandedSection === 'archetypes' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="px-3 pb-3"
            >
              <ArchetypeDatabase sessionId={sessionId} />
            </motion.div>
          )}
        </div>

        {/* Characters Section */}
        <div className="bg-muted/30 rounded-lg overflow-hidden flex-shrink-0">
          <SectionHeader
            section="characters"
            icon={Users}
            label="Personagens (Jogadores)"
            count={partyCharacters.length}
          />
          {expandedSection === 'characters' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="px-3 pb-3"
            >
              <div className="space-y-2">
                {partyCharacters.map((character) => (
                  <div
                    key={character.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {character.avatar ? (
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm truncate">{character.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {character.ownerName || 'Sem jogador'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${character.isOnline ? 'bg-fate-plus' : 'bg-muted-foreground'
                        }`} />
                      <button
                        onClick={() => onEditCharacter(character)}
                        className="px-3 py-1.5 rounded text-xs font-ui bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}

                {partyCharacters.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p>Nenhum jogador na sessão</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* NPC Sheet Dialog */}
      <Dialog open={!!selectedNPC} onOpenChange={(open) => !open && setSelectedNPC(null)}>
        <DialogContent className="p-0 border-none bg-transparent w-auto h-auto max-w-none shadow-none">
          {selectedNPC && (
            <ActiveNPCSheet
              npc={selectedNPC}
              sessionId={sessionId}
              onClose={() => setSelectedNPC(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
