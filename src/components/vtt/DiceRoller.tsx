import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Plus, Minus, X, Swords, Shield, Wand2, Mountain, RotateCcw, Zap, Bookmark, User, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { ActionType, DiceResult, SceneAspect, Character } from '@/types/game';
import { OPPOSITION_PRESETS, getLadderLabel, calculateOutcome, OutcomeResult } from '@/data/fateLadder';

interface InvokableAspect {
  name: string;
  source: string;
  sourceType: 'scene' | 'self' | 'other';
  freeInvokes?: number;
}

interface DiceRollerProps {
  onRoll: (
    modifier: number,
    skill: string | undefined,
    action: ActionType | undefined,
    type?: 'normal' | 'advantage',
    opposition?: number
  ) => Promise<DiceResult> | DiceResult;
  skills?: Record<string, number>;
  isOpen: boolean;
  onClose: () => void;
  presetSkill?: string | null;
  fatePoints?: number;
  onSpendFate?: () => void;
  // New props for aspects
  sceneAspects?: SceneAspect[];
  myCharacter?: Character | null;
  partyCharacters?: Array<{ name: string; aspects: Character['aspects'] }>;
  onInvokeAspect?: (aspectName: string, source: string, useFreeInvoke: boolean) => void;
}

const FateDie = ({ face, delay }: { face: 'plus' | 'minus' | 'blank'; delay: number }) => {
  const icons = {
    plus: <Plus className="w-6 h-6" />,
    minus: <Minus className="w-6 h-6" />,
    blank: <span className="w-2 h-2 bg-fate-blank rounded-full" />,
  };

  return (
    <motion.div
      className={`fate-die ${face}`}
      initial={{ rotateX: 720, rotateY: 720, scale: 0 }}
      animate={{ rotateX: 0, rotateY: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, type: 'spring' }}
    >
      {icons[face]}
    </motion.div>
  );
};

const ACTIONS: { value: ActionType; label: string; icon: ReactNode; tooltip: string }[] = [
  { value: 'superar', label: 'Superar', icon: <Mountain className="w-5 h-5" />, tooltip: 'Superar obstáculos' },
  { value: 'criarVantagem', label: 'Criar Vantagem', icon: <Wand2 className="w-5 h-5" />, tooltip: 'Criar ou descobrir aspectos' },
  { value: 'atacar', label: 'Atacar', icon: <Swords className="w-5 h-5" />, tooltip: 'Causar dano direto' },
  { value: 'defender', label: 'Defender', icon: <Shield className="w-5 h-5" />, tooltip: 'Evitar ataques ou perigos' },
];

