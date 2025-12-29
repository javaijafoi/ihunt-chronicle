import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { GameLog } from './GameLog';
import { LogEntry } from '@/types/game';

interface RightSidebarProps {
  logs: LogEntry[];
  onSendMessage: (message: string) => void;
}

export function RightSidebar({ logs, onSendMessage }: RightSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className="h-full flex flex-col bg-background/80 backdrop-blur-sm border-l border-border"
      initial={false}
      animate={{ width: collapsed ? 48 : 380 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Collapse toggle */}
      <div className="p-2 flex justify-start border-b border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Content */}
      {collapsed ? (
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded hover:bg-muted transition-colors"
            title="Abrir Chat"
          >
            <span className="writing-mode-vertical text-xs text-muted-foreground font-ui uppercase tracking-widest">
              Chat
            </span>
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden">
          <GameLog logs={logs} onSendMessage={onSendMessage} />
        </div>
      )}
    </motion.aside>
  );
}
