import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bookmark, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { PartyPanel } from './PartyPanel';
import { SceneAspects } from './SceneAspects';
import { CharacterHUD } from './CharacterHUD';
import { Character, SceneAspect } from '@/types/game';
import { PartyCharacter } from '@/types/session';

interface LeftSidebarProps {
  // Party
  partyCharacters: PartyCharacter[];
  myCharacterId?: string;
  onViewCharacter: (char: PartyCharacter) => void;
  onInvokeAspect: (characterName: string, aspect: string) => void;
  // Scene Aspects
  sceneAspects: SceneAspect[];
  onAddAspect: (name: string) => void;
  onInvokeSceneAspect: (aspectName: string, useFree?: boolean) => void;
  canEditAspects: boolean;
  // Character HUD
  selectedCharacter: Character | null;
  onSpendFate: () => void;
  onGainFate: () => void;
  onToggleStress: (track: 'physical' | 'mental', index: number) => void;
  onOpenFullSheet: () => void;
  onOpenDice: () => void;
}

type WidgetId = 'party' | 'aspects' | 'hud';

interface WidgetConfig {
  id: WidgetId;
  icon: typeof Users;
  label: string;
}

const widgets: WidgetConfig[] = [
  { id: 'party', icon: Users, label: 'Grupo' },
  { id: 'aspects', icon: Bookmark, label: 'Aspectos' },
  { id: 'hud', icon: User, label: 'Personagem' },
];

export function LeftSidebar(props: LeftSidebarProps) {
  const [openWidgets, setOpenWidgets] = useState<Record<WidgetId, boolean>>({
    party: true,
    aspects: true,
    hud: true,
  });
  const [collapsed, setCollapsed] = useState(false);

  const toggleWidget = (id: WidgetId) => {
    setOpenWidgets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case 'party':
        return props.partyCharacters.length > 0 ? (
          <PartyPanel
            partyCharacters={props.partyCharacters}
            myCharacterId={props.myCharacterId}
            onViewCharacter={props.onViewCharacter}
            onInvokeAspect={props.onInvokeAspect}
          />
        ) : (
          <p className="text-sm text-muted-foreground p-2">Nenhum jogador online.</p>
        );
      case 'aspects':
        return (
          <SceneAspects
            aspects={props.sceneAspects}
            onAddAspect={props.onAddAspect}
            onInvokeAspect={props.onInvokeSceneAspect}
            canEdit={props.canEditAspects}
          />
        );
      case 'hud':
        return props.selectedCharacter ? (
          <CharacterHUD
            character={props.selectedCharacter}
            onSpendFate={props.onSpendFate}
            onGainFate={props.onGainFate}
            onToggleStress={props.onToggleStress}
            onOpenFullSheet={props.onOpenFullSheet}
            onOpenDice={props.onOpenDice}
          />
        ) : (
          <p className="text-sm text-muted-foreground p-2">Selecione um personagem.</p>
        );
      default:
        return null;
    }
  };

  return (
    <motion.aside
      className="h-full flex flex-col bg-background/80 backdrop-blur-sm border-r border-border"
      initial={false}
      animate={{ width: collapsed ? 48 : 320 }}
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
                  className={`p-2 rounded transition-colors ${
                    isOpen ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-muted-foreground'
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
                        <div className="p-2 border-t border-border/50">
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
