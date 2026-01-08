import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Check, X, Image, MapPin, Archive, Search, RotateCcw, Bookmark, ChevronDown, ChevronRight } from 'lucide-react';
import { Scene, SceneAspect } from '@/types/game';

interface SceneManagerProps {
  scenes: Scene[];
  archivedScenes?: Scene[];
  currentScene: Scene | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreateScene: (scene: Omit<Scene, 'id'>) => void | Promise<string | null>;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void | Promise<void>;
  onDeleteScene: (sceneId: string) => void | Promise<void>;
  onSetActiveScene: (sceneId: string) => void | Promise<void>;
  onArchiveScene?: (sceneId: string) => void | Promise<void>;
  onUnarchiveScene?: (sceneId: string) => void | Promise<void>;
  minAspects?: number;
}

const DEFAULT_NEW_ASPECTS = [
  'Aspecto da Cena',
  'Elemento Ambiental',
  'Perigo Oculto',
];

export function SceneManager({
  scenes,
  archivedScenes = [],
  currentScene,
  searchQuery = '',
  onSearchChange,
  onCreateScene,
  onUpdateScene,
  onDeleteScene,
  onSetActiveScene,
  onArchiveScene,
  onUnarchiveScene,
  minAspects = 3,
}: SceneManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAspectsId, setEditingAspectsId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [newScene, setNewScene] = useState({
    name: '',
    background: '',
    aspects: DEFAULT_NEW_ASPECTS.map((name, i) => ({
      id: crypto.randomUUID(),
      name,
      freeInvokes: i === 0 ? 1 : 0,
      createdBy: 'gm',
      isTemporary: false,
    })) as SceneAspect[],
  });
  const [editData, setEditData] = useState({ name: '', background: '' });
  const [editAspects, setEditAspects] = useState<SceneAspect[]>([]);

  const handleCreate = () => {
    if (!newScene.name.trim()) return;
    if (newScene.aspects.filter(a => a.name.trim()).length < minAspects) {
      return; // Validation handled in UI
    }

    onCreateScene({
      name: newScene.name.trim(),
      background: newScene.background.trim() || undefined,
      aspects: newScene.aspects.filter(a => a.name.trim()),
      isActive: false,
    });

    setNewScene({
      name: '',
      background: '',
      aspects: DEFAULT_NEW_ASPECTS.map((name, i) => ({
        id: crypto.randomUUID(),
        name,
        freeInvokes: i === 0 ? 1 : 0,
        createdBy: 'gm',
        isTemporary: false,
      })),
    });
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

  const handleStartEditAspects = (scene: Scene) => {
    setEditingAspectsId(scene.id);
    setEditAspects([...scene.aspects]);
  };

  const handleSaveAspects = (sceneId: string) => {
    const validAspects = editAspects.filter(a => a.name.trim());
    if (validAspects.length < minAspects) return;

    onUpdateScene(sceneId, { aspects: validAspects });
    setEditingAspectsId(null);
  };

  const handleAddAspect = () => {
    setEditAspects([
      ...editAspects,
      {
        id: crypto.randomUUID(),
        name: '',
        freeInvokes: 0,
        createdBy: 'gm',
        isTemporary: false,
      },
    ]);
  };

  const handleRemoveAspect = (aspectId: string) => {
    if (editAspects.length <= minAspects) return;
    setEditAspects(editAspects.filter(a => a.id !== aspectId));
  };

  const handleNewAspectChange = (index: number, name: string) => {
    const updated = [...newScene.aspects];
    updated[index] = { ...updated[index], name };
    setNewScene({ ...newScene, aspects: updated });
  };

  const renderSceneCard = (scene: Scene, isArchived: boolean = false) => {
    const isActive = currentScene?.id === scene.id;
    const isEditing = editingId === scene.id;
    const isEditingAspects = editingAspectsId === scene.id;

    return (
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`p-4 rounded-lg border transition-colors ${isActive
            ? 'bg-primary/10 border-primary shadow-sm'
            : isArchived
              ? 'bg-muted/30 border-border/50 opacity-75'
              : 'bg-muted/50 border-border hover:border-primary/50'
          }`}
      >
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-input border border-border text-base font-medium focus:border-primary focus:outline-none"
              placeholder="Nome da cena"
              autoFocus
            />
            {/* ... keeping other inputs similar but slightly padded ... */}
            <input
              type="text"
              value={editData.background}
              onChange={(e) => setEditData({ ...editData, background: e.target.value })}
              className="w-full px-3 py-1.5 rounded bg-input border border-border text-sm focus:border-primary focus:outline-none"
              placeholder="URL da imagem (opcional)"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveEdit(scene.id)}
                className="p-2 rounded bg-fate-plus/20 text-fate-plus hover:bg-fate-plus/30 transition-colors flex-1 flex justify-center"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-2 rounded bg-muted hover:bg-muted/80 transition-colors flex-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : isEditingAspects ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="w-4 h-4 text-secondary" />
              <span className="font-display text-base">Aspectos de {scene.name}</span>
            </div>
            {/* ... keeping aspect editing similar but wider inputs ... */}
            {editAspects.map((aspect, i) => (
              <div key={aspect.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={aspect.name}
                  onChange={(e) => {
                    const updated = [...editAspects];
                    updated[i] = { ...updated[i], name: e.target.value };
                    setEditAspects(updated);
                  }}
                  className="flex-1 px-3 py-1.5 rounded bg-input border border-border text-sm focus:border-primary focus:outline-none"
                  placeholder={`Aspecto ${i + 1}`}
                />
                <input
                  type="number"
                  value={aspect.freeInvokes}
                  onChange={(e) => {
                    const updated = [...editAspects];
                    updated[i] = { ...updated[i], freeInvokes: parseInt(e.target.value) || 0 };
                    setEditAspects(updated);
                  }}
                  className="w-14 px-2 py-1.5 rounded bg-input border border-border text-sm text-center focus:border-primary focus:outline-none"
                  min={0}
                  max={9}
                />
                {editAspects.length > minAspects && (
                  <button
                    onClick={() => handleRemoveAspect(aspect.id)}
                    className="p-1.5 rounded hover:bg-destructive/20 transition-colors"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddAspect}
              className="w-full py-1.5 rounded border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + Adicionar Aspecto
            </button>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleSaveAspects(scene.id)}
                disabled={editAspects.filter(a => a.name.trim()).length < minAspects}
                className="flex-1 py-1.5 rounded bg-fate-plus/20 text-fate-plus text-sm font-ui hover:bg-fate-plus/30 disabled:opacity-50 transition-colors"
              >
                Salvar Aspectos
              </button>
              <button
                onClick={() => setEditingAspectsId(null)}
                className="px-4 py-1.5 rounded bg-muted text-sm font-ui hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-display font-medium text-base truncate" title={scene.name}>
                    {scene.name}
                  </span>
                  {isActive && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold uppercase tracking-wider">
                      Ativa
                    </span>
                  )}
                </div>
                {scene.background && (
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                    <Image className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{scene.background}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0 bg-background/50 rounded-lg p-1 border border-border/50">
                {!isActive && !isArchived && (
                  <button
                    onClick={() => onSetActiveScene(scene.id)}
                    className="p-1.5 rounded hover:bg-primary/20 text-primary transition-colors text-xs font-bold uppercase tracking-wide px-2"
                    title="Ativar cena"
                  >
                    Ativar
                  </button>
                )}
                {/* ... existing buttons, slightly larger touch targets ... */}
                {isArchived ? (
                  <button
                    onClick={() => onUnarchiveScene?.(scene.id)}
                    className="p-2 rounded hover:bg-secondary/20 transition-colors"
                    title="Restaurar"
                  >
                    <RotateCcw className="w-4 h-4 text-secondary" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEditAspects(scene)}
                      className="p-2 rounded hover:bg-secondary/20 transition-colors"
                      title="Editar aspectos"
                    >
                      <Bookmark className="w-4 h-4 text-secondary" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(scene)}
                      className="p-2 rounded hover:bg-muted transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {!isActive && onArchiveScene && (
                      <button
                        onClick={() => onArchiveScene(scene.id)}
                        className="p-2 rounded hover:bg-muted transition-colors"
                        title="Arquivar"
                      >
                        <Archive className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </>
                )}
                {!isActive && (
                  <button
                    onClick={() => onDeleteScene(scene.id)}
                    className="p-2 rounded hover:bg-destructive/20 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            </div>

            {/* Scene Aspects Preview */}
            {scene.aspects && scene.aspects.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex flex-wrap gap-2">
                  {scene.aspects.map((aspect) => (
                    <span
                      key={aspect.id}
                      className="px-2 py-1 rounded text-xs bg-secondary/10 text-secondary-foreground border border-secondary/30 flex items-center gap-1"
                      title={aspect.freeInvokes > 0 ? `${aspect.freeInvokes} invocações gratuitas` : undefined}
                    >
                      {aspect.name}
                      {aspect.freeInvokes > 0 && (
                        <span className="flex items-center justify-center bg-fate-plus text-fate-plus-foreground w-4 h-4 rounded-full text-[9px] font-bold">
                          {aspect.freeInvokes}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded bg-input border border-border text-sm focus:border-primary focus:outline-none"
            placeholder="Buscar cenas..."
          />
        </div>
      )}

      {/* Scene List */}
      <div className="space-y-2">
        <AnimatePresence>
          {scenes.map((scene) => renderSceneCard(scene))}
        </AnimatePresence>

        {scenes.length === 0 && !isCreating && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p>Nenhuma cena criada</p>
          </div>
        )}
      </div>

      {/* Archived Scenes */}
      {archivedScenes.length > 0 && (
        <div className="border-t border-border pt-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showArchived ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Archive className="w-4 h-4" />
            <span>Cenas Arquivadas ({archivedScenes.length})</span>
          </button>

          <AnimatePresence>
            {showArchived && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2"
              >
                {archivedScenes.map((scene) => renderSceneCard(scene, true))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Create New Scene */}
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
              value={newScene.name}
              onChange={(e) => setNewScene({ ...newScene, name: e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm focus:border-primary focus:outline-none"
              placeholder="Nome da cena"
              autoFocus
            />
            <input
              type="text"
              value={newScene.background}
              onChange={(e) => setNewScene({ ...newScene, background: e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-input border border-border text-sm focus:border-primary focus:outline-none"
              placeholder="URL da imagem de fundo (opcional)"
            />

            {/* Aspects */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-secondary" />
                <span className="text-xs text-muted-foreground font-ui uppercase">
                  Aspectos (mínimo {minAspects})
                </span>
              </div>
              {newScene.aspects.map((aspect, i) => (
                <input
                  key={aspect.id}
                  type="text"
                  value={aspect.name}
                  onChange={(e) => handleNewAspectChange(i, e.target.value)}
                  className="w-full px-2 py-1 rounded bg-input border border-border text-sm focus:border-primary focus:outline-none"
                  placeholder={`Aspecto ${i + 1}${i < minAspects ? ' *' : ''}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newScene.name.trim() || newScene.aspects.filter(a => a.name.trim()).length < minAspects}
                className="flex-1 py-1.5 rounded bg-primary text-primary-foreground text-sm font-ui hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Criar Cena
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewScene({
                    name: '',
                    background: '',
                    aspects: DEFAULT_NEW_ASPECTS.map((name, i) => ({
                      id: crypto.randomUUID(),
                      name,
                      freeInvokes: i === 0 ? 1 : 0,
                      createdBy: 'gm',
                      isTemporary: false,
                    })),
                  });
                }}
                className="px-3 py-1.5 rounded bg-muted text-muted-foreground text-sm font-ui hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2 rounded-lg border-2 border-dashed border-border text-muted-foreground text-sm font-ui flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Cena
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}
