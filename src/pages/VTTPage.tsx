import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Crown, Shield, Dices, X, BookOpen, Home, Database, Zap, Pencil, Camera, Copy, Menu, UserCircle, Book, Info, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCampaign } from '@/contexts/CampaignContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobilePlayerView } from '@/components/vtt/mobile/MobilePlayerView';

import { useScenes } from '@/hooks/useScenes';
import { useActiveNPCs } from '@/hooks/useActiveNPCs';
import { useTokens } from '@/hooks/useTokens';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';
import { useGameActions } from '@/hooks/useGameActions';
import { useSafetyTools } from '@/hooks/useSafetyTools';
import { useFirebaseCharacters } from '@/hooks/useFirebaseCharacters';
import { isPresenceRecent } from '@/utils/presence';
import { toast } from '@/hooks/use-toast';
import { useAspects } from '@/hooks/useAspects';

import { AspectHub } from '@/components/vtt/AspectHub';
import { SceneCanvas } from '@/components/vtt/SceneCanvas';
import { DiceRoller } from '@/components/vtt/DiceRoller';
import { CharacterSheet } from '@/components/vtt/CharacterSheet';
import { CharacterSelect } from '@/components/vtt/CharacterSelect';
import { CharacterCreator } from '@/components/vtt/CharacterCreator';
import { ArchetypeDatabase } from '@/components/vtt/ArchetypeDatabase';
import { ActiveNPCSheet } from '@/components/vtt/ActiveNPCSheet';
import { CompelModal } from '@/components/vtt/CompelModal';
import { SelfieTimeline } from '@/components/vtt/SelfieTimeline';
import { NewSelfieForm } from '@/components/vtt/NewSelfieForm';
import { CreateAdvantageModal } from '@/components/vtt/CreateAdvantageModal';
import { useCreateAdvantage } from '@/hooks/useCreateAdvantage';
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

import { ActionType, Character, Token, Selfie } from '@/types/game';
import { PartyCharacter } from '@/types/session';

const appVersion = import.meta.env.APP_VERSION;

import { forwardRef } from 'react';

