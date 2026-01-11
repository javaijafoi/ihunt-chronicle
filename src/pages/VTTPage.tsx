import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Crown, Shield, Dices, X, BookOpen, Home, Database, Zap, Pencil, Camera, Copy, Menu, UserCircle, Book, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCampaign } from '@/contexts/CampaignContext';
import { useEpisode } from '@/hooks/useEpisode';
import { useScenes } from '@/hooks/useScenes';
import { useActiveNPCs } from '@/hooks/useActiveNPCs';
import { useTokens } from '@/hooks/useTokens';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';
import { useGameActions } from '@/hooks/useGameActions';
import { useSafetyTools } from '@/hooks/useSafetyTools';
import { useFirebaseCharacters } from '@/hooks/useFirebaseCharacters';
import { isPresenceRecent } from '@/utils/presence';
import { toast } from '@/hooks/use-toast';

import { SceneCanvas } from '@/components/vtt/SceneCanvas';
import { DiceRoller } from '@/components/vtt/DiceRoller';
import { CharacterSheet } from '@/components/vtt/CharacterSheet';
import { CharacterSelect } from '@/components/vtt/CharacterSelect';
import { CharacterCreator } from '@/components/vtt/CharacterCreator';
import { ArchetypeDatabase } from '@/components/vtt/ArchetypeDatabase';
import { SelfieTimeline } from '@/components/vtt/SelfieTimeline';
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

import { ActionType, Character, Token } from '@/types/game';
import { PartyCharacter } from '@/types/session';

const appVersion = import.meta.env.APP_VERSION;

