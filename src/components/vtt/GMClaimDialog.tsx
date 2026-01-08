import { Crown, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GameSession } from '@/types/session';

interface GMClaimDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    currentSession: GameSession | null;
    isClaiming: boolean;
}

export function GMClaimDialog({
    isOpen,
    onClose,
    onConfirm,
    currentSession,
    isClaiming,
}: GMClaimDialogProps) {
    const currentGMId = currentSession?.gmId;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2 w-fit">
                        <Crown className="w-8 h-8 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-xl font-display">
                        Assumir como Mestre?
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Isso dará a você controle total sobre a mesa, cenas e NPCs.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3 my-2">
                    {currentGMId ? (
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-amber-500">Atenção: Já existe um Mestre</p>
                                <p className="text-xs text-muted-foreground">
                                    Ao confirmar, o Mestre atual será desconectado e enviado de volta para a tela de seleção.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground">
                            A mesa está atualmente sem Mestre ativo.
                        </p>
                    )}
                </div>

                <DialogFooter className="sm:justify-between gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isClaiming}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isClaiming}
                        className="flex-1"
                    >
                        {isClaiming ? "Assumindo..." : "Confirmar e Assumir"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
