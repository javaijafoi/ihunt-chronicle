import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, CheckCircle, Crown, Archive } from 'lucide-react';
import { useTimeline } from '@/hooks/useTimeline';
import { useCampaign } from '@/contexts/CampaignContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

import { useSelfieEngine } from '@/hooks/useSelfieEngine';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function TimelineManager({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { campaign, isGM } = useCampaign();
    const { seasons, stories, episodes, addSeason, addStory, addEpisode, activateEpisode, closeEpisode: deactivateEpisode } = useTimeline(campaign?.id);
    const { closeEpisodeAndGrantSlots } = useSelfieEngine();

    const [closingEpisode, setClosingEpisode] = useState<string | null>(null);
    const [closingType, setClosingType] = useState<'episode' | 'story_climax' | 'season_finale'>('episode');

    // Forms state
    const [newSeasonTitle, setNewSeasonTitle] = useState('');
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [newStoryDesc, setNewStoryDesc] = useState('');
    const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

    const [newEpisodeTitle, setNewEpisodeTitle] = useState('');
    const [newEpisodeDesc, setNewEpisodeDesc] = useState('');
    const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

    const [createMode, setCreateMode] = useState<'season' | 'story' | 'episode' | null>(null);
    const [newThemeAspect, setNewThemeAspect] = useState('');

    if (!isGM) return null;

    const handleAddThemeAspect = async () => {
        if (!newThemeAspect.trim() || !campaign) return;
        const currentaspects = campaign.themeAspects || [];
        try {
            await updateDoc(doc(db, 'campaigns', campaign.id), {
                themeAspects: [...currentaspects, newThemeAspect.trim()]
            });
            setNewThemeAspect('');
            toast({ title: "Aspecto adicionado" });
        } catch (e) {
            console.error(e);
            toast({ title: "Erro ao adicionar aspecto", variant: "destructive" });
        }
    };

    const handleRemoveThemeAspect = async (aspect: string) => {
        if (!campaign) return;
        const currentaspects = campaign.themeAspects || [];
        try {
            await updateDoc(doc(db, 'campaigns', campaign.id), {
                themeAspects: currentaspects.filter(a => a !== aspect)
            });
            toast({ title: "Aspecto removido" });
        } catch (e) {
            console.error(e);
            toast({ title: "Erro ao remover aspecto", variant: "destructive" });
        }
    };

    const handleCreateSeason = async () => {
        if (newSeasonTitle) {
            await addSeason(newSeasonTitle, '');
            setNewSeasonTitle('');
            setCreateMode(null);
        }
    };

    const handleCreateStory = async () => {
        if (newStoryTitle && selectedSeasonId) {
            await addStory(selectedSeasonId, newStoryTitle, newStoryDesc);
            setNewStoryTitle('');
            setNewStoryDesc('');
            setCreateMode(null);
        }
    };

    const handleCreateEpisode = async () => {
        if (newEpisodeTitle && selectedStoryId) {
            await addEpisode(selectedStoryId, newEpisodeTitle, newEpisodeDesc);
            setNewEpisodeTitle('');
            setNewEpisodeDesc('');
            setCreateMode(null);
        }
    };

    const handleCloseEpisode = async () => {
        if (!closingEpisode || !campaign) return;
        try {
            await closeEpisodeAndGrantSlots(closingEpisode, closingType, campaign.id);
            toast({ title: "Episódio encerrado!", description: "Slots de Selfie distribuídos com sucesso." });
            setClosingEpisode(null);
        } catch (e) {
            toast({ title: "Erro ao encerrar", variant: "destructive" });
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Gerenciador da Linha do Tempo</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 flex gap-4 min-h-0">
                        {/* Sidebar / Tree View */}
                        <ScrollArea className="flex-1 border rounded-md p-4 bg-background/50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold">Estrutura</h3>
                                <Button size="sm" variant="outline" onClick={() => setCreateMode('season')}><Plus className="w-4 h-4 mr-1" /> Temporada</Button>
                            </div>

                            <Accordion type="multiple" className="w-full">
                                {seasons.map(season => (
                                    <AccordionItem value={season.id} key={season.id}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <span>{season.title}</span>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline">{season.status}</Badge>
                                                    <div role="button" className="h-6 w-6 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground" onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedSeasonId(season.id);
                                                        setCreateMode('story');
                                                    }}><Plus className="w-3 h-3" /></div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="pl-4 border-l-2 ml-2 space-y-2">
                                                {stories.filter(s => s.seasonId === season.id).map(story => (
                                                    <div key={story.id} className="bg-card/50 p-2 rounded-md">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-semibold text-sm">{story.title}</span>
                                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                                                                setSelectedStoryId(story.id);
                                                                setCreateMode('episode');
                                                            }}><Plus className="w-3 h-3" /></Button>
                                                        </div>

                                                        <div className="space-y-1 pl-2">
                                                            {episodes.filter(e => e.storyId === story.id).map(episode => (
                                                                <div key={episode.id} className="flex justify-between items-center text-sm p-1 hover:bg-muted rounded">
                                                                    <span>{episode.title}</span>
                                                                    <div className="flex gap-1">
                                                                        {episode.status === 'active' && <Badge className="bg-green-500">Ativo</Badge>}
                                                                        {episode.status === 'closed' && <Badge variant="secondary">Concluído</Badge>}
                                                                        {episode.status === 'draft' && <Button size="sm" variant="ghost" onClick={() => activateEpisode(episode.id)} title="Ativar"><Play className="w-3 h-3 text-green-500" /></Button>}
                                                                        {episode.status === 'active' && <Button size="sm" variant="ghost" onClick={() => setClosingEpisode(episode.id)} title="Encerrar"><CheckCircle className="w-3 h-3 text-blue-500" /></Button>}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {episodes.filter(e => e.storyId === story.id).length === 0 && <span className="text-xs text-muted-foreground italic">Sem episódios</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                                {stories.filter(s => s.seasonId === season.id).length === 0 && <span className="text-sm text-muted-foreground">Sem histórias</span>}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                            {seasons.length === 0 && <div className="text-center p-4 text-muted-foreground">Nenhuma temporada criada. Comece criando uma!</div>}
                        </ScrollArea>

                        {/* Creation Forms */}
                        {createMode && (
                            <div className="w-1/3 border rounded-md p-4 bg-card">
                                {createMode === 'season' && (
                                    <div className="space-y-4">
                                        <h4 className="font-bold">Nova Temporada</h4>
                                        <Input placeholder="Título" value={newSeasonTitle} onChange={e => setNewSeasonTitle(e.target.value)} />
                                        <Button onClick={handleCreateSeason}>Criar</Button>
                                        <Button variant="ghost" onClick={() => setCreateMode(null)}>Cancelar</Button>
                                    </div>
                                )}
                                {createMode === 'story' && (
                                    <div className="space-y-4">
                                        <h4 className="font-bold">Nova História (Arco)</h4>
                                        <Input placeholder="Título" value={newStoryTitle} onChange={e => setNewStoryTitle(e.target.value)} />
                                        <Textarea placeholder="Descrição" value={newStoryDesc} onChange={e => setNewStoryDesc(e.target.value)} />
                                        <Button onClick={handleCreateStory}>Criar para {seasons.find(s => s.id === selectedSeasonId)?.title}</Button>
                                        <Button variant="ghost" onClick={() => setCreateMode(null)}>Cancelar</Button>
                                    </div>
                                )}
                                {createMode === 'episode' && (
                                    <div className="space-y-4">
                                        <h4 className="font-bold">Novo Episódio</h4>
                                        <Input placeholder="Título" value={newEpisodeTitle} onChange={e => setNewEpisodeTitle(e.target.value)} />
                                        <Textarea placeholder="Resumo" value={newEpisodeDesc} onChange={e => setNewEpisodeDesc(e.target.value)} />
                                        <Button onClick={handleCreateEpisode}>Criar em {stories.find(s => s.id === selectedStoryId)?.title}</Button>
                                        <Button variant="ghost" onClick={() => setCreateMode(null)}>Cancelar</Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Theme Aspects Section */}
                    <div className="border-t pt-4 mt-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <Crown className="w-5 h-5 text-amber-500" />
                                Aspectos de Tema da Crônica
                            </h3>
                        </div>
                        <div className="bg-card p-4 rounded-md border space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Novo Aspecto de Tema..."
                                    value={newThemeAspect}
                                    onChange={e => setNewThemeAspect(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddThemeAspect()}
                                />
                                <Button onClick={handleAddThemeAspect} size="sm"><Plus className="w-4 h-4 mr-2" />Adicionar</Button>
                            </div>
                            <div className="space-y-2">
                                {campaign?.themeAspects?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">Nenhum aspecto de tema definido.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {campaign?.themeAspects?.map((aspect, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                                                <span className="font-display text-lg">{aspect}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive/90 h-8 w-8 p-0"
                                                    onClick={() => handleRemoveThemeAspect(aspect)}
                                                >
                                                    <Archive className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!closingEpisode} onOpenChange={(open) => !open && setClosingEpisode(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Encerrar Episódio e Distribuir Recompensas</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Isso encerrará o episódio atual e dará aos jogadores um slot de Selfie baseado no tipo de encerramento.</p>

                        <RadioGroup value={closingType} onValueChange={(v) => setClosingType(v as any)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="episode" id="r1" />
                                <Label htmlFor="r1">Encerramento Normal <span className="text-muted-foreground text-xs">(Slot de Humor +1)</span></Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="story_climax" id="r2" />
                                <Label htmlFor="r2">Clímax de Arco <span className="text-muted-foreground text-xs">(Slot de Auge +2)</span></Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="season_finale" id="r3" />
                                <Label htmlFor="r3">Finale de Temporada <span className="text-muted-foreground text-xs">(Slot de Mudança)</span></Label>
                            </div>
                        </RadioGroup>

                        <Button className="w-full" onClick={handleCloseEpisode}>
                            Confirmar Encerramento
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
