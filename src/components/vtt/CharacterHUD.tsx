import { motion } from 'framer-motion';
import { User, Heart, Brain, ChevronRight, Dices, MapPin } from 'lucide-react';
import { Character } from '@/types/game';
import { calculateStressTracks } from '@/utils/gameRules';
import { FatePointDisplay } from './FatePointDisplay';

interface CharacterHUDProps {
  character: Character;
  onSpendFate: () => void;
  onGainFate: () => void;
  onToggleStress: (track: 'physical' | 'mental', index: number) => void;
  onOpenFullSheet: () => void;
  onOpenDice?: () => void;
  onAddToScene?: () => void;
  isInScene?: boolean;
}

export function CharacterHUD({ 
  character, 
  onSpendFate, 
  onGainFate, 
  onToggleStress,
  onOpenFullSheet,
  onOpenDice,
  onAddToScene,
  isInScene = false,
}: CharacterHUDProps) {
  const calculatedTracks = calculateStressTracks(character);
  const physicalStress = calculatedTracks.physical.map(
    (_filled, index) => character.stress.physical?.[index] ?? false
  );
  const mentalStress = calculatedTracks.mental.map(
    (_filled, index) => character.stress.mental?.[index] ?? false
  );
  const stressTooltip =
    'No Fate, as caixas são valores de absorção. Você pode riscar la caixa 3 para absorver 3 de dano, deixando as menores livres.';

  return (
    <motion.div
      className="glass-panel p-4 w-full max-w-[21rem]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Character Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-primary shrink-0">
          {character.avatar ? (
            <img src={character.avatar} alt={character.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 
            className="font-display text-lg text-primary truncate" 
            title={character.name}
          >
            {character.name}
          </h3>
          <p 
            className="text-xs text-muted-foreground line-clamp-2 font-ui leading-tight"
            title={character.aspects.highConcept}
          >
            {character.aspects.highConcept}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
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
            onClick={onOpenFullSheet}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Ver ficha completa"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scene Action Button */}
      {onAddToScene && (
        <div className="mb-4">
          {!isInScene ? (
            <button
              onClick={onAddToScene}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-ui text-sm"
            >
              <MapPin className="w-4 h-4" />
              Entrar na Cena
            </button>
          ) : (
            <div className="w-full text-center p-2 rounded-lg bg-muted text-muted-foreground font-ui text-sm flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              Já está em cena
            </div>
          )}
        </div>
      )}

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
            {physicalStress.map((filled, index) => (
              <button
                key={index}
                onClick={() => onToggleStress('physical', index)}
                className={`stress-box ${filled ? 'filled' : ''}`}
                aria-label={`Estresse Físico ${index + 1}`}
                title={`Estresse Físico ${index + 1}. ${stressTooltip}`}
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
            {mentalStress.map((filled, index) => (
              <button
                key={index}
                onClick={() => onToggleStress('mental', index)}
                className={`stress-box ${filled ? 'filled' : ''}`}
                aria-label={`Estresse Mental ${index + 1}`}
                title={`Estresse Mental ${index + 1}. ${stressTooltip}`}
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
        <div className="space-y-1.5">
          <div 
            className="aspect-tag text-xs line-clamp-2 leading-snug"
            title={character.aspects.highConcept}
          >
            {character.aspects.highConcept}
          </div>
          <div 
            className="aspect-tag text-xs line-clamp-2 leading-snug"
            title={character.aspects.drama}
          >
            {character.aspects.drama}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
