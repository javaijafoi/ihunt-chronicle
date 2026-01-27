import { ActionType, Character, DiceResult, UnifiedAspect } from '@/types/game';
import { useState, useEffect } from 'react';
import { Target, Shield, Sword, Sparkles, RefreshCcw, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface MobileDiceRollerProps {
    activeCharacter: Character;
    presetSkill: string | null;
    onRoll: (modifier: number, skill?: string, action?: ActionType, type?: 'normal' | 'advantage', opposition?: number) => Promise<DiceResult>;
    onInvokeAspect: (aspectName: string, source: string, useFree: boolean) => void;
    allAspects: UnifiedAspect[];
}

export function MobileDiceRoller({ activeCharacter, presetSkill, onRoll, onInvokeAspect, allAspects }: MobileDiceRollerProps) {
    const [view, setView] = useState<'setup' | 'result'>('setup');
    const [selectedSkill, setSelectedSkill] = useState<string>('Notificar');
    const [selectedAction, setSelectedAction] = useState<ActionType>('superar');
    const [opposition, setOpposition] = useState([2]); // Default Fair (+2)
    const [isRolling, setIsRolling] = useState(false);
    const [result, setResult] = useState<DiceResult | null>(null);

    // Sync preset skill
    useEffect(() => {
        if (presetSkill) {
            setSelectedSkill(presetSkill);
            setView('setup');
        }
    }, [presetSkill]);

    const skillList = Object.keys(activeCharacter.skills).sort();

    const handleRoll = async () => {
        setIsRolling(true);
        try {
            const res = await onRoll(0, selectedSkill, selectedAction, 'normal', opposition[0]);
            setResult(res);
            setView('result');
        } catch (e) {
            console.error(e);
        } finally {
            setIsRolling(false);
        }
    };

    const calculateOutcome = (total: number, target: number) => {
        const shifts = total - target;
        if (shifts >= 3) return { label: 'SUCESSO COM ESTILO', color: 'text-yellow-500' };
        if (shifts > 0) return { label: 'SUCESSO', color: 'text-green-500' };
        if (shifts === 0) return { label: 'EMPATE', color: 'text-blue-500' };
        return { label: 'FALHA', color: 'text-red-500' };
    };

    if (view === 'result' && result) {
        const currentTotal = result.total;
        const outcome = calculateOutcome(currentTotal, result.opposition || 0);

        return (
            <div className="flex flex-col h-full p-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-muted-foreground">{outcome.label}</h2>
                        <div className="text-8xl font-black font-display tracking-tighter">{currentTotal > 0 ? `+${currentTotal}` : currentTotal}</div>
                        <p className="text-muted-foreground">vs {result.opposition}</p>
                    </div>

                    <div className="flex gap-2 p-4 bg-muted/20 rounded-xl border border-border/50">
                        {result.fateDice.map((d, i) => (
                            <div key={i} className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold shadow-sm",
                                d === 'plus' ? "bg-green-500/20 text-green-500" : d === 'minus' ? "bg-red-500/20 text-red-500" : "bg-muted text-muted-foreground"
                            )}>
                                {d === 'plus' ? "+" : d === 'minus' ? "-" : "0"}
                            </div>
                        ))}
                    </div>

                    <div className="text-sm font-medium text-muted-foreground">
                        {selectedSkill} ({activeCharacter.skills[selectedSkill] > 0 ? '+' : ''}{activeCharacter.skills[selectedSkill]})
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 shrink-0">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                            setView('setup');
                        }}
                        className="w-full text-lg h-14"
                    >
                        <RefreshCcw className="mr-2 w-5 h-5" /> Nova Rolagem
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col gap-6 h-full">
            <div className="space-y-4">
                <label className="text-sm font-bold uppercase text-muted-foreground">Habilidade</label>
                <select
                    className="w-full p-4 text-lg rounded-xl border border-border bg-card shadow-sm appearance-none"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                >
                    {skillList.map(s => (
                        <option key={s} value={s}>{s} (+{activeCharacter.skills[s]})</option>
                    ))}
                </select>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-bold uppercase text-muted-foreground">Ação</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setSelectedAction('superar')}
                        className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", selectedAction === 'superar' ? "border-primary bg-primary/10 text-primary" : "border-border bg-card")}
                    >
                        <Hand className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">Superar</span>
                    </button>
                    <button
                        onClick={() => setSelectedAction('criarVantagem')}
                        className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", selectedAction === 'criarVantagem' ? "border-primary bg-primary/10 text-primary" : "border-border bg-card")}
                    >
                        <Sparkles className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">Vantagem</span>
                    </button>
                    <button
                        onClick={() => setSelectedAction('atacar')}
                        className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", selectedAction === 'atacar' ? "border-primary bg-primary/10 text-primary" : "border-border bg-card")}
                    >
                        <Sword className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">Atacar</span>
                    </button>
                    <button
                        onClick={() => setSelectedAction('defender')}
                        className={cn("p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all", selectedAction === 'defender' ? "border-primary bg-primary/10 text-primary" : "border-border bg-card")}
                    >
                        <Shield className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">Defender</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold uppercase text-muted-foreground">Oposição</label>
                    <span className="text-2xl font-bold font-display">+{opposition[0]}</span>
                </div>
                <Slider
                    value={opposition}
                    onValueChange={setOpposition}
                    min={-2}
                    max={8}
                    step={1}
                    className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>Medíocre (+0)</span>
                    <span>Bom (+3)</span>
                    <span>Ótimo (+4)</span>
                    <span>Lendário (+8)</span>
                </div>
            </div>

            <div className="mt-auto pt-4">
                <Button
                    size="lg"
                    className="w-full h-16 text-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                    onClick={handleRoll}
                    disabled={isRolling}
                >
                    {isRolling ? "Rolando..." : "ROLAR DADOS"}
                </Button>
            </div>
        </div>
    );
}
