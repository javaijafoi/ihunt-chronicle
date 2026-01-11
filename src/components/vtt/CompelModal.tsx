import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UnifiedAspect } from '@/types/game';
import { Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CompelModalProps {
    isOpen: boolean;
    onClose: () => void;
    aspect: UnifiedAspect | null;
    complication: string;
    onAccept: () => void;
    onReject: () => void;
}

export function CompelModal({
    isOpen,
    onClose,
    aspect,
    complication,
    onAccept,
    onReject
}: CompelModalProps) {
    if (!aspect) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] border-amber-500/50 bg-amber-950/20 backdrop-blur-xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span className="text-amber-500 font-bold tracking-wider text-xs uppercase">Chamado de Aspecto</span>
                    </div>
                    <DialogTitle className="text-2xl font-display">
                        O Destino Intervém...
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Aspect Card */}
                    <div className="bg-background/50 border rounded-lg p-4 flex flex-col items-center text-center space-y-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-amber-500/5 z-0" />
                        <span className="text-xs text-muted-foreground relative z-10">O aspecto chamado é:</span>
                        <h3 className="text-xl font-bold text-amber-500 relative z-10 font-display">"{aspect.name}"</h3>
                        {aspect.ownerName && (
                            <Badge variant="outline" className="relative z-10 bg-background/50">
                                {aspect.ownerName}
                            </Badge>
                        )}
                    </div>

                    {/* Complication */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">A Complicação</span>
                        <div className="bg-zinc-950/50 p-4 rounded-md border border-amber-500/20 text-amber-100 italic">
                            "{complication}"
                        </div>
                    </div>
                </div>

                <DialogFooter className="grid grid-cols-2 gap-4 sm:space-x-0">
                    <Button
                        variant="ghost"
                        onClick={onReject}
                        className="h-auto py-4 flex flex-col gap-1 hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/50"
                    >
                        <div className="flex items-center gap-2 font-bold">
                            <ThumbsDown className="w-4 h-4" /> REJEITAR
                        </div>
                        <span className="text-xs font-normal opacity-80">Gastar 1 Ponto de Destino</span>
                    </Button>

                    <Button
                        onClick={onAccept}
                        className="h-auto py-4 flex flex-col gap-1 bg-amber-600 hover:bg-amber-700 text-white border-amber-500"
                    >
                        <div className="flex items-center gap-2 font-bold">
                            <ThumbsUp className="w-4 h-4" /> ACEITAR
                        </div>
                        <span className="text-xs font-normal opacity-90">Ganhar 1 Ponto de Destino</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
