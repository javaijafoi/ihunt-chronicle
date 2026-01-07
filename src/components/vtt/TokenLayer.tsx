import { useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue } from 'framer-motion';
import { X, User, Skull, User2, Eye, EyeOff, Heart } from 'lucide-react';
import { Token } from '@/types/game';

interface PointerCoordinates {
  x: number;
  y: number;
}

interface ContainerRect {
  width: number;
  height: number;
  left: number;
  top: number;
}

export function calculateTokenPercentPosition(
  point: PointerCoordinates,
  rect: ContainerRect,
) {
  const { width, height, left, top } = rect;

  if (width === 0 || height === 0) return null;

  const localX = point.x - left;
  const localY = point.y - top;

  const dropXPercent = (localX / width) * 100;
  const dropYPercent = (localY / height) * 100;

  const clampedX = Math.max(0, Math.min(100, dropXPercent));
  const clampedY = Math.max(0, Math.min(100, dropYPercent));

  return { x: clampedX, y: clampedY };
}

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

interface DraggableTokenProps {
  token: Token;
  containerRef: React.RefObject<HTMLDivElement>;
  isGM: boolean;
  currentUserId?: string;
  isSelected: boolean;
  isHovered: boolean;
  onMoveToken: ((tokenId: string, x: number, y: number) => void) | undefined;
  onSelectToken: ((token: Token) => void) | undefined;
  onToggleVisibility: ((tokenId: string) => void) | undefined;
  onDeleteToken: ((tokenId: string) => void) | undefined;
  onHover: (id: string | null) => void;
}

const DraggableToken = ({
  token,
  containerRef,
  isGM,
  currentUserId,
  isSelected,
  isHovered,
  onMoveToken,
  onSelectToken,
  onToggleVisibility,
  onDeleteToken,
  onHover
}: DraggableTokenProps) => {
  // Use motion values to track drag offset separate from position
  // This allows us to reset the drag offset (transform) to 0 after drop
  // while React updates the visual left/top position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const canDrag = () => {
    if (isGM) return true;
    return token.type === 'character' && token.ownerId === currentUserId;
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (!containerRef.current || !onMoveToken) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentPxX = (token.x / 100) * rect.width;
    const currentPxY = (token.y / 100) * rect.height;

    const newPxX = currentPxX + info.offset.x;
    const newPxY = currentPxY + info.offset.y;

    const newPercentX = (newPxX / rect.width) * 100;
    const newPercentY = (newPxY / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, newPercentX));
    const clampedY = Math.max(0, Math.min(100, newPercentY));

    onMoveToken(token.id, clampedX, clampedY);

    // Critical fix: Reset drag transforms to 0 purely.
    // The new position is now handled by the 'left' and 'top' props updates.
    // We must wait a tick or just set strictly to ensure no visual jump?
    // Setting immediately works because React batching handling the prop update.
    x.set(0);
    y.set(0);
  };

  const getTokenStyles = () => {
    const baseSize = token.size === 'large' ? 64 : token.size === 'small' ? 32 : 48;
    let borderColor = 'border-green-500/70 hover:border-green-500';
    let bgColor = 'bg-green-500/20';

    if (token.type === 'monster') {
      borderColor = 'border-destructive/70 hover:border-destructive';
      bgColor = 'bg-destructive/20';
    } else if (token.type === 'npc') {
      borderColor = 'border-accent/70 hover:border-accent';
      bgColor = 'bg-accent/20';
    }

    if (token.color) borderColor = '';
    return { baseSize, borderColor, bgColor };
  };

  const getTokenIcon = () => {
    switch (token.type) {
      case 'monster': return <Skull className="w-6 h-6 text-destructive" />;
      case 'npc': return <User2 className="w-6 h-6 text-accent" />;
      default: return <User className="w-6 h-6 text-green-500" />;
    }
  };

  const getLabelStyle = () => {
    switch (token.type) {
      case 'monster': return 'bg-destructive/90 text-destructive-foreground';
      case 'npc': return 'bg-accent/90 text-accent-foreground';
      default: return 'bg-green-500/90 text-white';
    }
  };

  const { baseSize, borderColor, bgColor } = getTokenStyles();
  const isDraggable = canDrag();
  const isHidden = token.isVisible === false;

  return (
    <motion.div
      key={token.id}
      layout={false} // Disable layout prop to avoid conflicts with manual pos
      drag={isDraggable}
      dragConstraints={isDraggable ? containerRef : undefined}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.1, zIndex: 50 }}
      style={{
        x, // Bind motion values for drag transform
        y,
        left: `${token.x}%`,
        top: `${token.y}%`,
        transform: 'translate(-50%, -50%)', // This CSS transform is handled by 'x' and 'y' above? No.
        // Framer Motion mixes 'x' (translateX) and 'y' (translateY) into the transform.
        // We need to ensure the centering translate(-50%, -50%) persists.
        // Framer Motion handles mixed transforms well, but better to be explicit if issues arise.
        // Actually, style.transform might be overwritten by x/y binding if not careful.
        // But FM usually appends.
        // To be safe, use translateX/Y in style? No, x/y are shorthand.
        position: 'absolute',
        translateX: '-50%', // Use FM props for static transform parts to ensure merge?
        translateY: '-50%',
        zIndex: isSelected ? 40 : isHovered ? 30 : 20,
      }}
      onClick={() => onSelectToken?.(token)}
      onMouseEnter={() => onHover(token.id)}
      onMouseLeave={() => onHover(null)}
      className="absolute pointer-events-auto"
    >
      <div
        className={`
          relative rounded-full border-2
          transition-all duration-200 shadow-lg
          ${isSelected ? 'border-primary ring-2 ring-primary/50 scale-110' : borderColor}
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
          <div className={`w-full h-full rounded-full flex items-center justify-center ${bgColor}`}>
            {getTokenIcon()}
          </div>
        )}
        {token.maxStress && token.currentStress !== undefined && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {Array.from({ length: token.maxStress }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full border ${i < token.currentStress! ? 'bg-destructive border-destructive' : 'bg-background border-muted-foreground/50'}`}
              />
            ))}
          </div>
        )}
        <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded shadow-md ${getLabelStyle()}`}>
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
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(token.id); }}
                className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteToken?.(token.id); }}
              className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80 transition-colors"
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
};

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

  const visibleTokens = tokens.filter(token => {
    if (isGM) return true;
    return token.isVisible !== false;
  });

  return (
    <div ref={containerRef} className="absolute inset-0">
      {visibleTokens.map((token) => (
        <DraggableToken
          key={token.id}
          token={token}
          containerRef={containerRef}
          isGM={isGM}
          currentUserId={currentUserId}
          isSelected={selectedTokenId === token.id}
          isHovered={hoveredTokenId === token.id}
          onMoveToken={onMoveToken}
          onSelectToken={onSelectToken}
          onToggleVisibility={onToggleVisibility}
          onDeleteToken={onDeleteToken}
          onHover={setHoveredTokenId}
        />
      ))}
    </div>
  );
}
