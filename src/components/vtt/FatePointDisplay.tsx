import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface FatePointDisplayProps {
  points: number;
  maxPoints?: number;
  onSpend?: () => void;
  onGain?: () => void;
  compact?: boolean;
}

export function FatePointDisplay({ 
  points, 
  maxPoints = 5, 
  onSpend, 
  onGain,
  compact = false 
}: FatePointDisplayProps) {
  const displayPoints = Array.from({ length: maxPoints }, (_, i) => i < points);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="fate-point w-8 h-8 text-sm" onClick={onSpend}>
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-display text-xl text-accent">{points}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground font-ui uppercase tracking-wider">
        <Sparkles className="w-3 h-3 text-accent" />
        Pontos de Destino
      </div>
      <div className="flex gap-2">
        {displayPoints.map((filled, index) => (
          <motion.button
            key={index}
            className={`fate-point ${!filled ? 'empty' : ''}`}
            onClick={filled ? onSpend : onGain}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05, type: 'spring' }}
          >
            {filled ? <Sparkles className="w-5 h-5 text-accent-foreground" /> : ''}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
