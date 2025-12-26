import { motion } from 'framer-motion';
import { Dices, BookOpen, Shield, Settings, Coffee } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DockProps {
  onRollDice: () => void;
  onOpenSheet: () => void;
  onOpenSafety: () => void;
  activeTool?: string;
}

const dockItems = [
  { id: 'dice', icon: Dices, label: 'Dados', action: 'onRollDice' },
  { id: 'sheet', icon: BookOpen, label: 'Ficha', action: 'onOpenSheet' },
  { id: 'safety', icon: Shield, label: 'Segurança', action: 'onOpenSafety' },
  { id: 'break', icon: Coffee, label: 'Intervalo', action: null },
  { id: 'settings', icon: Settings, label: 'Config', action: null },
];

export function Dock({ onRollDice, onOpenSheet, onOpenSafety, activeTool }: DockProps) {
  const handleAction = (actionName: string | null) => {
    switch (actionName) {
      case 'onRollDice': onRollDice(); break;
      case 'onOpenSheet': onOpenSheet(); break;
      case 'onOpenSafety': onOpenSafety(); break;
    }
  };

  return (
    <motion.div
      className="glass-panel px-4 py-2 flex items-center gap-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {dockItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTool === item.id;
        
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <motion.button
                className={`dock-button ${isActive ? 'active' : ''}`}
                onClick={() => handleAction(item.action)}
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
