
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, CheckCircle, Flag } from 'lucide-react';
import { useTimeline } from '@/hooks/useTimeline';
import { useCampaign } from '@/contexts/CampaignContext';

export function TimelineManager({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { campaign, isGM } = useCampaign();
    const { seasons, stories, episodes, addSeason, addStory, addEpisode, activateEpisode, closeEpisode } = useTimeline(campaign?.id);

    // Forms state
    const [newSeasonTitle, setNewSeasonTitle] = useState('');
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [newStoryDesc, setNewStoryDesc] = useState('');
    const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

    const [newEpisodeTitle, setNewEpisodeTitle] = useState('');
    const [newEpisodeDesc, setNewEpisodeDesc] = useState('');
    const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

    const [createMode, setCreateMode] = useState<'season' | 'story' | 'episode' | null>(null);

    if (!isGM) return null;

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

    return (
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
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSeasonId(season.id);
                                                    setCreateMode('story');
                                                }}><Plus className="w-3 h-3" /></Button>
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
                                                                    {episode.status === 'completed' && <Badge variant="secondary">Concluído</Badge>}
                                                                    {episode.status === 'pending' && <Button size="sm" variant="ghost" onClick={() => activateEpisode(episode.id)}><Play className="w-3 h-3 text-green-500" /></Button>}
                                                                    {episode.status === 'active' && <Button size="sm" variant="ghost" onClick={() => closeEpisode(episode.id)}><CheckCircle className="w-3 h-3 text-blue-500" /></Button>}
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
            </DialogContent>
        </Dialog>
    );
}
