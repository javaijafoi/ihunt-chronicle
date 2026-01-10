import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Plus, Minus, X, Swords, Shield, Wand2, Mountain, RotateCcw, Zap, Bookmark, User, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { ActionType, DiceResult, SceneAspect, Character, Selfie } from '@/types/game';
import { OPPOSITION_PRESETS, getLadderLabel, calculateOutcome, OutcomeResult } from '@/data/fateLadder';
import { OPPOSITION_PRESETS, getLadderLabel, calculateOutcome, OutcomeResult } from '@/data/fateLadder';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Camera } from 'lucide-react';

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
    opposition?: number,
    isHidden?: boolean
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
  onUpdateCharacter?: (id: string, updates: Partial<Character>) => Promise<void>;
  variant?: 'modal' | 'window';
  isGM?: boolean;
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
  onUpdateCharacter,
  variant = 'modal',
  isGM = false,
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
  const [isHiddenRoll, setIsHiddenRoll] = useState(false);

  // Selfie System State
  const [isSelfieAlbumOpen, setIsSelfieAlbumOpen] = useState(false);
  const [pendingAugeSelfie, setPendingAugeSelfie] = useState<Selfie | null>(null);

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

  const handleApplySelfie = async (selfie: Selfie, intent?: 'bonus' | 'reroll') => {
    // 1. Consume Selfie
    if (myCharacter && onUpdateCharacter) {
      const updatedSelfies = myCharacter.selfies.map(s => s.id === selfie.id ? { ...s, isAvailable: false, usedAt: new Date().toISOString() } : s);
      await onUpdateCharacter(myCharacter.id, { selfies: updatedSelfies });
    }

    // 2. Apply Mechanic
    if (selfie.type === 'mood') {
      // Mood: +1
      if (result) {
        const newTotal = result.total + 1;
        const newOutcome = calculateOutcome(newTotal, result.opposition ?? null);
        setResult({ ...result, total: newTotal, modifier: result.modifier + 1, outcome: newOutcome?.outcome, shifts: newOutcome?.shifts });
      } else {
        setCustomModifier(prev => prev + 1);
      }
    } else if (selfie.type === 'auge') {
      if (intent === 'reroll' && result) {
        // Reroll logic
        setIsRolling(true);
        setHasUsedReroll(true);
        await sleep(100);
        const rerollResult = await onRoll(
          result.modifier,
          result.skill,
          result.action,
          result.type,
          result.opposition
        );
        await sleep(600);
        setResult({ ...rerollResult, invocations: result.invocations });
        setIsRolling(false);
      } else {
        // Bonus +2
        if (result) {
          const newTotal = result.total + 2;
          const newOutcome = calculateOutcome(newTotal, result.opposition ?? null);
          setResult({ ...result, total: newTotal, modifier: result.modifier + 2, outcome: newOutcome?.outcome, shifts: newOutcome?.shifts });
        } else {
          setCustomModifier(prev => prev + 2);
        }
      }
    } else if (selfie.type === 'mudanca') {
      setHasAdvantage(true);
    }
  };

  const onActivateSelfie = (selfie: Selfie) => {
    if (selfie.type === 'auge') {
      // Create a choice dialog or simple logic
      // If no result, it must be +2 (cannot reroll pre-roll).
      // But user might want to "save for later"? No, consume now.
      if (!result) {
        handleApplySelfie(selfie, 'bonus');
        setIsSelfieAlbumOpen(false);
      } else {
        setPendingAugeSelfie(selfie);
        setIsSelfieAlbumOpen(false); // Close album, show choice dialog
      }
    } else {
      handleApplySelfie(selfie);
      setIsSelfieAlbumOpen(false);
    }
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

  const rollerPanel = (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >

      {/* Parameters Section - Hidden after roll */}
      <AnimatePresence mode="wait">
        {!result && (
          <motion.div
            key="params"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Free Roll Toggle */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border">
              <div>
                <span className="text-sm font-ui">Rolagem Livre</span>
                <p className="text-xs text-muted-foreground">Sem habilidade ou ação</p>
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
                className={`px-2 py-1.5 rounded-full border transition-all ${isFreeRoll ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/60'
                  }`}
                aria-pressed={isFreeRoll}
              >
                <span className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${isFreeRoll ? 'bg-primary' : 'bg-muted'
                  }`}>
                  <span className={`absolute left-0.5 h-3 w-3 rounded-full bg-background shadow transition-transform ${isFreeRoll ? 'translate-x-4' : ''
                    }`} />
                </span>
              </button>
            </div>

            {/* Free Roll Custom Modifier */}
            {isFreeRoll && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm font-ui">Modificador</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCustomModifier(prev => prev - 1)}
                    className="p-1.5 rounded bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-display text-xl w-10 text-center">
                    {formatNumber(customModifier)}
                  </span>
                  <button
                    onClick={() => setCustomModifier(prev => prev + 1)}
                    className="p-1.5 rounded bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Skill Selection (when not free roll) */}
            {!isFreeRoll && Object.keys(skills).length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider mb-1.5 block">
                  Habilidade
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(skills).map(([skill, value]) => (
                    <button
                      key={skill}
                      onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                      className={`px-2 py-1 rounded text-xs font-ui transition-all ${selectedSkill === skill
                        ? 'bg-primary text-primary-foreground'
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
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider">
                    Ação
                  </label>
                  {!selectedAction && (
                    <span className="text-[10px] text-destructive font-ui">Obrigatório</span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {ACTIONS.map((action) => (
                    <button
                      key={action.value}
                      onClick={() => setSelectedAction(action.value)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border transition-all ${selectedAction === action.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/60'
                        }`}
                      title={action.tooltip}
                    >
                      <span className="shrink-0">{action.icon}</span>
                      <span className="text-[10px] font-ui leading-tight">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Opposition Selection */}
            <div>
              <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider mb-1.5 block">
                Oposição <span className="text-muted-foreground/60">(opcional)</span>
              </label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {OPPOSITION_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setOpposition(opposition === preset.value ? null : preset.value);
                      setCustomOpposition('');
                    }}
                    className={`px-2 py-0.5 rounded text-xs font-ui transition-all ${opposition === preset.value
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
                className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm
                         focus:border-primary focus:outline-none"
              />
            </div>

            {/* Advantage Toggle */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/5 border border-secondary/20">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-secondary" />
                <span className="text-sm font-ui">Vantagem (3dF + d6)</span>
              </div>
              <button
                type="button"
                onClick={() => setHasAdvantage(prev => !prev)}
                className={`px-2 py-1 rounded-full border transition-all ${hasAdvantage ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border hover:border-secondary/60'
                  }`}
                aria-pressed={hasAdvantage}
              >
                <span className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${hasAdvantage ? 'bg-secondary' : 'bg-muted'
                  }`}>
                  <span className={`absolute left-0.5 h-3 w-3 rounded-full bg-background shadow transition-transform ${hasAdvantage ? 'translate-x-4' : ''
                    }`} />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memories Button */}
      {myCharacter && onUpdateCharacter && (
        <div className="px-2 pb-2">
          <button
            onClick={() => setIsSelfieAlbumOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all font-display text-sm"
          >
            <Camera className="w-4 h-4" />
            Memórias ({myCharacter.selfies?.filter(s => s.isAvailable).length || 0})
          </button>
        </div>
      )}

      {/* Dice Display - Always visible */}
      <div className="flex justify-center gap-2 min-h-[60px] items-center py-3">
        {isRolling ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
          >
            <Dices className="w-10 h-10 text-primary" />
          </motion.div>
        ) : result ? (
          <>
            {result.fateDice.map((face, i) => (
              <FateDie key={i} face={face} delay={i * 0.1} />
            ))}
            {result.type === 'advantage' && typeof result.d6 === 'number' && (
              <motion.div
                className="fate-die advantage-d6 border-2 border-secondary bg-secondary/10 text-secondary flex flex-col items-center justify-center px-2 py-1.5 rounded-lg"
                initial={{ rotateX: 720, rotateY: 720, scale: 0 }}
                animate={{ rotateX: 0, rotateY: 0, scale: 1 }}
                transition={{ delay: result.fateDice.length * 0.1, duration: 0.6, type: 'spring' }}
              >
                <span className="text-[9px] font-ui uppercase">d6</span>
                <span className="font-display text-lg">{result.d6}</span>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground text-center py-2">
            <Dices className="w-8 h-8 mx-auto opacity-50" />
          </div>
        )}
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="text-center p-3 rounded-lg bg-muted/30 border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Main Result */}
            <div className="font-display text-4xl mb-1">
              <span className={getOutcomeDisplay(currentOutcome, result.total).class}>
                {formatNumber(result.total)}
              </span>
            </div>

            {/* Ladder Label */}
            <p className="text-xs text-muted-foreground font-ui">
              {getLadderLabel(result.total)}
            </p>

            {/* Outcome Classification */}
            <p className={`font-display text-lg mt-1 ${getOutcomeDisplay(currentOutcome, result.total).class}`}>
              {getOutcomeDisplay(currentOutcome, result.total).text}
            </p>

            {/* Shifts Display */}
            {currentOutcome && currentOutcome.shifts !== 0 && (
              <p className="text-xs text-muted-foreground mt-0.5 font-ui">
                {Math.abs(currentOutcome.shifts)} virada{Math.abs(currentOutcome.shifts) !== 1 ? 's' : ''}
              </p>
            )}

            {/* Compact Breakdown */}
            <p className="text-[10px] text-muted-foreground mt-2 font-mono">
              {result.skill && `${result.skill} `}
              {formatNumber(result.diceTotal)} + {formatNumber(result.modifier)}
              {result.opposition !== undefined && ` vs ${formatNumber(result.opposition)}`}
            </p>

            {/* Aspect Invocation - Compact */}
            {invokableAspects.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowAspectPanel(prev => !prev)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-secondary/50 text-secondary hover:bg-secondary/10 transition-colors font-ui text-xs"
                >
                  <Bookmark className="w-3 h-3" />
                  Invocar Aspecto
                  {showAspectPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <AnimatePresence>
                  {showAspectPanel && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-2 py-0.5 bg-muted/50 rounded">
                          <span>Pontos de Destino:</span>
                          <span className="font-display text-sm text-accent">{fatePoints}</span>
                        </div>

                        {invokableAspects.map((aspect, idx) => {
                          const isInvoked = invokedAspects.includes(aspect.name);
                          const hasFreeInvoke = (aspect.freeInvokes ?? 0) > 0;
                          const canInvoke = !isInvoked && (hasFreeInvoke || fatePoints > 0);

                          return (
                            <div
                              key={`${aspect.name}-${idx}`}
                              className={`p-1.5 rounded border text-left ${isInvoked
                                ? 'border-secondary/30 bg-secondary/10 opacity-60'
                                : 'border-border hover:border-secondary/50'
                                }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className={`${aspect.sourceType === 'scene' ? 'text-secondary' :
                                  aspect.sourceType === 'self' ? 'text-primary' : 'text-accent'
                                  }`}>
                                  {getSourceIcon(aspect.sourceType)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-ui truncate">{aspect.name}</p>
                                </div>
                                {!isInvoked && (
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleInvokeAspectBonus(aspect, hasFreeInvoke)}
                                      disabled={!canInvoke}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-ui bg-secondary/20 text-secondary hover:bg-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      +2
                                    </button>
                                    {!hasUsedReroll && (
                                      <button
                                        type="button"
                                        onClick={() => handleReroll(aspect, hasFreeInvoke)}
                                        disabled={!canInvoke}
                                        className="px-1.5 py-0.5 rounded text-[9px] font-ui bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <RotateCcw className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                )}
                                {isInvoked && (
                                  <span className="text-[9px] text-secondary">✓</span>
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

      {/* Roll / New Roll Button */}
      <motion.button
        onClick={result ? () => setResult(null) : handleRoll}
        disabled={isRolling || (!result && !canRoll)}
        className={`w-full py-2.5 px-4 rounded-lg font-display text-sm transition-all flex items-center justify-center gap-2 mt-3 ${result
          ? 'bg-muted text-foreground hover:bg-muted/80 border border-border'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {result ? (
          <>
            <RotateCcw className="w-4 h-4" />
            Nova Rolagem
          </>
        ) : (
          <>
            <Dices className="w-4 h-4" />
            {hasAdvantage ? 'Rolar (3dF + d6)' : 'Rolar (4dF)'}
          </>
        )}
      </motion.button>


      {/* Auge Choice Dialog */}
      <Dialog open={!!pendingAugeSelfie} onOpenChange={(open) => !open && setPendingAugeSelfie(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="grid gap-4 py-4">
            <h3 className="font-display text-lg text-center">Invocando Auge</h3>
            <p className="text-center text-sm text-muted-foreground">Escolha o efeito desta memória.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { handleApplySelfie(pendingAugeSelfie!, 'bonus'); setPendingAugeSelfie(null); }} className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 flex flex-col items-center gap-2">
                <span className="font-display text-xl text-amber-500">+2</span>
                <span className="text-xs">Bônus no Resultado</span>
              </button>
              <button onClick={() => { handleApplySelfie(pendingAugeSelfie!, 'reroll'); setPendingAugeSelfie(null); }} className="p-4 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 flex flex-col items-center gap-2">
                <RotateCcw className="w-6 h-6 text-primary" />
                <span className="text-xs">Rolar Novamente</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </motion.div>
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
            {rollerPanel}
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
          {rollerPanel}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
