import { useState } from 'react';
import { useAspects } from '@/hooks/useAspects';
import { UnifiedAspect, AspectSource } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Zap, Star, Tag, AlertTriangle, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Added Tabs import

interface AspectHubProps {
    campaignId: string;
    episodeId: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export function AspectHub({ campaignId, episodeId, onClose }: AspectHubProps) {
    const {
        allAspects,
        invokeAspect,
        compelAspect,
        rejectCompel
    } = useAspects(campaignId, episodeId);

    const [search, setSearch] = useState('');
    const [compelTarget, setCompelTarget] = useState<{ aspect: UnifiedAspect, complication: string } | null>(null);

    const handleSendCompel = async () => {
        if (!compelTarget || !compelTarget.complication.trim()) return;

        // Find owner ID if strictly character (for now aspect.ownerId)
        // If ownerType is campaign/scene, we might need a specific player target selector.
        // For simplicity, let's assume if it's a character aspect, target is owner.
        // If scene/theme, maybe prompt for target?
        // Let's implement character targeting later if needed, assume character aspect for now or just log warning.

        const targetId = compelTarget.aspect.ownerId;
        if (!targetId || compelTarget.aspect.ownerType !== 'character') {
            toast({ title: "Apenas aspectos de personagem por enquanto", variant: "destructive" });
            return;
        }

        try {
            await addDoc(collection(db, 'campaigns', campaignId, 'pendingCompels'), {
                targetCharacterId: targetId,
                aspectName: compelTarget.aspect.name,
                complication: compelTarget.complication,
                source: 'gm',
                status: 'pending',
                createdAt: Timestamp.now()
            });
            toast({ title: "Compel enviado!" });
            setCompelTarget(null);
        } catch (e) {
            console.error(e);
            toast({ title: "Erro ao enviar", variant: "destructive" });
        }
    };

    // Filtragem simplificada (apenas busca)
    const filteredAspects = allAspects.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
            (a.ownerName || '').toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    // Função para obter cor e label da tag
    const getSourceTag = (aspect: UnifiedAspect) => {
        switch (aspect.source) {
            case 'theme': return { label: 'TEMA', color: 'bg-indigo-900/50 text-indigo-300 border-indigo-500/30' };
            case 'character': return { label: 'PJ', color: 'bg-emerald-900/50 text-emerald-300 border-emerald-500/30' };
            case 'consequence': return { label: 'CONS', color: 'bg-red-900/50 text-red-300 border-red-500/30' };
            case 'situational':
                if (aspect.ownerType === 'scene') return { label: 'CENA', color: 'bg-cyan-900/50 text-cyan-300 border-cyan-500/30' };
                return { label: 'TEMP', color: 'bg-zinc-700/50 text-zinc-300 border-zinc-500/30' };
            case 'boost': return { label: 'IMPULSO', color: 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30' };
            default: return { label: 'OUTRO', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
        }
    };

    const handleCompelClick = (aspect: UnifiedAspect) => {
        setCompelTarget({
            aspect,
            complication: ""
        });
    };

    // Sorting Logic
    const sortAspects = (aspects: UnifiedAspect[]) => {
        return [...aspects].sort((a, b) => {
            const getWeight = (asp: UnifiedAspect) => {
                if (asp.source === 'theme') return 0;
                if (asp.source === 'situational' && asp.ownerType === 'scene') return 1;
                if (asp.source === 'boost') return 2;
                if (asp.source === 'character') return 3;
                if (asp.source === 'consequence') return 4;
                return 5;
            };
            const weightA = getWeight(a);
            const weightB = getWeight(b);
            if (weightA !== weightB) return weightA - weightB;
            return a.name.localeCompare(b.name);
        });
    };

    const sortedAspects = sortAspects(filteredAspects);

    const renderAspectList = (aspects: UnifiedAspect[]) => {
        if (aspects.length === 0) {
            return (
                <div className="p-8 text-center text-muted-foreground text-xs">
                    Nenhum aspecto encontrado.
                </div>
            );
        }
        return aspects.map(aspect => {
            const tag = getSourceTag(aspect);
            const isConsequence = aspect.source === 'consequence';
            return (
                <div
                    key={aspect.id}
                    className="group flex items-center justify-between p-2 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="outline" className={`h-5 px-1.5 text-[9px] min-w-[3.5rem] justify-center tracking-wider border font-bold ${tag.color}`}>
                            {tag.label}
                        </Badge>

                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                {isConsequence && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />}
                                <span className={`text-xs font-medium truncate ${isConsequence ? 'text-red-400' : 'text-zinc-200'} group-hover:text-white transition-colors`}>
                                    {aspect.name}
                                </span>
                            </div>
                            {aspect.ownerName && (
                                <span className="text-[10px] text-muted-foreground truncate">
                                    {aspect.ownerName}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                        {aspect.freeInvokes > 0 && (
                            <Badge variant="secondary" className="h-5 mr-1 px-1 text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                                {aspect.freeInvokes}
                            </Badge>
                        )}
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-6 text-[10px] px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            onClick={() => invokeAspect(aspect, aspect.freeInvokes > 0)}
                        >
                            Invocar
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-amber-700 hover:text-amber-500 hover:bg-amber-500/5"
                            title="Forçar (Compel)"
                            onClick={() => handleCompelClick(aspect)}
                        >
                            <Zap className="w-3 h-3 fill-current" />
                        </Button>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950/95 text-zinc-100 border border-zinc-800 shadow-2xl backdrop-blur-md rounded-lg overflow-hidden">
            {/* Header / Search */}
            <div className="p-3 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950">
                <div className="flex-1 relative">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar aspecto..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 bg-black/40 border-zinc-800 h-8 text-xs focus:ring-amber-500/20"
                    />
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Tabs & List */}
            <Tabs defaultValue="todos" className="flex-1 flex flex-col min-h-0">
                <div className="px-3 pt-2 bg-zinc-950 border-b border-zinc-800">
                    <TabsList className="w-full grid grid-cols-3 bg-zinc-900/50 p-1">
                        <TabsTrigger value="todos" className="text-[10px] h-7 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">TODOS</TabsTrigger>
                        <TabsTrigger value="cronica" className="text-[10px] h-7 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">CRÔNICA</TabsTrigger>
                        <TabsTrigger value="jogadores" className="text-[10px] h-7 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">JOGADORES</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 bg-zinc-900/50 min-h-0 relative">
                    <TabsContent value="todos" className="absolute inset-0 m-0">
                        <ScrollArea className="h-full">
                            <div className="flex flex-col">
                                {renderAspectList(sortedAspects)}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="cronica" className="absolute inset-0 m-0">
                        <ScrollArea className="h-full">
                            <div className="flex flex-col">
                                {renderAspectList(sortedAspects.filter(a => a.source === 'theme' || a.source === 'situational' && a.ownerType === 'scene' || a.source === 'situational'))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="jogadores" className="absolute inset-0 m-0">
                        <ScrollArea className="h-full">
                            <div className="flex flex-col">
                                {renderAspectList(sortedAspects.filter(a => a.source === 'character' || a.source === 'consequence'))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Simple Dialog for GM to input complication */}
            <Dialog open={!!compelTarget} onOpenChange={(open) => !open && setCompelTarget(null)}>
                <DialogContent>
                    <DialogTitle>Forçar Aspecto: {compelTarget?.aspect.name}</DialogTitle>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Complicação Proposta</Label>
                            <Textarea
                                placeholder="Descreva como isso complica a vida do personagem..."
                                value={compelTarget?.complication}
                                onChange={e => setCompelTarget(prev => prev ? { ...prev, complication: e.target.value } : null)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCompelTarget(null)}>Cancelar</Button>
                            <Button onClick={handleSendCompel}>Enviar Oferta</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
