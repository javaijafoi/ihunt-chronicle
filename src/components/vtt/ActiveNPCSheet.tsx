import { ActiveNPC } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Save, ShieldAlert, Heart, Skull, ImagePlus } from 'lucide-react';
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
    // If clicking the current level, reduce by 1. If clicking higher, set to that level.
    // Example: Current 2. Click 2 -> 1. Click 3 -> 3. Click 1 -> 1.
    // Simpler: Just toggle specific boxes? Fate usually works as "mark box 1, mark box 2".
    // Let's implement as "Current Stress Value" (0 to max).
    // Clicking box N sets stress to N. If already >= N, clicking N might clear it?
    // Let's stick to standard Fate: stress boxes are individual hits, but often simplified as a track.
    // The type `currentStress` is a number (total stress taken).
    // Let's treat it as a track: 0 = none, 1 = box 1 full, 2 = box 1+2? No, Fate stress is slot-based usually.
    // But `currentStress` as number implies a counter (HP-like) or just "highest box"?
    // The previous system used `stress` as max and `currentStress` as number.
    // Let's assume linear stress for simplicity (Standard HP-like for monsters): 0/4.

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
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative group shrink-0">
                {npc.avatar ? (
                  <img src={npc.avatar} className="w-16 h-16 rounded-md bg-muted object-cover border border-border group-hover:border-primary transition-colors" />
                ) : (
                  <div className={`w-16 h-16 rounded-md flex items-center justify-center border border-border group-hover:border-primary transition-colors ${npc.kind === 'monstro' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
                    }`}>
                    {npc.kind === 'monstro' ? <Skull className="w-8 h-8" /> : <Heart className="w-8 h-8" />}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md transition-opacity">
                  <ImagePlus className="w-5 h-5 text-white" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Imagem do NPC</h4>
                <p className="text-sm text-muted-foreground">
                  Cole uma URL de imagem para exibir.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    defaultValue={npc.avatar}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateNPC(npc.id, { avatar: e.currentTarget.value });
                      }
                    }}
                    onBlur={(e) => updateNPC(npc.id, { avatar: e.currentTarget.value })}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div>
            <h2 className="font-display text-2xl leading-none mb-1">{npc.name}</h2>
            <div className="flex gap-2 items-center">
              <Badge variant="outline" className="text-xs">{npc.archetypeName}</Badge>
              {npc.kind === 'monstro' && <Badge variant="destructive" className="text-[10px] uppercase">Ameaça</Badge>}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mr-2"><X className="w-5 h-5" /></Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Stats */}
            <div className="space-y-6">
              {/* Stress Track */}
              <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-3 h-3" /> Stress
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: npc.stress }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleStressToggle(i)}
                      className={`w-10 h-10 rounded border-2 flex items-center justify-center font-bold text-lg transition-all ${i < currentStress
                        ? 'bg-destructive border-destructive text-destructive-foreground shadow-sm'
                        : 'border-border bg-background hover:border-destructive/50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consequences */}
              <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">Consequências</h4>
                <div className="grid gap-2">
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="w-16 h-8 justify-center shrink-0">LEVE</Badge>
                    <Input
                      className="h-8 text-sm"
                      placeholder="-2"
                      value={npc.consequences.mild || ""}
                      onChange={(e) => handleConsequenceChange('mild', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="w-16 h-8 justify-center shrink-0 border-yellow-500/50 text-yellow-500">MOD</Badge>
                    <Input
                      className="h-8 text-sm"
                      placeholder="-4"
                      value={npc.consequences.moderate || ""}
                      onChange={(e) => handleConsequenceChange('moderate', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="w-16 h-8 justify-center shrink-0 border-red-500/50 text-red-500">GRAVE</Badge>
                    <Input
                      className="h-8 text-sm"
                      placeholder="-6"
                      value={npc.consequences.severe || ""}
                      onChange={(e) => handleConsequenceChange('severe', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Aspects & Skills */}
            <div className="space-y-6">
              {/* Aspects */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">Aspectos</h4>
                <div className="space-y-2">
                  {npc.aspects.map((aspect, i) => (
                    <div key={i} className="p-2.5 rounded bg-secondary/10 border border-secondary/20 text-sm font-medium text-secondary-foreground/90">
                      {aspect}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">Perícias</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(npc.skills).map(([skill, val]) => (
                    <Badge key={skill} variant="secondary" className="px-2.5 py-1 text-sm font-normal">
                      {skill} <span className="ml-1.5 text-primary font-bold">+{val}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <h4 className="text-xs font-bold uppercase text-muted-foreground">Anotações do Mestre</h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] bg-yellow-50/5 border-yellow-900/10 focus:border-yellow-500/50"
              placeholder="Notas sobre interpretação, segredos, táticas..."
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
