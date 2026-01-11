import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, MapPin, Users, Users2, Archive, RefreshCcw, Calendar, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SceneManager } from './SceneManager';
import { ActiveNPCsPanel } from './ActiveNPCsPanel';
import { ActiveNPCSheet } from './ActiveNPCSheet';
import { TimelineManager } from './TimelineManager';
import { ArchetypeDatabase } from './ArchetypeDatabase';
import { CharactersDatabase } from './CharactersDatabase';
// ... imports
import { Scene, Character, ActiveNPC } from '@/types/game';
import { PartyCharacter } from '@/types/session';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface GMPanelProps {
  sessionId: string;
  campaignId: string;
  scenes: Scene[];
  archivedScenes?: Scene[];
  currentScene: Scene | null;
  sceneSearchQuery?: string;
  onSceneSearchChange?: (query: string) => void;
  onCreateScene: (scene: Omit<Scene, 'id'>) => void | Promise<string | null>;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void | Promise<void>;
  onDeleteScene: (sceneId: string) => void | Promise<void>;
  onSetActiveScene: (sceneId: string) => void | Promise<void>;
  onArchiveScene?: (sceneId: string) => void | Promise<void>;
  onUnarchiveScene?: (sceneId: string) => void | Promise<void>;
  minAspects?: number;
  // Characters
  partyCharacters: PartyCharacter[];
  archivedCharacters?: PartyCharacter[];
  onEditCharacter: (character: Character) => void;
}

type PanelSection = 'scenes' | 'active_npcs' | 'archetypes' | 'characters';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { useFirebaseCharacters } from '@/hooks/useFirebaseCharacters';
import { useCampaign } from '@/contexts/CampaignContext';

