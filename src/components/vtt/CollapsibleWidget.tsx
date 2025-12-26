import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface CollapsibleWidgetProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  storageKey?: string;
  className?: string;
  headerClassName?: string;
  badge?: ReactNode;
}

export function CollapsibleWidget({
  title,
  icon,
  children,
  defaultOpen = true,
  storageKey,
  className = '',
  headerClassName = '',
  badge,
}: CollapsibleWidgetProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`widget-${storageKey}`);
      if (saved !== null) return saved === 'true';
    }
    return defaultOpen;
  });

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`widget-${storageKey}`, String(isOpen));
    }
  }, [isOpen, storageKey]);

  return (
    <motion.div
      className={`glass-panel overflow-hidden ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors border-b border-border ${headerClassName}`}
      >
        <span className="text-primary">{icon}</span>
        <h3 className="font-display text-sm flex-1 text-left">{title}</h3>
        {badge}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
