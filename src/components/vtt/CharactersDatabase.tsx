import { useState } from 'react';
import { useFirebaseCharacters } from '@/hooks/useFirebaseCharacters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Archive, RefreshCcw, User, Trash2, MoreVertical, Copy } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Character } from '@/types/game';

interface CharactersDatabaseProps {
    sessionId?: string;
}

export function CharactersDatabase({ sessionId }: CharactersDatabaseProps) {
    const {
        characters,
        loading,
        createCharacter,
        archiveCharacter,
        unarchiveCharacter,
        deleteCharacter,
        duplicateCharacter
    } = useFirebaseCharacters(sessionId);

    const [searchQuery, setSearchQuery] = useState('');
    const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

    // Filter Logic
    const activeCharacters = characters.filter(c => !c.isArchived);
    const archivedCharacters = characters.filter(c => c.isArchived);

    const filterList = (list: Character[]) => {
        if (!searchQuery.trim()) return list;
        return list.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    const handleCreateNew = async () => {
        if (!sessionId) return;
        await createCharacter({
            userId: 'gm',
            createdBy: 'gm',
            name: 'Novo Personagem',
            campaignId: sessionId,
            aspects: { highConcept: '', drama: '', job: '', dreamBoard: '', free: [] },
            skills: {},
            maneuvers: [],
            stress: { physical: [], mental: [] },
            consequences: { mild: null, moderate: null, severe: null },
            fatePoints: 3,
            refresh: 3,
            selfies: [],
        });
    };

    if (loading) {
        return <div className="h-full grid place-items-center text-muted-foreground">Carregando personagens...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header Section */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10">
                <div>
                    <h2 className="text-lg font-bold font-display text-foreground">Gerenciar Personagens</h2>
                    <p className="text-xs text-muted-foreground">Total: {characters.length} personagens na crônica</p>
                </div>
                <Button size="sm" onClick={handleCreateNew} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Personagem
                </Button>
            </div>

            {/* Toolbar & Filters */}
            <div className="p-4 border-b border-border bg-muted/5 flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nome..."
                        className="pl-9 h-9"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <Tabs defaultValue="active" className="flex-1 flex flex-col min-h-0">
                    <div className="px-4 pt-2 bg-muted/5 border-b border-border">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-transparent">
                            <TabsTrigger
                                value="active"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                            >
                                Ativos <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 rounded-full">{activeCharacters.length}</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="archived"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                            >
                                Arquivados <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 rounded-full">{archivedCharacters.length}</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="active" className="flex-1 overflow-y-auto p-4 m-0">
                        <CharacterGrid
                            characters={filterList(activeCharacters)}
                            onArchive={(id) => archiveCharacter(id)}
                            onDuplicate={(id) => duplicateCharacter(id)}
                            onDelete={(c) => setCharacterToDelete(c)}
                        />
                    </TabsContent>

                    <TabsContent value="archived" className="flex-1 overflow-y-auto p-4 m-0">
                        <CharacterGrid
                            characters={filterList(archivedCharacters)}
                            isArchived
                            onUnarchive={(id) => unarchiveCharacter(id)}
                            onDelete={(c) => setCharacterToDelete(c)}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!characterToDelete} onOpenChange={(open) => !open && setCharacterToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Personagem?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir permanentemente <strong>{characterToDelete?.name}</strong>?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (characterToDelete) deleteCharacter(characterToDelete.id);
                                setCharacterToDelete(null);
                            }}
                        >
                            Excluir Definitivamente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function CharacterGrid({
    characters,
    isArchived = false,
    onArchive,
    onUnarchive,
    onDuplicate,
    onDelete
}: {
    characters: Character[],
    isArchived?: boolean,
    onArchive?: (id: string) => void,
    onUnarchive?: (id: string) => void,
    onDuplicate?: (id: string) => void,
    onDelete?: (c: Character) => void
}) {
    if (characters.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                <User className="w-12 h-12" />
                <p>Nenhum personagem encontrado.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {characters.map(char => (
                <div key={char.id} className="relative group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col">
                    <div className="h-32 bg-muted relative">
                        {char.avatar ? (
                            <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <User className="w-10 h-10 opacity-20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-2 left-3 right-3 text-white">
                            <h3 className="font-display font-bold text-base truncate">{char.name}</h3>
                            <p className="text-[10px] opacity-80 truncate">{char.aspects.highConcept || "Sem conceito"}</p>
                        </div>
                    </div>

                    <div className="p-2 flex items-center justify-between text-xs bg-card">
                        <span className="text-muted-foreground truncate max-w-[120px]">
                            {/* Can add player name here if available */}
                            GM Controlled
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {onDuplicate && (
                                    <DropdownMenuItem onClick={() => onDuplicate(char.id)}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Duplicar
                                    </DropdownMenuItem>
                                )}
                                {isArchived ? (
                                    onUnarchive && (
                                        <DropdownMenuItem onClick={() => onUnarchive(char.id)}>
                                            <RefreshCcw className="w-4 h-4 mr-2" />
                                            Restaurar
                                        </DropdownMenuItem>
                                    )
                                ) : (
                                    onArchive && (
                                        <DropdownMenuItem onClick={() => onArchive(char.id)}>
                                            <Archive className="w-4 h-4 mr-2" />
                                            Arquivar
                                        </DropdownMenuItem>
                                    )
                                )}
                                <DropdownMenuSeparator />
                                {onDelete && (
                                    <DropdownMenuItem
                                        onClick={() => onDelete(char)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Excluir
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ))}
        </div>
    );
}
