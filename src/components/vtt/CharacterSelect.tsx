import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User, Trash2, Copy, Download, Upload, Play, Edit, Sparkles, Loader2 } from 'lucide-react';
import { Character } from '@/types/game';
import { useFirebaseCharacters } from '@/hooks/useFirebaseCharacters';
import { CharacterCreator } from './CharacterCreator';

interface CharacterSelectProps {
  onSelectCharacter: (character: Character) => void;
}

export function CharacterSelect({ onSelectCharacter }: CharacterSelectProps) {
  const { 
    characters, 
    loading,
    createCharacter, 
    updateCharacter,
    deleteCharacter, 
    duplicateCharacter,
  } = useFirebaseCharacters();
  
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async (characterData: Omit<Character, 'id'>) => {
    if (editingCharacter) {
      await updateCharacter(editingCharacter.id, characterData);
      setEditingCharacter(undefined);
    } else {
      await createCharacter(characterData);
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setIsCreatorOpen(true);
  };

  const handleExport = () => {
    const json = JSON.stringify(characters, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ihunt-characters.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        const imported = JSON.parse(json) as Character[];
        if (Array.isArray(imported)) {
          for (const char of imported) {
            const { id, ...data } = char;
            await createCharacter(data);
          }
        }
      } catch (error) {
        console.error('Error importing characters:', error);
      }
      setIsImporting(false);
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePlay = () => {
    const character = characters.find(c => c.id === selectedId);
    if (character) {
      onSelectCharacter(character);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando personagens...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Background Grid */}
      <div 
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl mb-2">
            <span className="text-primary text-glow-primary">#i</span>
            <span className="text-foreground">HUNT</span>
            <span className="text-muted-foreground text-2xl ml-3">VTT</span>
          </h1>
          <p className="text-muted-foreground font-ui">
            Selecione um personagem para começar
          </p>
        </div>

        {/* Character Grid */}
        <div className="glass-panel p-6 mb-6">
          {characters.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl text-muted-foreground mb-2">
                Nenhum personagem criado
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Crie seu primeiro caçador para começar a jogar
              </p>
              <button
                onClick={() => {
                  setEditingCharacter(undefined);
                  setIsCreatorOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg 
                         bg-primary text-primary-foreground font-ui
                         hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Criar Personagem
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* New Character Card */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingCharacter(undefined);
                  setIsCreatorOpen(true);
                }}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg 
                         border-2 border-dashed border-border hover:border-primary 
                         transition-colors min-h-[200px]"
              >
                <Plus className="w-10 h-10 text-muted-foreground" />
                <span className="font-ui text-muted-foreground">Novo Personagem</span>
              </motion.button>

              {/* Character Cards */}
              <AnimatePresence>
                {characters.map((character) => (
                  <motion.div
                    key={character.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedId(character.id === selectedId ? null : character.id)}
                    className={`relative flex flex-col p-4 rounded-lg cursor-pointer
                             transition-all min-h-[200px] ${
                               character.id === selectedId
                                 ? 'glass-panel border-2 border-primary shadow-lg shadow-primary/20'
                                 : 'bg-muted/50 border border-border hover:border-primary/50'
                             }`}
                  >
                    {/* Avatar & Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border">
                        {character.avatar ? (
                          <img 
                            src={character.avatar} 
                            alt={character.name} 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <User className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg text-primary truncate">
                          {character.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {character.aspects.job || 'Sem emprego'}
                        </p>
                      </div>
                    </div>

                    {/* High Concept */}
                    <p className="text-sm text-foreground/80 line-clamp-2 flex-1">
                      {character.aspects.highConcept || 'Sem alto conceito'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="font-display text-accent">{character.fatePoints}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Object.keys(character.skills).length} habilidades
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {character.maneuvers.length} manobras
                      </div>
                    </div>

                    {/* Actions (visible when selected) */}
                    {character.id === selectedId && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-12 left-0 right-0 flex items-center justify-center gap-2"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(character);
                          }}
                          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateCharacter(character.id);
                          }}
                          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Deletar personagem?')) {
                              deleteCharacter(character.id);
                              setSelectedId(null);
                            }
                          }}
                          className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={characters.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted
                       hover:bg-muted/80 disabled:opacity-50 transition-colors font-ui text-sm"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted
                       hover:bg-muted/80 disabled:opacity-50 transition-colors font-ui text-sm"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Importar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          <button
            onClick={handlePlay}
            disabled={!selectedId}
            className="flex items-center gap-2 px-6 py-3 rounded-lg 
                     bg-primary text-primary-foreground font-ui
                     hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-colors"
          >
            <Play className="w-5 h-5" />
            Jogar
          </button>
        </div>
      </motion.div>

      {/* Character Creator Modal */}
      <CharacterCreator
        isOpen={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setEditingCharacter(undefined);
        }}
        onSave={handleCreate}
        editingCharacter={editingCharacter}
      />
    </div>
  );
}
