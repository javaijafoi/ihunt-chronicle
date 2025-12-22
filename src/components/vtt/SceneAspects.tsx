import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Plus, Sparkles, X } from 'lucide-react';
import { SceneAspect } from '@/types/game';

interface SceneAspectsProps {
  aspects: SceneAspect[];
  onAddAspect: (name: string, freeInvokes?: number) => void;
  onInvokeAspect: (aspectName: string, useFreeInvoke?: boolean) => void;
  canEdit?: boolean;
}

export function SceneAspects({ aspects, onAddAspect, onInvokeAspect, canEdit = true }: SceneAspectsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAspectName, setNewAspectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAspectName.trim()) {
      onAddAspect(newAspectName.trim());
      setNewAspectName('');
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      className="glass-panel p-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-secondary flex items-center gap-2">
          <Bookmark className="w-4 h-4" />
          Aspectos da Cena
        </h3>
        {canEdit && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Add New Aspect Form */}
      <AnimatePresence>
        {isAdding && canEdit && (
          <motion.form
            onSubmit={handleSubmit}
            className="mb-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <input
              type="text"
              value={newAspectName}
              onChange={(e) => setNewAspectName(e.target.value)}
              placeholder="Nome do aspecto..."
              className="w-full px-3 py-2 rounded-md bg-input border border-border 
                       focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary
                       font-ui text-sm placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              type="submit"
              className="mt-2 w-full py-2 rounded-md bg-secondary text-secondary-foreground 
                       font-ui text-sm hover:bg-secondary/90 transition-colors"
            >
              Criar Aspecto
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Aspects List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {aspects.map((aspect) => (
            <motion.div
              key={aspect.id}
              className="aspect-tag scene flex items-center justify-between group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <span className="flex-1 truncate">{aspect.name}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {aspect.freeInvokes > 0 && (
                  <button
                    onClick={() => onInvokeAspect(aspect.name, true)}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-glow"
                    title="Invocar gratuitamente"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{aspect.freeInvokes}</span>
                  </button>
                )}
                <button
                  onClick={() => onInvokeAspect(aspect.name, false)}
                  className="text-xs text-primary hover:text-primary-glow"
                  title="Invocar (gasta 1 ponto de destino)"
                >
                  Invocar
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {aspects.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4 font-ui">
            Nenhum aspecto de cena ativo
          </p>
        )}
      </div>
    </motion.div>
  );
}
