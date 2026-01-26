import { ActiveNPC } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, ShieldAlert, Heart, Skull, ImagePlus, User, Sparkles, Target, Brain } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useActiveNPCs } from '@/hooks/useActiveNPCs';

interface ActiveNPCSheetProps {
  npc: ActiveNPC;
  sessionId: string;
  onClose: () => void;
}

export function ActiveNPCSheet({ npc, sessionId, onClose }: ActiveNPCSheetProps) {
  const { updateNPC } = useActiveNPCs(sessionId);

  // Local state for editing
  const [notes, setNotes] = useState(npc.notes || "");
  const [currentStress, setCurrentStress] = useState(npc.currentStress);

  // Debounce notes update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== npc.notes) {
        updateNPC(npc.id, { notes });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [notes, npc.id]);

  const handleStressToggle = (idx: number) => {
    let newStress = idx + 1;
    if (currentStress === newStress) newStress = idx; // Toggle off top one
    setCurrentStress(newStress);
    updateNPC(npc.id, { currentStress: newStress });
  };

  const handleConsequenceChange = (type: 'mild' | 'moderate' | 'severe', value: string) => {
    updateNPC(npc.id, {
      consequences: {
        ...npc.consequences,
        [type]: value || null
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-background border-l border-border shadow-2xl w-full max-w-2xl">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between bg-card text-card-foreground">
        <div className="flex gap-4 items-center">
          {/* Avatar Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative group shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-border shadow-md transition-all hover:border-primary">
                {npc.avatar ? (
                  <img src={npc.avatar} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${npc.kind === 'monstro' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                    {npc.kind === 'monstro' ? <Skull className="w-8 h-8" /> : <User className="w-8 h-8" />}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ImagePlus className="w-6 h-6 text-white" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Avatar</h4>
                <p className="text-sm text-muted-foreground">URL da imagem do personagem</p>
                <Input
                  placeholder="https://..."
                  defaultValue={npc.avatar}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') updateNPC(npc.id, { avatar: e.currentTarget.value });
                  }}
                  onBlur={(e) => updateNPC(npc.id, { avatar: e.currentTarget.value })}
                />
              </div>
            </PopoverContent>
          </Popover>

          <div>
            <h2 className="font-display text-3xl leading-none text-foreground">{npc.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs uppercase tracking-wider">{npc.archetypeName}</Badge>
              {npc.kind === 'monstro' && <Badge variant="destructive" className="text-[10px] uppercase">Ameaça</Badge>}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted text-muted-foreground"><X className="w-6 h-6" /></Button>
      </div>

      <ScrollArea className="flex-1 bg-background">
        <div className="p-6 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Aspects */}
            <div className="space-y-6">
              {/* Fate Points - Just Visual for NPCs typically, but good to have */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                <span className="text-xs font-bold uppercase text-accent tracking-wider">Pontos de Destino</span>
                <div className="flex gap-1">
                  {/* Dummy Fate Points for visual consistency or track actual if NPCs had them (usually GM pool) */}
                  <div className="w-4 h-4 rounded-full bg-accent shadow-[0_0_10px_rgba(var(--accent),0.5)]"></div>
                  <div className="w-4 h-4 rounded-full bg-accent/20 border border-accent/50"></div>
                  <div className="w-4 h-4 rounded-full bg-accent/20 border border-accent/50"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-display text-lg text-foreground">Aspectos</h3>
                </div>
                <div className="space-y-3">
                  {npc.aspects.length > 0 ? (
                    npc.aspects.map((aspect, i) => (
                      <div key={i} className="p-3 rounded-md bg-secondary/10 border-l-4 border-secondary text-sm font-medium text-secondary-foreground relative group">
                        {aspect}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Nenhum aspecto definido.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Stats */}
            <div className="space-y-6">
              {/* Skills */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <h3 className="font-display text-lg text-foreground">Perícias</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(npc.skills).map(([skill, val]) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm font-normal bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-default border border-secondary/20">
                      {skill} <span className="ml-2 font-bold text-primary">+{val}</span>
                    </Badge>
                  ))}
                  {Object.keys(npc.skills).length === 0 && <p className="text-sm text-muted-foreground italic">Nenhuma perícia.</p>}
                </div>
              </div>

              {/* Stress */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                  <h3 className="font-display text-lg text-foreground">Estresse & Consequências</h3>
                </div>

                <div className="p-4 rounded-lg bg-muted/20 border border-border/50 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Trilha de Estresse</h4>
                    <div className="flex gap-2">
                      {Array.from({ length: npc.stress }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleStressToggle(i)}
                          className={`w-10 h-10 rounded-md border-2 flex items-center justify-center font-display text-xl transition-all ${i < currentStress
                              ? 'bg-destructive border-destructive text-destructive-foreground shadow-lg scale-105'
                              : 'border-border bg-background hover:border-destructive/50 text-muted-foreground'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Consequências</h4>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="w-16 h-9 justify-center shrink-0 bg-background">LEVE</Badge>
                        <Input
                          className="h-9 text-sm bg-background/50 border-input focus:bg-background transition-colors"
                          placeholder="-2"
                          value={npc.consequences.mild || ""}
                          onChange={(e) => handleConsequenceChange('mild', e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="w-16 h-9 justify-center shrink-0 border-yellow-500/30 text-yellow-500 bg-yellow-500/5">MOD</Badge>
                        <Input
                          className="h-9 text-sm bg-background/50 border-input focus:bg-background transition-colors"
                          placeholder="-4"
                          value={npc.consequences.moderate || ""}
                          onChange={(e) => handleConsequenceChange('moderate', e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="w-16 h-9 justify-center shrink-0 border-destructive/30 text-destructive bg-destructive/5">GRAVE</Badge>
                        <Input
                          className="h-9 text-sm bg-background/50 border-input focus:bg-background transition-colors"
                          placeholder="-6"
                          value={npc.consequences.severe || ""}
                          onChange={(e) => handleConsequenceChange('severe', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <h3 className="font-display text-lg text-foreground">Anotações do Mestre</h3>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] bg-yellow-50/5 border-yellow-900/10 focus:border-yellow-500/50 text-foreground resize-y"
              placeholder="Segredos, táticas, falas..."
            />
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
