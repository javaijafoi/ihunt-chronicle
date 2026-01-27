import { Copy, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Campaign } from '@/types/schema';

interface MobileHeaderProps {
    campaign: Campaign;
    onTriggerXCard: () => void;
}

export function MobileHeader({ campaign, onTriggerXCard }: MobileHeaderProps) {
    const handleCopyCode = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(campaign.joinCode)
                .then(() => toast({ title: "Código copiado!" }))
                .catch(() => toast({ title: "Erro ao copiar", variant: "destructive" }));
        } else {
            // Fallback
            try {
                const textArea = document.createElement("textarea");
                textArea.value = campaign.joinCode;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast({ title: "Código copiado!" });
            } catch (err) {
                toast({ title: "Erro ao copiar", variant: "destructive" });
            }
        }
    };

    return (
        <header className="h-14 px-4 flex items-center justify-between shrink-0 border-b border-border bg-background/95 backdrop-blur-sm z-50 sticky top-0">
            <div className="flex items-center gap-3">
                <h1 className="font-display text-lg text-primary">#iHUNT</h1>
                <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded text-xs font-mono"
                >
                    <span className="text-muted-foreground">SALA:</span>
                    <span className="font-bold text-accent">{campaign.joinCode}</span>
                    <Copy className="w-3 h-3 text-muted-foreground" />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onTriggerXCard}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                    title="Cartão X"
                >
                    <Shield className="w-5 h-5 fill-current" />
                </button>
            </div>
        </header>
    );
}
