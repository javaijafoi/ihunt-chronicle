import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User2,
  Skull,
  MapPin,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Package,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActiveNPC, Scene, Archetype } from '@/types/game';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { ActiveNPCSheet } from './ActiveNPCSheet';

interface ActiveNPCsPanelProps {
  npcsInCurrentScene: ActiveNPC[];
  npcsInOtherScenes: ActiveNPC[];
  storedNPCs: ActiveNPC[];
  scenes: Scene[];
  currentSceneId?: string | null;
  onPlaceToken: (npcId: string) => void;
  onRemoveToken: (npcId: string) => void;
  onMoveToScene: (npcId: string, sceneId: string | null, sceneName?: string) => void;
  onUpdateNPC: (npcId: string, updates: Partial<ActiveNPC>) => void;
  onArchiveNPC: (npcId: string, createArchetype: (data: Omit<Archetype, 'id' | 'isGlobal'>) => Promise<string | null>) => void;
  onDeleteNPC: (npcId: string) => void;
  createArchetype: (data: Omit<Archetype, 'id' | 'isGlobal'>) => Promise<string | null>;
}

export function ActiveNPCsPanel({
  npcsInCurrentScene,
  npcsInOtherScenes,
  storedNPCs,
  scenes,
  currentSceneId,
  onPlaceToken,
  onRemoveToken,
  onMoveToScene,
  onUpdateNPC,
  onArchiveNPC,
  onDeleteNPC,
  createArchetype,
}: ActiveNPCsPanelProps) {
  const [expandedNpcId, setExpandedNpcId] = useState<string | null>(null);
  const [editingNpcId, setEditingNpcId] = useState<string | null>(null);

  const totalNPCs = npcsInCurrentScene.length + npcsInOtherScenes.length + storedNPCs.length;
  const currentScene = scenes.find((s) => s.id === currentSceneId);

  const renderNPCCard = (npc: ActiveNPC, context: 'current' | 'other' | 'stored') => {
    const Icon = npc.kind === 'monstro' ? Skull : User2;
    const isExpanded = expandedNpcId === npc.id;
    const stressPercent = npc.stress > 0 ? (npc.currentStress / npc.stress) * 100 : 0;
    const otherScenes = scenes.filter((s) => s.id !== currentSceneId);
    const npcScene = npc.sceneId ? scenes.find((s) => s.id === npc.sceneId) : null;

    return (
      <div
        key={npc.id}
        className="bg-muted/50 rounded-lg border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-2">
          <button
            onClick={() => setExpandedNpcId(isExpanded ? null : npc.id)}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
          >
            <Icon className={`w-4 h-4 shrink-0 ${npc.kind === 'monstro' ? 'text-destructive' : 'text-primary'}`} />
            <div className="flex-1 min-w-0">
              <div className="font-display text-xs truncate">{npc.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">
                NPC - {npc.kind === 'monstro' ? `Monstro (${npc.archetypeName})` : `Pessoa (${npc.archetypeName})`}
              </div>
            </div>
          </button>

          {/* Token toggle for current scene */}
          {context === 'current' && (
            <Button
              size="sm"
              variant={npc.hasToken ? 'default' : 'outline'}
              className="h-6 px-2"
              onClick={() => (npc.hasToken ? onRemoveToken(npc.id) : onPlaceToken(npc.id))}
            >
              {npc.hasToken ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>
          )}

          {/* Location indicator for other scenes */}
          {context === 'other' && npcScene && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {npcScene.name}
            </span>
          )}

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setEditingNpcId(npc.id)}>
                Editar Ficha
              </DropdownMenuItem>

              {/* Move to scene submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ArrowRight className="w-3 h-3 mr-2" />
                  Mover para...
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {currentSceneId && context !== 'current' && (
                    <DropdownMenuItem
                      onClick={() => onMoveToScene(npc.id, currentSceneId, currentScene?.name)}
                    >
                      <MapPin className="w-3 h-3 mr-2" />
                      Cena Atual
                    </DropdownMenuItem>
                  )}
                  {otherScenes.map((scene) => (
                    <DropdownMenuItem
                      key={scene.id}
                      onClick={() => onMoveToScene(npc.id, scene.id, scene.name)}
                      disabled={scene.id === npc.sceneId}
                    >
                      {scene.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onMoveToScene(npc.id, null)}>
                    <Package className="w-3 h-3 mr-2" />
                    Guardar (sem cena)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onArchiveNPC(npc.id, createArchetype)}>
                <Archive className="w-3 h-3 mr-2" />
                Arquivar
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onDeleteNPC(npc.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
        </div>

        {/* Stress bar */}
        <div className="px-2 pb-2">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive transition-all"
              style={{ width: `${stressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {npc.currentStress}/{npc.stress} stress
          </div>
        </div>

        {/* Expanded quick view */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2 pt-0 space-y-2 border-t border-border/50">
                {/* Aspects */}
                <div className="flex flex-wrap gap-1">
                  {npc.aspects.map((asp, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground"
                    >
                      {asp}
                    </span>
                    )}
                </div>

                {/* Scene tags */}
                {npc.sceneTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {npc.sceneTags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        📍 {tag}
                      </span>
                    )))}
                  </div>
                )}

                {/* Notes preview */}
                {npc.notes && (
                  <p className="text-[10px] text-muted-foreground italic line-clamp-2">
                    {npc.notes}
                  </p>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-6 text-[10px]"
                  onClick={() => setEditingNpcId(npc.id)}
                >
                  Abrir Ficha Completa
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const editingNpc = editingNpcId ? [...npcsInCurrentScene, ...npcsInOtherScenes, ...storedNPCs].find((n) => n.id === editingNpcId) : null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {totalNPCs} NPC{totalNPCs !== 1 ? 's' : ''} ativo{totalNPCs !== 1 ? 's' : ''}
        </span>
      </div>

      <ScrollArea className="h-[350px]">
        <div className="space-y-3 pr-2">
          {/* Current Scene NPCs */}
          {currentSceneId && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-primary uppercase font-ui">
                  Na Cena Atual {currentScene && `(${currentScene.name})`}
                </span>
              </div>
              {npcsInCurrentScene.length > 0 ? (
                <div className="space-y-2">
                  {npcsInCurrentScene.map((npc) => renderNPCCard(npc, 'current'))}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground italic pl-4">
                  Nenhum NPC nesta cena
                </p>
              )}
            </div>
          )}

          {/* Other Scenes NPCs */}
          {npcsInOtherScenes.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase font-ui">
                  Em Outras Cenas
                </span>
              </div>
              <div className="space-y-2">
                {npcsInOtherScenes.map((npc) => renderNPCCard(npc, 'other'))}
              </div>
            </div>
          )}

          {/* Stored NPCs */}
          {storedNPCs.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Package className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase font-ui">
                  Guardados
                </span>
              </div>
              <div className="space-y-2">
                {storedNPCs.map((npc) => renderNPCCard(npc, 'stored'))}
              </div>
            </div>
          )}

          {totalNPCs === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Nenhum NPC ativo</p>
              <p className="text-[10px] mt-1">
                Adicione NPCs da Base de Arquétipos
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* NPC Sheet Modal */}
      {editingNpc && (
        <ActiveNPCSheet
          npc={editingNpc}
          isOpen={!!editingNpcId}
          onClose={() => setEditingNpcId(null)}
          onUpdate={(updates) => onUpdateNPC(editingNpc.id, updates)}
        />
      )}
    </div>
  );
}
