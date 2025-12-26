import { motion } from 'framer-motion';
import { useCallback, useRef } from 'react';
import { Bookmark, Dices, BookOpen, Shield, Users, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type DockWindow = 'chat' | 'hud' | 'sheet' | 'party' | 'dice' | 'aspects';

interface DockProps {
  windows: Record<DockWindow, boolean>;
  onToggleWindow: (window: DockWindow) => void;
  onOpenSafety: () => void;
  onHoldDice?: () => void;
}

type DockItem = {
  id: DockWindow | 'safety';
  icon: typeof Dices;
  label: string;
};

const dockItems: DockItem[] = [
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'hud', icon: LayoutDashboard, label: 'HUD' },
  { id: 'sheet', icon: BookOpen, label: 'Ficha' },
  { id: 'party', icon: Users, label: 'Grupo' },
  { id: 'aspects', icon: Bookmark, label: 'Aspectos' },
  { id: 'dice', icon: Dices, label: 'Dados' },
  { id: 'safety', icon: Shield, label: 'Segurança' },
];

export function Dock({ windows, onToggleWindow, onOpenSafety, onHoldDice }: DockProps) {
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTriggered = useRef(false);

  const startHold = useCallback(() => {
    if (!onHoldDice) return;

    holdTimeout.current = setTimeout(() => {
      holdTriggered.current = true;
      onHoldDice();
      holdTimeout.current = null;
    }, 400);
  }, [onHoldDice]);

  const cancelHold = useCallback((reset?: boolean) => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    if (reset || !holdTriggered.current) {
      holdTriggered.current = false;
    }
  }, []);

  return (
    <motion.div
      className="glass-panel px-4 py-2 flex items-center gap-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {dockItems.map((item, index) => {
        const Icon = item.icon;
        const isWindow = item.id !== 'safety';
        const isActive = isWindow ? windows[item.id] : false;
        
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <motion.button
                className={`dock-button ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (item.id === 'dice' && holdTriggered.current) {
                    holdTriggered.current = false;
                    return;
                  }
                  if (item.id === 'safety') {
                    onOpenSafety();
                    return;
                  }
                  if (isWindow) {
                    onToggleWindow(item.id);
                  }
                }}
                onPointerDown={item.id === 'dice' ? startHold : undefined}
                onPointerUp={item.id === 'dice' ? () => cancelHold() : undefined}
                onPointerLeave={item.id === 'dice' ? () => cancelHold(true) : undefined}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-foreground'}`} />
                <span className="text-xs font-ui text-muted-foreground">{item.label}</span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </motion.div>
  );
}
