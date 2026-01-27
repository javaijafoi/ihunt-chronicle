import { UnifiedAspect, Character } from '@/types/game';
import { Tag, User, MapPin, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileAspectListProps {
    allAspects: UnifiedAspect[];
    myCharacter: Character;
    onInvoke: (aspect: UnifiedAspect) => void;
}

export function MobileAspectList({ allAspects, myCharacter, onInvoke }: MobileAspectListProps) {

    const sceneAspects = allAspects.filter(a => a.ownerType === 'scene');
    const myAspects = allAspects.filter(a => a.ownerType === 'character' && a.ownerId === myCharacter.id);
    const otherAspects = allAspects.filter(a => a.ownerType === 'character' && a.ownerId !== myCharacter.id);

    const AspectCard = ({ aspect }: { aspect: UnifiedAspect }) => {
        const hasFree = aspect.freeInvokes > 0;

        return (
            <div className="bg-card p-3 rounded-lg border border-border/50 shadow-sm flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {aspect.ownerType === 'scene' ? <MapPin className="w-3 h-3 text-muted-foreground" /> : <User className="w-3 h-3 text-muted-foreground" />}
                        <span className="text-xs text-muted-foreground truncate">{aspect.ownerName || 'Cena'}</span>
                    </div>
                    <h4 className="font-medium text-sm truncate bg-muted/50 p-1 rounded px-2">{aspect.name}</h4>
                </div>

                <button
                    onClick={() => onInvoke(aspect)}
                    className={cn(
                        "flex flex-col items-center justify-center h-12 min-w-[80px] rounded-lg border-2 transition-all active:scale-95",
                        hasFree
                            ? "border-accent bg-accent/10 text-accent font-bold"
                            : "border-amber-500/20 bg-amber-500/5 text-amber-600"
                    )}
                >
                    {hasFree ? (
                        <>
                            <span className="text-xs uppercase font-bold">Grátis</span>
                            <span className="text-lg leading-none">{aspect.freeInvokes}x</span>
                        </>
                    ) : (
                        <>
                            <span className="text-[10px] uppercase font-bold">Destino</span>
                            <span className="text-sm font-bold flex items-center gap-1">
                                1 <Zap className="w-3 h-3 fill-current" />
                            </span>
                        </>
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="p-4 space-y-6">
            <div className="space-y-3">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Aspectos de Cena
                </h3>
                {sceneAspects.length === 0 ? <p className="text-sm text-muted-foreground italic">Nenhum aspecto de cena.</p> : (
                    <div className="space-y-2">
                        {sceneAspects.map(a => <AspectCard key={a.id} aspect={a} />)}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" /> Meus Aspectos
                </h3>
                {myAspects.length === 0 ? <p className="text-sm text-muted-foreground italic">Nenhum aspecto situacional.</p> : (
                    <div className="space-y-2">
                        {myAspects.map(a => <AspectCard key={a.id} aspect={a} />)}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Outros
                </h3>
                {otherAspects.length === 0 ? <p className="text-sm text-muted-foreground italic">Nenhum outro aspecto.</p> : (
                    <div className="space-y-2">
                        {otherAspects.map(a => <AspectCard key={a.id} aspect={a} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
