import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, MapPin, Skull, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { SceneManager } from './SceneManager';
import { MonsterDatabase, Monster } from './MonsterDatabase';
import { Scene, Character } from '@/types/game';
import { PartyCharacter } from '@/types/session';

interface GMPanelProps {
  scenes: Scene[];
  currentScene: Scene | null;
  onCreateScene: (scene: Omit<Scene, 'id'>) => void;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onDeleteScene: (sceneId: string) => void;
  onSetActiveScene: (sceneId: string) => void;
  monsters: Monster[];
  onAddMonsterToScene: (monster: Monster) => void;
  onCreateMonster: (monster: Omit<Monster, 'id'>) => void;
  onDeleteMonster: (monsterId: string) => void;
  partyCharacters: PartyCharacter[];
  onEditCharacter: (character: Character) => void;
}

type PanelSection = 'scenes' | 'monsters' | 'characters';

export function GMPanel({
  scenes,
  currentScene,
  onCreateScene,
  onUpdateScene,
  onDeleteScene,
  onSetActiveScene,
  monsters,
  onAddMonsterToScene,
  onCreateMonster,
  onDeleteMonster,
  partyCharacters,
  onEditCharacter,
}: GMPanelProps) {
  const [expandedSection, setExpandedSection] = useState<PanelSection | null>('scenes');

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
    icon: typeof MapPin; 
    label: string; 
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors rounded-lg"
    >
      <Icon className="w-4 h-4 text-secondary" />
      <span className="font-display text-sm flex-1 text-left">{label}</span>
      {typeof count === 'number' && (
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
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
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg border border-secondary/20 mb-3">
        <Crown className="w-4 h-4 text-secondary" />
        <span className="font-display text-sm text-secondary">Painel do GM</span>
      </div>

      {/* Scenes Section */}
      <div className="bg-muted/30 rounded-lg overflow-hidden">
        <SectionHeader section="scenes" icon={MapPin} label="Cenas" count={scenes.length} />
        {expandedSection === 'scenes' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-3 pb-3"
          >
            <SceneManager
              scenes={scenes}
              currentScene={currentScene}
              onCreateScene={onCreateScene}
              onUpdateScene={onUpdateScene}
              onDeleteScene={onDeleteScene}
              onSetActiveScene={onSetActiveScene}
            />
          </motion.div>
        )}
      </div>

      {/* Monsters Section */}
      <div className="bg-muted/30 rounded-lg overflow-hidden">
        <SectionHeader section="monsters" icon={Skull} label="Monstros" count={monsters.length} />
        {expandedSection === 'monsters' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-3 pb-3"
          >
            <MonsterDatabase
              monsters={monsters}
              onAddToScene={onAddMonsterToScene}
              onCreateMonster={onCreateMonster}
              onDeleteMonster={onDeleteMonster}
            />
          </motion.div>
        )}
      </div>

      {/* Characters Section */}
      <div className="bg-muted/30 rounded-lg overflow-hidden">
        <SectionHeader 
          section="characters" 
          icon={Users} 
          label="Personagens" 
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
                    <div className="font-display text-xs truncate">{character.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {character.ownerName || 'Sem jogador'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      character.isOnline ? 'bg-fate-plus' : 'bg-muted-foreground'
                    }`} />
                    <button
                      onClick={() => onEditCharacter(character)}
                      className="px-2 py-1 rounded text-[10px] font-ui bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
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
  );
}
