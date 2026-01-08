import { ActiveNPC } from '@/types/game';
import { useActiveNPCs } from '@/hooks/useActiveNPCs';
import { useTokens } from '@/hooks/useTokens';
import {
  Users,
  MapPin,
  Shield,
  Eye,
  EyeOff,
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ActiveNPCsPanelProps {
  sessionId: string;
  currentSceneId: string | null;
  onSelectNPC: (npc: ActiveNPC) => void;
}

export function ActiveNPCsPanel({ sessionId, currentSceneId, onSelectNPC }: ActiveNPCsPanelProps) {
  const { activeNPCs, moveToScene, toggleToken, deleteNPC, updateNPC } = useActiveNPCs(sessionId);
  const { tokens, createToken, deleteToken } = useTokens(sessionId);

  // Grouping
  const inScene = activeNPCs.filter(n => n.sceneId === currentSceneId && currentSceneId !== null);
  const otherScenes = activeNPCs.filter(n => n.sceneId && n.sceneId !== currentSceneId);
  const guarded = activeNPCs.filter(n => !n.sceneId);

  const handleToggleToken = async (npc: ActiveNPC) => {
    const willHaveToken = !npc.hasToken;

    if (willHaveToken) {
      if (!currentSceneId) {
        toast.error("Não há cena ativa para colocar o token.");
        return;
      }

      // Create token
      try {
        await createToken({
          type: 'npc',
          npcId: npc.id,
          name: npc.name,
          avatar: npc.avatar,
          x: 50,
          y: 50,
          currentStress: npc.currentStress,
          maxStress: npc.stress,
          isVisible: true,
          // Store kind for styling optimization in TokenLayer (optional but good)
          // Actually, TokenLayer logic we wrote uses `npcKind` if present on merged object or we can store it.
          // Let's store it to be safe if we want independent token rendering.
          // But strict Token type doesn't have npcKind. I'll stick to type conformity.
          // TokenLayer will need the merged data or I can abuse the Token type if I extended it?
          // I didn't extend Token type with npcKind. I'll rely on VTTPage merging or just generic styling.
        });

        // Update NPC
        await updateNPC(npc.id, { hasToken: true, sceneId: currentSceneId });
        toast.success("Token colocado na cena.");
      } catch (e) {
        console.error(e);
      }
    } else {
      // Remove token
      const token = tokens.find(t => t.npcId === npc.id);
      if (token) {
        await deleteToken(token.id);
      }

      await updateNPC(npc.id, { hasToken: false });
      toast.success("Token removido.");
    }
  };

  const renderNPCItem = (npc: ActiveNPC, context: 'scene' | 'other' | 'guarded') => (
    <div key={npc.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-accent/10 transition-colors group">
      {/* Avatar/Icon */}
      <div
        className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={() => onSelectNPC(npc)}
      >
        {npc.avatar ? (
          <img src={npc.avatar} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        {/* Type indicator dot */}
        <div className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-background ${npc.kind === 'monstro' ? 'bg-destructive' : 'bg-primary'
          }`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer py-1" onClick={() => onSelectNPC(npc)}>
        <h4 className="font-semibold text-base truncate leading-tight">{npc.name}</h4>
        <div className="flex flex-col gap-1.5 mt-1.5">
          <span className="text-sm text-muted-foreground truncate">{npc.archetypeName}</span>
          {/* Stress track viz - larger */}
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: Math.min(npc.stress, 6) }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded border border-border ${i < npc.currentStress
                  ? 'bg-destructive border-destructive shadow-[0_0_6px] shadow-destructive/50'
                  : 'bg-muted/50'
                  }`}
              />
            ))}
            {npc.stress > 6 && <span className="text-xs text-muted-foreground ml-1">+{npc.stress - 6}</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleToken(npc);
          }}
          title={npc.hasToken ? "Remover Token" : "Colocar Token (Moverá para Cena)"}
        >
          {npc.hasToken ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSelectNPC(npc)}>
              <Edit className="w-4 h-4 mr-2" /> Editar Ficha
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {context !== 'scene' && currentSceneId && (
              <DropdownMenuItem onClick={() => moveToScene(npc.id, currentSceneId)}>
                <MapPin className="w-4 h-4 mr-2" /> Trazer para Cena Atual
              </DropdownMenuItem>
            )}

            {context === 'scene' && (
              <DropdownMenuItem onClick={() => moveToScene(npc.id, null)}>
                <Shield className="w-4 h-4 mr-2" /> Guardar (Remover da Cena)
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteNPC(npc.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <ScrollArea className="flex-1 h-full pr-4">
      <div className="space-y-6 py-2">
        {/* Current Scene */}
        {currentSceneId && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Na Cena Atual
            </h3>
            {inScene.length > 0 ? (
              <div className="space-y-2">
                {inScene.map(npc => renderNPCItem(npc, 'scene'))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic px-2">Nenhum NPC nesta cena.</p>
            )}
          </div>
        )}

        {/* Other Scenes */}
        {otherScenes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
              <Map className="w-4 h-4" /> Em Outras Cenas
            </h3>
            <div className="space-y-2">
              {otherScenes.map(npc => renderNPCItem(npc, 'other'))}
            </div>
          </div>
        )}

        {/* Guarded */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" /> Guardados
          </h3>
          {guarded.length > 0 ? (
            <div className="space-y-2">
              {guarded.map(npc => renderNPCItem(npc, 'guarded'))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic px-2">Nenhum NPC guardado.</p>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
