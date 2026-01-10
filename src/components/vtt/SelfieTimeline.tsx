import { useState, useMemo } from 'react';
import { Camera, Plus, Sparkles, Trophy, Heart, CheckCircle2, Trash2, MoreVertical, Filter, Lock } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Character, Selfie, SelfieType } from '@/types/game';
import { PartyCharacter } from '@/types/session'; // Use PartyCharacter to have access to ownerId/name if needed
import { NewSelfieForm } from './NewSelfieForm';
import { SelfieAdvancementModal } from './SelfieAdvancementModal';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SelfieTimelineProps {
    myCharacter?: Character | null; // The current user's character (for creation/permissions)
    partyCharacters: PartyCharacter[]; // All characters in the session
    onUpdateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
    isGM: boolean;
    currentUserId?: string;
}

interface TimelineItem {
    selfie: Selfie;
    characterId: string;
    characterName: string;
    characterAvatar?: string;
    ownerId?: string;
}

export function SelfieTimeline({
    myCharacter,
    partyCharacters,
    onUpdateCharacter,
    isGM,
    currentUserId
}: SelfieTimelineProps) {
    const [filter, setFilter] = useState<'all' | SelfieType>('all');
    const [showNewSelfie, setShowNewSelfie] = useState(false);
    const [advancementSelfie, setAdvancementSelfie] = useState<Selfie | null>(null);

    // Aggregate all selfies into a single timeline
    const timelineItems = useMemo(() => {
        const items: TimelineItem[] = [];
        partyCharacters.forEach(char => {
            if (char.selfies) {
                char.selfies.forEach(selfie => {
                    items.push({
                        selfie,
                        characterId: char.id,
                        characterName: char.name,
                        characterAvatar: char.avatar,
                        ownerId: char.ownerId
                    });
                });
            }
        });
        // Sort by createdAt descending (newest first)
        return items.sort((a, b) =>
            new Date(b.selfie.createdAt).getTime() - new Date(a.selfie.createdAt).getTime()
        );
    }, [partyCharacters]);

    const filteredItems = timelineItems.filter(item => filter === 'all' || item.selfie.type === filter);

    const handleCreateSelfie = async (newSelfie: Selfie) => {
        if (!myCharacter) return;
        try {
            const updatedSelfies = [newSelfie, ...(myCharacter.selfies || [])];
            await onUpdateCharacter(myCharacter.id, { selfies: updatedSelfies });
            toast({ title: 'Selfie Publicada!', description: 'Agora escolha sua evolução.' });
            setAdvancementSelfie(newSelfie);
            setShowNewSelfie(false);
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro', description: 'Não foi possível salvar a selfie.', variant: 'destructive' });
        }
    };

    const handleDeleteSelfie = async (characterId: string, selfieId: string, selfieTitle: string) => {
        if (!confirm(`Tem certeza que deseja apagar a memória "${selfieTitle}"?`)) return;

        try {
            // Find the character to update (it might differ from myCharacter if GM is deleting)
            // But we can only update via the passed function which usually takes ID.
            const char = partyCharacters.find(c => c.id === characterId);
            if (char && char.selfies) {
                const updated = char.selfies.filter(s => s.id !== selfieId);
                await onUpdateCharacter(characterId, { selfies: updated });
                toast({ title: 'Memória apagada.' });
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro', description: 'Falha ao apagar.', variant: 'destructive' });
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
            case 'mood': return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
            case 'auge': return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
            case 'mudanca': return 'text-red-500 border-red-500/20 bg-red-500/10';
        }
    };

    const getBorderColor = (type: SelfieType) => {
        switch (type) {
            case 'mood': return 'group-hover:border-blue-500/50';
            case 'auge': return 'group-hover:border-amber-500/50';
            case 'mudanca': return 'group-hover:border-red-500/50';
        }
    }

    return (
        <div className="flex flex-col h-full bg-background/50 rounded-lg overflow-hidden border">
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-medium">Timeline de Memórias</h3>
                </div>

                {myCharacter && (
                    <Button size="sm" onClick={() => setShowNewSelfie(true)} className="h-7 text-xs gap-1">
                        <Plus className="w-3 h-3" />
                        Nova Selfie
                    </Button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="px-3 py-2 border-b bg-background">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
                    <TabsList className="w-full grid grid-cols-4 h-8 bg-muted/50">
                        <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                        <TabsTrigger value="mood" className="text-xs">Mood</TabsTrigger>
                        <TabsTrigger value="auge" className="text-xs">Auge</TabsTrigger>
                        <TabsTrigger value="mudanca" className="text-xs">Mudança</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Timeline Grid */}
            <ScrollArea className="flex-1 p-4">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <Camera className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm">Nenhuma memória compartilhada ainda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map((item) => {
                            const isOwner = myCharacter?.id === item.characterId;
                            const canDelete = isOwner || isGM;

                            return (
                                <div
                                    key={item.selfie.id}
                                    className={cn(
                                        "group relative flex flex-col rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md",
                                        getBorderColor(item.selfie.type)
                                    )}
                                >
                                    {/* Header: User Info & Time */}
                                    <div className="flex items-center justify-between p-2 pb-0 z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full overflow-hidden border border-border bg-muted">
                                                {item.characterAvatar ? (
                                                    <img src={item.characterAvatar} alt={item.characterName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] uppercase font-bold text-muted-foreground">
                                                        {item.characterName.substring(0, 2)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium leading-none">{item.characterName}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatDistanceToNow(new Date(item.selfie.createdAt), { addSuffix: true, locale: ptBR })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1", getTypeColor(item.selfie.type))}>
                                            {getTypeIcon(item.selfie.type)}
                                            <span className="uppercase">{item.selfie.type}</span>
                                        </div>
                                    </div>

                                    {/* Image Container */}
                                    <div className="aspect-video w-full mt-2 relative overflow-hidden bg-muted/20">
                                        <img
                                            src={item.selfie.url}
                                            alt={item.selfie.title}
                                            className={cn(
                                                "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                                                !item.selfie.isAvailable && "grayscale opacity-70"
                                            )}
                                        />

                                        {/* Status Badge */}
                                        <div className="absolute top-2 right-2">
                                            {!item.selfie.isAvailable && (
                                                <Badge variant="outline" className="h-5 px-1.5 bg-black/60 text-white border-white/20 text-[10px] backdrop-blur-sm">
                                                    <Lock className="w-3 h-3 mr-1" />
                                                    Usada
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Footer */}
                                    <div className="p-3 pt-2 flex-1 flex flex-col">
                                        <h4 className="font-display text-sm leading-tight mb-1">{item.selfie.title}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 font-ui flex-1">{item.selfie.description}</p>

                                        {canDelete && (
                                            <div className="flex justify-end mt-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDeleteSelfie(item.characterId, item.selfie.id, item.selfie.title)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>

            {/* Creation Modal */}
            {showNewSelfie && myCharacter && (
                <NewSelfieForm
                    characterId={myCharacter.id}
                    isOpen={showNewSelfie}
                    onClose={() => setShowNewSelfie(false)}
                    onSubmit={handleCreateSelfie}
                />
            )}

            {/* Advancement Modal */}
            {advancementSelfie && myCharacter && (
                <SelfieAdvancementModal
                    character={myCharacter}
                    selfieType={advancementSelfie.type}
                    isOpen={!!advancementSelfie}
                    onClose={() => setAdvancementSelfie(null)}
                    onSave={async (updates) => {
                        await onUpdateCharacter(myCharacter.id, updates);
                    }}
                />
            )}
        </div>
    );
}
