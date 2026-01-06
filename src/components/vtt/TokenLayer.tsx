import { useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, User, Skull, User2, Eye, EyeOff, Heart } from 'lucide-react';
import { Token } from '@/types/game';

interface TokenLayerProps {
  tokens: Token[];
  isGM?: boolean;
  currentUserId?: string;
  onMoveToken?: (tokenId: string, x: number, y: number) => void;
  onDeleteToken?: (tokenId: string) => void;
  onSelectToken?: (token: Token) => void;
  onToggleVisibility?: (tokenId: string) => void;
  selectedTokenId?: string | null;
}

export function TokenLayer({
  tokens,
  isGM = false,
  currentUserId,
  onMoveToken,
  onDeleteToken,
  onSelectToken,
  onToggleVisibility,
  selectedTokenId,
}: TokenLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent, 
    info: PanInfo, 
    token: Token
  ) => {
    if (!containerRef.current || !onMoveToken) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dropXPercent = ((info.point.x - rect.left) / rect.width) * 100;
    const dropYPercent = ((info.point.y - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, dropXPercent));
    const clampedY = Math.max(0, Math.min(100, dropYPercent));

    onMoveToken(token.id, clampedX, clampedY);
  };

  const getTokenStyles = (token: Token) => {
    const baseSize = token.size === 'large' ? 64 : token.size === 'small' ? 32 : 48;
    
    let borderColor = 'border-secondary/70 hover:border-secondary';
    let bgColor = 'bg-secondary/20';
    
    if (token.type === 'monster') {
      borderColor = 'border-destructive/70 hover:border-destructive';
      bgColor = 'bg-destructive/20';
    } else if (token.type === 'npc') {
      borderColor = 'border-accent/70 hover:border-accent';
      bgColor = 'bg-accent/20';
    }

    if (token.color) {
      borderColor = '';
    }

    return { baseSize, borderColor, bgColor };
  };

  const getTokenIcon = (token: Token) => {
    switch (token.type) {
      case 'monster':
        return <Skull className="w-6 h-6 text-destructive" />;
      case 'npc':
        return <User2 className="w-6 h-6 text-accent" />;
      default:
        return <User className="w-6 h-6 text-secondary" />;
    }
  };

  const getLabelStyle = (token: Token) => {
    switch (token.type) {
      case 'monster':
        return 'bg-destructive/90 text-destructive-foreground';
      case 'npc':
        return 'bg-accent/90 text-accent-foreground';
      default:
        return 'bg-secondary/90 text-secondary-foreground';
    }
  };

  const canDrag = (token: Token) => {
    if (isGM) return true;
    return token.type === 'character' && token.ownerId === currentUserId;
  };

  const visibleTokens = tokens.filter(token => {
    if (isGM) return true;
    return token.isVisible !== false;
  });

  return (
    <div ref={containerRef} className="absolute inset-0">
      {visibleTokens.map((token) => {
        const isSelected = selectedTokenId === token.id;
        const isHovered = hoveredTokenId === token.id;
        const { baseSize, borderColor, bgColor } = getTokenStyles(token);
        const isDraggable = canDrag(token);
        const isHidden = token.isVisible === false;

        return (
          <motion.div
            key={token.id}
            drag={isDraggable}
            dragMomentum={false}
            onDragEnd={(event, info) => handleDragEnd(event, info, token)}
            whileDrag={{ scale: 1.1, zIndex: 50 }}
            className="absolute pointer-events-auto"
            style={{
              left: `${token.x}%`,
              top: `${token.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isSelected ? 40 : isHovered ? 30 : 20,
            }}
            onClick={() => onSelectToken?.(token)}
            onMouseEnter={() => setHoveredTokenId(token.id)}
            onMouseLeave={() => setHoveredTokenId(null)}
          >
            <div
              className={`
                relative rounded-full border-2
                transition-all duration-200 shadow-lg
                ${isSelected 
                  ? 'border-primary ring-2 ring-primary/50 scale-110' 
                  : borderColor
                }
                ${isDraggable ? 'cursor-move' : 'cursor-pointer'}
                ${isHidden ? 'opacity-50' : ''}
              `}
              style={{ 
                width: baseSize, 
                height: baseSize,
                borderColor: token.color || undefined,
              }}
            >
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
                    ${bgColor}
                  `}
                >
                  {getTokenIcon(token)}
                </div>
              )}
              {token.maxStress && token.currentStress !== undefined && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {Array.from({ length: token.maxStress }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full border ${
                        i < token.currentStress!
                          ? 'bg-destructive border-destructive'
                          : 'bg-background border-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              )}
              <div
                className={`
                  absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-xs font-medium px-2 py-0.5 rounded shadow-md
                  ${getLabelStyle(token)}
                `}
              >
                {token.name}
              </div>
              {isGM && isHidden && (
                <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                  <EyeOff className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
              )}
              {isGM && isSelected && (
                <div className="absolute -top-2 -right-2 flex gap-1">
                  {onToggleVisibility && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(token.id);
                      }}
                      className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                      title={isHidden ? 'Mostrar para jogadores' : 'Esconder dos jogadores'}
                    >
                      {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteToken?.(token.id);
                    }}
                    className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80 transition-colors"
                    title="Remover token"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <AnimatePresence>
              {isHovered && !isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-8 z-50"
                >
                  <div className="glass-panel p-2 min-w-[120px] text-center">
                    <div className="font-display text-sm">{token.name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">
                      {token.type === 'character' ? 'Personagem' : token.type === 'monster' ? 'Monstro' : 'NPC'}
                    </div>
                    {token.maxStress && (
                      <div className="flex items-center justify-center gap-1 mt-1 text-[10px]">
                        <Heart className="w-3 h-3 text-destructive" />
                        <span>{token.currentStress || 0}/{token.maxStress}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
