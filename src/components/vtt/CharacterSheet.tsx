import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Sparkles, Heart, Brain, Zap, Target, Eye } from 'lucide-react';
import { Character } from '@/types/game';
import { FatePointDisplay } from './FatePointDisplay';
import { DRIVES, GENERAL_MANEUVERS, getDriveById } from '@/data/drives';
import { calculateStressTracks } from '@/utils/gameRules';

interface CharacterSheetProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onSpendFate?: () => void;
  onGainFate?: () => void;
  onToggleStress?: (track: 'physical' | 'mental', index: number) => void;
  onSetConsequence?: (
    severity: 'mild' | 'moderate' | 'severe',
    value: string | null
  ) => void;
  readOnly?: boolean;
  onSkillClick?: (skill: string) => void;
}

export function CharacterSheet({ 
  character, 
  isOpen, 
  onClose, 
  onSpendFate,
  onGainFate,
  onToggleStress,
  onSetConsequence,
  readOnly = false,
  onSkillClick
}: CharacterSheetProps) {
  const canToggleStress = !readOnly && !!onToggleStress;
  const consequenceReadOnly = readOnly || !onSetConsequence;
  const calculatedTracks = calculateStressTracks(character);
  const stressTooltip =
    'No Fate, as caixas são valores de absorção. Você pode riscar a caixa 3 para absorver 3 de dano, deixando as menores livres.';
  const physicalStress = calculatedTracks.physical.map(
    (_filled, index) => character.stress.physical?.[index] ?? false
  );
  const mentalStress = calculatedTracks.mental.map(
    (_filled, index) => character.stress.mental?.[index] ?? false
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          
          {/* Sheet */}
          <motion.div
            className="relative glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 glass-panel rounded-t-lg border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-primary">
                  {character.avatar ? (
                    <img src={character.avatar} alt={character.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-3xl text-glow-primary text-primary">
                      {character.name}
                    </h2>
                    {readOnly && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs font-ui text-muted-foreground border border-border">
                        <Eye className="w-3 h-3" />
                        Visualização
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground font-ui">
                    {character.aspects.highConcept}
                  </p>
                  {character.drive && (
                    <p className="text-sm text-secondary flex items-center gap-1 mt-1">
                      <span>{getDriveById(character.drive)?.icon}</span>
                      {getDriveById(character.drive)?.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Fate Points */}
                <div className="glass-panel p-4">
                  <FatePointDisplay
                    points={character.fatePoints}
                    maxPoints={character.refresh + 2}
                    onSpend={readOnly ? undefined : onSpendFate}
                    onGain={readOnly ? undefined : onGainFate}
                    readOnly={readOnly}
                  />
                  {readOnly && (
                    <p className="mt-2 text-xs text-muted-foreground font-ui">
                      Modo de visualização — alterações desativadas.
                    </p>
                  )}
                </div>

                {/* Aspects */}
                <div className="glass-panel p-4">
                  <h3 className="font-display text-xl text-primary mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Aspectos
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider">Alto Conceito</label>
                      <div className="aspect-tag mt-1">{character.aspects.highConcept}</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider">Drama</label>
                      <div className="aspect-tag mt-1">{character.aspects.drama}</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider">Emprego</label>
                      <div className="aspect-tag mt-1">{character.aspects.job}</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider">Quadro dos Sonhos</label>
                      <div className="aspect-tag mt-1">{character.aspects.dreamBoard}</div>
                    </div>
                    {character.aspects.free.map((aspect, i) => (
                      <div key={i}>
                        <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider">Livre</label>
                        <div className="aspect-tag mt-1">{aspect}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Maneuvers */}
                <div className="glass-panel p-4">
                  <h3 className="font-display text-xl text-secondary mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Manobras
                  </h3>
                  <div className="space-y-2">
                    {character.maneuvers.map((maneuverId, i) => {
                      // Resolve maneuver name from ID
                      const drive = character.drive ? getDriveById(character.drive) : undefined;
                      let maneuverName = maneuverId;
                      let isFree = false;
                      
                      if (drive) {
                        if (drive.freeManeuver.id === maneuverId) {
                          maneuverName = drive.freeManeuver.name;
                          isFree = true;
                        } else {
                          const exclusive = drive.exclusiveManeuvers.find(m => m.id === maneuverId);
                          if (exclusive) maneuverName = exclusive.name;
                        }
                      }
                      const general = GENERAL_MANEUVERS.find(m => m.id === maneuverId);
                      if (general) maneuverName = general.name;

                      return (
                        <div key={i} className={`px-3 py-2 rounded-md font-ui text-sm ${
                          isFree ? 'bg-primary/20 text-primary' : 'bg-muted'
                        }`}>
                          {maneuverName}
                          {isFree && <span className="ml-2 text-xs opacity-70">(grátis)</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Skills */}
                <div className="glass-panel p-4">
                  <h3 className="font-display text-xl text-primary mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Habilidades
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(character.skills)
                      .sort(([, a], [, b]) => b - a)
                      .map(([skill, value]) => (
                        <button
                          key={skill}
                          onClick={() => onSkillClick?.(skill)}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-md bg-muted transition-colors ${
                            onSkillClick ? 'hover:bg-muted/80 cursor-pointer' : ''
                          }`}
                        >
                          <span className="font-ui text-left">{skill}</span>
                          <span className="font-display text-xl text-primary">+{value}</span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Stress */}
                <div className="glass-panel p-4">
                  <h3 className="font-display text-xl text-destructive mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Estresse
                  </h3>
                  
                  {/* Physical */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-ui uppercase tracking-wider">Físico</span>
                    </div>
                    <div className="flex gap-2">
                      {physicalStress.map((filled, index) => (
                        <button
                          key={index}
                          onClick={
                            canToggleStress ? () => onToggleStress('physical', index) : undefined
                          }
                          className={`stress-box w-10 h-10 ${filled ? 'filled' : ''} ${!canToggleStress ? 'opacity-70 cursor-not-allowed' : ''}`}
                          disabled={!canToggleStress}
                          title={stressTooltip}
                        >
                          <span className="font-display">{index + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mental */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-ui uppercase tracking-wider">Mental</span>
                    </div>
                    <div className="flex gap-2">
                      {mentalStress.map((filled, index) => (
                        <button
                          key={index}
                          onClick={
                            canToggleStress ? () => onToggleStress('mental', index) : undefined
                          }
                          className={`stress-box w-10 h-10 ${filled ? 'filled' : ''} ${!canToggleStress ? 'opacity-70 cursor-not-allowed' : ''}`}
                          disabled={!canToggleStress}
                          style={{ 
                            borderColor: filled ? 'hsl(var(--secondary))' : undefined,
                            background: filled ? 'hsl(var(--secondary))' : undefined 
                          }}
                          title={stressTooltip}
                        >
                          <span className="font-display">{index + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Consequences */}
                <div className="glass-panel p-4">
                  <h3 className="font-display text-xl text-destructive mb-4">
                    Consequências
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-display text-sm">2</span>
                        Leve
                      </label>
                      <input
                        type="text"
                        placeholder="Vazio"
                        value={character.consequences.mild || ''}
                        className="w-full mt-1 px-3 py-2 rounded-md bg-input border border-border 
                                 focus:border-primary focus:outline-none font-ui text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        readOnly={consequenceReadOnly}
                        disabled={consequenceReadOnly}
                        onChange={(e) => onSetConsequence?.('mild', e.target.value || null)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-display text-sm">4</span>
                        Moderada
                      </label>
                      <input
                        type="text"
                        placeholder="Vazio"
                        value={character.consequences.moderate || ''}
                        className="w-full mt-1 px-3 py-2 rounded-md bg-input border border-border 
                                 focus:border-primary focus:outline-none font-ui text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        readOnly={consequenceReadOnly}
                        disabled={consequenceReadOnly}
                        onChange={(e) => onSetConsequence?.('moderate', e.target.value || null)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-display text-sm">6</span>
                        Grave
                      </label>
                      <input
                        type="text"
                        placeholder="Vazio"
                        value={character.consequences.severe || ''}
                        className="w-full mt-1 px-3 py-2 rounded-md bg-input border border-border 
                                 focus:border-primary focus:outline-none font-ui text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        readOnly={consequenceReadOnly}
                        disabled={consequenceReadOnly}
                        onChange={(e) => onSetConsequence?.('severe', e.target.value || null)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
