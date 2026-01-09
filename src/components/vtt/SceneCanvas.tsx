import { Scene, Token, SceneAspect } from '@/types/game';
import { TokenLayer } from './TokenLayer';
import { Sparkles } from 'lucide-react';

interface SceneCanvasProps {
  scene: Scene | null;
  tokens?: Token[];
  aspects?: SceneAspect[];
  onInvokeAspect?: (aspectName: string, useFree?: boolean) => void;
  isGM?: boolean;
  currentUserId?: string;
  activeCharacterId?: string;
  onMoveToken?: (tokenId: string, x: number, y: number) => void;
  onDeleteToken?: (tokenId: string) => void;
  onSelectToken?: (token: Token) => void;
  onToggleVisibility?: (tokenId: string) => void;
  selectedTokenId?: string | null;
}

export function SceneCanvas({
  scene,
  tokens = [],
  aspects = [],
  onInvokeAspect,
  isGM = false,
  currentUserId,
  activeCharacterId,
  onMoveToken,
  onDeleteToken,
  onSelectToken,
  onToggleVisibility,
  selectedTokenId,
}: SceneCanvasProps) {
  return (
    <div
      className="canvas-layer scanlines"
      style={{
        backgroundImage: scene?.background ? `url(${scene.background})` : undefined,
      }}
    >
      {/* Gradient overlay for better UI visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-background/40" />

      {/* Scene name & Aspects */}
      {scene && (
        <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-2 w-full max-w-md pointer-events-none">
          <div className="glass-panel px-6 py-2 pointer-events-auto w-fit">
            <h2 className="font-display text-xl text-secondary text-glow-secondary">
              {scene.name}
            </h2>
          </div>

          {/* Aspects List */}
          {aspects.length > 0 && (
            <div className="flex flex-col items-start gap-1 w-full pointer-events-auto">
              {aspects.map((aspect) => (
                <div
                  key={aspect.id}
                  className="group flex items-center gap-3 px-2 py-0.5 bg-black/20 backdrop-blur-sm border border-white/5 rounded-sm hover:bg-black/40 transition-colors w-fit"
                >
                  <span className="text-xs font-ui text-zinc-300 shadow-black drop-shadow-md">{aspect.name}</span>

                  {/* Invocation Controls */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {aspect.freeInvokes > 0 && (
                      <button
                        onClick={() => onInvokeAspect?.(aspect.name, true)}
                        className="flex items-center gap-1 text-[10px] text-accent hover:text-accent-glow font-bold uppercase"
                        title="Invocar gratuitamente"
                      >
                        <Sparkles className="w-3 h-3" />
                        {aspect.freeInvokes}
                      </button>
                    )}
                    <button
                      onClick={() => onInvokeAspect?.(aspect.name, false)}
                      className="text-[10px] text-primary hover:text-primary-glow font-bold uppercase tracking-wider"
                      title="Invocar"
                    >
                      Invocar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid overlay (subtle) */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Token Layer */}
      <TokenLayer
        tokens={tokens}
        isGM={isGM}
        currentUserId={currentUserId}
        activeCharacterId={activeCharacterId}
        onMoveToken={onMoveToken}
        onDeleteToken={onDeleteToken}
        onSelectToken={onSelectToken}
        onToggleVisibility={onToggleVisibility}
        selectedTokenId={selectedTokenId}
      />
    </div>
  );
}
