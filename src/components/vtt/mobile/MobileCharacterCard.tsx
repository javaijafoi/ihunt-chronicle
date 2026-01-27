import { Character } from '@/types/game';
import { User, Star, AlertTriangle, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MobileCharacterCardProps {
    character: Character;
    onRollSkill: (skillName: string) => void;
    onToggleStress: (track: 'physical' | 'mental', index: number) => void;
    onSpendFate: () => void;
}

export function MobileCharacterCard({ character, onRollSkill, onToggleStress, onSpendFate }: MobileCharacterCardProps) {
    const [showConsequences, setShowConsequences] = useState(false);

    // Parse skills into levels
    const skillLevels: Record<number, string[]> = {};
    Object.entries(character.skills).forEach(([skill, rating]) => {
        if (!skillLevels[rating]) skillLevels[rating] = [];
        skillLevels[rating].push(skill);
    });
    const levels = Object.keys(skillLevels).map(Number).sort((a, b) => b - a);

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Header Card */}
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex gap-4 items-start">
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                    {character.avatar ? (
                        <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-10 h-10 text-muted-foreground" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h2 className="font-display text-xl font-bold truncate">{character.name}</h2>
                    <p className="text-sm text-muted-foreground italic truncate mb-2">{character.highConcept}</p>

                    <button
                        onClick={onSpendFate}
                        disabled={character.fatePoints <= 0}
                        className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full px-3 py-1 text-sm font-bold active:bg-amber-500/20 disabled:opacity-50 transition-colors"
                    >
                        <Star className="w-4 h-4 fill-current" />
                        <span>{character.fatePoints} FP</span>
                    </button>
                </div>
            </div>

            {/* Stress Tracks */}
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Estresse</h3>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                            <Zap className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex gap-2 flex-1 flex-wrap">
                            {character.stress.physical.map((val, idx) => (
                                <button
                                    key={`phys-${idx}`}
                                    onClick={() => onToggleStress('physical', idx)}
                                    className={cn(
                                        "w-10 h-10 flex items-center justify-center rounded border-2 font-bold text-lg transition-all",
                                        val
                                            ? "bg-red-500 border-red-500 text-white"
                                            : "bg-background border-border hover:border-red-500/50"
                                    )}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                            <Shield className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex gap-2 flex-1 flex-wrap">
                            {character.stress.mental.map((val, idx) => (
                                <button
                                    key={`men-${idx}`}
                                    onClick={() => onToggleStress('mental', idx)}
                                    className={cn(
                                        "w-10 h-10 flex items-center justify-center rounded border-2 font-bold text-lg transition-all",
                                        val
                                            ? "bg-blue-500 border-blue-500 text-white"
                                            : "bg-background border-border hover:border-blue-500/50"
                                    )}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Consequences */}
            <Collapsible open={showConsequences} onOpenChange={setShowConsequences} className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden transition-all">
                <CollapsibleTrigger asChild>
                    <button className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
                        <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Consequências
                        </h3>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", showConsequences && "rotate-180")} />
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 space-y-3">
                    <div className="space-y-2">
                        {Object.entries(character.consequences).map(([severity, val]) => (
                            <div key={severity} className="flex flex-col gap-1">
                                <span className="text-xs font-bold uppercase text-muted-foreground">
                                    {severity === 'mild' ? 'Leve (2)' : severity === 'moderate' ? 'Moderada (4)' : 'Grave (6)'}
                                </span>
                                <div className={cn(
                                    "p-2 rounded border text-sm min-h-[40px] flex items-center",
                                    val ? "bg-red-500/10 border-red-500/30 text-red-100" : "bg-muted/30 border-dashed border-border text-muted-foreground/50"
                                )}>
                                    {val || "Nenhuma"}
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Skills Grid */}
            <div className="space-y-4">
                {levels.map(level => (
                    <div key={level}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-bold font-display opacity-30">+{level}</span>
                            <div className="h-px bg-border flex-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {skillLevels[level].map(skill => (
                                <button
                                    key={skill}
                                    onClick={() => onRollSkill(skill)}
                                    className="p-3 bg-card rounded-lg border border-border/50 shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-98 transition-all text-left flex items-center justify-between group"
                                >
                                    <span className="font-medium">{skill}</span>
                                    <span className="text-muted-foreground/30 group-hover:text-current transition-colors">+{level}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
