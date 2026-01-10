import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Plus,
    Filter,
    Sparkles,
    Trophy,
    Heart,
    Lock,
    CheckCircle2,
    Trash2,
    MoreVertical
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Character, Selfie, SelfieType } from '@/types/game';
import { NewSelfieForm } from './NewSelfieForm';
import { SelfieAdvancementModal } from './SelfieAdvancementModal';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SelfieAlbumProps {
    character: Character;
    onUpdateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
    onActivateSelfie?: (selfie: Selfie) => void;
    readOnly?: boolean;
}

export function SelfieAlbum({
    character,
    onUpdateCharacter,
    onActivateSelfie,
    readOnly = false
}: SelfieAlbumProps) {
    const [filter, setFilter] = useState<'all' | SelfieType>('all');
    const [showNewSelfie, setShowNewSelfie] = useState(false);
    const [advancementSelfie, setAdvancementSelfie] = useState<Selfie | null>(null);

    const selfies = character.selfies || [];
    const filteredSelfies = selfies.filter(s => filter === 'all' || s.type === filter);

    const handleCreateSelfie = async (newSelfie: Selfie) => {
        try {
            // 1. Save the new selfie
            const updatedSelfies = [newSelfie, ...selfies];
            await onUpdateCharacter(character.id, { selfies: updatedSelfies });

            toast({ title: 'Selfie Salva!', description: 'Agora escolha sua evolução.' });

            // 2. Open Advancement Modal
            setAdvancementSelfie(newSelfie);
            setShowNewSelfie(false); // Close form
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro', description: 'Não foi possível salvar a selfie.', variant: 'destructive' });
        }
    };

    const handleDeleteSelfie = async (selfieId: string) => {
        if (confirm('Tem certeza que deseja apagar esta memória?')) {
            const updated = selfies.filter(s => s.id !== selfieId);
            await onUpdateCharacter(character.id, { selfies: updated });
            toast({ title: 'Memória apagada.' });
        }
    };

    const handleUseSelfie = (selfie: Selfie) => {
        if (!selfie.isAvailable) return;
        if (onActivateSelfie) {
            onActivateSelfie(selfie);
        } else {
            // If no activator (e.g. just viewing), maybe valid manual usage? 
            // For now, imply it's only actionable if provided.
            toast({ title: 'Modo de Visualização', description: 'Abra o Rolador de Dados para usar suas memórias.' });
        }
    };

    const getTypeIcon = (type: SelfieType) => {
        switch (type) {
            case 'mood': return <Sparkles className="w-3 h-3" />;
            case 'auge': return <Trophy className="w-3 h-3" />;
            case 'mudanca': return <Heart className="w-3 h-3" />;
        }
    };

    const getTypeColor = (type: SelfieType) => {
        switch (type) {
            case 'mood': return 'border-blue-500/50 bg-blue-500/5 text-blue-500';
            case 'auge': return 'border-amber-500/50 bg-amber-500/5 text-amber-500';
            case 'mudanca': return 'border-red-500/50 bg-red-500/5 text-red-500';
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/50 rounded-lg overflow-hidden border">
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-medium">Álbum de Memórias</h3>
                    <Badge variant="secondary" className="text-[10px] h-5">
                        {selfies.filter(s => s.isAvailable).length} Disponíveis
                    </Badge>
                </div>

                {!readOnly && (
                    <Button size="sm" onClick={() => setShowNewSelfie(true)} className="h-7 text-xs gap-1">
                        <Plus className="w-3 h-3" />
                        Nova Selfie
                    </Button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="px-3 py-2 border-b bg-background">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
                    <TabsList className="w-full grid grid-cols-4 h-8">
                        <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                        <TabsTrigger value="mood" className="text-xs">Mood</TabsTrigger>
                        <TabsTrigger value="auge" className="text-xs">Auge</TabsTrigger>
                        <TabsTrigger value="mudanca" className="text-xs">Mudança</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Grid */}
            <ScrollArea className="flex-1 p-3">
                {filteredSelfies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <Camera className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm">Nenhuma memória encontrada.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredSelfies.map((selfie) => (
                            <div
                                key={selfie.id}
                                className={cn(
                                    "group relative aspect-[4/5] rounded-md border-2 overflow-hidden transition-all",
                                    getTypeColor(selfie.type),
                                    !selfie.isAvailable && "opacity-50 grayscale border-dashed"
                                )}
                            >
                                {/* Image */}
                                <img
                                    src={selfie.url}
                                    alt={selfie.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                                {/* Status Indicator */}
                                <div className="absolute top-2 right-2">
                                    {selfie.isAvailable ? (
                                        <Badge className="h-5 px-1.5 bg-green-500 hover:bg-green-600 border-none text-[10px]">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Ativa
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="h-5 px-1.5 bg-black/50 text-white border-white/20 text-[10px]">
                                            <Lock className="w-3 h-3 mr-1" />
                                            Usada
                                        </Badge>
                                    )}
                                </div>

                                {/* Type Icon */}
                                <div className="absolute top-2 left-2 p-1 rounded-full bg-black/40 text-white backdrop-blur-sm">
                                    {getTypeIcon(selfie.type)}
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 pt-6">
                                    <h4 className="font-display text-white text-sm line-clamp-1 leading-tight">{selfie.title}</h4>
                                    <p className="text-white/70 text-[10px] line-clamp-2 mt-0.5 font-ui">{selfie.description}</p>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                        {selfie.isAvailable ? (
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="w-full h-7 text-[10px] bg-white text-black hover:bg-white/90"
                                                onClick={() => handleUseSelfie(selfie)}
                                            >
                                                Lembrar
                                            </Button>
                                        ) : (
                                            <div className="w-full h-7 flex items-center justify-center text-[10px] text-white/50 italic">
                                                Renova na próxima sessão
                                            </div>
                                        )}

                                        {!readOnly && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/20">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleDeleteSelfie(selfie.id)} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Apagar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* New Selfie Modal */}
            {showNewSelfie && (
                <NewSelfieForm
                    characterId={character.id}
                    isOpen={showNewSelfie}
                    onClose={() => setShowNewSelfie(false)}
                    onSubmit={handleCreateSelfie}
                />
            )}

            {/* Advancement Modal */}
            {advancementSelfie && (
                <SelfieAdvancementModal
                    character={character}
                    selfieType={advancementSelfie.type}
                    isOpen={!!advancementSelfie}
                    onClose={() => setAdvancementSelfie(null)}
                    onSave={async (updates) => {
                        await onUpdateCharacter(character.id, updates);
                    }}
                />
            )}
        </div>
    );
}
