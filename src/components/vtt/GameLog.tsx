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
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="bg-gradient-to-br from-muted/80 to-muted/40 rounded-xl border border-border overflow-hidden"
    >
      {/* Header with character info */}
      <div className="flex items-center gap-3 p-3 border-b border-border/50">
        <div className="w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center shrink-0 overflow-hidden">
          {rollDetails.avatar ? (
            <img src={rollDetails.avatar} alt={log.character || 'Jogador'} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm text-foreground truncate">
            {log.character || 'Jogador'}
          </div>
          <div className="text-xs text-muted-foreground">
            {rollDetails.actionLabel || 'Rolagem Livre'}
            {rollDetails.skill && (
              <span className="text-primary ml-1">
                • {rollDetails.skill} ({formatModifier(rollDetails.skillBonus ?? 0)})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dice results */}
      <div className="p-3 space-y-3">
        {/* Fate dice display */}
        <div className="flex items-center gap-2 justify-center">
          {rollDetails.fateDice.map((face, index) => (
            <motion.div
              key={index}
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-mono text-lg font-bold ${getFaceColor(face)}`}
            >
              {formatFace(face)}
            </motion.div>
          ))}
          {rollDetails.type === 'advantage' && typeof rollDetails.d6 === 'number' && (
            <motion.div
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-10 h-10 rounded-lg border-2 border-secondary bg-secondary/20 flex items-center justify-center font-mono text-lg font-bold text-secondary"
            >
              {rollDetails.d6}
            </motion.div>
          )}
        </div>

        {/* Total and outcome */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Total</span>
            <span className="font-display text-2xl text-foreground">
              {formatModifier(rollDetails.total)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({rollDetails.ladderLabel})
            </span>
          </div>

          {rollDetails.opposition !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">vs</span>
              <span className="font-display text-lg text-muted-foreground">
                {formatModifier(rollDetails.opposition)}
              </span>
            </div>
          )}
        </div>

        {/* Outcome badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-background/50 ${outcomeInfo.color}`}
        >
          <OutcomeIcon className="w-5 h-5" />
          <span className="font-display text-sm uppercase tracking-wide">
            {outcomeInfo.label}
          </span>
          {rollDetails.shifts !== undefined && rollDetails.shifts !== 0 && (
            <span className="text-xs opacity-80">
              ({Math.abs(rollDetails.shifts)} virada{Math.abs(rollDetails.shifts) !== 1 ? 's' : ''})
            </span>
          )}
        </motion.div>
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
