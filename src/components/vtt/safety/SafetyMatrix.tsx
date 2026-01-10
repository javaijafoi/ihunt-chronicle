import { motion } from 'framer-motion';
import {
    SafetyLevel,
    DEFAULT_SAFETY_TOPICS,
    SAFETY_LEVELS
} from '@/types/safety';
import { CheckCircle2, EyeOff, PauseCircle, XCircle, Info, Check, UserX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ... interface ...
interface SafetyMatrixProps {
    mySettings: Record<string, SafetyLevel>;
    aggregatedLevels: Record<string, SafetyLevel>;
    onUpdateSetting: (topicId: string, level: SafetyLevel) => void;
}

const ICONS = {
    CheckCircle2,
    EyeOff,
    PauseCircle,
    XCircle,
    Check,
    UserX
};

export function SafetyMatrix({
    mySettings,
    aggregatedLevels,
    onUpdateSetting
}: SafetyMatrixProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20 backdrop-blur-sm">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground font-ui leading-relaxed">
                    Seus votos são <span className="font-semibold text-foreground">anônimos</span>.
                    A coluna <span className="text-foreground font-bold px-1.5 py-0.5 bg-white/5 rounded mx-1">Mesa</span>
                    exibe automaticamente o nível mais restritivo selecionado pelo grupo.
                </p>
            </div>

            <div className="relative rounded-xl border border-white/5 overflow-hidden bg-black/20">
                {/* Sticky Header */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 items-center bg-background/95 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-white/10">
                    <div className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">Tópico</div>
                    <div className="font-display text-xs font-bold text-muted-foreground uppercase tracking-widest text-center min-w-[140px]">Seu Voto</div>
                    <div className="font-display text-xs font-bold text-primary uppercase tracking-widest text-center w-12">Mesa</div>
                </div>

                {/* Rows container with scroll if needed (though parent handles it) */}
                <div className="divide-y divide-white/5">
                    {DEFAULT_SAFETY_TOPICS.map((topic) => {
                        const myLevel = mySettings[topic.id] || 'ok';
                        const groupLevel = aggregatedLevels[topic.id] || 'ok';
                        const GroupIcon = ICONS[SAFETY_LEVELS.find(l => l.id === groupLevel)!.icon as keyof typeof ICONS];

                        return (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-[1fr_auto_auto] gap-x-6 items-center p-3 hover:bg-white/5 transition-colors group"
                            >
                                {/* Topic Name */}
                                <div className="text-sm font-medium text-foreground/90 group-hover:text-primary transition-colors pl-2">
                                    {topic.name}
                                </div>

                                {/* User Selection Controls */}
                                <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-full border border-white/5">
                                    {SAFETY_LEVELS.map((level) => {
                                        const LevelIcon = ICONS[level.icon as keyof typeof ICONS];
                                        const isSelected = myLevel === level.id;

                                        return (
                                            <Tooltip key={level.id}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => onUpdateSetting(topic.id, level.id)}
                                                        className={cn(
                                                            "p-2 rounded-full transition-all duration-300 relative",
                                                            isSelected ? level.color : "hover:bg-white/10 text-muted-foreground",
                                                            isSelected ? "text-white shadow-lg scale-110 z-10" : "hover:scale-105"
                                                        )}
                                                    >
                                                        <LevelIcon className={cn("w-4 h-4", isSelected && "stroke-[2.5px]")} />
                                                        {isSelected && (
                                                            <motion.div
                                                                layoutId={`glow-${topic.id}`}
                                                                className={cn("absolute inset-0 rounded-full blur-md -z-10 opacity-50", level.color)}
                                                                initial={false}
                                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                            />
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="uppercase font-display tracking-wider text-xs bg-black/90 border-white/10">
                                                    {level.label}
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>

                                {/* Group Aggregated View */}
                                <div className="flex justify-center w-12 relative">
                                    <div className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500",
                                        SAFETY_LEVELS.find(l => l.id === groupLevel)?.color,
                                        "shadow-lg border border-white/10"
                                    )}>
                                        <GroupIcon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
