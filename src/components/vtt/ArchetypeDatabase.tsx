import { useState } from 'react';
import { useArchetypes } from '@/hooks/useArchetypes';
import { useActiveNPCs } from '@/hooks/useActiveNPCs';
import { Archetype } from '@/types/game';
import {
  Search,
  Users,
  Skull,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Copy,
  UserPlus
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ArchetypeDatabaseProps {
  sessionId: string;
}

export function ArchetypeDatabase({ sessionId }: ArchetypeDatabaseProps) {
  const { archetypes, createArchetype, deleteArchetype } = useArchetypes(sessionId);
  const { createFromArchetype } = useActiveNPCs(sessionId);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'pessoa' | 'monstro'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Instance Dialog State
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [viewingArchetype, setViewingArchetype] = useState<Archetype | null>(null);
  const [instanceName, setInstanceName] = useState("");

  const filteredArchetypes = archetypes.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.aspects.some(asp => asp.toLowerCase().includes(search.toLowerCase()));
    const matchType = filter === 'all' || a.kind === filter;
    return matchSearch && matchType;
  });

  const handleInstantiate = async () => {
    if (!selectedArchetype) return;
    const finalName = instanceName.trim() || selectedArchetype.name;

    await createFromArchetype(selectedArchetype, finalName);

    toast.success(`'${finalName}' adicionado à cena.`);
    setSelectedArchetype(null);
    setViewingArchetype(null);
    setInstanceName("");
  };

  const openInstantiation = (archetype: Archetype) => {
    setSelectedArchetype(archetype);
    setInstanceName(archetype.name);
  };

  const onDeleteArchetype = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este arquétipo?")) {
      deleteArchetype(id);
      setViewingArchetype(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/50 rounded-lg border border-border/50">
      {/* Header & Controls */}
      <div className="p-4 border-b border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-primary">Base de Arquétipos</h3>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Arquétipo</DialogTitle>
              </DialogHeader>
              <ArchetypeForm
                onSubmit={(data) => {
                  createArchetype(data);
                  setIsCreating(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-auto">
            <TabsList className="bg-transparent p-0 gap-1 flex flex-wrap justify-end h-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary h-8 px-3 text-xs border border-transparent data-[state=active]:border-primary/20 bg-muted/50">Todos</TabsTrigger>
              <TabsTrigger value="pessoa" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary h-8 px-3 text-xs border border-transparent data-[state=active]:border-primary/20 bg-muted/50"><Users className="w-3.5 h-3.5 mr-1.5" /> Pessoas</TabsTrigger>
              <TabsTrigger value="monstro" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary h-8 px-3 text-xs border border-transparent data-[state=active]:border-primary/20 bg-muted/50"><Skull className="w-3.5 h-3.5 mr-1.5" /> Monstros</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Grid List */}
      <ScrollArea className="flex-1 p-4 h-full">
        {(!search && filter === 'all' && filteredArchetypes.length === 0) ? (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium text-lg">Nenhum arquétipo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            {filteredArchetypes.map((archetype) => (
              <div
                key={archetype.id}
                className="group relative flex flex-col gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-md h-full"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                    {archetype.avatar ? (
                      <img
                        src={archetype.avatar}
                        alt={archetype.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`text-muted-foreground ${archetype.kind === 'monstro' ? 'text-destructive/50' : 'text-primary/50'}`}>
                        {archetype.kind === 'monstro' ? <Skull className="w-7 h-7" /> : <Users className="w-7 h-7" />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col h-full">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-display font-medium truncate leading-tight" title={archetype.name}>
                        {archetype.name}
                      </h4>
                      <Badge variant="outline" className="shrink-0 text-[10px] h-5 px-1.5 uppercase">
                        {archetype.kind}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-auto">
                      {archetype.aspects.slice(0, 2).map((aspect, i) => (
                        <span key={i} className="inline-block px-1.5 py-0.5 rounded-sm bg-muted/60 text-[10px] text-muted-foreground truncate max-w-full">
                          {aspect}
                        </span>
                      ))}
                      {archetype.aspects.length > 2 && (
                        <span className="text-[10px] text-muted-foreground px-1 py-0.5">
                          +{archetype.aspects.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                  <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                    <div className="flex items-center gap-1" title="Estresse Físico">
                      <div className="w-2 h-2 rounded-full bg-rose-500/70" />
                      {archetype.stress.physical}
                    </div>
                    <div className="flex items-center gap-1" title="Estresse Mental">
                      <div className="w-2 h-2 rounded-full bg-blue-500/70" />
                      {archetype.stress.mental}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingArchetype(archetype)}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                      title="Ver Detalhes"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    {!archetype.isGlobal && (
                      <button
                        onClick={() => onDeleteArchetype(archetype.id!)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openInstantiation(archetype)}
                      className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors ml-1"
                      title="Adicionar à Cena"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredArchetypes.length === 0 && search && (
          <p className="text-center text-muted-foreground py-8">Nada encontrado para "{search}"</p>
        )}
      </ScrollArea>

      {/* Viewing Details Dialog */}
      <Dialog open={!!viewingArchetype} onOpenChange={(open) => !open && setViewingArchetype(null)}>
        <DialogContent className="max-w-md">
          {viewingArchetype && (
            <>
              <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                {viewingArchetype.avatar ? (
                  <img src={viewingArchetype.avatar} className="w-16 h-16 rounded-lg object-cover bg-muted" />
                ) : (
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center bg-muted ${viewingArchetype.kind === 'monstro' ? 'text-destructive' : 'text-primary'
                    }`}>
                    {viewingArchetype.kind === 'monstro' ? <Skull className="w-8 h-8" /> : <Users className="w-8 h-8" />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl font-display">{viewingArchetype.name}</DialogTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{viewingArchetype.kind}</Badge>
                    {viewingArchetype.isGlobal && <Badge variant="secondary">Global</Badge>}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {viewingArchetype.description && (
                  <p className="text-sm text-muted-foreground">{viewingArchetype.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-border/50">
                  <div>
                    <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2">Aspectos</h5>
                    <ul className="space-y-1">
                      {viewingArchetype.aspects.map((asp, i) => (
                        <li key={i} className="text-sm border-l-2 border-primary/30 pl-2 leading-tight py-0.5">
                          {asp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2">Perícias</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(viewingArchetype.skills).map(([skill, val]) => (
                        <Badge key={skill} variant="secondary" className="px-1.5 py-0.5 text-xs font-normal">
                          {skill} <span className="ml-1 font-bold text-primary">+{val}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-border">
                {!viewingArchetype.isGlobal && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteArchetype(viewingArchetype.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                  </Button>
                )}
                <Button onClick={() => openInstantiation(viewingArchetype)} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Instanciar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Instantiation Dialog */}
      <Dialog open={!!selectedArchetype} onOpenChange={(open) => !open && setSelectedArchetype(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar à Sessão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do NPC</label>
              <Input
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder={selectedArchetype?.name}
              />
              <p className="text-xs text-muted-foreground">
                Ex: "Guarda Real", "Zumbi #3", or mantenha "{selectedArchetype?.name}".
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelectedArchetype(null)}>Cancelar</Button>
              <Button onClick={handleInstantiate}>Criar NPC</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple internal form component
function ArchetypeForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<'pessoa' | 'monstro'>('monstro');
  const [aspects, setAspects] = useState("");

  const handleSubmit = () => {
    if (!name) return toast.error("Nome é obrigatório");

    // Parse aspects from line breaks
    const aspectList = aspects.split('\n').filter(a => a.trim().length > 0);

    onSubmit({
      name,
      kind,
      description: "Criado na sessão",
      aspects: aspectList,
      skills: {}, // Empty for now to keep simple
      stress: 2,
      consequences: { mild: null, moderate: null, severe: null },
      stunts: []
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Nome</label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label>Tipo</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as any)}
          >
            <option value="monstro">Monstro</option>
            <option value="pessoa">Pessoa</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label>Aspectos (um por linha)</label>
        <textarea
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={aspects}
          onChange={e => setAspects(e.target.value)}
          placeholder="Alto Conceito&#10;Dificuldade&#10;Outro Aspecto"
        />
      </div>

      <Button onClick={handleSubmit} className="w-full">Criar Modelo</Button>
    </div>
  );
}
