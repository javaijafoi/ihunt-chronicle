import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, User, CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { LogEntry, RollLogDetails } from '@/types/game';

interface GameLogProps {
  logs: LogEntry[];
  onSendMessage: (message: string) => void;
  currentUserName?: string;
}

const isRollDetails = (details?: LogEntry['details']): details is RollLogDetails => {
  return Boolean(details && typeof details === 'object' && 'kind' in details && (details as RollLogDetails).kind === 'roll');
};

const formatFace = (face: 'plus' | 'minus' | 'blank') => {
  if (face === 'plus') return '+';
  if (face === 'minus') return '−';
  return '0';
};

const getFaceColor = (face: 'plus' | 'minus' | 'blank') => {
  if (face === 'plus') return 'bg-fate-plus/20 text-fate-plus border-fate-plus/30';
  if (face === 'minus') return 'bg-destructive/20 text-destructive border-destructive/30';
  return 'bg-muted text-muted-foreground border-border';
};

type OutcomeType = 'success' | 'failure' | 'tie' | 'style';

const getOutcomeInfo = (outcome?: string): { type: OutcomeType; label: string; icon: typeof CheckCircle; color: string } => {
  if (!outcome) return { type: 'tie', label: 'Resultado', icon: AlertCircle, color: 'text-muted-foreground' };

  const lower = outcome.toLowerCase();
  if (lower.includes('estilo')) {
    return { type: 'style', label: 'Sucesso com Estilo!', icon: Sparkles, color: 'text-secondary' };
  }
  if (lower.includes('sucesso')) {
    return { type: 'success', label: 'Sucesso', icon: CheckCircle, color: 'text-fate-plus' };
  }
  if (lower.includes('empate')) {
    return { type: 'tie', label: 'Empate', icon: AlertCircle, color: 'text-warning' };
  }
  if (lower.includes('falha')) {
    return { type: 'failure', label: 'Falha', icon: XCircle, color: 'text-destructive' };
  }
  return { type: 'tie', label: outcome, icon: AlertCircle, color: 'text-muted-foreground' };
};

function RollCard({ log, rollDetails }: { log: LogEntry; rollDetails: RollLogDetails }) {
  const outcomeInfo = getOutcomeInfo(rollDetails.outcome);
  const OutcomeIcon = outcomeInfo.icon;
  const formatModifier = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-background/40 backdrop-blur-sm border border-border/50 rounded-lg p-2 flex items-center gap-3 hover:bg-background/60 transition-colors group"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-background border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
        {rollDetails.avatar ? (
          <img src={rollDetails.avatar} alt={log.character || 'Jogador'} className="w-full h-full object-cover" />
        ) : (
          <User className="w-4 h-4 text-primary/50" />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Header Line */}
        <div className="flex items-baseline gap-2 text-xs">
          <span className="font-display font-bold text-foreground truncate max-w-[100px]">
            {log.character || 'Jogador'}
          </span>
          <span className="text-muted-foreground truncate">
            {rollDetails.actionLabel || 'Rolou Dados'}
          </span>
          {rollDetails.skill && (
            <span className="text-primary font-medium">
              {rollDetails.skill} ({formatModifier(rollDetails.skillBonus ?? 0)})
            </span>
          )}
        </div>

        {/* Dice Row */}
        <div className="flex items-center gap-1 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {rollDetails.fateDice.map((face, index) => (
            <div
              key={index}
              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono border ${getFaceColor(face)}`}
            >
              {formatFace(face)}
            </div>
          ))}
          {rollDetails.type === 'advantage' && typeof rollDetails.d6 === 'number' && (
            <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono border border-secondary bg-secondary/10 text-secondary">
              {rollDetails.d6}
            </div>
          )}
          {/* Opposition if present */}
          {rollDetails.opposition !== undefined && (
            <span className="text-[10px] text-muted-foreground ml-1">
              vs {rollDetails.opposition}
            </span>
          )}
        </div>
      </div>

      {/* Result Section */}
      <div className="flex flex-col items-end justify-center min-w-[60px]">
        <div className="flex items-center gap-1">
          <span className={`font-display text-xl leading-none ${outcomeInfo.color}`}>
            {formatModifier(rollDetails.total)}
          </span>
          <div className={`${outcomeInfo.color}`} title={outcomeInfo.label}>
            <OutcomeIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Shifts (Little Badge) */}
        {rollDetails.shifts !== undefined && rollDetails.shifts > 0 && (
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">
            {rollDetails.shifts} shifts
          </span>
        )}

        {/* Timestamp */}
        <span className="text-[9px] text-muted-foreground/40 font-mono">
          {(() => {
            const d = log.timestamp instanceof Timestamp ? log.timestamp.toDate() : new Date(log.timestamp);
            return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          })()}
        </span>
      </div>
    </motion.div>
  );
}

function ChatMessage({ log }: { log: LogEntry }) {
  const formatTime = (date: Date | Timestamp) => {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'fate':
        return 'bg-accent/10 border-accent/30 text-accent';
      case 'aspect':
        return 'bg-secondary/10 border-secondary/30 text-secondary';
      case 'system':
        return 'bg-muted/50 border-border text-muted-foreground italic';
      default:
        return 'bg-primary/10 border-primary/30 text-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-lg border px-3 py-2 ${getMessageStyle(log.type)}`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {log.character && log.type === 'chat' && (
            <span className="font-display text-xs text-primary block mb-0.5">
              {log.character}
            </span>
          )}
          <p className="text-sm font-ui break-words">{log.message}</p>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
          {formatTime(log.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

export function GameLog({ logs, onSendMessage, currentUserName }: GameLogProps) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="glass-panel flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-3 border-b border-border shrink-0">
        <h3 className="font-display text-lg flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Chat da Sessão
        </h3>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            const rollDetails = isRollDetails(log.details) ? log.details : null;

            if (rollDetails) {
              return (
                <RollCard
                  key={log.id}
                  log={log}
                  rollDetails={rollDetails}
                />
              );
            }

            return <ChatMessage key={log.id} log={log} />;
          })}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma mensagem ainda.</p>
            <p className="text-xs mt-1">Comece a conversa!</p>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 px-3 py-2 rounded-lg bg-input border border-border 
                     focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
                     font-ui text-sm placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
