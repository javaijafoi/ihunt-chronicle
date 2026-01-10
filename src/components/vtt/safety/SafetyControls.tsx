import { useState } from 'react';
import { Shield, AlertTriangle, XCircle, PauseCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SafetyMatrix } from './SafetyMatrix';
import { SafetyLevel } from '@/types/safety';

interface SafetyControlsProps {
    mySettings: Record<string, SafetyLevel>;
    aggregatedLevels: Record<string, SafetyLevel>;
    onUpdateSetting: (topicId: string, level: SafetyLevel) => void;
    onTriggerXCard: () => void;
    onTogglePause: () => void;
}

export function SafetyControls({
    mySettings,
    aggregatedLevels,
    onUpdateSetting,
    onTriggerXCard,
    onTogglePause
}: SafetyControlsProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex items-center gap-2">
            {/* Intervalo Comercial (Pause) */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onTogglePause}
                        className="p-2.5 rounded-lg glass-panel hover:bg-yellow-500/10 hover:text-yellow-500 transition-colors"
                    >
                        <PauseCircle className="w-5 h-5" />
                    </button>
                </TooltipTrigger>
                <TooltipContent>Intervalo Comercial (Pausa)</TooltipContent>
            </Tooltip>

            {/* X-Card */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onTriggerXCard}
                        className="p-2.5 rounded-lg glass-panel hover:bg-destructive hover:text-destructive-foreground transition-colors group"
                    >
                        <XCircle className="w-5 h-5 group-hover:animate-pulse" />
                    </button>
                </TooltipTrigger>
                <TooltipContent className="bg-destructive text-destructive-foreground">CARTÃO X (Parar Jogo)</TooltipContent>
            </Tooltip>

            {/* Safety Matrix Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <button
                        className="p-2.5 rounded-lg glass-panel hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <Shield className="w-5 h-5" />
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-black/90 backdrop-blur-xl border-white/10">
                    <div className="mb-4">
                        <h2 className="font-display text-2xl text-primary flex items-center gap-2">
                            <Shield className="w-6 h-6" />
                            Ferramentas de Segurança
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            Defina seus limites. Sua segurança vem em primeiro lugar.
                        </p>
                    </div>

                    <SafetyMatrix
                        mySettings={mySettings}
                        aggregatedLevels={aggregatedLevels}
                        onUpdateSetting={onUpdateSetting}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