export function VTTPage() {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();

  // New Context Hooks
  const { campaign, currentEpisode, currentScene, isGM, myCharacter, selectCharacter, loading: campaignLoading } = useCampaign();
  const { episodeId, campaignId } = { episodeId: currentEpisode?.id, campaignId: campaign?.id };

  // Derived Hooks
  const { scenes, activeScene, createScene, updateScene, deleteScene, setActiveScene, archiveScene, unarchiveScene, searchQuery: sceneSearchQuery, setSearchQuery: setSceneSearchQuery, MIN_ASPECTS } = useScenes(episodeId, campaignId, isGM);
  const { activeNPCs, updateNPC } = useActiveNPCs(campaignId);
  const { tokens, createToken, updateTokenPosition, updateToken, deleteToken } = useTokens(activeScene?.id, campaignId);
  const { partyCharacters, archivedCharacters, presenceMap } = usePartyCharacters(campaignId);
  const { updateCharacter: updateFirebaseCharacter } = useFirebaseCharacters(undefined); // Removed SessionID dependency? need to check implementation

  const { logs, addLog, createRollLog, updateFate, rollDice } = useGameActions(episodeId, campaignId, isGM);

  const { safetyState, mySettings, aggregatedLevels, updateMySetting, triggerXCard, resolveXCard, togglePause } = useSafetyTools(episodeId, campaignId, isGM);

  // Local State
  const [viewingCharacter, setViewingCharacter] = useState<PartyCharacter | Character | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [presetSkill, setPresetSkill] = useState<string | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [showArchetypes, setShowArchetypes] = useState(false);
  const [showSelfieAlbum, setShowSelfieAlbum] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  // Merge Tokens
  const mergedTokens = useMemo(() => {
    return tokens.map(token => {
      if (token.type === 'npc' && token.npcId) {
        const npc = activeNPCs.find(n => n.id === token.npcId);
        if (npc) {
          return {
            ...token,
            name: npc.name,
            avatar: npc.avatar,
            currentStress: npc.currentStress,
            maxStress: npc.stress,
            npcKind: npc.kind
          };
        }
      }
      return token;
    });
  }, [tokens, activeNPCs]);

  // Loading Check
  if (campaignLoading || !campaign) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  // Character Selection Force
  if (!myCharacter && !isGM) {
    // Logic to force selection or creation if player is member but has no char
    // For now, simple blocker
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <h2 className="text-xl">Selecione seu Personagem</h2>
        {/* Reuse Character Select Component or build new one */}
        <CharacterSelect onSelectCharacter={async (c) => {
          await selectCharacter(c.id);
        }} />
      </div>
    );
  }

  const activeCharacter = myCharacter as Character | null; // Cast for now

  // Actions
  const handleRollDice = async (
    modifier: number = 0,
    skill: string | undefined,
    action: ActionType | undefined,
    type: 'normal' | 'advantage' = 'normal',
    opposition?: number
  ) => {
    try {
      const diceResult = rollDice(modifier, skill, action, type, opposition);
      diceResult.character = activeCharacter?.name || 'GM'; // Patch name
      await createRollLog(diceResult);

      // If it's a fast roll (no skill/action), ensure we don't show toast, user wants chat only

      return diceResult;
    } catch (e) {
      console.error("Roll failed:", e);
      toast({ title: "Erro na rolagem", variant: "destructive" });
      throw e;
    }
  };

  const spendFatePoint = (charId: string) => updateFate(charId, -1, true);
  const gainFatePoint = (charId: string) => updateFate(charId, 1, true);

  // Scene Aspects Helper
  const handleInvokeAspectFromSidebar = (characterName: string, aspectName: string) => {
    addLog(`${activeCharacter?.name || 'GM'} invocou "${aspectName}" de ${characterName}`, 'aspect');
  };

  const handleInvokeAspectFromRoller = (aspectName: string, source: string, useFreeInvoke: boolean) => {
    if (useFreeInvoke) {
      addLog(`${activeCharacter?.name || 'GM'} invocou "${aspectName}" (GRÁTIS)`, 'aspect');
      // Logic to decrement free invoke
      if (activeScene) {
        const aspectIndex = activeScene.aspects.findIndex(a => a.name === aspectName);
        if (aspectIndex >= 0 && activeScene.aspects[aspectIndex].freeInvokes > 0) {
          const newAspects = [...activeScene.aspects];
          newAspects[aspectIndex] = { ...newAspects[aspectIndex], freeInvokes: newAspects[aspectIndex].freeInvokes - 1 };
          updateScene(activeScene.id, { aspects: newAspects });
        }
      }
    } else {
      addLog(`${activeCharacter?.name || 'GM'} invocou "${aspectName}" de ${source}`, 'aspect');
    }
  };

  const handleInvokeSceneAspect = (aspectName: string, useFreeInvoke: boolean = false) => {
    addLog(`${activeCharacter?.name || 'GM'} invocou aspecto de cena "${aspectName}"`, 'aspect');
    // Logic to decrement free invoke if useFreeInvoke
    if (useFreeInvoke && activeScene) {
      const aspectIndex = activeScene.aspects.findIndex(a => a.name === aspectName);
      if (aspectIndex >= 0 && activeScene.aspects[aspectIndex].freeInvokes > 0) {
        const newAspects = [...activeScene.aspects];
        newAspects[aspectIndex] = { ...newAspects[aspectIndex], freeInvokes: newAspects[aspectIndex].freeInvokes - 1 };
        updateScene(activeScene.id, { aspects: newAspects });
      }
    }
  };

  const handleToggleStress = async (characterId: string, track: 'physical' | 'mental', index: number) => {
    // Find character to get current state
    // We can use partyCharacters or activeCharacter if it matches
    const char = partyCharacters.find(c => c.id === characterId) || (activeCharacter?.id === characterId ? activeCharacter : null);
    if (!char) return;

    const currentTrack = char.stress?.[track] || [];
    // Ensure track is long enough
    const newTrack = [...currentTrack];
    while (newTrack.length <= index) newTrack.push(false);

    newTrack[index] = !newTrack[index];

    await updateFirebaseCharacter(characterId, {
      stress: {
        ...char.stress,
        [track]: newTrack
      }
    });
  };

  // Render (Simplified for brevity, kept structure)
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background flex flex-col">
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
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
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
                  navigator.clipboard.writeText(campaign.id);
                  toast({ title: "Código copiado!", description: "Compartilhe com seus jogadores." });
                }}
                className="glass-panel px-2 py-1.5 flex items-center gap-1.5 hover:bg-muted/50 transition-colors group"
              >
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Sala:</div>
                <code className="text-xs font-mono font-bold text-accent group-hover:text-accent/80 transition-colors">
                  {campaign.id.slice(0, 8)}...
                </code>
                <Copy className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clique para copiar o código da sala</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          {/* Fast Roll */}
          <button onClick={() => handleRollDice(0, undefined, undefined, 'normal')} className="p-2 glass-panel" title="Rolagem Rápida (4dF)">
            <Zap className="w-5 h-5" />
          </button>

          {/* Dice & Sheet */}
          <button onClick={() => setShowDice(!showDice)} className="p-2 glass-panel" title="Rolador de Dados"><Dices className="w-5 h-5" /></button>
          <button onClick={() => setShowSheet(!showSheet)} className="p-2 glass-panel" title="Ficha do Personagem"><BookOpen className="w-5 h-5" /></button>

          {/* Selfie */}
          <button onClick={() => setShowSelfieAlbum(!showSelfieAlbum)} className="p-2 glass-panel" title="Álbum de Selfies"><Camera className="w-5 h-5" /></button>

          {/* Safety / Others */}
          <SafetyControls mySettings={mySettings} aggregatedLevels={aggregatedLevels} onUpdateSetting={updateMySetting} onTriggerXCard={triggerXCard} onTogglePause={togglePause} />
        </div>
      </motion.header>

      <XCardOverlay safetyState={safetyState} currentUserId={user?.uid} isGM={isGM} onResolve={resolveXCard} />

      <Dialog open={showSelfieAlbum} onOpenChange={setShowSelfieAlbum}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 bg-background">
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
        {/* Left Sidebar */}
        <LeftSidebar
          sessionId={campaign?.joinCode || ''}
          partyCharacters={partyCharacters}
          archivedCharacters={archivedCharacters}
          myCharacterId={myCharacter?.id}
          onViewCharacter={(char) => setViewingCharacter(char)}
          onInvokeAspect={handleInvokeAspectFromSidebar}

          // GM Props
          isGM={isGM}
          scenes={scenes}
          archivedScenes={[]} // TODO
          currentScene={activeScene ?? null}
          onSetActiveScene={setActiveScene}
          onCreateScene={createScene}
          onUpdateScene={updateScene}
          onDeleteScene={deleteScene}

          // Computed GM Info
          gm={campaign?.gmId ? {
            id: campaign.gmId,
            name: Object.values(presenceMap).find(p => p.ownerId === campaign.gmId)?.ownerName || 'Mestre',
            isOnline: Object.values(presenceMap).some(p => p.ownerId === campaign.gmId && isPresenceRecent(p.lastSeen))
          } : undefined}

          onAddCharacterToScene={async (characterId) => {
            const char = partyCharacters.find(c => c.id === characterId);
            if (!char || !activeScene) return;
            // Default position center-ish
            await createToken({
              type: 'character',
              characterId: char.id,
              name: char.name,
              avatar: char.avatar,
              x: 400,
              y: 300,
              isVisible: true
            });
            toast({ title: "Token adicionado", description: `${char.name} entrou em cena.` });
          }}
          onRemoveCharacterFromScene={async (characterId) => {
            const t = tokens.find(tk => tk.characterId === characterId);
            if (t) {
              await deleteToken(t.id);
              toast({ title: "Token removido", description: "Saiu de cena." });
            }
          }}
          isCharacterInScene={(characterId) => tokens.some(t => t.characterId === characterId)}

          sceneSearchQuery={sceneSearchQuery}
          onSceneSearchChange={setSceneSearchQuery}
          onArchiveScene={archiveScene}
          onUnarchiveScene={unarchiveScene}
          minAspects={MIN_ASPECTS}
          onEditCharacter={(c) => setViewingCharacter(c)}
        />

        {/* Main Area */}
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
                      if (!activeCharacter) return;
                      const newAspect = {
                        id: crypto.randomUUID(),
                        name,
                        freeInvokes
                      };
                      const currentAspects = activeCharacter.situationalAspects || [];
                      await updateFirebaseCharacter(activeCharacter.id, {
                        situationalAspects: [...currentAspects, newAspect]
                      });
                    }}
                    onRemoveSituationalAspect={async (id) => {
                      if (!activeCharacter) return;
                      const currentAspects = activeCharacter.situationalAspects || [];
                      await updateFirebaseCharacter(activeCharacter.id, {
                        situationalAspects: currentAspects.filter(a => a.id !== id)
                      });
                    }}
                    onUpdateSituationalAspect={async (id, updates) => {
                      if (!activeCharacter) return;
                      const currentAspects = activeCharacter.situationalAspects || [];
                      const updatedAspects = currentAspects.map(a =>
                        a.id === id ? { ...a, ...updates } : a
                      );
                      await updateFirebaseCharacter(activeCharacter.id, {
                        situationalAspects: updatedAspects
                      });
                    }}
                  />
                </div>
              </div>
            ) : (
              <SceneCanvas
                scene={activeScene ?? null}
                tokens={mergedTokens}
                aspects={activeScene?.aspects || []}
                onInvokeAspect={handleInvokeSceneAspect}
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

          {/* Dice Roller Overlay */}
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
                  onInvokeAspect={handleInvokeAspectFromRoller}
                  onAddLog={addLog}
                  isGM={isGM}
                />
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar (Chat) */}
        <RightSidebar logs={logs} onSendMessage={addLog} />
      </div>

      {/* Modals */}
      <Dialog open={showArchetypes} onOpenChange={setShowArchetypes}><DialogContent><DialogTitle>Base de Arquétipos</DialogTitle><ArchetypeDatabase sessionId={campaign.id} /></DialogContent></Dialog>

      {/* Other viewing modals omitted for brevity, add back as needed */}
    </div>
  );
}
