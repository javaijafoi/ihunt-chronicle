import { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, User, Skull } from 'lucide-react';
import { Token } from '@/types/game';

interface TokenLayerProps {
  tokens: Token[];
  isGM?: boolean;
  onMoveToken?: (tokenId: string, x: number, y: number) => void;
  onDeleteToken?: (tokenId: string) => void;
  onSelectToken?: (token: Token) => void;
  selectedTokenId?: string | null;
}

export function TokenLayer({
  tokens,
  isGM = false,
  onMoveToken,
  onDeleteToken,
  onSelectToken,
  selectedTokenId,
}: TokenLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (tokenId: string, info: { point: { x: number; y: number } }) => {
    if (!containerRef.current || !onMoveToken) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((info.point.x - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((info.point.y - rect.top) / rect.height) * 100));

    onMoveToken(tokenId, x, y);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {tokens.map((token) => {
        const isSelected = selectedTokenId === token.id;
        const isMonster = !token.characterId;

        return (
          <motion.div
            key={token.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${token.x}%`,
              top: `${token.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            drag={isGM}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={(_, info) => handleDragEnd(token.id, info)}
            whileDrag={{ scale: 1.1, zIndex: 50 }}
            onClick={() => onSelectToken?.(token)}
          >
            <div
              className={`
                relative w-12 h-12 rounded-full border-2 cursor-pointer
                transition-all duration-200
                ${isSelected 
                  ? 'border-primary ring-2 ring-primary/50 scale-110' 
                  : isMonster 
                    ? 'border-destructive/70 hover:border-destructive' 
                    : 'border-secondary/70 hover:border-secondary'
                }
                ${isGM ? 'cursor-move' : 'cursor-pointer'}
              `}
            >
              {/* Avatar */}
              {token.avatar ? (
                <img
                  src={token.avatar}
                  alt={token.name}
                  className="w-full h-full rounded-full object-cover"
                  draggable={false}
                />
              ) : (
                <div
                  className={`
                    w-full h-full rounded-full flex items-center justify-center
                    ${isMonster ? 'bg-destructive/20' : 'bg-secondary/20'}
                  `}
                >
                  {isMonster ? (
                    <Skull className="w-6 h-6 text-destructive" />
                  ) : (
                    <User className="w-6 h-6 text-secondary" />
                  )}
                </div>
              )}

              {/* Name label */}
              <div
                className={`
                  absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-xs font-medium px-1.5 py-0.5 rounded
                  ${isMonster ? 'bg-destructive/80 text-destructive-foreground' : 'bg-secondary/80 text-secondary-foreground'}
                `}
              >
                {token.name}
              </div>

              {/* Delete button (GM only) */}
              {isGM && isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteToken?.(token.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