export function DiceRoller({ 
  onRoll, 
  skills = {}, 
  isOpen, 
  onClose, 
  presetSkill, 
  fatePoints = 0, 
  onSpendFate,
  sceneAspects = [],
  myCharacter,
  partyCharacters = [],
  onInvokeAspect,
}: DiceRollerProps) {
  const [result, setResult] = useState<DiceResult | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [hasAdvantage, setHasAdvantage] = useState(false);
  const [isFreeRoll, setIsFreeRoll] = useState(false);
  const [customModifier, setCustomModifier] = useState(0);
  const [opposition, setOpposition] = useState<number | null>(null);
  const [customOpposition, setCustomOpposition] = useState('');
  const [hasUsedReroll, setHasUsedReroll] = useState(false);
  const [showAspectPanel, setShowAspectPanel] = useState(false);
  const [invokedAspects, setInvokedAspects] = useState<string[]>([]);

  const formatNumber = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

  // Build list of all invokable aspects
  const buildInvokableAspects = (): InvokableAspect[] => {
    const aspects: InvokableAspect[] = [];

    // Scene aspects
    sceneAspects.forEach(aspect => {
      aspects.push({
        name: aspect.name,
        source: 'Cena',
        sourceType: 'scene',
        freeInvokes: aspect.freeInvokes,
      });
    });

    // My character aspects
    if (myCharacter) {
      const charAspects = [
        myCharacter.aspects.highConcept,
        myCharacter.aspects.drama,
        myCharacter.aspects.job,
        myCharacter.aspects.dreamBoard,
        ...myCharacter.aspects.free,
      ].filter(Boolean);

      charAspects.forEach(aspect => {
        aspects.push({
          name: aspect,
          source: myCharacter.name,
          sourceType: 'self',
        });
      });

      // Add consequences as invokable aspects (for compels or self-invokes)
      if (myCharacter.consequences.mild) {
        aspects.push({
          name: myCharacter.consequences.mild,
          source: `${myCharacter.name} (Consequência)`,
          sourceType: 'self',
        });
      }
      if (myCharacter.consequences.moderate) {
        aspects.push({
          name: myCharacter.consequences.moderate,
          source: `${myCharacter.name} (Consequência)`,
          sourceType: 'self',
        });
      }
      if (myCharacter.consequences.severe) {
        aspects.push({
          name: myCharacter.consequences.severe,
          source: `${myCharacter.name} (Consequência)`,
          sourceType: 'self',
        });
      }
    }

    // Party characters aspects
    partyCharacters.forEach(char => {
      if (char.name === myCharacter?.name) return; // Skip self

      const charAspects = [
        char.aspects.highConcept,
        char.aspects.drama,
        char.aspects.job,
        char.aspects.dreamBoard,
        ...char.aspects.free,
      ].filter(Boolean);

      charAspects.forEach(aspect => {
        aspects.push({
          name: aspect,
          source: char.name,
          sourceType: 'other',
        });
      });
    });

    return aspects;
  };

  const invokableAspects = buildInvokableAspects();

  useEffect(() => {
    if (isOpen) {
      setSelectedSkill(presetSkill ?? null);
      setResult(null);
      setSelectedAction(null);
      setHasAdvantage(false);
      setIsFreeRoll(false);
      setCustomModifier(0);
      setOpposition(null);
      setCustomOpposition('');
      setHasUsedReroll(false);
      setShowAspectPanel(false);
      setInvokedAspects([]);
    }
  }, [isOpen, presetSkill]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleRoll = async () => {
    // Free roll doesn't require action selection
    if (!isFreeRoll && !selectedAction) {
      return;
    }

    setIsRolling(true);
    setResult(null);
    setHasUsedReroll(false);
    setInvokedAspects([]);
    
    await sleep(100);
    
    const modifier = isFreeRoll 
      ? customModifier 
      : (selectedSkill ? skills[selectedSkill] || 0 : 0);
    
    const diceResult = await onRoll(
      modifier, 
      isFreeRoll ? undefined : selectedSkill || undefined, 
      isFreeRoll ? undefined : selectedAction!, 
      hasAdvantage ? 'advantage' : 'normal',
      opposition ?? undefined
    );
    
    await sleep(600);
    
    setResult(diceResult);
    setIsRolling(false);
  };

  const handleInvokeAspectBonus = (aspect: InvokableAspect, useFreeInvoke: boolean) => {
    if (!result) return;
    
    // Check if already invoked this aspect
    if (invokedAspects.includes(aspect.name)) return;
    
    // If not using free invoke, need to spend fate point
    if (!useFreeInvoke) {
      if (fatePoints <= 0 || !onSpendFate) return;
      onSpendFate();
    }

    // Notify parent about the invocation
    onInvokeAspect?.(aspect.name, aspect.source, useFreeInvoke);
    
    const newTotal = result.total + 2;
    const newOutcome = calculateOutcome(newTotal, result.opposition ?? null);
    
    setResult(prev => prev ? { 
      ...prev, 
      total: newTotal,
      shifts: newOutcome?.shifts,
      outcome: newOutcome?.outcome,
      invocations: prev.invocations + 1,
    } : prev);
    
    setInvokedAspects(prev => [...prev, aspect.name]);
  };

  const handleReroll = async (aspect: InvokableAspect, useFreeInvoke: boolean) => {
    if (!result || hasUsedReroll) return;

    // If not using free invoke, need to spend fate point
    if (!useFreeInvoke) {
      if (fatePoints <= 0 || !onSpendFate) return;
      onSpendFate();
    }

    // Notify parent about the invocation
    onInvokeAspect?.(aspect.name, aspect.source, useFreeInvoke);

    setIsRolling(true);
    setHasUsedReroll(true);
    setInvokedAspects(prev => [...prev, aspect.name]);

    await sleep(100);
    const rerollResult = await onRoll(
      result.modifier, 
      result.skill, 
      result.action, 
      result.type,
      result.opposition
    );
    await sleep(600);

    // Keep invocation count from previous result
    setResult({ ...rerollResult, invocations: result.invocations + 1 });
    setIsRolling(false);
  };

  const getOutcomeDisplay = (outcomeResult: OutcomeResult | null, total: number) => {
    if (outcomeResult) {
      const colorClass = {
        failure: 'text-destructive',
        tie: 'text-warning',
        success: 'text-fate-plus',
        style: 'text-secondary text-glow-secondary',
      }[outcomeResult.outcome];
      
      return { text: outcomeResult.label, class: colorClass };
    }
    
    // No opposition - simple feedback
    if (total >= 3) return { text: 'Resultado Alto!', class: 'text-secondary text-glow-secondary' };
    if (total >= 0) return { text: 'Resultado Positivo', class: 'text-fate-plus' };
    return { text: 'Resultado Negativo', class: 'text-destructive' };
  };

  const currentOutcome = result && result.opposition !== undefined 
    ? calculateOutcome(result.total, result.opposition) 
    : null;

  const canRoll = isFreeRoll || selectedAction;

  const getSourceIcon = (sourceType: 'scene' | 'self' | 'other') => {
    switch (sourceType) {
      case 'scene': return <Bookmark className="w-3 h-3" />;
      case 'self': return <User className="w-3 h-3" />;
      case 'other': return <Users className="w-3 h-3" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="spotlight-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="glass-panel p-6 min-w-[420px] max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-glow-primary text-primary">
                Rolar Dados
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Roll Toggle */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <span className="text-sm font-ui">Rolagem Livre</span>
                <p className="text-xs text-muted-foreground">Sem habilidade ou ação específica</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFreeRoll(prev => !prev);
                  if (!isFreeRoll) {
                    setSelectedSkill(null);
                    setSelectedAction(null);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                  isFreeRoll ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/60'
                }`}
                aria-pressed={isFreeRoll}
              >
                <span className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  isFreeRoll ? 'bg-primary' : 'bg-muted'
                }`}>
                  <span className={`absolute left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${
                    isFreeRoll ? 'translate-x-5' : ''
                  }`} />
                </span>
              </button>
            </div>

            {/* Free Roll Custom Modifier */}
            {isFreeRoll && (
              <div className="mb-4">
                <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider mb-2 block">
                  Modificador Customizado
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCustomModifier(prev => prev - 1)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-display text-2xl w-16 text-center">
                    {formatNumber(customModifier)}
                  </span>
                  <button
                    onClick={() => setCustomModifier(prev => prev + 1)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Skill Selection (when not free roll) */}
            {!isFreeRoll && Object.keys(skills).length > 0 && (
              <div className="mb-4">
                <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider mb-2 block">
                  Habilidade
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(skills).map(([skill, value]) => (
                    <button
                      key={skill}
                      onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                      className={`px-3 py-1.5 rounded-md text-sm font-ui transition-all ${
                        selectedSkill === skill
                          ? 'bg-primary text-primary-foreground glow-primary'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {skill} +{value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Selection (when not free roll) */}
            {!isFreeRoll && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider">
                    Ação
                  </label>
                  {!selectedAction && (
                    <span className="text-xs text-destructive font-ui">Selecione uma ação</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIONS.map((action) => (
                    <button
                      key={action.value}
                      onClick={() => setSelectedAction(action.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
                        selectedAction === action.value
                          ? 'border-primary bg-primary/10 text-primary glow-primary'
                          : 'border-border hover:border-primary/60'
                      }`}
                      title={action.tooltip}
                    >
                      <span className="shrink-0">{action.icon}</span>
                      <div>
                        <div className="font-display text-sm leading-tight">{action.label}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">{action.tooltip}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Opposition Selection */}
            <div className="mb-4">
              <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider mb-2 block">
                Oposição (Dificuldade) <span className="text-muted-foreground/60">— opcional</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {OPPOSITION_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setOpposition(opposition === preset.value ? null : preset.value);
                      setCustomOpposition('');
                    }}
                    className={`px-2 py-1 rounded-md text-xs font-ui transition-all ${
                      opposition === preset.value
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={customOpposition}
                onChange={(e) => {
                  setCustomOpposition(e.target.value);
                  const val = parseInt(e.target.value);
                  setOpposition(isNaN(val) ? null : val);
                }}
                placeholder="Valor customizado..."
                className="w-full px-3 py-2 rounded-md bg-input border border-border 
                         focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
                         font-ui text-sm placeholder:text-muted-foreground"
              />
              {opposition !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Oposição definida: <span className="text-foreground font-medium">{formatNumber(opposition)}</span> ({getLadderLabel(opposition)})
                </p>
              )}
            </div>

            {/* Advantage Toggle */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-secondary" />
                <div>
                  <span className="text-sm font-ui">Tenho a Vantagem</span>
                  <p className="text-xs text-muted-foreground">Substitui 1 dado Fate por um d6</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHasAdvantage(prev => !prev)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                  hasAdvantage ? 'border-secondary bg-secondary/10 text-secondary glow-secondary' : 'border-border hover:border-secondary/60'
                }`}
                aria-pressed={hasAdvantage}
              >
                <span className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  hasAdvantage ? 'bg-secondary' : 'bg-muted'
                }`}>
                  <span className={`absolute left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${
                    hasAdvantage ? 'translate-x-5' : ''
                  }`} />
                </span>
              </button>
            </div>

            {/* Dice Display */}
            <div className="flex justify-center gap-3 min-h-[80px] items-center mb-4">
              {isRolling ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                >
                  <Dices className="w-12 h-12 text-primary" />
                </motion.div>
              ) : result ? (
                <>
                  {result.fateDice.map((face, i) => (
                    <FateDie key={i} face={face} delay={i * 0.1} />
                  ))}
                  {result.type === 'advantage' && typeof result.d6 === 'number' && (
                    <motion.div
                      className="fate-die advantage-d6 border-2 border-secondary bg-secondary/10 text-secondary flex flex-col items-center justify-center px-3 py-2 rounded-lg shadow-lg glow-secondary"
                      initial={{ rotateX: 720, rotateY: 720, scale: 0 }}
                      animate={{ rotateX: 0, rotateY: 0, scale: 1 }}
                      transition={{ delay: result.fateDice.length * 0.1, duration: 0.6, type: 'spring' }}
                    >
                      <span className="text-[10px] font-ui uppercase tracking-wider">d6</span>
                      <span className="font-display text-xl">{result.d6}</span>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground text-center">
                  <Dices className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-ui">Clique para rolar</p>
                </div>
              )}
            </div>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  className="text-center mb-4 p-4 rounded-lg bg-muted/30 border border-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Main Result */}
                  <div className="font-display text-5xl mb-1">
                    <span className={getOutcomeDisplay(currentOutcome, result.total).class}>
                      {formatNumber(result.total)}
                    </span>
                  </div>
                  
                  {/* Ladder Label */}
                  <p className="text-sm text-muted-foreground font-ui mb-2">
                    {getLadderLabel(result.total)}
                  </p>
                  
                  {/* Outcome Classification */}
                  <p className={`font-display text-xl ${getOutcomeDisplay(currentOutcome, result.total).class}`}>
                    {getOutcomeDisplay(currentOutcome, result.total).text}
                  </p>
                  
                  {/* Shifts Display */}
                  {currentOutcome && (
                    <p className="text-sm text-muted-foreground mt-1 font-ui">
                      <span className="font-medium text-foreground">{Math.abs(currentOutcome.shifts)}</span> virada{Math.abs(currentOutcome.shifts) !== 1 ? 's' : ''}
                      {currentOutcome.shifts < 0 ? ' abaixo' : currentOutcome.shifts > 0 ? ' acima' : ''}
                    </p>
                  )}
                  
                  {/* Breakdown */}
                  <p className="text-xs text-muted-foreground mt-2 font-mono">
                    Dados: {formatNumber(result.diceTotal)} | Mod: {formatNumber(result.modifier)}
                    {result.skill ? ` (${result.skill})` : ''} = Total: {formatNumber(result.total)}
                    {result.opposition !== undefined && ` vs ${formatNumber(result.opposition)}`}
                  </p>
                  
                  {/* Action Label */}
                  {result.action && (
                    <p className="text-xs text-muted-foreground mt-1 font-ui uppercase tracking-wide">
                      Ação: {ACTIONS.find(a => a.value === result.action)?.label}
                    </p>
                  )}
                  
                  {/* Invocations */}
                  {result.invocations > 0 && (
                    <div className="text-xs text-secondary mt-2 font-ui">
                      <p>{result.invocations} invocação(ões) de aspecto</p>
                      {invokedAspects.length > 0 && (
                        <p className="text-muted-foreground mt-1">
                          {invokedAspects.map((a, i) => (
                            <span key={i}>"{a}"{i < invokedAspects.length - 1 ? ', ' : ''}</span>
                          ))}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Aspect Invocation Panel */}
                  {invokableAspects.length > 0 && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setShowAspectPanel(prev => !prev)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-secondary/50 text-secondary hover:bg-secondary/10 transition-colors font-ui text-sm"
                      >
                        <Bookmark className="w-4 h-4" />
                        Invocar Aspecto (+2 ou Reroll)
                        {showAspectPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      <AnimatePresence>
                        {showAspectPanel && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                              {/* Fate Points indicator */}
                              <div className="flex items-center justify-between text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                                <span>Pontos de Destino disponíveis:</span>
                                <span className="font-display text-lg text-accent">{fatePoints}</span>
                              </div>
                              
                              {invokableAspects.map((aspect, idx) => {
                                const isInvoked = invokedAspects.includes(aspect.name);
                                const hasFreeInvoke = (aspect.freeInvokes ?? 0) > 0;
                                const canInvoke = !isInvoked && (hasFreeInvoke || fatePoints > 0);
                                
                                return (
                                  <div
                                    key={`${aspect.name}-${idx}`}
                                    className={`p-2 rounded-lg border text-left ${
                                      isInvoked 
                                        ? 'border-secondary/30 bg-secondary/10 opacity-60' 
                                        : 'border-border hover:border-secondary/50'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className={`mt-0.5 ${
                                        aspect.sourceType === 'scene' ? 'text-secondary' :
                                        aspect.sourceType === 'self' ? 'text-primary' : 'text-accent'
                                      }`}>
                                        {getSourceIcon(aspect.sourceType)}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-ui truncate" title={aspect.name}>
                                          "{aspect.name}"
                                        </p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                          {aspect.source}
                                          {hasFreeInvoke && (
                                            <span className="px-1 py-0.5 rounded bg-secondary/20 text-secondary">
                                              {aspect.freeInvokes} grátis
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                      {!isInvoked && (
                                        <div className="flex gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleInvokeAspectBonus(aspect, hasFreeInvoke)}
                                            disabled={!canInvoke}
                                            className="px-2 py-1 rounded text-[10px] font-ui bg-secondary/20 text-secondary hover:bg-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title={hasFreeInvoke ? 'Usar invocação gratuita (+2)' : 'Gastar 1 ponto de destino (+2)'}
                                          >
                                            +2
                                          </button>
                                          {!hasUsedReroll && (
                                            <button
                                              type="button"
                                              onClick={() => handleReroll(aspect, hasFreeInvoke)}
                                              disabled={!canInvoke}
                                              className="px-2 py-1 rounded text-[10px] font-ui bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                              title={hasFreeInvoke ? 'Usar invocação gratuita (reroll)' : 'Gastar 1 ponto de destino (reroll)'}
                                            >
                                              <RotateCcw className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      )}
                                      {isInvoked && (
                                        <span className="text-[10px] text-secondary font-ui">Invocado</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Roll Button */}
            <motion.button
              onClick={handleRoll}
              disabled={isRolling || !canRoll}
              className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-display text-lg
                       hover:bg-primary/90 disabled:opacity-50 transition-all glow-primary flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Dices className="w-5 h-5" />
              {hasAdvantage ? 'Rolar com Vantagem (3dF + d6)' : 'Rolar Dados (4dF)'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
