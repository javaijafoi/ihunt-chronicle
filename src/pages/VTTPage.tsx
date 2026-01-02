import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Crown, Shield, Dices, X, BookOpen, Home, ArrowLeft } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { GLOBAL_SESSION_ID, useSession } from '@/hooks/useSession';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';
import { useScenes } from '@/hooks/useScenes';
import { useMonsters } from '@/hooks/useMonsters';
import { useTokens } from '@/hooks/useTokens';
import { toast } from '@/hooks/use-toast';
import { SceneCanvas } from '@/components/vtt/SceneCanvas';
import { DiceRoller } from '@/components/vtt/DiceRoller';
import { SafetyCard } from '@/components/vtt/SafetyCard';
import { CharacterSheet } from '@/components/vtt/CharacterSheet';
import { CharacterSelect } from '@/components/vtt/CharacterSelect';
import { LeftSidebar } from '@/components/vtt/LeftSidebar';
import { RightSidebar } from '@/components/vtt/RightSidebar';
import { ActionType, Character, Token } from '@/types/game';
import { PartyCharacter } from '@/types/session';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PRESENCE_STALE_MS } from '@/constants/presence';

export function VTTPage() {
  const navigate = useNavigate();

  const { user, userProfile, loading: authLoading } = useAuth();
  const { currentSession, leaveSession, isGM } = useSession();
  const { partyCharacters, presenceMap } = usePartyCharacters();

  // New hooks for Firebase persistence
  const { scenes, createScene, updateScene, deleteScene, setActiveScene } = useScenes(GLOBAL_SESSION_ID);
  const { monsters, createMonster, deleteMonster } = useMonsters(GLOBAL_SESSION_ID);
  const { tokens, createToken, updateTokenPosition, deleteToken } = useTokens(GLOBAL_SESSION_ID);

  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [viewingCharacter, setViewingCharacter] = useState<PartyCharacter | Character | null>(null);
  const [presetSkill, setPresetSkill] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

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
  } = useGameState(currentSession?.id || GLOBAL_SESSION_ID, activeCharacter || undefined, isGM);

  useEffect(() => {
    if (!activeCharacter || !user) return;

    const activePresence = Object.values(presenceMap).find(
      (presence) => presence.characterId === activeCharacter.id
    );

    const lastSeenTime = activePresence?.lastSeen?.getTime();
    const hasRecentPresence =
      typeof lastSeenTime === 'number' && Date.now() - lastSeenTime <= PRESENCE_STALE_MS;

    if (activePresence && activePresence.ownerId !== user.uid && hasRecentPresence) {
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

  // Show character select if no active character and not GM
  if (!activeCharacter && !isGM) {
    return <CharacterSelect onSelectCharacter={setActiveCharacter} />;
  }

  const openDiceRoller = (skill?: string | null) => {
    setPresetSkill(skill ?? null);
    setShowDice(true);
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
    return diceResult;
  };

  const isSessionGM = user?.uid === currentSession?.gmId;
  const canManageCharacter = (character?: { id?: string } | null) =>
    isGM || (!!character?.id && character.id === activeCharacter?.id);
  const canManageViewingState = isGM || canManageCharacter(viewingCharacter);
  const canManageActiveState = isGM || canManageCharacter(selectedCharacter);

  const sceneAspects = currentSession?.currentScene?.aspects || gameState.currentScene?.aspects || [];
  
  // Get active scene from Firebase scenes or fallback to gameState
  const activeScene = scenes.find(s => s.isActive) || gameState.currentScene;

  // Handler for adding monster to scene as token
  const handleAddMonsterToScene = async (monster: { id: string; name: string; avatar?: string }) => {
    await createToken({
      characterId: '', // Empty for monsters
      name: monster.name,
      avatar: monster.avatar,
      x: 50, // Center of canvas
      y: 50,
    });
    addLog(`${monster.name} adicionado à cena`, 'system');
  };

  // Handler for selecting a token
  const handleSelectToken = (token: Token) => {
    setSelectedTokenId(token.id === selectedTokenId ? null : token.id);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background flex flex-col">
      {/* Top Bar */}
      <motion.header
        className="h-14 px-4 flex items-center justify-between shrink-0 border-b border-border bg-background/90 backdrop-blur-sm z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Left: Navigation & Logo */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/"
                className="p-2 rounded-lg glass-panel hover:bg-muted transition-colors"
              >
                <Home className="w-4 h-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Página Inicial</TooltipContent>
          </Tooltip>

          <div className="glass-panel px-3 py-1.5">
            <h1 className="font-display text-xl">
              <span className="text-primary text-glow-primary">#i</span>
              <span className="text-foreground">HUNT</span>
            </h1>
          </div>

          {currentSession && (
            <div className="glass-panel px-2 py-1.5 flex items-center gap-2">
              <span className="text-xs text-muted-foreground truncate max-w-24">
                {currentSession.name}
              </span>
              {isGM && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-muted text-[10px] text-secondary">
                  <Crown className="w-2.5 h-2.5" />
                  GM
                </span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLeaveSession}
                    className="p-1 rounded hover:bg-muted transition-colors"
                  >
                    <LogOut className="w-3 h-3 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Trocar Personagem</TooltipContent>
              </Tooltip>
            </div>
          )}

          {userProfile && (
            <div className="glass-panel px-2.5 py-1.5 flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-border bg-muted">
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    {(userProfile.displayName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground leading-tight">
                  {userProfile.displayName || 'Caçador'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  {isSessionGM ? (
                    <Crown className="w-2.5 h-2.5 text-secondary" />
                  ) : (
                    <Shield className="w-2.5 h-2.5 text-primary" />
                  )}
                  {isSessionGM ? 'Mestre' : 'Caçador'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Action Buttons */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => openDiceRoller()}
                className={`p-2.5 rounded-lg transition-colors ${
                  showDice ? 'bg-primary text-primary-foreground' : 'glass-panel hover:bg-muted'
                }`}
              >
                <Dices className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Rolar Dados</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowSheet(!showSheet)}
                className={`p-2.5 rounded-lg transition-colors ${
                  showSheet ? 'bg-primary text-primary-foreground' : 'glass-panel hover:bg-muted'
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Ficha do Personagem</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsSafetyOpen(true)}
                className="p-2.5 rounded-lg glass-panel hover:bg-muted transition-colors"
              >
                <Shield className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Ferramentas de Segurança</TooltipContent>
          </Tooltip>
        </div>

        {/* Right: GM Fate Pool */}
        <div className="glass-panel px-3 py-1.5 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-ui uppercase tracking-wider">GM Pool</span>
          <span className="font-display text-xl text-accent text-glow-accent">
            {currentSession?.gmFatePool ?? gameState.gmFatePool}
          </span>
        </div>
      </motion.header>

      {/* Main 3-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar: Widgets */}
        <LeftSidebar
          partyCharacters={partyCharacters}
          myCharacterId={activeCharacter?.id}
          onViewCharacter={setViewingCharacter}
          onInvokeAspect={handleInvokeAspect}
          sceneAspects={sceneAspects}
          onAddAspect={addSceneAspect}
          onInvokeSceneAspect={invokeAspect}
          canEditAspects={isGM}
          selectedCharacter={selectedCharacter}
          onSpendFate={() => selectedCharacter && spendFatePoint(selectedCharacter.id)}
          onGainFate={() => selectedCharacter && gainFatePoint(selectedCharacter.id)}
          onToggleStress={(track, index) => selectedCharacter && toggleStress(selectedCharacter.id, track, index)}
          onOpenFullSheet={() => setShowSheet(true)}
          onOpenDice={() => openDiceRoller()}
          // GM props
          isGM={isGM}
          scenes={scenes}
          currentScene={activeScene || null}
          onCreateScene={createScene}
          onUpdateScene={updateScene}
          onDeleteScene={deleteScene}
          onSetActiveScene={setActiveScene}
          monsters={monsters}
          onAddMonsterToScene={handleAddMonsterToScene}
          onCreateMonster={createMonster}
          onDeleteMonster={deleteMonster}
          onEditCharacter={(character) => {
            setViewingCharacter(character as PartyCharacter);
          }}
        />

        {/* Center: Game Area or Character Sheet */}
        <main className="flex-1 relative min-h-0">
          <AnimatePresence mode="wait">
            {showSheet && selectedCharacter ? (
              <motion.div
                key="sheet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-background overflow-auto"
              >
                <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-background/90 backdrop-blur-sm border-b border-border">
                  <h2 className="font-display text-xl text-primary">Ficha do Personagem</h2>
                  <button
                    onClick={() => setShowSheet(false)}
                    className="p-2 rounded-lg glass-panel hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 max-w-5xl mx-auto">
                  <CharacterSheet
                    variant="window"
                    character={selectedCharacter}
                    isOpen={showSheet}
                    onClose={() => setShowSheet(false)}
                    onSpendFate={canManageActiveState ? () => spendFatePoint(selectedCharacter.id) : undefined}
                    onGainFate={canManageActiveState ? () => gainFatePoint(selectedCharacter.id) : undefined}
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
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <SceneCanvas
                  scene={activeScene || null}
                  tokens={tokens}
                  isGM={isGM}
                  onMoveToken={updateTokenPosition}
                  onDeleteToken={deleteToken}
                  onSelectToken={handleSelectToken}
                  selectedTokenId={selectedTokenId}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dice Roller Panel - Bottom center */}
          <AnimatePresence>
            {showDice && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[400px] max-w-[95%]"
              >
                <div className="glass-panel p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-base text-primary flex items-center gap-2">
                      <Dices className="w-4 h-4" />
                      Rolador
                    </h3>
                    <button
                      onClick={() => {
                        setShowDice(false);
                        setPresetSkill(null);
                      }}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <DiceRoller
                    variant="window"
                    isOpen={showDice}
                    onClose={() => {
                      setShowDice(false);
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
                    sceneAspects={sceneAspects}
                    myCharacter={selectedCharacter}
                    partyCharacters={partyCharacters.map((pc) => ({
                      name: pc.name,
                      aspects: pc.aspects,
                    }))}
                    onInvokeAspect={(aspectName, source, useFreeInvoke) => {
                      if (useFreeInvoke) {
                        invokeAspect(aspectName, true);
                      } else {
                        addLog(`${activeCharacter?.name || 'GM'} invocou "${aspectName}" de ${source}`, 'aspect');
                      }
                    }}
                    isGM={isGM}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Right Sidebar: Chat */}
        <RightSidebar logs={gameState.logs} onSendMessage={(msg) => addLog(msg, 'chat')} />
      </div>

      {/* Viewing another character's sheet */}
      <AnimatePresence>
        {viewingCharacter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-background/90 backdrop-blur-sm border-b border-border">
              <h2 className="font-display text-xl text-primary">{viewingCharacter.name}</h2>
              <button
                onClick={() => setViewingCharacter(null)}
                className="p-2 rounded-lg glass-panel hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-w-5xl mx-auto">
              <CharacterSheet
                variant="window"
                character={viewingCharacter}
                isOpen={!!viewingCharacter}
                onClose={() => setViewingCharacter(null)}
                onSpendFate={canManageViewingState ? () => spendFatePoint(viewingCharacter.id) : undefined}
                onGainFate={canManageViewingState ? () => gainFatePoint(viewingCharacter.id) : undefined}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SafetyCard isOpen={isSafetyOpen} onClose={() => setIsSafetyOpen(false)} isGM={isGM} />
    </div>
  );
}
