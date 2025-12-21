import { Scene } from '@/types/game';

interface SceneCanvasProps {
  scene: Scene | null;
}

export function SceneCanvas({ scene }: SceneCanvasProps) {
  return (
    <div 
      className="canvas-layer scanlines"
      style={{ 
        backgroundImage: scene?.background ? `url(${scene.background})` : undefined,
      }}
    >
      {/* Gradient overlay for better UI visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-background/40" />
      
      {/* Scene name */}
      {scene && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="glass-panel px-6 py-2">
            <h2 className="font-display text-xl text-secondary text-glow-secondary">
              {scene.name}
            </h2>
          </div>
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
    </div>
  );
}
