import { ReactNode } from 'react';
import { GripHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface DraggableWindowProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
  className?: string;
  initialPosition?: {
    x: number;
    y: number;
  };
}

export function DraggableWindow({
  title,
  children,
  onClose,
  isOpen = true,
  className = '',
  initialPosition = { x: 0, y: 0 },
}: DraggableWindowProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{
        x: initialPosition.x,
        y: initialPosition.y,
        opacity: 0,
        scale: 0.98,
      }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed top-0 left-0 z-50 w-[380px] bg-background/95 backdrop-blur border border-border rounded-xl shadow-lg ${className}`}
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
