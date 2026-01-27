import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { SituationalAspect } from '@/types/game';
import { User, Users, MapPin, AlertCircle } from 'lucide-react';

interface TargetOption {
    id: string;
    name: string;
    type: 'scene' | 'character' | 'npc';
}

interface CreateAdvantageModalProps {
    isOpen: boolean;
    onClose: () => void;
    outcome: 'tie' | 'success' | 'style';
    freeInvokes: number;
    isBoost: boolean;
    currentSceneId?: string;
    currentSceneName?: string;
    targets: Array<TargetOption>;
    onConfirm: (
        name: string,
        targetId: string,
        targetType: 'scene' | 'character' | 'npc',
        freeInvokes: number,
        isBoost: boolean,
        isPersistent: boolean
    ) => void;
    hasPersistentManeuver?: boolean;
}

export function CreateAdvantageModal({
    isOpen,
    onClose,
    outcome,
    freeInvokes,
    isBoost,
    currentSceneName,
    targets,
    onConfirm,
    hasPersistentManeuver
}: CreateAdvantageModalProps) {
    const [aspectName, setAspectName] = useState('');
    const [selectedTargetId, setSelectedTargetId] = useState<string>('');
    const [isPersistent, setIsPersistent] = useState(false);

    // Set default target to scene or first available
    useEffect(() => {
        if (isOpen) {
            setAspectName('');
            setIsPersistent(false);
            // Prefer scene if available, otherwise first target
            const sceneTarget = targets.find(t => t.type === 'scene');
            if (sceneTarget) {
                setSelectedTargetId(sceneTarget.id);
            } else if (targets.length > 0) {
                setSelectedTargetId(targets[0].id);
            }
        }
    }, [isOpen, targets]);

    const handleConfirm = () => {
        if (!aspectName.trim() || !selectedTargetId) return;

        const target = targets.find(t => t.id === selectedTargetId);
        if (!target) return;

        onConfirm(
            aspectName,
            target.id,
            target.type,
            freeInvokes,
            isBoost,
            isPersistent
        );
        onClose();
    };

    const getOutcomeLabel = () => {
        switch (outcome) {
            case 'style': return 'Sucesso com Estilo';
            case 'success': return 'Sucesso (+1 invocação)';
            case 'tie': return 'Empate (Boost temporário)';
            default: return '';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isBoost ? 'Criar Impulso (Boost)' : 'Criar Vantagem'}</DialogTitle>
                    <DialogDescription>
                        Resultado: <span className="font-bold text-primary">{getOutcomeLabel()}</span>
                        {outcome === 'style' && <span className="ml-1 text-xs text-muted-foreground">(2 invocações grátis)</span>}
                        {outcome === 'success' && <span className="ml-1 text-xs text-muted-foreground">(1 invocação grátis)</span>}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">

                    <div className="grid gap-2">
                        <Label htmlFor="aspectName">Nome do {isBoost ? 'Impulso' : 'Aspecto'}</Label>
                        <Input
                            id="aspectName"
                            value={aspectName}
                            onChange={(e) => setAspectName(e.target.value)}
                            placeholder={isBoost ? "Desequilibrado, Areia nos olhos..." : "Em chamas, Terreno Alto..."}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Onde aplicar?</Label>
                        <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                            <RadioGroup value={selectedTargetId} onValueChange={setSelectedTargetId}>
                                {targets.map((target) => (
                                    <div key={target.id} className="flex items-center space-x-2 py-1">
                                        <RadioGroupItem value={target.id} id={target.id} />
                                        <Label htmlFor={target.id} className="flex items-center gap-2 cursor-pointer w-full">
                                            {target.type === 'scene' && <MapPin className="w-3 h-3 text-muted-foreground" />}
                                            {target.type === 'character' && <User className="w-3 h-3 text-muted-foreground" />}
                                            {target.type === 'npc' && <Users className="w-3 h-3 text-muted-foreground" />}
                                            <span className={target.type === 'scene' ? 'font-semibold italic' : ''}>{target.name}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>

                    {!isBoost && hasPersistentManeuver && (
                        <div className="flex items-start space-x-2 p-3 bg-secondary/10 rounded-md border border-secondary/20">
                            <Checkbox
                                id="persistent"
                                checked={isPersistent}
                                onCheckedChange={(c) => setIsPersistent(c === true)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="persistent" className="font-semibold text-secondary cursor-pointer">
                                    Aspecto Persistente (Sabe das Coisas)
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Este aspecto não será removido ao trocar de cena e recupera 1 invocação grátis por cena.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={!aspectName.trim() || !selectedTargetId}>
                        {isBoost ? 'Criar Boost' : 'Criar Vantagem'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
