import { useState } from 'react';
import { useAspects } from '@/hooks/useAspects';
import { UnifiedAspect, AspectSource } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Zap, Star, Tag, AlertTriangle, X } from 'lucide-react';
import { CompelModal } from './CompelModal';

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

            {/* List */}
            <ScrollArea className="flex-1 bg-zinc-900/50">
                <div className="flex flex-col">
                    {filteredAspects.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-xs">
                            Nenhum aspecto encontrado.
                        </div>
                    ) : (
                        filteredAspects.map(aspect => {
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
                        })
                    )}
                </div>
            </ScrollArea>

            <CompelModal
                isOpen={!!compelTarget}
                onClose={() => setCompelTarget(null)}
                aspect={compelTarget?.aspect || null}
                complication={compelTarget?.complication || ''}
                onAccept={() => {
                    if (compelTarget) compelAspect(compelTarget.aspect, 'TARGET_ID');
                    setCompelTarget(null);
                }}
                onReject={() => {
                    if (compelTarget) {
                        rejectCompel('TARGET_ID');
                    }
                    setCompelTarget(null);
                }}
            />
        </div>
    );
}
