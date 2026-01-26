import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Sparkles, Heart, Brain, Zap, Target, Eye, Info } from 'lucide-react';
import { Character } from '@/types/game';
import { FatePointDisplay } from './FatePointDisplay';
import { useRules } from '@/contexts/RulesContext';
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
  onUpdateNotes?: (notes: string) => void;
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
  onInvokeAspect,
  onUpdateNotes
}: CharacterSheetProps) {
  const { skillManeuvers, getDriveById } = useRules();
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

  /* 
    Refactored Layout per User Request:
    1. Aspects (Top, Full Width)
    2. Skills (Middle, Prominent)
    3. Maneuvers & Gifts (Middle)
    4. Situational Aspects (Middle/Bottom)
    5. Others (Fate, Stress, Consequences, Notes)
  */
  const sheetBody = (
    <div className="relative w-full max-w-4xl space-y-6">

      {/* Header Identity */}
      {/* Modal Header */}
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
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Window Identity */}
      {variant === 'window' && (
        <div className="flex items-center gap-3 p-3 glass-panel rounded-lg">
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
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs font-ui text-muted-foreground border border-border shrink-0">
                <Eye className="w-3 h-3" /> Visualização
              </span>
            </div>
          )}
        </div>
      )}

      {/* 1. ASPECTS - Top Priority, Full Width or Grid */}
      <div className="glass-panel p-4 lg:p-6">
        <h3 className="font-display text-xl text-primary mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <Sparkles className="w-5 h-5" />
          Aspectos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Named Aspects */}
          <div className="space-y-4">
            <div className="group relative">
              <label className="text-[10px] text-muted-foreground font-ui uppercase tracking-wider block mb-1">Alto Conceito</label>
              <div
                className={`p-3 rounded-lg bg-primary/10 border border-primary/20 text-base font-medium relative overflow-hidden ${onInvokeAspect ? 'cursor-pointer hover:bg-primary/20 transition-colors' : ''}`}
                onClick={() => onInvokeAspect?.(character.aspects.highConcept)}
              >
                {character.aspects.highConcept}
                {onInvokeAspect && <span className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-[10px] text-primary bg-background px-1 rounded pointer-events-none">Invocar</span>}
              </div>
            </div>
            <div className="group relative">
              <label className="text-[10px] text-muted-foreground font-ui uppercase tracking-wider block mb-1">Drama</label>
              <div
                className={`p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-base font-medium relative overflow-hidden ${onInvokeAspect ? 'cursor-pointer hover:bg-destructive/20 transition-colors' : ''}`}
                onClick={() => onInvokeAspect?.(character.aspects.drama)}
              >
                {character.aspects.drama}
                {onInvokeAspect && <span className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-[10px] text-primary bg-background px-1 rounded pointer-events-none">Invocar</span>}
              </div>
            </div>
          </div>

          {/* Secondary Aspects Grid */}
          <div className="grid grid-cols-1 gap-3 content-start">
            <div className="grid grid-cols-2 gap-3">
              <div className="group relative">
                <label className="text-[10px] text-muted-foreground font-ui uppercase tracking-wider">Emprego</label>
                <div className={`p-2 rounded bg-muted/40 border border-border text-sm ${onInvokeAspect ? 'cursor-pointer hover:bg-muted/60' : ''}`} onClick={() => onInvokeAspect?.(character.aspects.job)}>
                  {character.aspects.job}
                </div>
              </div>
              <div className="group relative">
                <label className="text-[10px] text-muted-foreground font-ui uppercase tracking-wider">Sonho</label>
                <div className={`p-2 rounded bg-muted/40 border border-border text-sm ${onInvokeAspect ? 'cursor-pointer hover:bg-muted/60' : ''}`} onClick={() => onInvokeAspect?.(character.aspects.dreamBoard)}>
                  {character.aspects.dreamBoard}
                </div>
              </div>
            </div>

            {/* Free Aspects */}
            <div className="space-y-2">
              {character.aspects.free.map((aspect, i) => (
                <div key={i} className="group relative flex items-center gap-2">
                  <div className={`flex-1 p-2 rounded bg-muted/30 border border-border/50 text-sm ${onInvokeAspect ? 'cursor-pointer hover:bg-muted/50' : ''}`} onClick={() => onInvokeAspect?.(aspect)}>
                    {aspect}
                  </div>
                </div>
              ))}
              {character.aspects.free.length === 0 && <p className="text-xs text-muted-foreground italic pl-1">Sem aspectos livres.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. SKILLS - High Visibility */}
        <div className="glass-panel p-4">
          <h3 className="font-display text-xl text-primary mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
            <Target className="w-5 h-5" />
            Perícias
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(character.skills).map(([skill, value]) => (
              <button
                key={skill}
                onClick={() => onSkillClick?.(skill)}
                className={`p-2 rounded-lg text-center border transition-all ${onSkillClick ? 'hover:border-primary/50 hover:bg-primary/5 cursor-pointer' : 'cursor-default bg-muted/20'} border-border`}
                disabled={!onSkillClick}
              >
                <div className="font-display text-2xl leading-none mb-1 text-primary">+{value}</div>
                <div className="text-xs text-muted-foreground capitalize truncate font-medium">{skill}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3 & 4. MANEUVERS & GIFTS */}
        <div className="space-y-6">
          {/* Maneuvers */}
          <div className="glass-panel p-4">
            <h3 className="font-display text-xl text-secondary mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
              <Zap className="w-5 h-5" />
              Manobras
            </h3>
            <div className="space-y-2">
              {[...(character.maneuvers || []), ...(character.skillManeuvers || [])].map((maneuverId, i) => {
                const drive = character.drive ? getDriveById(character.drive) : undefined;
                /* Lookup Logic reused from previous implementation */
                let maneuverName = maneuverId;
                let maneuverDescription = '';
                let isFree = false;
                let type = 'general';

                if (drive) {
                  if (drive.freeManeuvers[0]?.id === maneuverId) {
                    maneuverName = drive.freeManeuvers[0].name;
                    maneuverDescription = drive.freeManeuvers[0].description;
                    isFree = true;
                    type = 'drive';
                  } else {
                    const exclusive = drive.exclusiveManeuvers.find(m => m.id === maneuverId);
                    if (exclusive) {
                      maneuverName = exclusive.name;
                      maneuverDescription = exclusive.description;
                      type = 'drive';
                    }
                  }
                }
                if (type === 'general') {
                  for (const [skillName, maneuvers] of Object.entries(skillManeuvers)) {
                    const found = maneuvers.find(m => m.id === maneuverId);
                    if (found) {
                      maneuverName = found.name;
                      maneuverDescription = found.description;
                      type = 'skill';
                      break;
                    }
                  }
                }

                return (
                  <Tooltip key={`${maneuverId}-${i}`}>
                    <TooltipTrigger asChild>
                      <div className={`p-2 rounded-md font-ui text-sm flex items-start gap-3 cursor-help transition-colors hover:bg-muted/80 ${isFree ? 'bg-primary/10 border border-primary/20 text-primary-foreground' : 'bg-muted/40 border border-border'}`}>
                        <div className="mt-0.5">
                          {type === 'skill' && <Target className="w-3.5 h-3.5 text-blue-400" />}
                          {type === 'drive' && <Zap className="w-3.5 h-3.5 text-yellow-500" />}
                          {type === 'general' && <Zap className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm leading-none mb-1 flex items-center gap-2">
                            {maneuverName}
                            {isFree && <span className="text-[9px] uppercase bg-primary/20 text-primary px-1 rounded">Grátis</span>}
                          </div>
                          <div className="text-xs opacity-70 line-clamp-2">{maneuverDescription}</div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="font-medium mb-1">{maneuverName}</p>
                      <p className="text-xs text-muted-foreground">{maneuverDescription}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {(!character.maneuvers?.length && !character.skillManeuvers?.length) && <p className="text-sm text-muted-foreground italic">Nenhuma manobra.</p>}
            </div>
          </div>

          {/* Gifts - Only show if present */}
          {(character.gifts && character.gifts.length > 0) && (
            <div className="glass-panel p-4">
              <h3 className="font-display text-xl text-purple-400 mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
                <Sparkles className="w-5 h-5" />
                Dons Sobrenaturais
              </h3>
              <div className="space-y-2">
                {character.gifts.map((gift, i) => (
                  <div key={i} className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20 flex gap-3">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-purple-100 text-sm mb-0.5">{gift.name}</div>
                      <p className="text-xs text-purple-200/70">{gift.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. SITUATIONAL ASPECTS / ADVANTAGES */}
      <div className="glass-panel p-4">
        <h3 className="font-display text-xl text-primary mb-3 flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Vantagens / Aspectos Situacionais
          </div>
          {!readOnly && onAddSituationalAspect && (
            <button
              className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-2 py-1 rounded transition-colors"
              onClick={() => document.getElementById('new-situational-aspect')?.focus()}
            >
              + Nova
            </button>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {character.situationalAspects?.map((aspect) => (
            <div key={aspect.id} className="flex flex-col p-3 bg-muted/20 border border-border/50 rounded-lg group hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="font-medium text-sm leading-tight line-clamp-2" title={aspect.name}>{aspect.name}</div>
                {!readOnly && onRemoveSituationalAspect && (
                  <button
                    onClick={() => onRemoveSituationalAspect(aspect.id)}
                    className="p-1 -mr-1 -mt-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Invocações</span>
                <div className="flex items-center gap-2 bg-background/50 rounded px-1.5 py-0.5 border border-white/5">
                  {!readOnly && onUpdateSituationalAspect && (
                    <button onClick={() => onUpdateSituationalAspect(aspect.id, { freeInvokes: Math.max(0, aspect.freeInvokes - 1) })} className="w-5 h-5 flex items-center justify-center hover:bg-muted rounded text-muted-foreground hover:text-foreground text-sm font-bold">-</button>
                  )}
                  <span className="font-mono font-bold text-primary text-sm">{aspect.freeInvokes}</span>
                  {!readOnly && onUpdateSituationalAspect && (
                    <button onClick={() => onUpdateSituationalAspect(aspect.id, { freeInvokes: aspect.freeInvokes + 1 })} className="w-5 h-5 flex items-center justify-center hover:bg-muted rounded text-muted-foreground hover:text-foreground text-sm font-bold">+</button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!readOnly && onAddSituationalAspect && (
            <div className="flex flex-col justify-center p-3 border border-dashed border-border/50 rounded-lg hover:bg-muted/10 transition-colors">
              <input
                type="text"
                id="new-situational-aspect"
                placeholder="Nome da vantagem..."
                className="bg-transparent border-0 border-b border-border/50 text-sm focus:border-primary focus:outline-none mb-2 placeholder:text-muted-foreground/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    if (input.value.trim()) {
                      onAddSituationalAspect(input.value.trim(), 1);
                      input.value = '';
                    }
                  }
                }}
              />
              <div className="text-[10px] text-muted-foreground italic text-center">Pressione Enter para adicionar</div>
            </div>
          )}

          {(!character.situationalAspects?.length && !onAddSituationalAspect) && <div className="col-span-full text-sm text-muted-foreground italic py-4 text-center">Nenhum aspecto situacional ativo.</div>}
        </div>
      </div>

      {/* 6. OTHERS (Stats, Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stress & Fate */}
        <div className="glass-panel p-4 space-y-6">
          {/* Fate Points */}
          <div>
            <h4 className="text-xs font-bold uppercase text-accent mb-2 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Pontos de Destino
            </h4>
            <FatePointDisplay
              points={character.fatePoints}
              maxPoints={character.refresh + 2}
              onSpend={readOnly ? undefined : onSpendFate}
              onGain={readOnly ? undefined : onGainFate}
              readOnly={readOnly}
            />
          </div>

          <div className="h-px bg-border/50" />

          {/* Stress Tracks */}
          <div>
            <h4 className="text-xs font-bold uppercase text-destructive mb-3 flex items-center gap-2">
              <Heart className="w-3 h-3" /> Estresse
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-16 text-xs font-bold text-muted-foreground">FÍSICO</span>
                <div className="flex gap-1.5 flex-1">
                  {physicalStress.map((filled, index) => (
                    <button
                      key={index}
                      onClick={() => onToggleStress?.('physical', index)}
                      disabled={!canToggleStress}
                      className={`h-8 w-8 rounded border flex items-center justify-center transition-all ${filled ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-muted/30 border-border hover:border-destructive/50'} ${!canToggleStress ? 'cursor-default' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-16 text-xs font-bold text-muted-foreground">MENTAL</span>
                <div className="flex gap-1.5 flex-1">
                  {mentalStress.map((filled, index) => (
                    <button
                      key={index}
                      onClick={() => onToggleStress?.('mental', index)}
                      disabled={!canToggleStress}
                      className={`h-8 w-8 rounded border flex items-center justify-center transition-all ${filled ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 border-border hover:border-primary/50'} ${!canToggleStress ? 'cursor-default' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consequences & Notes */}
        <div className="glass-panel p-4 flex flex-col">
          <div className="flex-1 space-y-4">
            <h4 className="text-xs font-bold uppercase text-secondary mb-2 flex items-center gap-2">
              <Brain className="w-3 h-3" /> Consequências
            </h4>
            <div className="space-y-2">
              {(['mild', 'moderate', 'severe'] as const).map((severity) => (
                <div key={severity} className="flex gap-2">
                  <div className={`w-20 shrink-0 flex items-center justify-center rounded text-[10px] font-bold uppercase border ${severity === 'mild' ? 'border-border text-muted-foreground' : severity === 'moderate' ? 'border-yellow-500/30 text-yellow-500' : 'border-destructive/30 text-destructive'}`}>
                    {severity === 'mild' ? 'Suave -2' : severity === 'moderate' ? 'Mod. -4' : 'Severa -6'}
                  </div>
                  <div className="flex-1 relative">
                    <div className={`w-full px-3 py-1.5 rounded text-sm bg-background/50 border ${character.consequences[severity] ? 'border-secondary/50 text-foreground' : 'border-border/50 text-muted-foreground/50 italic'} min-h-[34px] flex items-center`}>
                      {character.consequences[severity] || 'Livre'}
                    </div>
                    {!consequenceReadOnly && (
                      <button
                        className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 bg-black/10 flex items-center justify-center text-xs font-bold text-secondary backdrop-blur-[1px] transition-opacity rounded"
                        onClick={() => onSetConsequence?.(severity, character.consequences[severity] ? null : '')}
                      >
                        {character.consequences[severity] ? 'Recuperar' : 'Marcar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-border/50 my-4" />

            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Anotações</h4>
            {readOnly ? (
              <div className="text-sm text-muted-foreground/80 whitespace-pre-wrap p-2 bg-muted/20 rounded border border-white/5 min-h-[80px]">
                {character.notes || 'Sem anotações.'}
              </div>
            ) : (
              <textarea
                className="w-full min-h-[100px] bg-background/50 border border-border rounded p-2 text-sm focus:outline-none focus:border-primary resize-y font-ui"
                placeholder="..."
                value={character.notes || ''}
                onChange={(e) => onUpdateNotes?.(e.target.value)}
              />
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