export function GMPanel({
  // ... props
  sessionId,
  campaignId,
  scenes,
  archivedScenes = [],
  currentScene,
  sceneSearchQuery = '',
  onSceneSearchChange,
  onCreateScene,
  onUpdateScene,
  onDeleteScene,
  onSetActiveScene,
  onArchiveScene,
  onUnarchiveScene,
  minAspects = 3,
  partyCharacters,
  archivedCharacters = [],
  onEditCharacter,
}: GMPanelProps) {
  const [activeTab, setActiveTab] = useState<'scenes' | 'npcs'>('scenes');
  const [selectedNPC, setSelectedNPC] = useState<ActiveNPC | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);
  const { campaign, currentEpisode } = useCampaign();

  const updateGMFate = async (delta: number) => {
    if (!currentEpisode) return;
    const current = currentEpisode.gmFatePool || 0;
    const newVal = Math.max(0, current + delta);
    try {
      await updateDoc(doc(db, 'episodes', currentEpisode.id), { gmFatePool: newVal });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao atualizar Fate do GM", variant: "destructive" });
    }
  };

  const [charactersViewMode, setCharactersViewMode] = useState<'active' | 'archived'>('active');
  const [characterToArchive, setCharacterToArchive] = useState<{ id: string; name: string } | null>(null);
  const [showArchetypes, setShowArchetypes] = useState(false);



  // Helper to archive/unarchive
  const setCharacterArchived = async (charId: string, archived: boolean) => {
    try {
      // Assuming characters are in root or subcollection. 
      // Based on recent changes, characters are likely root with sessionId.
      // But let's try to be generic or use the passed prop logic if available.
      // Since we don't have onArchiveCharacter prop, we'll try direct update or check if we should add it to props.
      // Let's assume standard update:
      const batch = writeBatch(db);
      const charRef = doc(db, 'characters', charId);
      batch.update(charRef, { isArchived: archived });
      await batch.commit();
      toast({ title: archived ? "Personagem arquivado" : "Personagem restaurado" });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  const handleArchiveConfirm = async () => {
    if (characterToArchive) {
      // Direct update for now
      try {
        await setCharacterArchived(characterToArchive.id, true);
      } catch (e) { console.error(e); }
      setCharacterToArchive(null);
    }
  };

  const unarchiveCharacter = async (charId: string) => {
    await setCharacterArchived(charId, false);
  };

  /* Removed handleMigrateSkills */



  const tabs = [
    { id: 'scenes' as const, label: 'Cenas', icon: MapPin },
    { id: 'npcs' as const, label: 'NPCs Ativos', icon: Users2 },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-secondary/10 border-b border-border mb-2 rounded-md">
        <span className="text-xs font-bold text-secondary uppercase tracking-wider pl-1">Ferramentas do Mestre</span>
        <div className="flex items-center gap-1">
          {/* GM Fate Pool */}
          <div className="flex items-center mr-2 bg-background/50 rounded-lg border border-border px-1">
            <span className="text-[10px] font-bold text-muted-foreground mr-1 uppercase">GM Fate:</span>
            <button onClick={() => updateGMFate(-1)} className="hover:bg-destructive/10 text-destructive p-1 rounded font-bold text-xs">-</button>
            <span className="mx-1 font-display min-w-[1ch] text-center text-sm">{currentEpisode?.gmFatePool || 0}</span>
            <button onClick={() => updateGMFate(1)} className="hover:bg-primary/10 text-primary p-1 rounded font-bold text-xs">+</button>
          </div>

          <button onClick={() => setShowCharacters(true)} className="p-1 hover:bg-secondary/20 rounded text-secondary" title="Gerenciar Personagens">
            <Users className="w-4 h-4" />
          </button>
          <button onClick={() => setShowArchetypes(true)} className="p-1 hover:bg-secondary/20 rounded" title="Base de Arquétipos">
            <BookOpen className="w-4 h-4 text-secondary" />
          </button>
          <button onClick={() => setShowTimeline(true)} className="p-1 hover:bg-secondary/20 rounded" title="Gerenciar Linha do Tempo">
            <Calendar className="w-4 h-4 text-secondary" />
          </button>
        </div>
      </div>

      <TimelineManager isOpen={showTimeline} onClose={() => setShowTimeline(false)} />

      <Dialog open={showArchetypes} onOpenChange={setShowArchetypes}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0 bg-background border-border">
          <div className="flex-1 min-h-0 overflow-hidden">
            <ArchetypeDatabase sessionId={sessionId} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCharacters} onOpenChange={setShowCharacters}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0 bg-background border-border">
          <div className="flex-1 min-h-0 overflow-hidden">
            <CharactersDatabase sessionId={campaignId} partyCharacters={partyCharacters} />
          </div>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
        <div className="px-2 pt-2 flex-shrink-0">
          <TabsList className="w-full grid grid-cols-2 bg-muted/50">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs gap-2">
                <tab.icon className="w-4 h-4" />
                <span className="sr-only md:not-sr-only md:inline-block">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-2 pb-2">
          <TabsContent value="scenes" className="m-0 h-full mt-0 space-y-2">
            <SceneManager
              scenes={scenes}
              archivedScenes={archivedScenes}
              currentScene={currentScene}
              searchQuery={sceneSearchQuery}
              onSearchChange={onSceneSearchChange}
              onCreateScene={onCreateScene}
              onUpdateScene={onUpdateScene}
              onDeleteScene={onDeleteScene}
              onSetActiveScene={onSetActiveScene}
              onArchiveScene={onArchiveScene}
              onUnarchiveScene={onUnarchiveScene}
              minAspects={minAspects}
            />
          </TabsContent>

          <TabsContent value="npcs" className="m-0 h-full mt-0">
            <ActiveNPCsPanel
              campaignId={sessionId}
              currentSceneId={currentScene?.id || null}
              onSelectNPC={setSelectedNPC}
            />
          </TabsContent>


        </div>
      </Tabs>

      {/* ... Dialogs */}
      <Dialog open={!!selectedNPC} onOpenChange={(open) => !open && setSelectedNPC(null)}>
        <DialogContent className="p-0 border-none bg-transparent w-auto h-auto max-w-none shadow-none [&>button]:hidden focus:outline-none">
          {selectedNPC && (
            <ActiveNPCSheet
              npc={selectedNPC}
              sessionId={sessionId}
              onClose={() => setSelectedNPC(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!characterToArchive} onOpenChange={(open) => !open && setCharacterToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar Personagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja arquivar "{characterToArchive?.name}"?
              <br />
              O personagem será ocultado da lista, mas não será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveConfirm}>
              Sim, arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
