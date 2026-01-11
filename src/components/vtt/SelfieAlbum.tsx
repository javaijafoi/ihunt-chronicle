import { useState } from 'react';
import {
    Camera,
    Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Character, Selfie, SelfieType, SelfieSlot } from '@/types/game';
import { NewSelfieForm } from './NewSelfieForm';
import { SelfieAdvancementModal } from './SelfieAdvancementModal';
import { toast } from '@/hooks/use-toast';
import { SelfieCard } from './SelfieCard';
import { SelfieSlotPlaceholder } from './SelfieSlotPlaceholder';
import { useCampaign } from '@/contexts/CampaignContext';

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
    const [selectedSlotType, setSelectedSlotType] = useState<SelfieType>('mood');
    const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
    const { currentEpisode } = useCampaign();

    const selfies = character.selfies || [];
    const slots = character.selfieSlots || [];

    // Available slots are those not marked as used
    // Note: If using subcollection for slots as implemented in hook, 
    // we assume they are synced to character object or we would need to fetch them.
    // Given the types update was on Character interface 'selfieSlots?', let's assume they are passed here.
    // If not, we might need to fallback to just showing "legacy" add button if no slots system used yet for this char.

    const availableSlots = slots.filter(s => !s.used);

    const filteredSelfies = selfies.filter(s => filter === 'all' || s.type === filter);
    const filteredSlots = availableSlots.filter(s => filter === 'all' || s.type === filter);

    const handleCreateSelfieClick = (slotType: SelfieType, slotId?: string) => {
        setSelectedSlotType(slotType);
        setActiveSlotId(slotId || null);
        setShowNewSelfie(true);
    };

    const handleCreateSelfie = async (newSelfie: Selfie) => {
        try {
            // 1. Save the new selfie
            // If we came from a slot, mark slot as used
            let updatedSlots = [...(character.selfieSlots || [])];
            if (activeSlotId) {
                updatedSlots = updatedSlots.map(s =>
                    s.id === activeSlotId
                        ? { ...s, used: true, usedAt: new Date(), selfieId: newSelfie.id }
                        : s
                );
            }

            const updatedSelfies = [newSelfie, ...selfies];
            await onUpdateCharacter(character.id, {
                selfies: updatedSelfies,
                selfieSlots: updatedSlots
            });

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
            toast({ title: 'Memória Invocada', description: `Bônus de ${selfie.type === 'mood' ? '+1' : '+2'} aplicado à rolagem!` });
        } else {
            toast({ title: 'Modo de Visualização', description: 'Abra o Rolador de Dados para usar suas memórias.' });
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50 rounded-lg overflow-hidden border">
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-medium">Álbum de Memórias</h3>
                    <Badge variant="secondary" className="text-[10px] h-5 bg-zinc-100 dark:bg-zinc-800">
                        {selfies.filter(s => s.isAvailable).length} Disponíveis
                    </Badge>
                </div>

                {/* Fallback add button if no slots system or GM override */}
                {(!readOnly && slots.length === 0) && (
                    <Button size="sm" onClick={() => handleCreateSelfieClick('mood')} className="h-7 text-xs gap-1">
                        <Plus className="w-3 h-3" />
                        Nova Selfie (Legacy)
                    </Button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="px-3 py-2 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
                    <TabsList className="w-full grid grid-cols-4 h-8 bg-zinc-100 dark:bg-zinc-900">
                        <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                        <TabsTrigger value="mood" className="text-xs">Mood</TabsTrigger>
                        <TabsTrigger value="auge" className="text-xs">Auge</TabsTrigger>
                        <TabsTrigger value="mudanca" className="text-xs">Mudança</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Grid */}
            <ScrollArea className="flex-1 p-3">
                {filteredSelfies.length === 0 && filteredSlots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <Camera className="w-12 h-12 opacity-10 mb-2" />
                        <p className="text-sm">Nenhuma memória encontrada.</p>
                        {!readOnly && (
                            <p className="text-xs opacity-60 mt-1">Conclua episódios para ganhar slots de selfie.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {/* 1. Show Available Slots First */}
                        {!readOnly && filteredSlots.map(slot => (
                            <SelfieSlotPlaceholder
                                key={slot.id}
                                type={slot.type}
                                onClick={() => handleCreateSelfieClick(slot.type, slot.id)}
                            />
                        ))}

                        {/* 2. Show Existing Selfies */}
                        {filteredSelfies.map((selfie) => (
                            <SelfieCard
                                key={selfie.id}
                                selfie={selfie}
                                readOnly={readOnly}
                                onUse={handleUseSelfie}
                                onDelete={handleDeleteSelfie}
                            />
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
                    type={selectedSlotType}
                    episodeId={currentEpisode?.id}
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
