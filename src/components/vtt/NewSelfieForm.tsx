import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Selfie, SelfieType } from '@/types/game';
import { toast } from '@/hooks/use-toast';
import { Loader2, Link as LinkIcon, Sparkles, Trophy, Heart } from 'lucide-react';

interface NewSelfieFormProps {
    characterId: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (selfie: Selfie) => Promise<void>;
    type?: SelfieType;
    episodeId?: string;
}

export function NewSelfieForm({
    characterId,
    isOpen,
    onClose,
    onSubmit,
    type: initialType = 'mood',
    episodeId
}: NewSelfieFormProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<SelfieType>(initialType);
    const [imageUrl, setImageUrl] = useState('');

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setType(initialType);
        setImageUrl('');
    };

    const handleSubmit = async () => {
        if (!title || !description) {
            toast({ title: 'Erro', description: 'Preencha título e descrição.', variant: 'destructive' });
            return;
        }

        if (!imageUrl) {
            toast({ title: 'Erro', description: 'Forneça uma URL de imagem.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const newSelfie: Selfie = {
                id: crypto.randomUUID(),
                title,
                description,
                type,
                url: imageUrl,
                isAvailable: true,
                createdAt: new Date().toISOString(),
                grantedByEpisodeId: episodeId || ''
            };

            await onSubmit(newSelfie);
            resetForm();
            onClose();

        } catch (error) {
            console.error(error);
            toast({ title: 'Erro', description: 'Falha ao salvar selfie.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Selfie</DialogTitle>
                    <DialogDescription>
                        Registre um momento importante para ganhar bônus e evoluir.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">

                    {/* Image Input (URL Only) */}
                    <div className="space-y-2">
                        <Label>URL da Imagem</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="url"
                                    placeholder="https://exemplo.com/foto.jpg"
                                    className="pl-9"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Use links do Discord, Imgur, Pinterest, etc.
                        </p>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Título / Legenda Curta</Label>
                        <Input
                            placeholder="#AmoMuitoTudoIsso"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <Label>Tipo de Memória</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('mood')}
                                className={`flex flex-col items-center gap-2 p-3 rounded-md border transition-all ${type === 'mood'
                                    ? 'border-blue-500 bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20'
                                    : 'border-border hover:bg-muted text-muted-foreground'
                                    }`}
                            >
                                <Sparkles className="w-5 h-5" />
                                <span className="text-xs font-medium">Mood</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('auge')}
                                className={`flex flex-col items-center gap-2 p-3 rounded-md border transition-all ${type === 'auge'
                                    ? 'border-amber-500 bg-amber-500/10 text-amber-500 ring-2 ring-amber-500/20'
                                    : 'border-border hover:bg-muted text-muted-foreground'
                                    }`}
                            >
                                <Trophy className="w-5 h-5" />
                                <span className="text-xs font-medium">Auge</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('mudanca')}
                                className={`flex flex-col items-center gap-2 p-3 rounded-md border transition-all ${type === 'mudanca'
                                    ? 'border-red-500 bg-red-500/10 text-red-500 ring-2 ring-red-500/20'
                                    : 'border-border hover:bg-muted text-muted-foreground'
                                    }`}
                            >
                                <Heart className="w-5 h-5" />
                                <span className="text-xs font-medium">Mudança</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center pt-1">
                            {type === 'mood' && "Bônus: +1. Evolução: Trocar perícia ou aspecto."}
                            {type === 'auge' && "Bônus: +2 ou Reroll. Evolução: +1 Perícia ou Renomear Grave."}
                            {type === 'mudanca' && "Bônus: Vantagem (5dF). Evolução: Curar Grave ou +1 Recarga."}
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Descrição / Notas</Label>
                        <Textarea
                            placeholder="Detalhes sobre este momento..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Salvar Selfie
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
