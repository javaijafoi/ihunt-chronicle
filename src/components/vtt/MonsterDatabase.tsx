import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Skull, Edit, Trash2, Copy, ChevronDown, ChevronRight, Star } from 'lucide-react';

export interface Monster {
  id: string;
  name: string;
  description?: string;
  aspects: string[];
  skills: Record<string, number>;
  stress: number;
  stunts?: string[];
  isTemplate?: boolean;
}

// Default monsters for iHunt
const DEFAULT_MONSTERS: Monster[] = [
  {
    id: 'vampire-basic',
    name: 'Vampiro Comum',
    description: 'Um morto-vivo sedento de sangue.',
    aspects: ['Morto-Vivo Sedento', 'Aversão à Luz Solar', 'Força Sobrenatural'],
    skills: { Lutar: 3, Atletismo: 2, Provocar: 2, Percepção: 1 },
    stress: 3,
    stunts: ['Regeneração: +2 para superar consequências físicas'],
    isTemplate: true,
  },
  {
    id: 'werewolf-basic',
    name: 'Lobisomem',
    description: 'Um ser humano amaldiçoado que se transforma sob a lua cheia.',
    aspects: ['Fúria Bestial', 'Fraqueza à Prata', 'Sentidos Aguçados'],
    skills: { Lutar: 4, Atletismo: 3, Percepção: 3, Furtividade: 2 },
    stress: 4,
    stunts: ['Garras Mortais: +2 ao atacar com garras'],
    isTemplate: true,
  },
  {
    id: 'ghost-basic',
    name: 'Fantasma',
    description: 'Um espírito preso entre mundos.',
    aspects: ['Incorpóreo', 'Ligado a Um Lugar', 'Sede de Vingança'],
    skills: { Vontade: 3, Provocar: 3, Furtividade: 2, Percepção: 2 },
    stress: 2,
    stunts: ['Atravessar Paredes: Pode ignorar barreiras físicas'],
    isTemplate: true,
  },
  {
    id: 'demon-basic',
    name: 'Demônio Menor',
    description: 'Uma entidade do inferno.',
    aspects: ['Origem Infernal', 'Fraqueza ao Sagrado', 'Tentador'],
    skills: { Enganar: 4, Vontade: 3, Lutar: 2, Conhecimentos: 2 },
    stress: 3,
    stunts: ['Possessão: Pode tentar possuir um alvo com Vontade vs Vontade'],
    isTemplate: true,
  },
  {
    id: 'cultist-basic',
    name: 'Cultista',
    description: 'Um seguidor fanático de forças obscuras.',
    aspects: ['Devoção Fanática', 'Conhecimento Proibido'],
    skills: { Conhecimentos: 2, Vontade: 2, Atirar: 1, Lutar: 1 },
    stress: 2,
    isTemplate: true,
  },
];

interface MonsterDatabaseProps {
  monsters: Monster[];
  onAddToScene: (monster: Monster) => void;
  onCreateMonster: (monster: Omit<Monster, 'id'>) => void;
  onDeleteMonster: (monsterId: string) => void;
}

export function MonsterDatabase({
  monsters,
  onAddToScene,
  onCreateMonster,
  onDeleteMonster,
}: MonsterDatabaseProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newMonster, setNewMonster] = useState<Omit<Monster, 'id'>>({
    name: '',
    description: '',
    aspects: [''],
    skills: {},
    stress: 2,
    stunts: [],
  });

  const allMonsters = [...DEFAULT_MONSTERS, ...monsters.filter(m => !m.isTemplate)];

  const handleCreate = () => {
    if (!newMonster.name.trim()) return;
    
    onCreateMonster({
      ...newMonster,
      aspects: newMonster.aspects.filter(a => a.trim()),
      stunts: newMonster.stunts?.filter(s => s.trim()),
    });
    
    setNewMonster({
      name: '',
      description: '',
      aspects: [''],
      skills: {},
      stress: 2,
      stunts: [],
    });
    setIsCreating(false);
  };

  const handleDuplicate = (monster: Monster) => {
    onCreateMonster({
      name: `${monster.name} (Cópia)`,
      description: monster.description,
      aspects: [...monster.aspects],
      skills: { ...monster.skills },
      stress: monster.stress,
      stunts: monster.stunts ? [...monster.stunts] : undefined,
    });
  };

  return (
    <div className="space-y-3">
      {/* Monster List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {allMonsters.map((monster) => (
          <motion.div
            key={monster.id}
            className="rounded-lg bg-muted/50 border border-border overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === monster.id ? null : monster.id)}
              className="w-full p-3 flex items-center gap-2 text-left hover:bg-muted/80 transition-colors"
            >
              <Skull className="w-4 h-4 text-destructive shrink-0" />
              <span className="font-display text-sm flex-1 truncate">{monster.name}</span>
              {monster.isTemplate && (
                <Star className="w-3 h-3 text-secondary" />
              )}
              <span className="text-xs text-muted-foreground">
                Stress: {monster.stress}
              </span>
              {expandedId === monster.id ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {expandedId === monster.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 pt-0 space-y-3 border-t border-border">
                    {monster.description && (
                      <p className="text-xs text-muted-foreground italic">
                        {monster.description}
                      </p>
                    )}

                    {/* Aspects */}
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wide">
                        Aspectos
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {monster.aspects.map((aspect, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-secondary/20 text-secondary text-xs"
                          >
                            {aspect}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground tracking-wide">
                        Habilidades
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(monster.skills).map(([skill, value]) => (
                          <span key={skill} className="text-xs text-foreground">
                            {skill}: <span className="text-primary">+{value}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stunts */}
                    {monster.stunts && monster.stunts.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-wide">
                          Façanhas
                        </span>
                        <ul className="mt-1 space-y-1">
                          {monster.stunts.map((stunt, i) => (
                            <li key={i} className="text-xs text-foreground/80">
                              • {stunt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <button
                        onClick={() => onAddToScene(monster)}
                        className="flex-1 py-1.5 rounded bg-primary text-primary-foreground text-xs font-ui
                                 hover:bg-primary/90 transition-colors"
                      >
                        Adicionar à Cena
                      </button>
                      <button
                        onClick={() => handleDuplicate(monster)}
                        className="p-1.5 rounded bg-muted hover:bg-muted/80 transition-colors"
                        title="Duplicar"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {!monster.isTemplate && (
                        <button
                          onClick={() => onDeleteMonster(monster.id)}
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
      </div>

      {/* Create New Monster */}
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
              value={newMonster.name}
              onChange={(e) => setNewMonster({ ...newMonster, name: e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm
                       focus:border-primary focus:outline-none"
              placeholder="Nome do monstro"
              autoFocus
            />
            
            <textarea
              value={newMonster.description}
              onChange={(e) => setNewMonster({ ...newMonster, description: e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm
                       focus:border-primary focus:outline-none resize-none"
              placeholder="Descrição (opcional)"
              rows={2}
            />

            <div>
              <label className="text-xs text-muted-foreground">Stress</label>
              <input
                type="number"
                value={newMonster.stress}
                onChange={(e) => setNewMonster({ ...newMonster, stress: parseInt(e.target.value) || 2 })}
                className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm
                         focus:border-primary focus:outline-none"
                min={1}
                max={10}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newMonster.name.trim()}
                className="flex-1 py-1.5 rounded bg-primary text-primary-foreground text-sm font-ui
                         hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Criar Monstro
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
                     hover:border-destructive hover:text-destructive transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Monstro
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
