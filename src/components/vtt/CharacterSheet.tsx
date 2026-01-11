import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Sparkles, Heart, Brain, Zap, Target, Eye, Info } from 'lucide-react';
import { Character } from '@/types/game';
import { FatePointDisplay } from './FatePointDisplay';
import { GENERAL_MANEUVERS, getDriveById } from '@/data/drives';
import { calculateStressTracks } from '@/utils/gameRules';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  onAddSituationalAspect?: (name: string, freeInvokes: number) => void;
  onRemoveSituationalAspect?: (id: string) => void;
  onUpdateSituationalAspect?: (id: string, updates: Partial<{ name: string; freeInvokes: number }>) => void;
  onInvokeAspect?: (aspect: string) => void;
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
  variant = 'modal',
  onAddSituationalAspect,
  onRemoveSituationalAspect,
  onUpdateSituationalAspect,
  onInvokeAspect
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
    <div className="relative w-full max-w-4xl">
      {/* Character Info Header - Only show in modal variant */}
      {variant === 'modal' && (
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
              <h2 className="font-display text-3xl text-glow-primary text-primary">
                {character.name}
              </h2>
              <p className="text-muted-foreground font-ui">
                {character.aspects.highConcept}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Character identity bar for window variant */}
      {variant === 'window' && (
        <div className="flex items-center gap-3 mb-4 p-3 glass-panel rounded-lg">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-primary shrink-0">
            {character.avatar ? (
              <img src={character.avatar} alt={character.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl text-primary truncate">{character.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{character.aspects.highConcept}</p>
          </div>
          {readOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs font-ui text-muted-foreground border border-border shrink-0">
              <Eye className="w-3 h-3" />
              Visualização
            </span>
          )}
        </div>
      )}

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
            <h3 className="font-display text-xl text-primary mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Aspectos
            </h3>
            <div className="space-y-2">
              <div className="space-y-2">
                <div className="group relative">
                  <label className="text-[10px] text-muted-foreground font-ui uppercase tracking-wider">Alto Conceito</label>
                  <div
                    className={`aspect-tag mt-0.5 text-sm truncate ${onInvokeAspect ? 'cursor-pointer hover:text-primary hover:border-primary/50 transition-colors' : ''}`}
                    title={character.aspects.highConcept}
                    onClick={() => onInvokeAspect?.(character.aspects.highConcept)}
                  >
                    {character.aspects.highConcept}
                  </div>
                  {onInvokeAspect && <span className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 text-[10px] text-primary bg-background px-1 rounded border border-primary/20 pointer-events-none">Invocar</span>}
                </div>
                <div className="group relative">
                  <label className="text-[10px] text-muted-foreground font-ui uppercase tracking-wider">Drama</label>
                  <div
                    className={`aspect-tag mt-0.5 text-sm truncate ${onInvokeAspect ? 'cursor-pointer hover:text-primary hover:border-primary/50 transition-colors' : ''}`}
                    title={character.aspects.drama}
                    onClick={() => onInvokeAspect?.(character.aspects.drama)}
                  >
                    {character.aspects.drama}
                  </div>
                  {onInvokeAspect && <span className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 text-[10px] text-primary bg-background px-1 rounded border border-primary/20 pointer-events-none">Invocar</span>}
                </div>
                <div className="group relative">
                  <label className="text-[10px] text-muted-foreground font-ui uppercase tracking-wider">Emprego</label>
                  <div
                    className={`aspect-tag mt-0.5 text-sm truncate ${onInvokeAspect ? 'cursor-pointer hover:text-primary hover:border-primary/50 transition-colors' : ''}`}
                    title={character.aspects.job}
                    onClick={() => onInvokeAspect?.(character.aspects.job)}
                  >
                    {character.aspects.job}
                  </div>
                  {onInvokeAspect && <span className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 text-[10px] text-primary bg-background px-1 rounded border border-primary/20 pointer-events-none">Invocar</span>}
                </div>
                <div className="group relative">
                  <label className="text-[10px] text-muted-foreground font-ui uppercase tracking-wider">Quadro dos Sonhos</label>
                  <div
                    className={`aspect-tag mt-0.5 text-sm truncate ${onInvokeAspect ? 'cursor-pointer hover:text-primary hover:border-primary/50 transition-colors' : ''}`}
                    title={character.aspects.dreamBoard}
                    onClick={() => onInvokeAspect?.(character.aspects.dreamBoard)}
                  >
                    {character.aspects.dreamBoard}
                  </div>
                  {onInvokeAspect && <span className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 text-[10px] text-primary bg-background px-1 rounded border border-primary/20 pointer-events-none">Invocar</span>}
                </div>
                {character.aspects.free.map((aspect, i) => (
                  <div key={i} className="group relative">
                    <label className="text-[10px] text-muted-foreground font-ui uppercase tracking-wider">Livre</label>
                    <div
                      className={`aspect-tag mt-0.5 text-sm truncate ${onInvokeAspect ? 'cursor-pointer hover:text-primary hover:border-primary/50 transition-colors' : ''}`}
                      title={aspect}
                      onClick={() => onInvokeAspect?.(aspect)}
                    >
                      {aspect}
                    </div>
                    {onInvokeAspect && <span className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 text-[10px] text-primary bg-background px-1 rounded border border-primary/20 pointer-events-none">Invocar</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Situational Aspects */}
        <div className="glass-panel p-4">
          <h3 className="font-display text-xl text-primary mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Vantagens / Aspectos Situacionais
          </h3>

          <div className="space-y-2">
            {character.situationalAspects?.map((aspect) => (
              <div key={aspect.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded border border-border/50 group hover:border-primary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate" title={aspect.name}>{aspect.name}</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="uppercase tracking-wider">Invocações Grátis:</span>
                    <span className="font-bold text-primary">{aspect.freeInvokes}</span>
                  </div>
                </div>

                {!readOnly && onUpdateSituationalAspect && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateSituationalAspect(aspect.id, { freeInvokes: Math.max(0, aspect.freeInvokes - 1) })}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onUpdateSituationalAspect(aspect.id, { freeInvokes: aspect.freeInvokes + 1 })}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    >
                      +
                    </button>
                  </div>
                )}

                {!readOnly && onRemoveSituationalAspect && (
                  <button
                    onClick={() => onRemoveSituationalAspect(aspect.id)}
                    className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {!readOnly && onAddSituationalAspect && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  id="new-situational-aspect"
                  placeholder="Nova vantagem..."
                  className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget;
                      if (input.value.trim()) {
                        onAddSituationalAspect(input.value.trim(), 1); // Default 1 free invoke
                        input.value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('new-situational-aspect') as HTMLInputElement;
                    if (input?.value.trim()) {
                      onAddSituationalAspect(input.value.trim(), 1);
                      input.value = '';
                    }
                  }}
                  className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Maneuvers */}
        <div className="glass-panel p-4">
          <h3 className="font-display text-xl text-secondary mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Manobras
          </h3>
          <div className="space-y-1.5">
            {character.maneuvers.map((maneuverId, i) => {
              const drive = character.drive ? getDriveById(character.drive) : undefined;
              let maneuverName = maneuverId;
              let maneuverDescription = '';
              let isFree = false;

              if (drive) {
                if (drive.freeManeuver.id === maneuverId) {
                  maneuverName = drive.freeManeuver.name;
                  maneuverDescription = drive.freeManeuver.description;
                  isFree = true;
                } else {
                  const exclusive = drive.exclusiveManeuvers.find(m => m.id === maneuverId);
                  if (exclusive) {
                    maneuverName = exclusive.name;
                    maneuverDescription = exclusive.description;
                  }
                }
              }
              const general = GENERAL_MANEUVERS.find(m => m.id === maneuverId);
              if (general) {
                maneuverName = general.name;
                maneuverDescription = general.description;
              }

              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div className={`px-2.5 py-1.5 rounded-md font-ui text-sm flex items-center gap-2 cursor-help ${isFree ? 'bg-primary/20 text-primary' : 'bg-muted'
                      }`}>
                      <span className="truncate flex-1">{maneuverName}</span>
                      {isFree && <span className="text-[10px] opacity-70 shrink-0">(grátis)</span>}
                      <Info className="w-3 h-3 opacity-50 shrink-0" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p className="font-medium mb-1">{maneuverName}</p>
                    <p className="text-xs text-muted-foreground">{maneuverDescription}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Skills */}
        <div className="glass-panel p-4">
          <h3 className="font-display text-xl text-primary mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Perícias
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(character.skills).map(([skill, value]) => (
              <button
                key={skill}
                onClick={() => onSkillClick?.(skill)}
                className={`p-1.5 rounded text-center border transition-colors ${onSkillClick ? 'hover:border-primary/50 hover:text-primary cursor-pointer' : 'cursor-default'
                  }`}
                disabled={!onSkillClick}
              >
                <div className="font-display text-lg leading-none">+{value}</div>
                <div className="text-[10px] text-muted-foreground capitalize truncate">{skill}</div>
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
                    className={`relative flex-1 h-10 rounded-md border transition-all flex items-center justify-center gap-1 ${filled
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
                    className={`relative flex-1 h-10 rounded-md border transition-all flex items-center justify-center gap-1 ${filled
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
          <h3 className="font-display text-xl text-accent mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Impulso
          </h3>
          {character.drive ? (
            <div className="space-y-2">
              <div className="glass-panel p-2.5 bg-muted/30 border-primary/20">
                <p className="text-sm text-foreground flex items-center gap-2">
                  <span className="text-base">{getDriveById(character.drive)?.icon}</span>
                  <span className="font-display truncate">{getDriveById(character.drive)?.name}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{getDriveById(character.drive)?.summary}</p>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="glass-panel p-2.5 cursor-help">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Manobra Grátis</p>
                    <p className="font-display text-sm text-primary truncate">{getDriveById(character.drive)?.freeManeuver.name}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="font-medium mb-1">{getDriveById(character.drive)?.freeManeuver.name}</p>
                  <p className="text-xs text-muted-foreground">{getDriveById(character.drive)?.freeManeuver.description}</p>
                </TooltipContent>
              </Tooltip>

              <div className="grid grid-cols-2 gap-1.5">
                {getDriveById(character.drive)?.exclusiveManeuvers.map((maneuver) => (
                  <Tooltip key={maneuver.id}>
                    <TooltipTrigger asChild>
                      <div className="glass-panel p-2 bg-muted/50 cursor-help">
                        <p className="text-[10px] text-muted-foreground uppercase">Exclusiva</p>
                        <p className="font-display text-sm truncate">{maneuver.name}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="font-medium mb-1">{maneuver.name}</p>
                      <p className="text-xs text-muted-foreground">{maneuver.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum impulso selecionado.</p>
          )}
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
