import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelfieType } from '@/types/game';
import { cn } from '@/lib/utils';

interface SelfieSlotPlaceholderProps {
    type: SelfieType;
    onClick: () => void;
    disabled?: boolean;
}

export function SelfieSlotPlaceholder({ type, onClick, disabled }: SelfieSlotPlaceholderProps) {

    const getTypeStyles = (type: SelfieType) => {
        switch (type) {
            case 'mood': return 'border-blue-500/30 text-blue-500 hover:border-blue-500 hover:bg-blue-500/5';
            case 'auge': return 'border-amber-500/30 text-amber-500 hover:border-amber-500 hover:bg-amber-500/5';
            case 'mudanca': return 'border-red-500/30 text-red-500 hover:border-red-500 hover:bg-red-500/5';
        }
    };

    const getTypeLabel = (type: SelfieType) => {
        switch (type) {
            case 'mood': return 'Slot de Mood';
            case 'auge': return 'Slot de Auge';
            case 'mudanca': return 'Slot de Mudança';
        }
    };

    return (
        <Button
            variant="outline"
            className={cn(
                "h-auto aspect-[4/5] flex flex-col items-center justify-center gap-2 border-2 text-muted-foreground transition-all border-dashed rounded-xl",
                getTypeStyles(type),
                disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <div className="w-10 h-10 rounded-full bg-current opacity-20 flex items-center justify-center">
                <Plus className="w-6 h-6" />
            </div>
            <div className="text-center">
                <span className="block font-display text-sm font-medium opacity-80">
                    Nova Selfie
                </span>
                <span className="text-[10px] opacity-60 font-normal">
                    {getTypeLabel(type)}
                </span>
            </div>
        </Button>
    );
}
