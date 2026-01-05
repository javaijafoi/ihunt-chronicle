import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User2, Trash2, Copy, ChevronDown, ChevronRight, Star, MapPin } from 'lucide-react';
import { NPC } from '@/types/game';

interface NPCDatabaseProps {
  npcs: NPC[];
  onAddToScene: (npc: NPC) => void;
  onCreateNPC: (npc: Omit<NPC, 'id'>) => void;
  onDeleteNPC: (npcId: string) => void;
  onDuplicateNPC?: (npcId: string) => void;
}

export function NPCDatabase({
  npcs,
  onAddToScene,
  onCreateNPC,
  onDeleteNPC,
  onDuplicateNPC,
}: NPCDatabaseProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newNPC, setNewNPC] = useState<Omit<NPC, 'id'>>({
    name: '',
    description: '',
    aspects: [''],
    skills: {},
    stress: 2,
    notes: '',
  });

  const handleCreate = () => {
    if (!newNPC.name.trim()) return;
    
    onCreateNPC({
      ...newNPC,
      aspects: newNPC.aspects.filter(a => a.trim()),
    });
    
    setNewNPC({
      name: '',
      description: '',
      aspects: [''],
      skills: {},
      stress: 2,
      notes: '',
    });
    setIsCreating(false);
  };

  const handleDuplicate = (npc: NPC) => {
    if (onDuplicateNPC) {
      onDuplicateNPC(npc.id);
    } else {
      onCreateNPC({
        name: `${npc.name} (Cópia)`,
        description: npc.description,
        aspects: [...npc.aspects],
        skills: { ...npc.skills },
        stress: npc.stress,
        notes: npc.notes,
        avatar: npc.avatar,
      });
    }
  };

  const addAspect = () => {
    setNewNPC({ ...newNPC, aspects: [...newNPC.aspects, ''] });
  };

  const updateAspect = (index: number, value: string) => {
    const aspects = [...newNPC.aspects];
    aspects[index] = value;
    setNewNPC({ ...newNPC, aspects });
  };

  const removeAspect = (index: number) => {
    if (newNPC.aspects.length <= 1) return;
    const aspects = newNPC.aspects.filter((_, i) => i !== index);
    setNewNPC({ ...newNPC, aspects });
  };

  return (
    <div className="space-y-3">
      {/* NPC List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {npcs.map((npc) => (
          <motion.div
            key={npc.id}
            className="rounded-lg bg-muted/50 border border-border overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === npc.id ? null : npc.id)}
              className="w-full p-3 flex items-center gap-2 text-left hover:bg-muted/80 transition-colors"
            >
              {npc.avatar ? (
                <img 
                  src={npc.avatar} 
                  alt={npc.name}
                  className="w-6 h-6 rounded-full object-cover border border-accent/50"
                />
              ) : (
                <User2 className="w-4 h-4 text-accent shrink-0" />
              )}
              <span className="font-display text-sm flex-1 truncate">{npc.name}</span>
              {npc.isTemplate && (
                <Star className="w-3 h-3 text-secondary" />
              )}
              {expandedId === npc.id ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {expandedId === npc.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 pt-0 space-y-3 border-t border-border">
                    {npc.description && (
                      <p className="text-xs text-muted-foreground italic">
                        {npc.description}
                      </p>
                    )}

                    {/* Aspects */}
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wide">
                        Aspectos
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {npc.aspects.map((aspect, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-accent/20 text-accent text-xs"
                          >
                            {aspect}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    {Object.keys(npc.skills).length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-wide">
                          Habilidades
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(npc.skills).map(([skill, value]) => (
                            <span key={skill} className="text-xs text-foreground">
                              {skill}: <span className="text-primary">+{value}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {npc.notes && (
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-wide">
                          Notas
                        </span>
                        <p className="text-xs text-foreground/80 mt-1">{npc.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <button
                        onClick={() => onAddToScene(npc)}
                        className="flex-1 py-1.5 rounded bg-accent text-accent-foreground text-xs font-ui
                                 hover:bg-accent/90 transition-colors flex items-center justify-center gap-1"
                      >
                        <MapPin className="w-3 h-3" />
                        Adicionar à Cena
                      </button>
                      <button
                        onClick={() => handleDuplicate(npc)}
                        className="p-1.5 rounded bg-muted hover:bg-muted/80 transition-colors"
                        title="Duplicar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {!npc.isTemplate && (
                        <button
                          onClick={() => onDeleteNPC(npc.id)}
                          className="p-1.5 rounded hover:bg-destructive/20 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {npcs.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <User2 className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p>Nenhum NPC criado</p>
          </div>
        )}
      </div>

      {/* Create New NPC */}
      <AnimatePresence>
        {isCreating ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-muted/50 border border-border space-y-3"
          >
            <input
              type="text"
              value={newNPC.name}
              onChange={(e) => setNewNPC({ ...newNPC, name: e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm
                       focus:border-accent focus:outline-none"
              placeholder="Nome do NPC"
              autoFocus
            />
            
            <textarea
              value={newNPC.description}
              onChange={(e) => setNewNPC({ ...newNPC, description: e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm
                       focus:border-accent focus:outline-none resize-none"
              placeholder="Descrição (opcional)"
              rows={2}
            />

            {/* Aspects */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Aspectos</label>
              {newNPC.aspects.map((aspect, i) => (
                <div key={i} className="flex gap-1">
                  <input
                    type="text"
                    value={aspect}
                    onChange={(e) => updateAspect(i, e.target.value)}
                    className="flex-1 px-2 py-1 rounded bg-input border border-border text-xs
                             focus:border-accent focus:outline-none"
                    placeholder={`Aspecto ${i + 1}`}
                  />
                  {newNPC.aspects.length > 1 && (
                    <button
                      onClick={() => removeAspect(i)}
                      className="p-1 rounded hover:bg-destructive/20 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addAspect}
                className="text-xs text-accent hover:text-accent/80"
              >
                + Adicionar Aspecto
              </button>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Stress</label>
              <input
                type="number"
                value={newNPC.stress}
                onChange={(e) => setNewNPC({ ...newNPC, stress: parseInt(e.target.value) || 2 })}
                className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm
                         focus:border-accent focus:outline-none"
                min={1}
                max={10}
              />
            </div>

            <textarea
              value={newNPC.notes}
              onChange={(e) => setNewNPC({ ...newNPC, notes: e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm
                       focus:border-accent focus:outline-none resize-none"
              placeholder="Notas do GM (opcional)"
              rows={2}
            />

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newNPC.name.trim()}
                className="flex-1 py-1.5 rounded bg-accent text-accent-foreground text-sm font-ui
                         hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                Criar NPC
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded bg-muted text-muted-foreground text-sm font-ui
                         hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2 rounded-lg border-2 border-dashed border-border 
                     text-muted-foreground text-sm font-ui flex items-center justify-center gap-2
                     hover:border-accent hover:text-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo NPC
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
