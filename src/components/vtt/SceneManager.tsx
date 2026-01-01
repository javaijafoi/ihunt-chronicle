import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Check, X, Image, MapPin } from 'lucide-react';
import { Scene, SceneAspect } from '@/types/game';

interface SceneManagerProps {
  scenes: Scene[];
  currentScene: Scene | null;
  onCreateScene: (scene: Omit<Scene, 'id'>) => void;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onDeleteScene: (sceneId: string) => void;
  onSetActiveScene: (sceneId: string) => void;
}

export function SceneManager({
  scenes,
  currentScene,
  onCreateScene,
  onUpdateScene,
  onDeleteScene,
  onSetActiveScene,
}: SceneManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newScene, setNewScene] = useState({ name: '', background: '' });
  const [editData, setEditData] = useState({ name: '', background: '' });

  const handleCreate = () => {
    if (!newScene.name.trim()) return;
    
    onCreateScene({
      name: newScene.name.trim(),
      background: newScene.background.trim() || undefined,
      aspects: [],
      isActive: false,
    });
    
    setNewScene({ name: '', background: '' });
    setIsCreating(false);
  };

  const handleStartEdit = (scene: Scene) => {
    setEditingId(scene.id);
    setEditData({ name: scene.name, background: scene.background || '' });
  };

  const handleSaveEdit = (sceneId: string) => {
    if (!editData.name.trim()) return;
    
    onUpdateScene(sceneId, {
      name: editData.name.trim(),
      background: editData.background.trim() || undefined,
    });
    
    setEditingId(null);
  };

  return (
    <div className="space-y-3">
      {/* Scene List */}
      <div className="space-y-2">
        <AnimatePresence>
          {scenes.map((scene) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-lg border transition-colors ${
                currentScene?.id === scene.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-muted/50 border-border hover:border-primary/50'
              }`}
            >
              {editingId === scene.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-input border border-border text-sm
                             focus:border-primary focus:outline-none"
                    placeholder="Nome da cena"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editData.background}
                    onChange={(e) => setEditData({ ...editData, background: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-input border border-border text-sm
                             focus:border-primary focus:outline-none"
                    placeholder="URL da imagem (opcional)"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSaveEdit(scene.id)}
                      className="p-1.5 rounded bg-fate-plus/20 text-fate-plus hover:bg-fate-plus/30 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${
                        currentScene?.id === scene.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className="font-display text-sm truncate" title={scene.name}>
                        {scene.name}
                      </span>
                      {currentScene?.id === scene.id && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase">
                          Ativa
                        </span>
                      )}
                    </div>
                    {scene.background && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <Image className="w-3 h-3" />
                        <span className="truncate">{scene.background}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    {currentScene?.id !== scene.id && (
                      <button
                        onClick={() => onSetActiveScene(scene.id)}
                        className="p-1.5 rounded hover:bg-primary/20 text-primary transition-colors text-[10px] font-ui"
                        title="Ativar cena"
                      >
                        Ativar
                      </button>
                    )}
                    <button
                      onClick={() => handleStartEdit(scene)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => onDeleteScene(scene.id)}
                      className="p-1.5 rounded hover:bg-destructive/20 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {scenes.length === 0 && !isCreating && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p>Nenhuma cena criada</p>
          </div>
        )}
      </div>

      {/* Create New Scene */}
      <AnimatePresence>
        {isCreating ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-muted/50 border border-border space-y-2"
          >
            <input
              type="text"
              value={newScene.name}
              onChange={(e) => setNewScene({ ...newScene, name: e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm
                       focus:border-primary focus:outline-none"
              placeholder="Nome da cena"
              autoFocus
            />
            <input
              type="text"
              value={newScene.background}
              onChange={(e) => setNewScene({ ...newScene, background: e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm
                       focus:border-primary focus:outline-none"
              placeholder="URL da imagem de fundo (opcional)"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newScene.name.trim()}
                className="flex-1 py-1.5 rounded bg-primary text-primary-foreground text-sm font-ui
                         hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Criar Cena
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewScene({ name: '', background: '' });
                }}
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
                     hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Cena
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
