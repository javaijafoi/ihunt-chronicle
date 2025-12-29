import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Sparkles, Heart, Brain, Zap, Target, Eye } from 'lucide-react';
import { Character } from '@/types/game';
import { FatePointDisplay } from './FatePointDisplay';
import { GENERAL_MANEUVERS, getDriveById } from '@/data/drives';
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
  variant?: 'modal' | 'window';
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
  onSkillClick,
  variant = 'modal'
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

  const sheetBody = (
    <div className="relative glass-panel w-full max-w-4xl">
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
              Perícias
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(character.skills).map(([skill, value]) => (
                <button
                  key={skill}
                  onClick={() => onSkillClick?.(skill)}
                  className={`p-2 rounded-md text-left border transition-colors ${
                    onSkillClick ? 'hover:border-primary/50 hover:text-primary' : ''
                  }`}
                  disabled={!onSkillClick}
                >
                  <div className="font-display text-lg">+{value}</div>
                  <div className="text-sm text-muted-foreground capitalize">{skill}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Stress Tracks */}
          <div className="glass-panel p-4">
            <h3 className="font-display text-xl text-destructive mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Estresse & Consequências
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {stressTooltip}
            </p>

            <div className="space-y-3">
              {/* Physical Stress */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-ui text-muted-foreground uppercase tracking-wide">Estresse Físico</span>
                  <span className="text-[10px] text-muted-foreground">Base {character.stress.physical.length}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {physicalStress.map((filled, index) => (
                    <button
                      key={index}
                      onClick={() => onToggleStress?.('physical', index)}
                      disabled={!canToggleStress}
                      className={`relative flex-1 h-10 rounded-md border transition-all flex items-center justify-center gap-1 ${
                        filled 
                          ? 'bg-destructive/20 border-destructive text-destructive glow-destructive' 
                          : 'bg-muted border-border hover:border-destructive/60'
                      } ${!canToggleStress ? 'cursor-default' : ''}`}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mental Stress */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-ui text-muted-foreground uppercase tracking-wide">Estresse Mental</span>
                  <span className="text-[10px] text-muted-foreground">Base {character.stress.mental.length}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {mentalStress.map((filled, index) => (
                    <button
                      key={index}
                      onClick={() => onToggleStress?.('mental', index)}
                      disabled={!canToggleStress}
                      className={`relative flex-1 h-10 rounded-md border transition-all flex items-center justify-center gap-1 ${
                        filled 
                          ? 'bg-primary/20 border-primary text-primary glow-primary' 
                          : 'bg-muted border-border hover:border-primary/60'
                      } ${!canToggleStress ? 'cursor-default' : ''}`}
                    >
                      <Brain className="w-4 h-4" />
                      <span className="text-sm">{index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Consequences */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              {(['mild', 'moderate', 'severe'] as const).map((severity) => (
                <div key={severity} className="glass-panel p-3 bg-muted/40 border-dashed border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-ui uppercase tracking-wider">
                      {severity === 'mild' ? 'Suave (2)' : severity === 'moderate' ? 'Moderada (4)' : 'Severa (6)'}
                    </span>
                  </div>
                  <div className={`px-3 py-2 rounded-md text-sm bg-background border ${character.consequences[severity] ? 'border-secondary' : 'border-border'} min-h-[52px]`}>
                    {character.consequences[severity] || 'Sem consequência'}
                  </div>
                  {!consequenceReadOnly && (
                    <button
                      onClick={() => onSetConsequence?.(severity, character.consequences[severity] ? null : '')}
                      className="mt-2 w-full px-3 py-2 rounded-md text-sm border border-secondary/40 text-secondary hover:bg-secondary/10 transition-colors"
                    >
                      {character.consequences[severity] ? 'Remover' : 'Adicionar'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Drives */}
          <div className="glass-panel p-4">
            <h3 className="font-display text-xl text-accent mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Impulso
            </h3>
            {character.drive ? (
              <div className="space-y-3">
                <div className="glass-panel p-3 bg-muted/30 border-primary/20">
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <span className="text-lg">{getDriveById(character.drive)?.icon}</span>
                    <span className="font-display">{getDriveById(character.drive)?.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{getDriveById(character.drive)?.summary}</p>
                </div>
                <div className="glass-panel p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Manobra Grátis</p>
                  <p className="font-display text-lg text-primary">{getDriveById(character.drive)?.freeManeuver.name}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getDriveById(character.drive)?.exclusiveManeuvers.map((maneuver) => (
                    <div key={maneuver.id} className="glass-panel p-3 bg-muted/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Manobra Exclusiva</p>
                      <p className="font-display text-lg">{maneuver.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum impulso selecionado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === 'window') {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            className="w-full"
          >
            {sheetBody}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {sheetBody}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
