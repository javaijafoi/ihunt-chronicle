import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, MapPin, Database, Users, Users2 } from 'lucide-react';
import { SceneManager } from './SceneManager';
import { ArchetypeDatabase } from './ArchetypeDatabase';
import { ActiveNPCsPanel } from './ActiveNPCsPanel';
import { ActiveNPCSheet } from './ActiveNPCSheet';
import { Scene, Character, ActiveNPC } from '@/types/game';
import { PartyCharacter } from '@/types/session';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [activeTab, setActiveTab] = useState('scenes');
  const [selectedNPC, setSelectedNPC] = useState<ActiveNPC | null>(null);

  // Tabs Configuration
  const tabs = [
    { id: 'scenes', icon: MapPin, label: '', tooltip: 'Cenas' },
    { id: 'npcs', icon: Users2, label: '', tooltip: 'NPCs' },
    { id: 'archetypes', icon: Database, label: '', tooltip: 'Arquétipos' },
    { id: 'characters', icon: Users, label: '', tooltip: 'Personagens' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 border-b border-border flex-shrink-0">
        <Crown className="w-4 h-4 text-secondary" />
        <span className="font-display text-sm text-secondary">Painel do GM</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-2 pt-2 flex-shrink-0">
          <TabsList className="w-full grid grid-cols-4 bg-muted/50">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs gap-2">
                <tab.icon className="w-4 h-4" />
                <span className="sr-only md:not-sr-only md:inline-block">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-2 pb-2">

          <TabsContent value="scenes" className="m-0 h-full mt-0 space-y-2">
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
          </TabsContent>

          <TabsContent value="npcs" className="m-0 h-full mt-0">
            <ActiveNPCsPanel
              sessionId={sessionId}
              currentSceneId={currentScene?.id || null}
              onSelectNPC={setSelectedNPC}
            />
          </TabsContent>

          <TabsContent value="archetypes" className="m-0 h-full mt-0">
            <ArchetypeDatabase sessionId={sessionId} />
          </TabsContent>

          <TabsContent value="characters" className="m-0 h-full mt-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted text-xs text-muted-foreground mb-2">
                <Users className="w-3 h-3" />
                <span>{partyCharacters.length} personagens</span>
              </div>

              {partyCharacters.map((character) => (
                <div
                  key={character.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 overflow-hidden">
                    {character.avatar ? (
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-sm truncate">{character.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {character.ownerName || 'Sem jogador'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${character.isOnline ? 'bg-fate-plus' : 'bg-muted-foreground'
                      }`} />
                    <button
                      onClick={() => onEditCharacter(character)}
                      className="px-2 py-1 rounded text-[10px] font-ui bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              ))}

              {partyCharacters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>Nenhum personagem.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* NPC Sheet Dialog */}
      <Dialog open={!!selectedNPC} onOpenChange={(open) => !open && setSelectedNPC(null)}>
        <DialogContent className="p-0 border-none bg-transparent w-auto h-auto max-w-none shadow-none [&>button]:hidden focus:outline-none">
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
