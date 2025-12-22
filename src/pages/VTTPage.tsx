import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Share2, Check } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { GLOBAL_SESSION_ID, useSession } from '@/hooks/useSession';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';
import { SceneCanvas } from '@/components/vtt/SceneCanvas';
import { CharacterHUD } from '@/components/vtt/CharacterHUD';
import { SceneAspects } from '@/components/vtt/SceneAspects';
import { GameLog } from '@/components/vtt/GameLog';
import { Dock } from '@/components/vtt/Dock';
import { DiceRoller } from '@/components/vtt/DiceRoller';
import { SafetyCard } from '@/components/vtt/SafetyCard';
import { CharacterSheet } from '@/components/vtt/CharacterSheet';
import { CharacterSelect } from '@/components/vtt/CharacterSelect';
import { PartyPanel } from '@/components/vtt/PartyPanel';
import { Character } from '@/types/game';

interface LocationState {
  isGM?: boolean;
}

export function VTTPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  
  const { userProfile, loading: authLoading } = useAuth();
  const { currentSession, leaveSession, isGM } = useSession();
  const { partyCharacters } = usePartyCharacters();
  
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [viewingCharacter, setViewingCharacter] = useState<Character | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState(false);
  
  // Get session context from navigation state
  const pendingIsGM = locationState?.isGM;
  
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

  // Clear location state after reading to avoid re-joining on refresh
  useEffect(() => {
    if (locationState?.isGM !== undefined && activeCharacter) {
      // Clear the state from history
      window.history.replaceState({}, document.title);
    }
  }, [locationState, activeCharacter]);

  // Redirect to login if not authenticated
  if (!authLoading && !userProfile) {
    navigate('/');
    return null;
  }

  // Show character select if no active character
  if (!activeCharacter) {
    return (
      <CharacterSelect 
        onSelectCharacter={setActiveCharacter} 
        isGM={pendingIsGM}
      />
    );
  }

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(GLOBAL_SESSION_ID);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  const handleLeaveSession = async () => {
    await leaveSession();
    setActiveCharacter(null);
  };

  const handleInvokeAspect = (characterName: string, aspect: string) => {
    addLog(`${activeCharacter.name} invocou "${aspect}" de ${characterName}`, 'aspect');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Layer 0: Canvas */}
      <SceneCanvas scene={gameState.currentScene} />

      {/* Layer 1: UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar - Logo & Session Info */}
        <motion.div 
          className="absolute top-4 left-4 pointer-events-auto flex items-center gap-3"
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

          {/* Session Info */}
          {currentSession && (
            <div className="glass-panel px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {currentSession.name}
              </span>
              <button
                onClick={handleCopySessionId}
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Copiar código da sessão"
              >
                {copiedSessionId ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Share2 className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={handleLeaveSession}
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Sair da sessão"
              >
                <LogOut className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}
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
              {currentSession?.gmFatePool ?? gameState.gmFatePool}
            </span>
          </div>
        </motion.div>

        {/* Left Panel: Party + Character HUD */}
        <div className="absolute left-4 top-20 pointer-events-auto space-y-3">
          {/* Party Panel */}
          {partyCharacters.length > 0 && (
            <PartyPanel
              partyCharacters={partyCharacters}
              myCharacterId={activeCharacter?.id}
              onViewCharacter={(char) => setViewingCharacter(char)}
              onInvokeAspect={handleInvokeAspect}
            />
          )}

          {/* Character HUD */}
          {selectedCharacter && (
            <CharacterHUD
              character={selectedCharacter}
              onSpendFate={() => spendFatePoint(selectedCharacter.id)}
              onGainFate={() => gainFatePoint(selectedCharacter.id)}
              onToggleStress={(track, index) => toggleStress(selectedCharacter.id, track, index)}
              onOpenSheet={() => setIsSheetOpen(true)}
            />
          )}
        </div>

        {/* Right Panel: Scene Aspects */}
        <div className="absolute right-4 top-20 w-72 pointer-events-auto">
          <SceneAspects
            aspects={currentSession?.currentScene?.aspects || gameState.currentScene?.aspects || []}
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

      {/* Viewing another character's sheet */}
      {viewingCharacter && viewingCharacter.id !== activeCharacter?.id && (
        <CharacterSheet
          character={viewingCharacter}
          isOpen={true}
          onClose={() => setViewingCharacter(null)}
          onSpendFate={() => {}}
          onGainFate={() => {}}
          onToggleStress={() => {}}
        />
      )}
    </div>
  );
}
