import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Plus, Minus, X, Swords, Shield, Wand2, Mountain } from 'lucide-react';
import { ActionType, DiceResult } from '@/types/game';

interface DiceRollerProps {
  onRoll: (modifier: number, skill: string | undefined, action: ActionType, type?: 'normal' | 'advantage') => DiceResult;
  skills?: Record<string, number>;
  isOpen: boolean;
  onClose: () => void;
  presetSkill?: string | null;
  fatePoints?: number;
  onSpendFate?: () => void;
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

export function DiceRoller({ onRoll, skills = {}, isOpen, onClose, presetSkill, fatePoints = 0, onSpendFate }: DiceRollerProps) {
  const [result, setResult] = useState<DiceResult | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [actionPrompt, setActionPrompt] = useState(false);
  const [hasAdvantage, setHasAdvantage] = useState(false);

  const calculateDiceTotal = (diceResult: DiceResult) => {
    const fateTotal = diceResult.fateDice.reduce((sum, die) => {
      if (die === 'plus') return sum + 1;
      if (die === 'minus') return sum - 1;
      return sum;
    }, 0);

    const advantageValue = diceResult.type === 'advantage' && diceResult.d6
      ? Math.ceil(diceResult.d6 / 2)
      : 0;

    return fateTotal + advantageValue;
  };

  const formatNumber = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

  useEffect(() => {
    if (isOpen) {
      setSelectedSkill(presetSkill ?? null);
      setResult(null);
      setSelectedAction(null);
      setActionPrompt(true);
      setHasAdvantage(false);
    }
  }, [isOpen, presetSkill]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleRoll = async () => {
    if (!selectedAction) {
      setActionPrompt(true);
      return;
    }

    setIsRolling(true);
    setResult(null);
    
    await sleep(100);
    
    const modifier = selectedSkill ? skills[selectedSkill] || 0 : 0;
    const diceResult = onRoll(modifier, selectedSkill || undefined, selectedAction, hasAdvantage ? 'advantage' : 'normal');
    
    await sleep(600);
    
    setResult(diceResult);
    setIsRolling(false);
  };

  const handleInvokeAspect = () => {
    if (!result || fatePoints <= 0 || !onSpendFate) return;

    onSpendFate();
    setResult((prev) => prev ? { ...prev, total: prev.total + 2 } : prev);
  };

  const handleReroll = async () => {
    if (!result || fatePoints <= 0 || !onSpendFate) return;

    onSpendFate();
    setIsRolling(true);
    setResult(null);
    setSelectedAction(result.action);
    setSelectedSkill(result.skill ?? null);
    setHasAdvantage(result.type === 'advantage');

    await sleep(100);
    const rerollResult = onRoll(result.modifier, result.skill, result.action, result.type);
    await sleep(600);

    setResult(rerollResult);
    setIsRolling(false);
  };

  const getResultLabel = (total: number) => {
    if (total >= 3) return { text: 'Sucesso com Estilo!', class: 'text-secondary text-glow-secondary' };
    if (total >= 0) return { text: 'Sucesso', class: 'text-fate-plus' };
    return { text: 'Falha', class: 'text-destructive' };
  };

  const diceTotal = result ? calculateDiceTotal(result) : 0;

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
            className="glass-panel p-8 min-w-[400px] max-w-lg"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
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

            {/* Skill Selection */}
            {Object.keys(skills).length > 0 && (
              <div className="mb-6">
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

            {/* Action Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground font-ui uppercase tracking-wider">
                  Ação
                </label>
                {actionPrompt && !selectedAction && (
                  <span className="text-xs text-destructive font-ui">Qual ação?</span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ACTIONS.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => {
                      setSelectedAction(action.value);
                      setActionPrompt(false);
                    }}
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
                      <div className="text-[11px] text-muted-foreground leading-tight">{action.tooltip}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dice Display */}
            <div className="flex justify-center gap-3 min-h-[80px] items-center mb-6">
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
                  className="text-center mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="font-display text-5xl mb-2">
                    <span className={getResultLabel(result.total).class}>
                      {result.total >= 0 ? '+' : ''}{result.total}
                    </span>
                  </div>
                  <p className={`font-display text-xl ${getResultLabel(result.total).class}`}>
                    {getResultLabel(result.total).text}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    Dados: {formatNumber(diceTotal)} | Perícia: {formatNumber(result.modifier)}{result.skill ? ` (${result.skill})` : ''} = Total: {formatNumber(result.total)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-ui uppercase tracking-wide">
                    Ação: {ACTIONS.find(a => a.value === result.action)?.label}
                  </p>
                  {fatePoints > 0 && onSpendFate && (
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleInvokeAspect}
                        disabled={isRolling}
                        className="px-4 py-2 rounded-lg border border-secondary text-secondary hover:bg-secondary/10 transition-colors font-ui disabled:opacity-50"
                      >
                        Invocar Aspecto (+2)
                      </button>
                      <button
                        type="button"
                        onClick={handleReroll}
                        disabled={isRolling}
                        className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors font-ui disabled:opacity-50"
                      >
                        Rolar Novamente
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Advantage Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-ui">Tenho a Vantagem</span>
              <button
                type="button"
                onClick={() => setHasAdvantage((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${hasAdvantage ? 'border-secondary bg-secondary/10 text-secondary glow-secondary' : 'border-border hover:border-primary/60'}`}
                aria-pressed={hasAdvantage}
              >
                <span className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${hasAdvantage ? 'bg-secondary' : 'bg-muted'}`}>
                  <span className={`absolute left-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${hasAdvantage ? 'translate-x-5' : ''}`} />
                </span>
                <span className="font-ui text-sm">{hasAdvantage ? 'Ativa' : 'Desativada'}</span>
              </button>
            </div>

            {/* Roll Button */}
            <motion.button
              onClick={handleRoll}
              disabled={isRolling || !selectedAction}
              className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-display text-lg
                       hover:bg-primary/90 disabled:opacity-50 transition-all glow-primary flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Dices className="w-5 h-5" />
              {hasAdvantage ? 'Rolar com Vantagem' : 'Rolar Dados'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
