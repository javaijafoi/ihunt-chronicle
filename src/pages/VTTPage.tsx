import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Crown, Shield, Users, Bookmark, User, Dices } from 'lucide-react';
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
import { Roller3D, type Roller3DHandle } from '@/components/vtt/Roller3D';
import { useGameEvents } from '@/hooks/useGameEvents';
import { ActionType, Character } from '@/types/game';
import { PartyCharacter } from '@/types/session';
import { DraggableWindow } from '@/components/vtt/DraggableWindow';

export function VTTPage() {
  const navigate = useNavigate();
  const PRESENCE_RECENCY_TOLERANCE_MS = 10_000;
  
  const { user, userProfile, loading: authLoading } = useAuth();
  const { currentSession, leaveSession, isGM } = useSession();
  const { partyCharacters, presenceMap } = usePartyCharacters();
  
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [viewingCharacter, setViewingCharacter] = useState<PartyCharacter | Character | null>(null);
  const [presetSkill, setPresetSkill] = useState<string | null>(null);
  const rollerRef = useRef<Roller3DHandle | null>(null);
  
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
    createRollLog,
  } = useGameState(currentSession?.id || GLOBAL_SESSION_ID, activeCharacter || undefined);
  const {
    incomingRoll,
    emitRollEvent,
    acknowledgeRollEvent,
  } = useGameEvents(
    currentSession?.id || GLOBAL_SESSION_ID,
    user?.uid || currentSession?.id || GLOBAL_SESSION_ID,
  );

  const sessionStorageKey = currentSession?.id || GLOBAL_SESSION_ID;
  const [windows, setWindows] = useState({
    party: true,
    aspects: true,
    sheet: false,
    dice: false,
  });
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);

  const toggleWindow = (name: keyof typeof windows, value?: boolean) => {
    setWindows((prev) => ({
      ...prev,
      [name]: typeof value === 'boolean' ? value : !prev[name],
    }));
  };

  useEffect(() => {
    if (!activeCharacter || !user) return;

    const activePresence = Object.values(presenceMap).find(
      (presence) => presence.characterId === activeCharacter.id
    );

    const lastSeenTime = activePresence?.lastSeen?.getTime();
    const hasRecentPresence =
      typeof lastSeenTime === 'number' && Date.now() - lastSeenTime <= PRESENCE_RECENCY_TOLERANCE_MS;

    if (activePresence && activePresence.ownerId !== user.uid && hasRecentPresence) {
      setActiveCharacter(null);
      toast({
        title: 'Personagem desconectado',
        description: 'Outro jogador assumiu o controle deste personagem.',
        variant: 'destructive',
      });
    }
  }, [activeCharacter, presenceMap, user]);

  useEffect(() => {
    if (!incomingRoll) return;

    rollerRef.current?.roll(incomingRoll.result);
    acknowledgeRollEvent(incomingRoll.id);
  }, [acknowledgeRollEvent, incomingRoll]);

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
    toggleWindow('dice', true);
  };

  const handleLeaveSession = async () => {
    await leaveSession();
    setActiveCharacter(null);
  };

  const handleInvokeAspect = (characterName: string, aspect: string) => {
    addLog(`${activeCharacter.name} invocou "${aspect}" de ${characterName}`, 'aspect');
  };

  const handleRollDice = async (
    modifier: number = 0,
    skill: string | undefined,
    action: ActionType | undefined,
    type: 'normal' | 'advantage' = 'normal',
    opposition?: number
  ) => {
    const diceResult = rollDice(modifier, skill, action, type, opposition);

    void createRollLog(diceResult);

    try {
      const animation = rollerRef.current?.roll(diceResult);
      await emitRollEvent(diceResult);
      await (animation ?? Promise.resolve());
    } catch (error) {
      console.warn('Dice roll animation/event failed', error);
    }

    return diceResult;
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

      {/* Layer 1: UI - New Layout with sidebars */}
      <div className="absolute inset-0 pointer-events-none flex flex-col">
        {/* Top Bar */}
        <motion.div 
          className="h-16 px-4 pointer-events-auto flex items-center justify-between shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Left: Logo & Session Info */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="glass-panel px-4 py-2">
              <h1 className="font-display text-2xl">
                <span className="text-primary text-glow-primary">#i</span>
                <span className="text-foreground">HUNT</span>
                <span className="text-muted-foreground text-sm ml-2 font-ui">VTT</span>
              </h1>
            </div>

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
          </div>

          {/* Right: GM Fate Pool */}
          <div className="glass-panel px-4 py-2 flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-ui uppercase tracking-wider">GM Pool</span>
            <span className="font-display text-2xl text-accent text-glow-accent">
              {currentSession?.gmFatePool ?? gameState.gmFatePool}
            </span>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex min-h-0 px-4 gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto">
              {([
                { key: 'party', label: 'Grupo', icon: <Users className="w-5 h-5" /> },
                { key: 'aspects', label: 'Aspectos', icon: <Bookmark className="w-5 h-5" /> },
                { key: 'sheet', label: 'Ficha', icon: <User className="w-5 h-5" /> },
                { key: 'dice', label: 'Rolador', icon: <Dices className="w-5 h-5" /> },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleWindow(item.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors shadow-sm ${
                    windows[item.key]
                      ? 'border-primary bg-primary/10 text-primary glow-primary'
                      : 'border-border bg-background/70 hover:border-primary/40 text-foreground'
                  }`}
                  aria-pressed={windows[item.key]}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="absolute left-24 bottom-8 pointer-events-auto max-w-md">
              {selectedCharacter ? (
                <CharacterHUD
                  character={selectedCharacter}
                  onSpendFate={() => spendFatePoint(selectedCharacter.id)}
                  onGainFate={() => gainFatePoint(selectedCharacter.id)}
                  onToggleStress={(track, index) => toggleStress(selectedCharacter.id, track, index)}
                  onOpenSheet={() => toggleWindow('sheet', true)}
                  onOpenDice={() => openDiceRoller()}
                />
              ) : (
                <div className="glass-panel px-3 py-2 text-sm text-muted-foreground">
                  Nenhum personagem selecionado.
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Chat */}
          <motion.div 
            className="pointer-events-auto w-80 h-[calc(100%-4rem)]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GameLog
              logs={gameState.logs}
              onSendMessage={(msg) => addLog(msg, 'chat')}
            />
          </motion.div>
        </div>

        {/* Bottom Dock */}
        <div className="h-16 flex items-center justify-center pointer-events-auto shrink-0">
          <Dock
            onRollDice={() => openDiceRoller()}
            onOpenSheet={() => toggleWindow('sheet', true)}
            onOpenSafety={() => setIsSafetyOpen(true)}
            onHoldDice={() => rollerRef.current?.roll()}
          />
        </div>
      </div>

      <Roller3D ref={rollerRef} />

      <DraggableWindow
        title="Grupo"
        isOpen={windows.party}
        onClose={() => toggleWindow('party', false)}
        initialPosition={{ x: 32, y: 140 }}
        storageKey={`${sessionStorageKey}:party-window`}
      >
        {partyCharacters.length > 0 ? (
          <PartyPanel
            partyCharacters={partyCharacters}
            myCharacterId={activeCharacter?.id}
            onViewCharacter={(char) => setViewingCharacter(char)}
            onInvokeAspect={handleInvokeAspect}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum jogador online.</p>
        )}
      </DraggableWindow>

      <DraggableWindow
        title="Aspectos da Cena"
        isOpen={windows.aspects}
        onClose={() => toggleWindow('aspects', false)}
        initialPosition={{ x: 420, y: 160 }}
        className="w-[420px]"
        storageKey={`${sessionStorageKey}:scene-aspects-window`}
      >
        <SceneAspects
          aspects={currentSession?.currentScene?.aspects || gameState.currentScene?.aspects || []}
          onAddAspect={addSceneAspect}
          onInvokeAspect={invokeAspect}
          canEdit={isGM}
        />
      </DraggableWindow>

      <DraggableWindow
        title="Rolador de Dados"
        isOpen={windows.dice}
        onClose={() => {
          toggleWindow('dice', false);
          setPresetSkill(null);
        }}
        initialPosition={{ x: 220, y: 120 }}
        className="w-[520px]"
        storageKey={`${sessionStorageKey}:dice-roller-window`}
      >
        <DiceRoller
          variant="window"
          isOpen={windows.dice}
          onClose={() => {
            toggleWindow('dice', false);
            setPresetSkill(null);
          }}
          onRoll={handleRollDice}
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
      </DraggableWindow>

      {selectedCharacter && (
        <DraggableWindow
          title="Ficha do Personagem"
          isOpen={windows.sheet}
          onClose={() => toggleWindow('sheet', false)}
          initialPosition={{ x: 640, y: 80 }}
          className="w-[900px] max-w-[90vw]"
          storageKey={`${sessionStorageKey}:character-sheet:${selectedCharacter.id}`}
        >
          <CharacterSheet
            variant="window"
            character={selectedCharacter}
            isOpen={windows.sheet}
            onClose={() => toggleWindow('sheet', false)}
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
        </DraggableWindow>
      )}

      {/* Viewing another character's sheet */}
      {viewingCharacter && (
        <DraggableWindow
          title={`Ficha: ${viewingCharacter.name}`}
          isOpen={!!viewingCharacter}
          onClose={() => setViewingCharacter(null)}
          initialPosition={{ x: 680, y: 180 }}
          className="w-[900px] max-w-[90vw]"
          storageKey={`${sessionStorageKey}:viewing-sheet:${viewingCharacter.id}`}
        >
          <CharacterSheet
            variant="window"
            character={viewingCharacter}
            isOpen={!!viewingCharacter}
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
        </DraggableWindow>
      )}

      <SafetyCard
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />
    </div>
  );
}
