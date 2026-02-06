import { useState, useMemo, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Dices, X, BookOpen, Home, Zap, Camera, Copy, Menu, UserCircle, Book, Info, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Controller
import { useGameController } from '@/hooks/useGameController';

// Components
import { MobilePlayerView } from '@/components/vtt/mobile/MobilePlayerView';
import { AspectHub } from '@/components/vtt/AspectHub';
import { SceneCanvas } from '@/components/vtt/SceneCanvas';
import { DiceRoller } from '@/components/vtt/DiceRoller';
import { CharacterSheet } from '@/components/vtt/CharacterSheet';
import { CharacterSelect } from '@/components/vtt/CharacterSelect';
import { ArchetypeDatabase } from '@/components/vtt/ArchetypeDatabase';
import { ActiveNPCSheet } from '@/components/vtt/ActiveNPCSheet';
import { CompelModal } from '@/components/vtt/CompelModal';
import { SelfieTimeline } from '@/components/vtt/SelfieTimeline';
import { NewSelfieForm } from '@/components/vtt/NewSelfieForm';
import { CreateAdvantageModal } from '@/components/vtt/CreateAdvantageModal';
import { LeftSidebar } from '@/components/vtt/LeftSidebar';
import { RightSidebar } from '@/components/vtt/RightSidebar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SafetyControls } from '@/components/vtt/safety/SafetyControls';
import { XCardOverlay } from '@/components/vtt/safety/XCardOverlay';

export const VTTPage = forwardRef<HTMLDivElement>((props, ref) => {
  const navigate = useNavigate();
  const controller = useGameController();

  // Destructure Controller
  const {
    user, signOut, isMobile,
    campaign, campaignId, isGM, myCharacter, activeCharacter, selectCharacter, campaignLoading,
    scenes, activeScene, activeNPCs, tokens, partyCharacters, archivedCharacters, mergedTokens,
    allAspects, logs, safetyState, mySettings, aggregatedLevels,
    handleRollDice,
    spendFatePoint,
    gainFatePoint,
    handleToggleStress,
    handleInvokeAspect,
    handleManualInvoke,
    handleRevokeAspect,
    handleDeleteSelfie,
    handleCreateSelfie,
    handleSetActiveScene,
    handleConfirmAdvantage,
    checkMalinaSabeDasCoisas,
    createToken, updateTokenPosition, updateToken, deleteToken,
    createScene, updateScene, deleteScene, archiveScene, unarchiveScene, sceneSearchQuery, setSceneSearchQuery, MIN_ASPECTS,
    updateNPC, addLog, triggerXCard, resolveXCard, togglePause, updateMySetting, updateFirebaseCharacter
  } = controller;

  // Local UI State
  const [viewingCharacterId, setViewingCharacterId] = useState<string | null>(null);
  const [presetSkill, setPresetSkill] = useState<string | null>(null);
  const [showAspects, setShowAspects] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [showArchetypes, setShowArchetypes] = useState(false);
  const [showSelfieAlbum, setShowSelfieAlbum] = useState(false);
  const [showNewSelfieForm, setShowNewSelfieForm] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const [showCreateAdvantageModal, setShowCreateAdvantageModal] = useState(false);
  const [pendingAdvantage, setPendingAdvantage] = useState<{
    outcome: 'tie' | 'success' | 'style';
    freeInvokes: number;
  } | null>(null);

  // Computed Views
  const viewingPC = useMemo(() => partyCharacters.find(c => c.id === viewingCharacterId) || null, [viewingCharacterId, partyCharacters]);
  const viewingNPC = useMemo(() => activeNPCs.find(c => c.id === viewingCharacterId) || null, [viewingCharacterId, activeNPCs]);

  // Wrappers
  const onHandleCreateAdvantageFromRoll = (outcome: 'tie' | 'success' | 'style', freeInvokes: number) => {
    setPendingAdvantage({ outcome, freeInvokes });
    setShowCreateAdvantageModal(true);
  };

  const onConfirmAdvantage = async (name: string, targetId: string, targetType: 'scene' | 'character' | 'npc', freeInvokes: number, isBoost: boolean, isPersistent: boolean) => {
    await handleConfirmAdvantage(name, targetId, targetType, freeInvokes, isBoost, isPersistent, user?.uid || 'system');
    setShowCreateAdvantageModal(false);
    setPendingAdvantage(null);
  };

  const handleSceneCanvasInvoke = (aspectName: string, useFreeInvoke: boolean = false) => {
    handleInvokeAspect(aspectName, 'scene', useFreeInvoke);
  };

  const buildTargetList = () => {
    const targets = [];
    if (activeScene) targets.push({ id: activeScene.id, name: activeScene.name, type: 'scene' as const });
    if (activeCharacter) targets.push({ id: activeCharacter.id, name: activeCharacter.name, type: 'character' as const });
    activeNPCs.filter(n => n.sceneId === activeScene?.id).forEach(npc => {
      targets.push({ id: npc.id, name: npc.name, type: 'npc' as const });
    });
    return targets;
  };

  // Loading
  if (campaignLoading || !campaign) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  // Force Selection
  if (!myCharacter && !isGM) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <h2 className="text-xl">Selecione seu Personagem</h2>
        <CharacterSelect onSelectCharacter={async (c) => { await selectCharacter(c.id); }} />
      </div>
    );
  }

  // Mobile View
  if (isMobile && !isGM && activeCharacter) {
    return (
      <MobilePlayerView
        character={activeCharacter}
        campaign={campaign}
        activeScene={activeScene ?? null}
        logs={logs}
        allAspects={allAspects}
        currentUserId={user?.uid}
        onRollDice={handleRollDice}
        onSpendFate={spendFatePoint}
        onToggleStress={handleToggleStress}
        onInvokeAspect={handleInvokeAspect}
        onSendMessage={(msg) => addLog(msg, 'chat', { avatar: activeCharacter.avatar })}
        onTriggerXCard={triggerXCard}
      />
    );
  }

  return (
    <div ref={ref} className="relative w-full h-screen overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <motion.header className="h-14 px-4 flex items-center justify-between shrink-0 border-b border-border bg-background/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg glass-panel hover:bg-muted focus:outline-none">
                <Menu className="w-5 h-5 text-primary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 glass-panel border-border">
              <DropdownMenuLabel>Menu Principal</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                  <UserCircle className="w-4 h-4" />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center gap-2 cursor-pointer">
                  <Home className="w-4 h-4" />
                  <span>Voltar para Lobby</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/about" className="flex items-center gap-2 cursor-pointer">
                  <Info className="w-4 h-4" />
                  <span>Sobre o #iHunt</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/codex" className="flex items-center gap-2 cursor-pointer">
                  <Book className="w-4 h-4" />
                  <span>Códice de Regras</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => { signOut(); navigate('/'); }}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair (Logout)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="glass-panel px-3 py-1.5"><h1 className="font-display text-xl text-primary">#iHUNT</h1></div>
          <div className="glass-panel px-2 py-1.5 text-xs text-muted-foreground">{campaign.title}</div>

          {/* Room Code */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(campaign.joinCode)
                      .then(() => toast({ title: "Código copiado!", description: "Compartilhe com seus jogadores." }));
                  } catch (e) {
                    toast({ title: "Erro ao copiar", description: "Copia manual.", variant: "destructive" });
                  }
                }}
                className="glass-panel px-2 py-1.5 flex items-center gap-1.5 hover:bg-muted/50 transition-colors group"
              >
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Sala:</div>
                <code className="text-xs font-mono font-bold text-accent group-hover:text-accent/80 transition-colors">
                  {campaign.joinCode}
                </code>
                <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Clique para copiar</p></TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => handleRollDice(0, undefined, undefined, 'normal')} className="p-2 glass-panel" title="Rolagem Rápida (4dF)">
            <Zap className="w-5 h-5" />
          </button>
          <button onClick={() => setShowAspects(!showAspects)} className="p-2 glass-panel" title="Aspectos em Jogo">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </button>
          <button onClick={() => setShowDice(!showDice)} className="p-2 glass-panel" title="Rolador de Dados"><Dices className="w-5 h-5" /></button>
          <button onClick={() => setShowSheet(!showSheet)} className="p-2 glass-panel" title="Ficha do Personagem"><BookOpen className="w-5 h-5" /></button>
          <button onClick={() => setShowSelfieAlbum(!showSelfieAlbum)} className="p-2 glass-panel" title="Álbum de Selfies"><Camera className="w-5 h-5" /></button>
          <SafetyControls mySettings={mySettings} aggregatedLevels={aggregatedLevels} onUpdateSetting={updateMySetting} onTriggerXCard={triggerXCard} onTogglePause={togglePause} />
        </div>
      </motion.header>

      <XCardOverlay safetyState={safetyState} currentUserId={user?.uid} isGM={isGM} onResolve={resolveXCard} />

      <Dialog open={showSelfieAlbum} onOpenChange={setShowSelfieAlbum}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 bg-background">
          <DialogTitle className="sr-only">Álbum de Selfies</DialogTitle>
          <SelfieTimeline
            partyCharacters={partyCharacters}
            myCharacter={myCharacter}
            onUpdateCharacter={updateFirebaseCharacter}
            isGM={isGM}
            currentUserId={user?.uid}
          />
        </DialogContent>
      </Dialog>

      <div className="flex-1 flex min-h-0">
        <LeftSidebar
          sessionId={campaign?.joinCode || ''}
          campaignId={campaign?.id || ''}
          partyCharacters={partyCharacters}
          archivedCharacters={archivedCharacters}
          myCharacterId={myCharacter?.id}
          onViewCharacter={(char) => setViewingCharacterId(char.id)}
          onInvokeAspect={(charName, aspectName) => handleManualInvoke(aspectName, charName)}
          isGM={isGM}
          scenes={scenes}
          archivedScenes={[]}
          currentScene={activeScene ?? null}
          onSetActiveScene={handleSetActiveScene}
          onCreateScene={createScene}
          onUpdateScene={updateScene}
          onDeleteScene={deleteScene}
          gm={controller.gmInfo}
          onAddCharacterToScene={async (characterId) => {
            const char = partyCharacters.find(c => c.id === characterId);
            if (!char || !activeScene) return;
            await createToken({
              type: 'character',
              characterId: char.id,
              name: char.name,
              avatar: char.avatar,
              x: 400,
              y: 300,
              isVisible: true
            });
            toast({ title: "Token adicionado" });
          }}
          onRemoveCharacterFromScene={async (characterId) => {
            const t = tokens.find(tk => tk.characterId === characterId);
            if (t) {
              await deleteToken(t.id);
              toast({ title: "Token removido" });
            }
          }}
          isCharacterInScene={(characterId) => tokens.some(t => t.characterId === characterId)}
          sceneSearchQuery={sceneSearchQuery}
          onSceneSearchChange={setSceneSearchQuery}
          onArchiveScene={archiveScene}
          onUnarchiveScene={unarchiveScene}
          minAspects={MIN_ASPECTS}
          onEditCharacter={(c) => setViewingCharacterId(c.id)}
          onUpdateCharacter={updateFirebaseCharacter}
        />

        <main className="flex-1 relative min-h-0">
          <AnimatePresence mode="wait">
            {showSheet && activeCharacter ? (
              <div className="absolute inset-0 z-20 bg-background overflow-auto p-4">
                <div className="max-w-4xl mx-auto bg-card p-6 rounded-xl">
                  <div className="flex justify-between mb-4">
                    <h2 className="text-2xl font-bold">{activeCharacter.name}</h2>
                    <button onClick={() => setShowSheet(false)}><X /></button>
                  </div>
                  <CharacterSheet
                    character={activeCharacter}
                    isOpen={true}
                    onClose={() => setShowSheet(false)}
                    readOnly={false}
                    onSkillClick={(s) => { setPresetSkill(s); setShowDice(true); }}
                    onAddSituationalAspect={async (name, freeInvokes) => {
                      const newAspect = { id: crypto.randomUUID(), name, freeInvokes };
                      const currentAspects = activeCharacter.situationalAspects || [];
                      await updateFirebaseCharacter(activeCharacter.id, { situationalAspects: [...currentAspects, newAspect] });
                    }}
                    onRemoveSituationalAspect={async (id) => {
                      const currentAspects = activeCharacter.situationalAspects || [];
                      await updateFirebaseCharacter(activeCharacter.id, { situationalAspects: currentAspects.filter(a => a.id !== id) });
                    }}
                    onUpdateNotes={async (notes) => updateFirebaseCharacter(activeCharacter.id, { notes })}
                    onUpdateSituationalAspect={async (id, updates) => {
                      const updated = (activeCharacter.situationalAspects || []).map(a => a.id === id ? { ...a, ...updates } : a);
                      await updateFirebaseCharacter(activeCharacter.id, { situationalAspects: updated });
                    }}
                    onInvokeAspect={(aspectName) => handleManualInvoke(aspectName, activeCharacter?.name || 'Personagem')}
                    onAddSelfie={() => setShowNewSelfieForm(true)}
                    onDeleteSelfie={(id) => handleDeleteSelfie(id, activeCharacter)}
                  />
                </div>
              </div>
            ) : (
              <SceneCanvas
                scene={activeScene ?? null}
                tokens={mergedTokens}
                aspects={activeScene?.aspects || []}
                onInvokeAspect={handleSceneCanvasInvoke}
                isGM={isGM}
                currentUserId={user?.uid}
                activeCharacterId={activeCharacter?.id}
                onMoveToken={updateTokenPosition}
                onDeleteToken={deleteToken}
                onSelectToken={(t) => setSelectedTokenId(t.id)}
                onToggleVisibility={(id) => { const t = tokens.find(x => x.id === id); if (t) updateToken(id, { isVisible: !t.isVisible }) }}
                selectedTokenId={selectedTokenId}
              />
            )}
          </AnimatePresence>

          {showDice && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[400px]">
              <div className="glass-panel p-3">
                <div className="flex justify-between mb-2"><h3>Rolador</h3><button onClick={() => setShowDice(false)}><X className="w-4 h-4" /></button></div>
                <DiceRoller
                  isOpen={true}
                  onClose={() => setShowDice(false)}
                  onRoll={handleRollDice}
                  skills={activeCharacter?.skills}
                  presetSkill={presetSkill}
                  fatePoints={activeCharacter?.fatePoints}
                  onSpendFate={() => activeCharacter && spendFatePoint(activeCharacter.id)}
                  sceneAspects={activeScene?.aspects || []}
                  myCharacter={activeCharacter}
                  partyCharacters={partyCharacters}
                  unifiedAspects={allAspects}
                  onInvokeAspect={handleInvokeAspect}
                  onRevokeAspect={handleRevokeAspect}
                  onAddLog={addLog}
                  isGM={isGM}
                  onCreateAdvantage={onHandleCreateAdvantageFromRoll}
                />
              </div>
            </div>
          )}
        </main>

        <RightSidebar logs={logs} onSendMessage={addLog} />
      </div>

      <Dialog open={showAspects} onOpenChange={setShowAspects}>
        <DialogContent className="max-w-md h-[80vh] p-0 bg-transparent border-none overflow-hidden shadow-2xl">
          <DialogTitle className="sr-only">Hub de Aspectos</DialogTitle>
          <AspectHub campaignId={campaignId || ''} onClose={() => setShowAspects(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingCharacterId} onOpenChange={(open) => !open && setViewingCharacterId(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 bg-background overflow-hidden">
          <DialogTitle className="sr-only">
            Visualizar Personagem
          </DialogTitle>
          {viewingPC && (
            <div className="flex flex-col h-full bg-card">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <CharacterSheet
                  character={viewingPC}
                  isOpen={true}
                  onClose={() => setViewingCharacterId(null)}
                  readOnly={!isGM && viewingPC.id !== myCharacter?.id}
                  variant="modal"
                  onInvokeAspect={(aspectName) => handleManualInvoke(aspectName, viewingPC.name)}
                  onSkillClick={(skill) => handleRollDice(viewingPC.skills[skill], skill, undefined, 'normal', undefined, false, viewingPC.name)}
                  onToggleStress={(track, index) => handleToggleStress(viewingPC.id, track, index)}
                  onSetConsequence={async (severity, value) => {
                    await updateFirebaseCharacter(viewingPC.id, { consequences: { ...viewingPC.consequences, [severity]: value } });
                    addLog(`${viewingPC.name} definiu consequência ${severity}: ${value || 'Removida'}`, 'fate');
                  }}
                  onSpendFate={async () => {
                    spendFatePoint(viewingPC.id);
                    addLog(`${viewingPC.name} gastou 1 Ponto de Destino`, 'fate');
                  }}
                  onGainFate={async () => {
                    gainFatePoint(viewingPC.id);
                    addLog(`${viewingPC.name} ganhou 1 Ponto de Destino`, 'fate');
                  }}
                  onAddSituationalAspect={async (name, freeInvokes) => {
                    const currentAspects = viewingPC.situationalAspects || [];
                    const newAspect = { id: crypto.randomUUID(), name, freeInvokes };
                    await updateFirebaseCharacter(viewingPC.id, { situationalAspects: [...currentAspects, newAspect] });
                  }}
                  onRemoveSituationalAspect={async (id) => {
                    const currentAspects = viewingPC.situationalAspects || [];
                    await updateFirebaseCharacter(viewingPC.id, { situationalAspects: currentAspects.filter(a => a.id !== id) });
                  }}
                  onUpdateSituationalAspect={async (id, updates) => {
                    const updated = (viewingPC.situationalAspects || []).map(a => a.id === id ? { ...a, ...updates } : a);
                    await updateFirebaseCharacter(viewingPC.id, { situationalAspects: updated });
                  }}
                  onUpdateNotes={async (notes) => updateFirebaseCharacter(viewingPC.id, { notes })}
                  onAddSelfie={(!isGM && viewingPC.id !== myCharacter?.id) ? undefined : () => setShowNewSelfieForm(true)}
                  onDeleteSelfie={(!isGM && viewingPC.id !== myCharacter?.id) ? undefined : (id) => handleDeleteSelfie(id, viewingPC)}
                />
              </div>
            </div>
          )}
          {viewingNPC && (
            <ActiveNPCSheet
              npc={viewingNPC}
              sessionId={campaignId || ''}
              onClose={() => setViewingCharacterId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showArchetypes} onOpenChange={setShowArchetypes}><DialogContent><DialogTitle>Base de Arquétipos</DialogTitle><ArchetypeDatabase sessionId={campaign.id} /></DialogContent></Dialog>

      <CompelModal campaignId={campaignId || ''} myCharacterId={myCharacter?.id} />

      {showNewSelfieForm && (activeCharacter || viewingPC) && (
        <NewSelfieForm
          characterId={(activeCharacter || viewingPC)!.id}
          isOpen={showNewSelfieForm}
          onClose={() => setShowNewSelfieForm(false)}
          onSubmit={(selfie) => handleCreateSelfie(selfie, (activeCharacter || viewingPC)!)}
          type="mood"
        />
      )}

      {showCreateAdvantageModal && pendingAdvantage && (
        <CreateAdvantageModal
          isOpen={showCreateAdvantageModal}
          onClose={() => setShowCreateAdvantageModal(false)}
          outcome={pendingAdvantage.outcome}
          freeInvokes={pendingAdvantage.freeInvokes}
          isBoost={pendingAdvantage.outcome === 'tie'}
          currentSceneName={activeScene?.name}
          targets={buildTargetList()}
          onConfirm={onConfirmAdvantage}
          hasPersistentManeuver={checkMalinaSabeDasCoisas(activeCharacter)}
        />
      )}
    </div>
  );
});
VTTPage.displayName = 'VTTPage';
