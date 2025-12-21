import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { SceneCanvas } from '@/components/vtt/SceneCanvas';
import { CharacterHUD } from '@/components/vtt/CharacterHUD';
import { SceneAspects } from '@/components/vtt/SceneAspects';
import { GameLog } from '@/components/vtt/GameLog';
import { Dock } from '@/components/vtt/Dock';
import { DiceRoller } from '@/components/vtt/DiceRoller';
import { SafetyCard } from '@/components/vtt/SafetyCard';
import { CharacterSheet } from '@/components/vtt/CharacterSheet';
import { CharacterSelect } from '@/components/vtt/CharacterSelect';
import { Character } from '@/types/game';

export function VTTPage() {
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  
  const {
    gameState,
    selectedCharacter,
    rollDice,
    spendFatePoint,
    gainFatePoint,
    toggleStress,
    addSceneAspect,
    invokeAspect,
    addLog,
  } = useGameState(activeCharacter || undefined);

  const [isDiceOpen, setIsDiceOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Show character select if no active character
  if (!activeCharacter) {
    return <CharacterSelect onSelectCharacter={setActiveCharacter} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Layer 0: Canvas */}
      <SceneCanvas scene={gameState.currentScene} />

      {/* Layer 1: UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar - Logo */}
        <motion.div 
          className="absolute top-4 left-4 pointer-events-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-panel px-4 py-2">
            <h1 className="font-display text-2xl">
              <span className="text-primary text-glow-primary">#i</span>
              <span className="text-foreground">HUNT</span>
              <span className="text-muted-foreground text-sm ml-2 font-ui">VTT</span>
            </h1>
          </div>
        </motion.div>

        {/* GM Fate Pool */}
        <motion.div 
          className="absolute top-4 right-4 pointer-events-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-panel px-4 py-2 flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-ui uppercase tracking-wider">GM Pool</span>
            <span className="font-display text-2xl text-accent text-glow-accent">
              {gameState.gmFatePool}
            </span>
          </div>
        </motion.div>

        {/* Left Panel: Character HUD */}
        {selectedCharacter && (
          <div className="absolute left-4 top-20 pointer-events-auto">
            <CharacterHUD
              character={selectedCharacter}
              onSpendFate={() => spendFatePoint(selectedCharacter.id)}
              onGainFate={() => gainFatePoint(selectedCharacter.id)}
              onToggleStress={(track, index) => toggleStress(selectedCharacter.id, track, index)}
              onOpenSheet={() => setIsSheetOpen(true)}
            />
          </div>
        )}

        {/* Right Panel: Scene Aspects */}
        <div className="absolute right-4 top-20 w-72 pointer-events-auto">
          <SceneAspects
            aspects={gameState.currentScene?.aspects || []}
            onAddAspect={addSceneAspect}
            onInvokeAspect={invokeAspect}
          />
        </div>

        {/* Right Panel: Game Log */}
        <div className="absolute right-4 bottom-24 w-72 h-64 pointer-events-auto">
          <GameLog
            logs={gameState.logs}
            onSendMessage={(msg) => addLog(msg, 'chat')}
          />
        </div>

        {/* Bottom Dock */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
          <Dock
            onRollDice={() => setIsDiceOpen(true)}
            onOpenSheet={() => setIsSheetOpen(true)}
            onOpenSafety={() => setIsSafetyOpen(true)}
          />
        </div>
      </div>

      {/* Layer 2: Overlays */}
      <DiceRoller
        isOpen={isDiceOpen}
        onClose={() => setIsDiceOpen(false)}
        onRoll={rollDice}
        skills={selectedCharacter?.skills}
      />

      <SafetyCard
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />

      {selectedCharacter && (
        <CharacterSheet
          character={selectedCharacter}
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onSpendFate={() => spendFatePoint(selectedCharacter.id)}
          onGainFate={() => gainFatePoint(selectedCharacter.id)}
          onToggleStress={(track, index) => toggleStress(selectedCharacter.id, track, index)}
        />
      )}
    </div>
  );
}
