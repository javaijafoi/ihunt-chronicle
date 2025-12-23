import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Crown, Shield } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { GLOBAL_SESSION_ID, useSession } from '@/hooks/useSession';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';
import { toast } from '@/hooks/use-toast';
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
import { PartyCharacter } from '@/types/session';

export function VTTPage() {
  const navigate = useNavigate();
  
  const { user, userProfile, loading: authLoading } = useAuth();
  const { currentSession, leaveSession, isGM } = useSession();
  const { partyCharacters, presenceMap } = usePartyCharacters();
  
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [viewingCharacter, setViewingCharacter] = useState<PartyCharacter | Character | null>(null);
  const [presetSkill, setPresetSkill] = useState<string | null>(null);
  
  const {
    gameState,
    selectedCharacter,
    rollDice,
    spendFatePoint,
    gainFatePoint,
    toggleStress,
    setConsequence,
    addSceneAspect,
    invokeAspect,
    addLog,
  } = useGameState(currentSession?.id || GLOBAL_SESSION_ID, activeCharacter || undefined);

  const [isDiceOpen, setIsDiceOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (!activeCharacter || !user) return;

    const activePresence = Object.values(presenceMap).find(
      (presence) => presence.characterId === activeCharacter.id
    );

    if (activePresence && activePresence.ownerId !== user.uid) {
      setActiveCharacter(null);
      toast({
        title: 'Personagem desconectado',
        description: 'Outro jogador assumiu o controle deste personagem.',
        variant: 'destructive',
      });
    }
  }, [activeCharacter, presenceMap, user]);

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
      />
    );
  }

  const openDiceRoller = (skill?: string | null) => {
    setPresetSkill(skill ?? null);
    setIsDiceOpen(true);
  };

  const handleLeaveSession = async () => {
    await leaveSession();
    setActiveCharacter(null);
  };

  const handleInvokeAspect = (characterName: string, aspect: string) => {
    addLog(`${activeCharacter.name} invocou "${aspect}" de ${characterName}`, 'aspect');
  };

  const isSessionGM = user?.uid === currentSession?.gmId;
  const canManageCharacter = (character?: { id?: string } | null) =>
    isGM || (!!character?.id && character.id === activeCharacter?.id);
  const canManageViewingState = canManageCharacter(viewingCharacter);
  const canManageActiveState = canManageCharacter(selectedCharacter);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Layer 0: Canvas */}
      <SceneCanvas scene={gameState.currentScene} />

      {/* Layer 1: UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar - Logo & Session Info */}
        <motion.div 
          className="absolute top-4 left-4 pointer-events-auto flex items-center gap-3 flex-wrap"
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
            <div className="glass-panel px-3 py-2 flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  {currentSession.name}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                  Sessão Global
                </span>
              </div>
              {isGM && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs text-secondary">
                  <Crown className="w-3 h-3" />
                  GM
                </span>
              )}
              <button
                onClick={handleLeaveSession}
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Trocar de personagem"
              >
                <LogOut className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}

          {userProfile && (
            <div className="glass-panel px-3 py-2 flex items-center gap-3 shadow-lg/30 backdrop-blur-md">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-border/60 bg-muted">
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                    {(userProfile.displayName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground leading-tight">
                  {userProfile.displayName || 'Caçador'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  {isSessionGM ? (
                    <Crown className="w-3 h-3 text-secondary" />
                  ) : (
                    <Shield className="w-3 h-3 text-primary" />
                  )}
                  {isSessionGM ? 'Mestre da Mesa' : 'Caçador'}
                </span>
              </div>
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
              onOpenDice={() => openDiceRoller()}
            />
          )}
        </div>

        {/* Right Panel: Scene Aspects */}
        <div className="absolute right-4 top-20 w-72 pointer-events-auto">
          <SceneAspects
            aspects={currentSession?.currentScene?.aspects || gameState.currentScene?.aspects || []}
            onAddAspect={addSceneAspect}
            onInvokeAspect={invokeAspect}
            canEdit={isGM}
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
            onRollDice={() => openDiceRoller()}
            onOpenSheet={() => setIsSheetOpen(true)}
            onOpenSafety={() => setIsSafetyOpen(true)}
          />
        </div>
      </div>

      {/* Layer 2: Overlays */}
      <DiceRoller
        isOpen={isDiceOpen}
        onClose={() => {
          setIsDiceOpen(false);
          setPresetSkill(null);
        }}
        onRoll={rollDice}
        skills={selectedCharacter?.skills}
        presetSkill={presetSkill}
        fatePoints={selectedCharacter?.fatePoints}
        onSpendFate={() => {
          if (selectedCharacter) {
            spendFatePoint(selectedCharacter.id);
          }
        }}
        sceneAspects={currentSession?.currentScene?.aspects || gameState.currentScene?.aspects || []}
        myCharacter={selectedCharacter}
        partyCharacters={partyCharacters.map(pc => ({
          name: pc.name,
          aspects: pc.aspects,
        }))}
        onInvokeAspect={(aspectName, source, useFreeInvoke) => {
          if (useFreeInvoke) {
            invokeAspect(aspectName, true);
          } else {
            addLog(`${activeCharacter?.name} invocou "${aspectName}" de ${source}`, 'aspect');
          }
        }}
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
          onSpendFate={
            canManageActiveState ? () => spendFatePoint(selectedCharacter.id) : undefined
          }
          onGainFate={
            canManageActiveState ? () => gainFatePoint(selectedCharacter.id) : undefined
          }
          onToggleStress={
            canManageActiveState
              ? (track, index) => toggleStress(selectedCharacter.id, track, index)
              : undefined
          }
          onSetConsequence={
            canManageActiveState
              ? (severity, value) => setConsequence(selectedCharacter.id, severity, value)
              : undefined
          }
          readOnly={!canManageActiveState}
          onSkillClick={(skill) => openDiceRoller(skill)}
        />
      )}

      {/* Viewing another character's sheet */}
      {viewingCharacter && (
        <CharacterSheet
          character={viewingCharacter}
          isOpen={true}
          onClose={() => setViewingCharacter(null)}
          onSpendFate={
            canManageViewingState ? () => spendFatePoint(viewingCharacter.id) : undefined
          }
          onGainFate={
            canManageViewingState ? () => gainFatePoint(viewingCharacter.id) : undefined
          }
          onToggleStress={
            canManageViewingState
              ? (track, index) => toggleStress(viewingCharacter.id, track, index)
              : undefined
          }
          onSetConsequence={
            canManageViewingState
              ? (severity, value) => setConsequence(viewingCharacter.id, severity, value)
              : undefined
          }
          readOnly={!canManageViewingState}
        />
      )}
    </div>
  );
}
