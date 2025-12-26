import { ReactNode, useCallback, useEffect, useState, type CSSProperties } from 'react';
import { GripHorizontal, X } from 'lucide-react';
import { motion, useMotionValue } from 'framer-motion';

type Position = {
  x: number;
  y: number;
};

type DraggableWindowProps = {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
  style?: CSSProperties;
  initialPosition?: Position;
} & (
  | {
      id: string;
      storageKey?: string;
    }
  | {
    storageKey: string;
    id?: string;
  }
);

export function DraggableWindow({
  title,
  children,
  onClose,
  isOpen = true,
  className = '',
  style,
  id,
  storageKey,
  initialPosition = { x: 0, y: 0 },
}: DraggableWindowProps) {
  const key = storageKey ?? id;

  if (!key) {
    throw new Error('DraggableWindow requires an "id" or "storageKey" prop.');
  }

  const storageId = `draggable-window:${key}`;

  const readStoredPosition = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const stored = window.localStorage.getItem(storageId);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { x?: number; y?: number };

        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return { x: parsed.x, y: parsed.y };
        }
      } catch (error) {
        console.warn('Failed to parse stored position for DraggableWindow', error);
      }
    }

    return null;
  }, [storageId]);

  const [position, setPosition] = useState(() => {
    const storedPosition = readStoredPosition();

    if (storedPosition) return storedPosition;

    return { x: initialPosition.x, y: initialPosition.y };
  });
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  useEffect(() => {
    const storedPosition = readStoredPosition();

    if (storedPosition) {
      setPosition(storedPosition);
      return;
    }

    setPosition({ x: initialPosition.x, y: initialPosition.y });
  }, [initialPosition.x, initialPosition.y, readStoredPosition]);

  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  const handleDragEnd = () => {
    const nextPosition = { x: x.get(), y: y.get() };

    setPosition(nextPosition);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageId, JSON.stringify(nextPosition));
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{
        opacity: 0,
        scale: 0.98,
      }}
      animate={{ opacity: 1, scale: 1 }}
      onDragEnd={handleDragEnd}
      style={{ ...style, x, y }}
      className={`fixed top-0 left-0 z-50 bg-background/95 backdrop-blur border border-border rounded-xl shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          <span>{title}</span>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose?.();
          }}
          className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-4">{children}</div>
    </motion.div>
  );
}
