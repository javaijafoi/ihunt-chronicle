import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Dices, Sparkles, Bookmark, Info, Send } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { LogEntry, RollLogDetails } from '@/types/game';

interface GameLogProps {
  logs: LogEntry[];
  onSendMessage: (message: string) => void;
}

const getLogIcon = (type: LogEntry['type']) => {
  switch (type) {
    case 'roll': return <Dices className="w-3 h-3 text-primary" />;
    case 'fate': return <Sparkles className="w-3 h-3 text-accent" />;
    case 'aspect': return <Bookmark className="w-3 h-3 text-secondary" />;
    case 'system': return <Info className="w-3 h-3 text-muted-foreground" />;
    default: return <MessageSquare className="w-3 h-3 text-foreground" />;
  }
};

const getLogColor = (type: LogEntry['type']) => {
  switch (type) {
    case 'roll': return 'border-l-primary';
    case 'fate': return 'border-l-accent';
    case 'aspect': return 'border-l-secondary';
    case 'system': return 'border-l-muted';
    default: return 'border-l-foreground/30';
  }
};

const isRollDetails = (details?: LogEntry['details']): details is RollLogDetails => {
  return Boolean(details && typeof details === 'object' && 'kind' in details && (details as RollLogDetails).kind === 'roll');
};

const formatModifier = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

const formatFace = (face: 'plus' | 'minus' | 'blank') => {
  if (face === 'plus') return '+';
  if (face === 'minus') return '−';
  return '0';
};

const getOutcomeColor = (outcome?: string) => {
  if (!outcome) return 'text-muted-foreground';
  const lower = outcome.toLowerCase();
  if (lower.includes('falha')) return 'text-destructive';
  if (lower.includes('empate')) return 'text-warning';
  if (lower.includes('estilo')) return 'text-secondary';
  if (lower.includes('sucesso')) return 'text-fate-plus';
  return 'text-foreground';
};

export function GameLog({ logs, onSendMessage }: GameLogProps) {
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

  const formatTime = (date: Date | Timestamp) => {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <motion.div
      className="glass-panel flex flex-col h-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="font-display text-lg flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Log da Sessão
        </h3>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            const rollDetails = isRollDetails(log.details) ? log.details : null;
            const actionText = rollDetails?.actionLabel || 'Rolagem Livre';
            const message = rollDetails
              ? `${log.character || 'Jogador'} rolou ${actionText}${rollDetails.skill ? ` com ${rollDetails.skill} (${formatModifier(rollDetails.skillBonus ?? 0)})` : ''}`
              : log.message;

            return (
              <motion.div
                key={log.id}
                className={`border-l-2 pl-2 py-1 ${getLogColor(log.type)}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">{getLogIcon(log.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-ui ${log.type === 'system' ? 'text-muted-foreground italic' : ''}`}>
                      {message}
                    </p>
                    {rollDetails && (
                      <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground font-ui">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-foreground">
                            Total {formatModifier(rollDetails.total)}
                          </span>
                          <span className="text-muted-foreground/60">({rollDetails.ladderLabel})</span>
                          {rollDetails.opposition !== undefined && (
                            <span className="text-muted-foreground">
                              vs {formatModifier(rollDetails.opposition)}
                            </span>
                          )}
                          {rollDetails.shifts !== undefined && (
                            <span className="text-foreground">
                              ({Math.abs(rollDetails.shifts)} virada{Math.abs(rollDetails.shifts) !== 1 ? 's' : ''})
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] uppercase tracking-wide font-medium ${getOutcomeColor(rollDetails.outcome)}`}>
                          {rollDetails.outcome}
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5">
                          {rollDetails.fateDice.map((face, index) => (
                            <span
                              key={`${log.id}-df-${index}`}
                              className="px-2 py-1 rounded border border-border bg-muted text-foreground font-mono text-[11px] leading-none"
                              title={`dF ${index + 1}: ${formatFace(face)}`}
                            >
                              {formatFace(face)}
                            </span>
                          ))}
                          {rollDetails.type === 'advantage' && typeof rollDetails.d6 === 'number' && (
                            <span
                              className="px-2 py-1 rounded border border-secondary text-secondary bg-secondary/10 font-mono text-[11px] leading-none"
                              title={`d6 (vantagem): ${rollDetails.d6}`}
                            >
                              d6: {rollDetails.d6}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 px-3 py-2 rounded-md bg-input border border-border 
                     focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
                     font-ui text-sm placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
