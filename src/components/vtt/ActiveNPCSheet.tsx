import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User2, Skull, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ActiveNPC } from '@/types/game';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ActiveNPCSheetProps {
  npc: ActiveNPC;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<ActiveNPC>) => void;
}

export function ActiveNPCSheet({ npc, isOpen, onClose, onUpdate }: ActiveNPCSheetProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const Icon = npc.kind === 'monstro' ? Skull : User2;

  const handleStressToggle = (index: number) => {
    const newStress = index < npc.currentStress ? index : index + 1;
    onUpdate({ currentStress: Math.min(newStress, npc.stress) });
  };

  const handleAspectChange = (index: number, value: string) => {
    const newAspects = [...npc.aspects];
    newAspects[index] = value;
    onUpdate({ aspects: newAspects });
  };

  const handleAddAspect = () => {
    onUpdate({ aspects: [...npc.aspects, ''] });
  };

  const handleRemoveAspect = (index: number) => {
    onUpdate({ aspects: npc.aspects.filter((_, i) => i !== index) });
  };

  const handleConsequenceChange = (
    severity: 'mild' | 'moderate' | 'severe',
    value: string
  ) => {
    onUpdate({
      consequences: {
        ...npc.consequences,
        [severity]: value || null,
      },
    });
  };

  const handleStuntChange = (index: number, value: string) => {
    const newStunts = [...npc.stunts];
    newStunts[index] = value;
    onUpdate({ stunts: newStunts });
  };

  const handleAddStunt = () => {
    onUpdate({ stunts: [...npc.stunts, ''] });
  };

  const handleRemoveStunt = (index: number) => {
    onUpdate({ stunts: npc.stunts.filter((_, i) => i !== index) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${npc.kind === 'monstro' ? 'text-destructive' : 'text-primary'}`} />
            <span>{npc.name}</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            NPC - {npc.kind === 'monstro' ? `Monstro (${npc.archetypeName})` : `Pessoa (${npc.archetypeName})`}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-100px)]">
          <div className="p-4 space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-muted-foreground uppercase">Nome</label>
              <Input
                value={npc.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Stress Track */}
            <div>
              <label className="text-xs text-muted-foreground uppercase">
                Stress ({npc.currentStress}/{npc.stress})
              </label>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: npc.stress }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleStressToggle(i)}
                    className={`w-8 h-8 rounded border-2 transition-colors ${
                      i < npc.currentStress
                        ? 'bg-destructive border-destructive text-destructive-foreground'
                        : 'border-muted-foreground/30 hover:border-muted-foreground'
                    }`}
                  >
                    {i < npc.currentStress && '✕'}
                  </button>
                ))}
              </div>
            </div>

            {/* Consequences */}
            <div>
              <label className="text-xs text-muted-foreground uppercase">Consequências</label>
              <div className="space-y-2 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-20 shrink-0">Leve (2)</span>
                  <Input
                    value={npc.consequences.mild || ''}
                    onChange={(e) => handleConsequenceChange('mild', e.target.value)}
                    placeholder="Consequência leve..."
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-20 shrink-0">Moderada (4)</span>
                  <Input
                    value={npc.consequences.moderate || ''}
                    onChange={(e) => handleConsequenceChange('moderate', e.target.value)}
                    placeholder="Consequência moderada..."
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-20 shrink-0">Severa (6)</span>
                  <Input
                    value={npc.consequences.severe || ''}
                    onChange={(e) => handleConsequenceChange('severe', e.target.value)}
                    placeholder="Consequência severa..."
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Aspects */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground uppercase">Aspectos</label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={handleAddAspect}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1 mt-1">
                {npc.aspects.map((aspect, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Input
                      value={aspect}
                      onChange={(e) => handleAspectChange(i, e.target.value)}
                      placeholder="Aspecto..."
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveAspect(i)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-xs text-muted-foreground uppercase">Perícias</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(npc.skills).map(([skill, level]) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-1 rounded bg-muted"
                  >
                    {skill} +{level}
                  </span>
                ))}
                {Object.keys(npc.skills).length === 0 && (
                  <span className="text-xs text-muted-foreground italic">
                    Nenhuma perícia
                  </span>
                )}
              </div>
            </div>

            {/* Stunts */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground uppercase">Façanhas</label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2"
                  onClick={handleAddStunt}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1 mt-1">
                {npc.stunts.map((stunt, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Input
                      value={stunt}
                      onChange={(e) => handleStuntChange(i, e.target.value)}
                      placeholder="Façanha..."
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveStunt(i)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {npc.stunts.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">
                    Nenhuma façanha
                  </span>
                )}
              </div>
            </div>

            {/* Scene Tags */}
            {npc.sceneTags.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground uppercase">Cenas Visitadas</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {npc.sceneTags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      📍 {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs text-muted-foreground uppercase">Anotações</label>
              <Textarea
                value={npc.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="Notas sobre este NPC..."
                className="mt-1 min-h-[100px] text-sm"
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
