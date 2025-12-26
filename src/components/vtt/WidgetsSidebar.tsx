import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Bookmark, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Widget {
  id: string;
  icon: typeof Users;
  label: string;
}

const widgets: Widget[] = [
  { id: 'party', icon: Users, label: 'Grupo' },
  { id: 'character', icon: User, label: 'Personagem' },
  { id: 'aspects', icon: Bookmark, label: 'Aspectos' },
];

interface WidgetsSidebarProps {
  partyContent: ReactNode;
  characterContent: ReactNode;
  aspectsContent: ReactNode;
}

export function WidgetsSidebar({ partyContent, characterContent, aspectsContent }: WidgetsSidebarProps) {
  const [activeWidget, setActiveWidget] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vtt-active-widget') || null;
    }
    return null;
  });

  useEffect(() => {
    if (activeWidget) {
      localStorage.setItem('vtt-active-widget', activeWidget);
    } else {
      localStorage.removeItem('vtt-active-widget');
    }
  }, [activeWidget]);

  const toggleWidget = (widgetId: string) => {
    setActiveWidget(prev => prev === widgetId ? null : widgetId);
  };

  const getWidgetContent = () => {
    switch (activeWidget) {
      case 'party':
        return partyContent;
      case 'character':
        return characterContent;
      case 'aspects':
        return aspectsContent;
      default:
        return null;
    }
  };

  const activeWidgetLabel = widgets.find(w => w.id === activeWidget)?.label || '';

  return (
    <div className="flex h-full">
      {/* Icon Bar */}
      <motion.div
        className="glass-panel w-14 flex flex-col items-center py-3 gap-2 shrink-0"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {widgets.map((widget) => {
          const Icon = widget.icon;
          const isActive = activeWidget === widget.id;

          return (
            <Tooltip key={widget.id}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => toggleWidget(widget.id)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{widget.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </motion.div>

      {/* Floating Panel */}
      <AnimatePresence>
        {activeWidget && (
          <motion.div
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="ml-2"
          >
            <div className="glass-panel h-full w-72 flex flex-col overflow-hidden">
              {/* Panel Header */}
              <div className="flex items-center justify-between p-3 border-b border-border shrink-0">
                <h3 className="font-display text-sm text-foreground">
                  {activeWidgetLabel}
                </h3>
                <button
                  onClick={() => setActiveWidget(null)}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-3 min-h-0">
                {getWidgetContent()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
