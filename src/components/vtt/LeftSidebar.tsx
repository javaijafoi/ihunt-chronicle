import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bookmark, User, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { PartyPanel } from './PartyPanel';
import { CharacterHUD } from './CharacterHUD';
import { GMPanel } from './GMPanel';
import { Character, Scene } from '@/types/game';
import { PartyCharacter } from '@/types/session';

interface LeftSidebarProps {
  sessionId: string;
  // Party
  partyCharacters: PartyCharacter[];
  archivedCharacters?: PartyCharacter[];
  myCharacterId?: string;
  onViewCharacter: (char: PartyCharacter) => void;
  onInvokeAspect: (characterName: string, aspect: string) => void;
  gm?: {
    id: string;
    name: string;
    isOnline: boolean;
  };
  onAddCharacterToScene?: (characterId: string) => void;
  onRemoveCharacterFromScene?: (characterId: string) => void;
  isCharacterInScene?: (characterId: string) => boolean;
  // GM props
  isGM?: boolean;
  scenes?: Scene[];
  archivedScenes?: Scene[];
  currentScene?: Scene | null;
  sceneSearchQuery?: string;
  onSceneSearchChange?: (query: string) => void;
  onCreateScene?: (scene: Omit<Scene, 'id'>) => void | Promise<string | null>;
  onUpdateScene?: (sceneId: string, updates: Partial<Scene>) => void | Promise<void>;
  onDeleteScene?: (sceneId: string) => void | Promise<void>;
  onSetActiveScene?: (sceneId: string) => void | Promise<void>;
  onArchiveScene?: (sceneId: string) => void | Promise<void>;
  onUnarchiveScene?: (sceneId: string) => void | Promise<void>;
  minAspects?: number;
  onEditCharacter?: (character: Character) => void;
}

type WidgetId = 'gm' | 'party' | 'hud';

interface WidgetConfig {
  id: WidgetId;
  icon: typeof Users;
  label: string;
  gmOnly?: boolean;
}

const baseWidgets: WidgetConfig[] = [
  { id: 'gm', icon: Crown, label: 'Painel do GM', gmOnly: true },
  { id: 'party', icon: Users, label: 'Grupo' },
];

export function LeftSidebar(props: LeftSidebarProps) {
  const [openWidgets, setOpenWidgets] = useState<Record<WidgetId, boolean>>({
    gm: true,
    party: true,
    hud: true,
  });

  // Filter widgets based on GM status
  const widgets = baseWidgets.filter(w => !w.gmOnly || props.isGM);
  const [collapsed, setCollapsed] = useState(false);

  const toggleWidget = (id: WidgetId) => {
    setOpenWidgets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case 'gm':
        // Ensure we pass sessionId, as it's required by the new GMPanel
        // We might need to add sessionId to LeftSidebar props if it's not strictly available or mock it?
        // Wait, LeftSidebar props doesn't have sessionId explicitly typed above?
        // I need to check LeftSidebarProps.
        // VTTPage passes `sessionId={sessionId}` to LeftSidebar.
        // But let's check the interface. the interface doesn't have sessionId.
        // I should update interface first or fix it here.
        // VTTPage passed `sessionId` in the previous step but I need to accept it here.
        return props.isGM ? (
          <GMPanel
            sessionId={props.sessionId}
            scenes={props.scenes}
            archivedScenes={props.archivedScenes}
            currentScene={props.currentScene || null}
            sceneSearchQuery={props.sceneSearchQuery}
            onSceneSearchChange={props.onSceneSearchChange}
            onCreateScene={props.onCreateScene || (() => { })}
            onUpdateScene={props.onUpdateScene || (() => { })}
            onDeleteScene={props.onDeleteScene || (() => { })}
            onSetActiveScene={props.onSetActiveScene || (() => { })}
            onArchiveScene={props.onArchiveScene}
            onUnarchiveScene={props.onUnarchiveScene}
            minAspects={props.minAspects}

            // Re-added party props that GMPanel seems to take?
            // GMPanel takes partyCharacters and onEditCharacter.
            partyCharacters={props.partyCharacters}
            archivedCharacters={props.archivedCharacters}
            onEditCharacter={props.onEditCharacter || (() => { })}
          />
        ) : null;
      case 'party':
        return (
          <PartyPanel
            partyCharacters={props.partyCharacters}
            myCharacterId={props.myCharacterId}
            onViewCharacter={props.onViewCharacter}
            onInvokeAspect={props.onInvokeAspect}
            inviteCode={props.sessionId}
            gm={props.gm}
            isGM={props.isGM}
            onAddToScene={props.onAddCharacterToScene}
            onRemoveFromScene={props.onRemoveCharacterFromScene}
            isCharacterInScene={props.isCharacterInScene}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.aside
      className="h-full flex flex-col bg-background/80 backdrop-blur-sm border-r border-border"
      initial={false}
      animate={{ width: collapsed ? 56 : 380 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Collapse toggle */}
      <div className="p-2 flex justify-end border-b border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Widgets */}
      <div className="flex-1 overflow-y-auto">
        {collapsed ? (
          // Collapsed: show icons only
          <div className="flex flex-col items-center gap-2 py-2">
            {widgets.map((widget) => {
              const Icon = widget.icon;
              const isOpen = openWidgets[widget.id];
              return (
                <button
                  key={widget.id}
                  onClick={() => {
                    setCollapsed(false);
                    setOpenWidgets((prev) => ({ ...prev, [widget.id]: true }));
                  }}
                  className={`p-2 rounded transition-colors ${isOpen ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground'
                    }`}
                  title={widget.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        ) : (
          // Expanded: show full widgets
          <div className="p-2 space-y-2">
            {widgets.map((widget) => {
              const Icon = widget.icon;
              const isOpen = openWidgets[widget.id];
              return (
                <div key={widget.id} className="glass-panel overflow-hidden">
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-display text-sm flex-1 text-left">{widget.label}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 border-t border-border/50">
                          {renderWidgetContent(widget.id)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.aside>
  );
}
