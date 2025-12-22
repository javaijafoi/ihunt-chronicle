import { motion } from 'framer-motion';
import { User, Heart, Brain, ChevronRight, Dices } from 'lucide-react';
import { Character } from '@/types/game';
import { FatePointDisplay } from './FatePointDisplay';

interface CharacterHUDProps {
  character: Character;
  onSpendFate: () => void;
  onGainFate: () => void;
  onToggleStress: (track: 'physical' | 'mental', index: number) => void;
  onOpenSheet: () => void;
  onOpenDice?: () => void;
}

export function CharacterHUD({ 
  character, 
  onSpendFate, 
  onGainFate, 
  onToggleStress,
  onOpenSheet,
  onOpenDice
}: CharacterHUDProps) {
  return (
    <motion.div
      className="glass-panel p-4 w-80"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Character Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-primary">
          {character.avatar ? (
            <img src={character.avatar} alt={character.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-primary truncate">{character.name}</h3>
          <p className="text-xs text-muted-foreground truncate font-ui">
            {character.aspects.highConcept}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onOpenDice && (
            <button
              onClick={onOpenDice}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Rolar dados"
            >
              <Dices className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onOpenSheet}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Ver ficha completa"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Fate Points */}
      <div className="mb-4">
        <FatePointDisplay
          points={character.fatePoints}
          maxPoints={character.refresh + 2}
          onSpend={onSpendFate}
          onGain={onGainFate}
        />
      </div>

      {/* Stress Tracks */}
      <div className="space-y-3">
        {/* Physical Stress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground w-16">
            <Heart className="w-3 h-3 text-destructive" />
            <span className="font-ui uppercase">Físico</span>
          </div>
          <div className="flex gap-1">
            {character.stress.physical.map((filled, index) => (
              <button
                key={index}
                onClick={() => onToggleStress('physical', index)}
                className={`stress-box ${filled ? 'filled' : ''}`}
              >
                {filled && <span className="text-xs font-display">{index + 1}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Mental Stress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground w-16">
            <Brain className="w-3 h-3 text-secondary" />
            <span className="font-ui uppercase">Mental</span>
          </div>
          <div className="flex gap-1">
            {character.stress.mental.map((filled, index) => (
              <button
                key={index}
                onClick={() => onToggleStress('mental', index)}
                className={`stress-box ${filled ? 'filled' : ''}`}
                style={{ 
                  borderColor: filled ? 'hsl(var(--secondary))' : undefined,
                  background: filled ? 'hsl(var(--secondary))' : undefined,
                  boxShadow: filled ? '0 0 10px hsl(var(--secondary) / 0.5)' : undefined 
                }}
              >
                {filled && <span className="text-xs font-display">{index + 1}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Aspects */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground font-ui uppercase tracking-wider mb-2">
          Aspectos
        </div>
        <div className="space-y-1">
          <div className="aspect-tag text-xs truncate">
            {character.aspects.highConcept}
          </div>
          <div className="aspect-tag text-xs truncate">
            {character.aspects.drama}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
