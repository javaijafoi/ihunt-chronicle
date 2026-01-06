import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  User2,
  Skull,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Trash2,
  Archive,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Archetype, ArchetypeKind } from '@/types/game';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ArchetypeDatabaseProps {
  archetypes: Archetype[];
  onAddToSession: (archetype: Archetype, customName: string) => void;
  onCreateArchetype: (data: Omit<Archetype, 'id' | 'isGlobal'>) => Promise<string | null>;
  onDeleteArchetype: (id: string) => void;
}

type FilterType = 'all' | 'pessoa' | 'monstro';

export function ArchetypeDatabase({
  archetypes,
  onAddToSession,
  onCreateArchetype,
  onDeleteArchetype,
}: ArchetypeDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingToSession, setAddingToSession] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newArchetype, setNewArchetype] = useState<{
    name: string;
    kind: ArchetypeKind;
    description: string;
    aspects: string[];
    stress: number;
  }>({
    name: '',
    kind: 'pessoa',
    description: '',
    aspects: [''],
    stress: 2,
  });

  // Filter and search archetypes
  const filteredArchetypes = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return archetypes.filter((a) => {
      const matchesFilter = filter === 'all' || a.kind === filter;
      const matchesSearch =
        !query ||
        a.name.toLowerCase().includes(query) ||
        a.aspects.some((asp) => asp.toLowerCase().includes(query)) ||
        a.description?.toLowerCase().includes(query);
      return matchesFilter && matchesSearch && !a.isArchived;
    });
  }, [archetypes, filter, searchQuery]);

  // Archived archetypes (previously used NPCs)
  const archivedArchetypes = useMemo(
    () => archetypes.filter((a) => a.isArchived),
    [archetypes]
  );

  const handleAddToSession = (archetype: Archetype) => {
    if (!customName.trim()) return;
    onAddToSession(archetype, customName.trim());
    setAddingToSession(null);
    setCustomName('');
  };

  const handleCreateArchetype = async () => {
    if (!newArchetype.name.trim()) return;

    await onCreateArchetype({
      name: newArchetype.name.trim(),
      kind: newArchetype.kind,
      description: newArchetype.description.trim(),
      aspects: newArchetype.aspects.filter((a) => a.trim()),
      skills: {},
      stress: newArchetype.stress,
    });

    setIsCreating(false);
    setNewArchetype({
      name: '',
      kind: 'pessoa',
      description: '',
      aspects: [''],
      stress: 2,
    });
  };

  const renderArchetypeItem = (archetype: Archetype, isArchived = false) => {
    const isExpanded = expandedId === archetype.id;
    const isAdding = addingToSession === archetype.id;
    const Icon = archetype.kind === 'monstro' ? Skull : User2;

    return (
      <div
        key={archetype.id}
        className="bg-muted/50 rounded-lg border border-border overflow-hidden"
      >
        {/* Header */}
        <button
          onClick={() => setExpandedId(isExpanded ? null : archetype.id)}
          className="w-full flex items-center gap-2 p-2 hover:bg-muted transition-colors text-left"
        >
          <Icon className={`w-4 h-4 shrink-0 ${archetype.kind === 'monstro' ? 'text-destructive' : 'text-primary'}`} />
          <div className="flex-1 min-w-0">
            <div className="font-display text-xs truncate">{archetype.name}</div>
            {isArchived && archetype.archivedFromName && (
              <div className="text-[10px] text-muted-foreground">
                Ex: {archetype.archivedFromName}
              </div>
            )}
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            archetype.kind === 'monstro' 
              ? 'bg-destructive/20 text-destructive' 
              : 'bg-primary/20 text-primary'
          }`}>
            {archetype.kind === 'monstro' ? 'Monstro' : 'Pessoa'}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2 pt-0 space-y-2 border-t border-border/50">
                {archetype.description && (
                  <p className="text-[11px] text-muted-foreground italic">
                    {archetype.description}
                  </p>
                )}

                {/* Aspects */}
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Aspectos</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {archetype.aspects.map((asp, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground"
                      >
                        {asp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                {Object.keys(archetype.skills).length > 0 && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase">Perícias</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {Object.entries(archetype.skills).map(([skill, level]) => (
                        <span
                          key={skill}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-muted"
                        >
                          {skill} +{level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stunts */}
                {archetype.stunts && archetype.stunts.length > 0 && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase">Façanhas</span>
                    <ul className="text-[10px] mt-0.5 space-y-0.5">
                      {archetype.stunts.map((stunt, i) => (
                        <li key={i} className="text-foreground">• {stunt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stress */}
                <div className="text-[10px] text-muted-foreground">
                  Stress: {archetype.stress} caixas
                </div>

                {/* Add to session form */}
                {isAdding ? (
                  <div className="flex gap-1 items-center">
                    <Input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Nome do NPC..."
                      className="h-7 text-xs flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddToSession(archetype);
                        if (e.key === 'Escape') setAddingToSession(null);
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => handleAddToSession(archetype)}
                      disabled={!customName.trim()}
                    >
                      <UserPlus className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-[10px] flex-1"
                      onClick={() => setAddingToSession(archetype.id)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Adicionar à Sessão
                    </Button>
                    {!archetype.isGlobal && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => onDeleteArchetype(archetype.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar arquétipos..."
          className="h-8 pl-7 text-xs"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(['all', 'pessoa', 'monstro'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1 px-2 rounded text-[10px] font-ui transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'pessoa' ? 'Pessoas' : 'Monstros'}
          </button>
        ))}
      </div>

      {/* Archetype List */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-2 pr-2">
          {filteredArchetypes.map((a) => renderArchetypeItem(a))}

          {filteredArchetypes.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-xs">
              Nenhum arquétipo encontrado
            </div>
          )}

          {/* Archived Section */}
          {archivedArchetypes.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Archive className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground uppercase">
                  Usados Anteriormente
                </span>
              </div>
              {archivedArchetypes.map((a) => renderArchetypeItem(a, true))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Create New */}
      {isCreating ? (
        <div className="space-y-2 p-2 bg-muted/50 rounded-lg border border-border">
          <Input
            value={newArchetype.name}
            onChange={(e) => setNewArchetype({ ...newArchetype, name: e.target.value })}
            placeholder="Nome do arquétipo"
            className="h-7 text-xs"
          />
          <div className="flex gap-1">
            <button
              onClick={() => setNewArchetype({ ...newArchetype, kind: 'pessoa' })}
              className={`flex-1 py-1 rounded text-[10px] ${
                newArchetype.kind === 'pessoa' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              Pessoa
            </button>
            <button
              onClick={() => setNewArchetype({ ...newArchetype, kind: 'monstro' })}
              className={`flex-1 py-1 rounded text-[10px] ${
                newArchetype.kind === 'monstro' ? 'bg-destructive text-destructive-foreground' : 'bg-muted'
              }`}
            >
              Monstro
            </button>
          </div>
          <Textarea
            value={newArchetype.description}
            onChange={(e) => setNewArchetype({ ...newArchetype, description: e.target.value })}
            placeholder="Descrição..."
            className="text-xs min-h-[50px]"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Stress:</span>
            <Input
              type="number"
              min={1}
              max={10}
              value={newArchetype.stress}
              onChange={(e) => setNewArchetype({ ...newArchetype, stress: parseInt(e.target.value) || 2 })}
              className="h-7 w-16 text-xs"
            />
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={handleCreateArchetype}
              disabled={!newArchetype.name.trim()}
            >
              Criar Arquétipo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="w-3 h-3 mr-1" />
          Novo Arquétipo
        </Button>
      )}
    </div>
  );
}