export const VTTPage = forwardRef<HTMLDivElement>((props, ref) => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const isMobile = useIsMobile();

  // New Context Hooks
  const { campaign, currentScene, isGM, myCharacter, selectCharacter, loading: campaignLoading } = useCampaign();
  const { campaignId } = { campaignId: campaign?.id };

  // Derived Hooks
  const { scenes, activeScene, createScene, updateScene, deleteScene, setActiveScene, archiveScene, unarchiveScene, searchQuery: sceneSearchQuery, setSearchQuery: setSceneSearchQuery, MIN_ASPECTS } = useScenes(campaignId, isGM);
  const { activeNPCs, updateNPC } = useActiveNPCs(campaignId);
  const { tokens, createToken, updateTokenPosition, updateToken, deleteToken } = useTokens(activeScene?.id, campaignId);
  const { partyCharacters, archivedCharacters, presenceMap } = usePartyCharacters(campaignId);
  const { updateCharacter: updateFirebaseCharacter } = useFirebaseCharacters(undefined); // Removed SessionID dependency? need to check implementation

  // Track Last Visited
  useEffect(() => {
    if (campaignId) {
      localStorage.setItem('ihunt_last_campaign', campaignId);
    }
  }, [campaignId]);

  const { logs, addLog, createRollLog, updateFate, rollDice } = useGameActions(campaignId, isGM);


  const { allAspects, invokeAspect, revokeInvocation } = useAspects(campaignId || '', activeScene?.id);
  const { createAdvantage } = useCreateAdvantage(campaignId || '');

  const { safetyState, mySettings, aggregatedLevels, updateMySetting, triggerXCard, resolveXCard, togglePause } = useSafetyTools(campaignId, isGM);

  // Local State
  const [viewingCharacterId, setViewingCharacterId] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null); // Kept if needed, or remove? Left for safety
  const [presetSkill, setPresetSkill] = useState<string | null>(null);
  const [showAspects, setShowAspects] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [showArchetypes, setShowArchetypes] = useState(false);
  const [showSelfieAlbum, setShowSelfieAlbum] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showNewSelfieForm, setShowNewSelfieForm] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  // Create Advantage State
  const [showCreateAdvantageModal, setShowCreateAdvantageModal] = useState(false);
  const [pendingAdvantage, setPendingAdvantage] = useState<{
    outcome: 'tie' | 'success' | 'style';
    freeInvokes: number;
  } | null>(null);

  // Derived Viewing Characters
  const viewingPC = useMemo(() => {
    if (!viewingCharacterId) return null;
    return partyCharacters.find(c => c.id === viewingCharacterId) || null;
  }, [viewingCharacterId, partyCharacters]);

  const viewingNPC = useMemo(() => {
    if (!viewingCharacterId) return null;
    return activeNPCs.find(c => c.id === viewingCharacterId) || null;
  }, [viewingCharacterId, activeNPCs]);

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
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <h2 className="text-xl">Selecione seu Personagem</h2>
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
    opposition?: number,
    isHidden?: boolean,
    characterNameOverride?: string
  ) => {
    try {
      const diceResult = rollDice(modifier, skill, action, type, opposition);
      diceResult.character = characterNameOverride || activeCharacter?.name || 'GM';
      await createRollLog(diceResult);

      return diceResult;
    } catch (e) {
      console.error("Roll failed:", e);
      toast({ title: "Erro na rolagem", variant: "destructive" });
      throw e;
    }
  };

  const spendFatePoint = (charId: string) => updateFate(charId, -1, true);

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

  // Mobile View Integration
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
        onSpendFate={(charId) => updateFate(charId, -1, true)}
        onToggleStress={handleToggleStress}
        // Adapt invoke logic to match signature expected by MobilePlayerView vs simplified handler
        onInvokeAspect={(name, source, free) => handleInvokeAspectFromRoller(name, source, free)}
        onSendMessage={(msg) => addLog(msg, 'chat', { avatar: activeCharacter.avatar })}
        onTriggerXCard={triggerXCard}
      />
    );
  }
  const gainFatePoint = (charId: string) => updateFate(charId, 1, true);

  // Scene Aspects Helper
  const handleInvokeAspectFromSidebar = (characterName: string, aspectName: string) => {
    // Legacy support or just log if aspect object not found
    const aspect = allAspects.find(a => a.name === aspectName && (a.ownerName === characterName || a.ownerType === 'character')); // Loose match
    if (aspect) {
      invokeAspect(aspect, false);
    } else {
      // Fallback
      addLog(`${activeCharacter?.name || 'GM'} invocou "${aspectName}" de ${characterName}`, 'aspect');
      updateFate(activeCharacter?.id || '', -1, true);
    }
  };

  const handleInvokeAspectFromRoller = (aspectName: string, source: string, useFreeInvoke: boolean) => {
    const aspect = allAspects.find(a => a.name === aspectName);
    if (aspect) {
      invokeAspect(aspect, useFreeInvoke);
    } else {
      // Fallback logic if aspect not found in unified list
      if (useFreeInvoke) {
        addLog(`${activeCharacter?.name || 'GM'} invocou "${aspectName}" (GRÁTIS)`, 'aspect');
        // Manual decrement logic fallback...
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
        if (activeCharacter) spendFatePoint(activeCharacter.id);
      }
    }
  };

  const handleInvokeSceneAspect = (aspectName: string, useFreeInvoke: boolean = false) => {
    const aspect = allAspects.find(a => a.name === aspectName && a.ownerType === 'scene');
    if (aspect) {
      invokeAspect(aspect, useFreeInvoke);
    } else {
      // Fallback
      addLog(`${activeCharacter?.name || 'GM'} invocou aspecto de cena "${aspectName}"`, 'aspect');
      if (useFreeInvoke && activeScene) {
        const aspectIndex = activeScene.aspects.findIndex(a => a.name === aspectName);
        if (aspectIndex >= 0 && activeScene.aspects[aspectIndex].freeInvokes > 0) {
          const newAspects = [...activeScene.aspects];
          newAspects[aspectIndex] = { ...newAspects[aspectIndex], freeInvokes: newAspects[aspectIndex].freeInvokes - 1 };
          updateScene(activeScene.id, { aspects: newAspects });
        }
      } else if (!useFreeInvoke && activeCharacter) {
        spendFatePoint(activeCharacter.id);
      }
    }
  };

  const handleRevokeAspect = (aspectName: string, source: string, wasFree: boolean) => {
    // Try to find aspect in unified list
    const aspect = allAspects.find(a => a.name === aspectName);
    if (aspect) {
      revokeInvocation(aspect, wasFree);
    } else {
      // Fallback log
      addLog(`${activeCharacter?.name || 'GM'} desfez invocação de "${aspectName}" manually (no unified match)`, 'system');
      // If was free, might need manual restoration if not found in list?
      // Assuming unified list covers it.
    }
  };



  // Selfie Handlers
  const handleDeleteSelfie = async (selfieId: string) => {
    const char = activeCharacter || viewingPC;
    if (!char) return;
    if (!confirm('Tem certeza que deseja apagar esta selfie?')) return;

    const updatedSelfies = (char.selfies || []).filter(s => s.id !== selfieId);
    await updateFirebaseCharacter(char.id, { selfies: updatedSelfies });
    toast({ title: 'Selfie removida' });
  };

  const handleCreateSelfie = async (newSelfie: Selfie) => {
    const char = activeCharacter || viewingPC;
    if (!char) return;

    const updatedSelfies = [newSelfie, ...(char.selfies || [])];
    await updateFirebaseCharacter(char.id, { selfies: updatedSelfies });
  };

  const handleSetActiveScene = async (newSceneId: string) => {
    // 1. Scene Change Logic: Clean up old scene and characters BEFORE switching (or in parallel)

    if (isGM) {
      // A. Clean Characters
      for (const char of partyCharacters) {
        if (!char.situationalAspects || char.situationalAspects.length === 0) continue;

        const keptAspects = char.situationalAspects.filter(a => {
          // Keep if persistent OR not temporary (legacy support: if isPersistent undefined, assume temporary if logic demands, but here we trust flag)
          // useCreateAdvantage sets isTemporary = !isPersistent.
          if (a.isPersistent) return true;
          // If not persistent, remove it.
          return false;
        }).map(a => {
          if (a.isPersistent) {
            return { ...a, freeInvokes: Math.max(a.freeInvokes, 1) };
          }
          return a;
        });

        // Only update if changes
        if (keptAspects.length !== char.situationalAspects.length || keptAspects.some((ka, i) => ka.freeInvokes !== char.situationalAspects![i].freeInvokes)) {
          await updateFirebaseCharacter(char.id, { situationalAspects: keptAspects });
        }
      }

      // B. Clean Current Scene Aspects
      if (activeScene) {
        const sceneAspects = activeScene.aspects || [];
        // Keep if NOT temporary OR isPersistent
        const cleanSceneAspects = sceneAspects.filter(a => !a.isTemporary || a.isPersistent).map(a => {
          if (a.isPersistent) return { ...a, freeInvokes: Math.max(a.freeInvokes, 1) };
          return a;
        });

        if (cleanSceneAspects.length !== sceneAspects.length || cleanSceneAspects.some((ca, i) => ca.freeInvokes !== sceneAspects[i].freeInvokes)) {
          await updateScene(activeScene.id, { aspects: cleanSceneAspects });
        }
      }
    }

    // 2. Activate New Scene
    await setActiveScene(newSceneId);
  };

  // Create Advantage Handlers
  const checkMalinaSabeDasCoisas = (char: Character | null) => {
    if (!char) return false;
    return char.maneuvers?.includes('sabe-das-coisas') || char.drive === 'malina';
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

  const handleCreateAdvantageFromRoll = (outcome: 'tie' | 'success' | 'style', freeInvokes: number) => {
    setPendingAdvantage({ outcome, freeInvokes });
    setShowCreateAdvantageModal(true);
  };

  const handleConfirmAdvantage = async (
    name: string,
    targetId: string,
    targetType: 'scene' | 'character' | 'npc',
    freeInvokes: number,
    isBoost: boolean,
    isPersistent: boolean
  ) => {
    if (!activeCharacter && !isGM) return; // Allow GM to create? Assuming activeCharacter context mostly.
    await createAdvantage(name, targetId, targetType, freeInvokes, isBoost, isPersistent, user?.uid || 'system');
    setShowCreateAdvantageModal(false);
    setPendingAdvantage(null);
  };

  // Render (Simplified for brevity, kept structure)
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
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(campaign.joinCode)
                      .then(() => toast({ title: "Código copiado!", description: "Compartilhe com seus jogadores." }))
                      .catch(() => toast({ title: "Erro ao copiar", description: "Tente copiar manualmente.", variant: "destructive" }));
                  } else {
                    // Fallback for non-secure contexts
                    try {
                      const textArea = document.createElement("textarea");
                      textArea.value = campaign.joinCode;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      toast({ title: "Código copiado!", description: "Compartilhe com seus jogadores." });
                    } catch (err) {
                      toast({ title: "Erro ao copiar", description: "Seu navegador não suporta cópia automática.", variant: "destructive" });
                    }
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

          {/* Aspects - New Button */}
          <button onClick={() => setShowAspects(!showAspects)} className="p-2 glass-panel" title="Aspectos em Jogo">
            <Sparkles className="w-5 h-5 text-amber-500" />
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

      {/* Active Episode Warning */}
      {/* Active Episode Warning - Removed */}

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
        {/* Left Sidebar */}
        <LeftSidebar
          sessionId={campaign?.joinCode || ''}
          campaignId={campaign?.id || ''}
          partyCharacters={partyCharacters}
          archivedCharacters={archivedCharacters}
          myCharacterId={myCharacter?.id}
          onViewCharacter={(char) => setViewingCharacterId(char.id)}
          onInvokeAspect={handleInvokeAspectFromSidebar}

          // GM Props
          isGM={isGM}
          scenes={scenes}
          archivedScenes={[]} // TODO
          currentScene={activeScene ?? null}
          onSetActiveScene={handleSetActiveScene}
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
          onEditCharacter={(c) => setViewingCharacterId(c.id)}
          onUpdateCharacter={updateFirebaseCharacter}
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
                    onUpdateNotes={async (notes) => {
                      if (!activeCharacter) return;
                      await updateFirebaseCharacter(activeCharacter.id, { notes });
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
                    onInvokeAspect={(aspectName) => handleInvokeAspectFromSidebar(activeCharacter?.name || 'Personagem', aspectName)}
                    onAddSelfie={() => setShowNewSelfieForm(true)}
                    onDeleteSelfie={handleDeleteSelfie}
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
                  unifiedAspects={allAspects}
                  onInvokeAspect={handleInvokeAspectFromRoller}
                  onRevokeAspect={handleRevokeAspect}
                  onAddLog={addLog}
                  isGM={isGM}
                  onCreateAdvantage={handleCreateAdvantageFromRoll}
                />
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar (Chat) */}
        <RightSidebar logs={logs} onSendMessage={addLog} />
      </div>

      {/* Modals */}
      <Dialog open={showAspects} onOpenChange={setShowAspects}>
        <DialogContent className="max-w-md h-[80vh] p-0 bg-transparent border-none overflow-hidden shadow-2xl">
          <DialogTitle className="sr-only">Hub de Aspectos</DialogTitle>
          <AspectHub campaignId={campaignId || ''} onClose={() => setShowAspects(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingCharacterId} onOpenChange={(open) => !open && setViewingCharacterId(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 bg-background overflow-hidden">
          <DialogTitle className="sr-only">
            {viewingPC ? `Ficha de ${viewingPC.name}` : viewingNPC ? `Ficha de ${viewingNPC.name}` : 'Visualizar Personagem'}
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
                  onInvokeAspect={(aspectName) => handleInvokeAspectFromSidebar(viewingPC.name, aspectName)}
                  onSkillClick={(skill) => {
                    handleRollDice(viewingPC.skills[skill], skill, undefined, 'normal', undefined, false, viewingPC.name);
                  }}
                  onToggleStress={async (track, index) => {
                    await handleToggleStress(viewingPC.id, track, index);
                  }}
                  onSetConsequence={async (severity, value) => {
                    await updateFirebaseCharacter(viewingPC.id, {
                      consequences: { ...viewingPC.consequences, [severity]: value }
                    });
                    addLog(`${viewingPC.name} definiu consequência ${severity}: ${value || 'Removida'}`, 'fate');
                  }}
                  onSpendFate={async () => {
                    await updateFate(viewingPC.id, -1, true);
                    addLog(`${viewingPC.name} gastou 1 Ponto de Destino`, 'fate');
                  }}
                  onGainFate={async () => {
                    await updateFate(viewingPC.id, 1, true);
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
                    const currentAspects = viewingPC.situationalAspects || [];
                    const updatedAspects = currentAspects.map(a => a.id === id ? { ...a, ...updates } : a);
                    await updateFirebaseCharacter(viewingPC.id, { situationalAspects: updatedAspects });
                  }}
                  onUpdateNotes={async (notes) => {
                    await updateFirebaseCharacter(viewingPC.id, { notes });
                  }}
                  onAddSelfie={(!isGM && viewingPC.id !== myCharacter?.id) ? undefined : () => setShowNewSelfieForm(true)}
                  onDeleteSelfie={(!isGM && viewingPC.id !== myCharacter?.id) ? undefined : handleDeleteSelfie}
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

      {/* Other viewing modals omitted for brevity, add back as needed */}
      <CompelModal campaignId={campaignId || ''} myCharacterId={myCharacter?.id} />

      {showNewSelfieForm && (activeCharacter || viewingPC) && (
        <NewSelfieForm
          characterId={(activeCharacter || viewingPC)!.id}
          isOpen={showNewSelfieForm}
          onClose={() => setShowNewSelfieForm(false)}
          onSubmit={handleCreateSelfie}
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
          onConfirm={handleConfirmAdvantage}
          hasPersistentManeuver={checkMalinaSabeDasCoisas(activeCharacter)}
        />
      )}
    </div>
  );
});
VTTPage.displayName = 'VTTPage';
