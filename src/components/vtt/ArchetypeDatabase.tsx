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
  Copy
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

    setSelectedArchetype(null);
    setInstanceName("");
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
                Novo Modelo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Arquétipo</DialogTitle>
              </DialogHeader>
              {/* Form placeholder - simple implementation for now */}
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
              placeholder="Buscar por nome ou aspecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pessoa"><Users className="w-4 h-4 mr-1" /> Pessoas</TabsTrigger>
              <TabsTrigger value="monstro"><Skull className="w-4 h-4 mr-1" /> Monstros</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 p-4 h-full max-h-[500px]">
        <div className="space-y-3">
          {(!search && filter === 'all') ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium text-lg">Pesquise para encontrar arquétipos</p>
              <p className="text-sm mt-2">Digite o nome, aspecto ou use os filtros acima.</p>
            </div>
          ) : (
            <>
              {filteredArchetypes.map((archetype) => (
                <div
                  key={archetype.id}
                  className={`border border-border/50 rounded-lg transition-all ${expandedId === archetype.id ? 'bg-accent/5 ring-1 ring-primary/20' : 'hover:bg-accent/5'
                    }`}
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === archetype.id ? null : archetype.id)}
                  >
                    {archetype.avatar ? (
                      <img src={archetype.avatar} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                    ) : (
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-muted/80 shadow-inner ${archetype.kind === 'monstro' ? 'text-destructive' : 'text-primary'
                        }`}>
                        {archetype.kind === 'monstro' ? <Skull className="w-7 h-7" /> : <Users className="w-7 h-7" />}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-display font-medium text-base truncate pr-2">{archetype.name}</h4>
                        {archetype.isGlobal && <Badge variant="secondary" className="text-[10px] uppercase tracking-wider shrink-0">Global</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{archetype.description}</p>
                    </div>

                    {expandedId === archetype.id ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                  </div>

                  {/* Details Expanded */}
                  {expandedId === archetype.id && (
                    <div className="p-4 pt-0 border-t border-border/50 bg-muted/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4">
                        <div>
                          <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block mb-2">Aspectos</span>
                          <ul className="space-y-1.5">
                            {archetype.aspects.map((asp, i) => (
                              <li key={i} className="text-sm flex items-start gap-2 text-foreground/90">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                                <span className="italic">{asp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block mb-2">Perícias</span>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(archetype.skills).map(([skill, val]) => (
                              <Badge key={skill} variant="outline" className="text-sm font-normal px-2 py-0.5 bg-background/50">
                                {skill} <span className="ml-1 font-bold text-primary">+{val}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2 border-t border-border/30 mt-2">
                        {!archetype.isGlobal && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Deletar este modelo?")) deleteArchetype(archetype.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Excluir
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedArchetype(archetype);
                            setInstanceName(archetype.name); // Default name
                          }}
                        >
                          <Copy className="w-3.5 h-3.5 mr-1.5" /> Adicionar à Sessão
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredArchetypes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum arquétipo encontrado para "{search}".</p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Instantiation Dialog */}
      <Dialog open={!!selectedArchetype} onOpenChange={(open) => !open && setSelectedArchetype(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar '{selectedArchetype?.name}' à Sessão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Único (opcional)</label>
              <Input
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder={selectedArchetype?.name}
              />
              <p className="text-xs text-muted-foreground">
                Ex: Se o arquétipo é "Vampiro Comum", você pode nomear este de "Vlad" ou "Guarda-costas".
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelectedArchetype(null)}>Cancelar</Button>
              <Button onClick={handleInstantiate}>Adicionar</Button>
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
