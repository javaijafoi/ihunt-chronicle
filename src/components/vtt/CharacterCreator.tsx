import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, User, Sparkles, Target, Zap, Check, Plus, Trash2 } from 'lucide-react';
import { Character } from '@/types/game';
import { SkillPyramid } from './SkillPyramid';

interface CharacterCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Omit<Character, 'id'>) => void;
  editingCharacter?: Character;
}

const STEPS = [
  { id: 'identity', title: 'Identidade', icon: User },
  { id: 'aspects', title: 'Aspectos', icon: Sparkles },
  { id: 'skills', title: 'Habilidades', icon: Target },
  { id: 'maneuvers', title: 'Manobras', icon: Zap },
  { id: 'review', title: 'Revisão', icon: Check },
];

const DEFAULT_CHARACTER: Omit<Character, 'id'> = {
  name: '',
  avatar: '',
  aspects: {
    highConcept: '',
    drama: '',
    job: '',
    dreamBoard: '',
    free: [],
  },
  skills: {},
  maneuvers: [],
  stress: {
    physical: [false, false, false],
    mental: [false, false, false],
  },
  consequences: {
    mild: null,
    moderate: null,
    severe: null,
  },
  fatePoints: 3,
  refresh: 3,
};

export function CharacterCreator({ isOpen, onClose, onSave, editingCharacter }: CharacterCreatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [character, setCharacter] = useState<Omit<Character, 'id'>>(
    editingCharacter ? { ...editingCharacter } : { ...DEFAULT_CHARACTER }
  );
  const [newManeuver, setNewManeuver] = useState('');
  const [newFreeAspect, setNewFreeAspect] = useState('');

  const updateField = <K extends keyof typeof character>(
    field: K,
    value: typeof character[K]
  ) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
  };

  const updateAspect = (key: keyof typeof character.aspects, value: string | string[]) => {
    setCharacter(prev => ({
      ...prev,
      aspects: { ...prev.aspects, [key]: value },
    }));
  };

  const addManeuver = () => {
    if (!newManeuver.trim()) return;
    setCharacter(prev => ({
      ...prev,
      maneuvers: [...prev.maneuvers, newManeuver.trim()],
    }));
    setNewManeuver('');
  };

  const removeManeuver = (index: number) => {
    setCharacter(prev => ({
      ...prev,
      maneuvers: prev.maneuvers.filter((_, i) => i !== index),
    }));
  };

  const addFreeAspect = () => {
    if (!newFreeAspect.trim()) return;
    updateAspect('free', [...character.aspects.free, newFreeAspect.trim()]);
    setNewFreeAspect('');
  };

  const removeFreeAspect = (index: number) => {
    updateAspect('free', character.aspects.free.filter((_, i) => i !== index));
  };

  const canProceed = (): boolean => {
    switch (STEPS[currentStep].id) {
      case 'identity':
        return character.name.trim().length > 0;
      case 'aspects':
        return character.aspects.highConcept.trim().length > 0;
      case 'skills':
        return Object.keys(character.skills).length >= 4;
      default:
        return true;
    }
  };

  const handleSave = () => {
    onSave(character);
    setCharacter({ ...DEFAULT_CHARACTER });
    setCurrentStep(0);
    onClose();
  };

  const handleClose = () => {
    setCharacter(editingCharacter ? { ...editingCharacter } : { ...DEFAULT_CHARACTER });
    setCurrentStep(0);
    onClose();
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'identity':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-ui uppercase tracking-wider text-muted-foreground mb-2">
                Nome do Personagem *
              </label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ex: Marina 'Neon' Costa"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border 
                         focus:border-primary focus:outline-none font-ui text-lg"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-ui uppercase tracking-wider text-muted-foreground mb-2">
                Avatar (URL da imagem)
              </label>
              <input
                type="url"
                value={character.avatar || ''}
                onChange={(e) => updateField('avatar', e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-lg bg-input border border-border 
                         focus:border-primary focus:outline-none font-ui"
              />
            </div>

            <div>
              <label className="block text-sm font-ui uppercase tracking-wider text-muted-foreground mb-2">
                Refresh (Pontos de Destino Iniciais)
              </label>
              <div className="flex items-center gap-4">
                {[2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      updateField('refresh', n);
                      updateField('fatePoints', n);
                    }}
                    className={`w-12 h-12 rounded-lg font-display text-xl transition-all ${
                      character.refresh === n
                        ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/30'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Padrão: 3. Menos refresh = mais manobras.
              </p>
            </div>
          </div>
        );

      case 'aspects':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Aspectos são frases que definem seu personagem. Eles podem ser invocados para bônus ou chamados para complicações.
            </p>
            
            <div>
              <label className="block text-sm font-ui uppercase tracking-wider text-muted-foreground mb-2">
                Alto Conceito * <span className="text-primary">(quem você é como caçador)</span>
              </label>
              <input
                type="text"
                value={character.aspects.highConcept}
                onChange={(e) => updateAspect('highConcept', e.target.value)}
                placeholder="Ex: Hacker antissistema que caça monstros corporativos"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border 
                         focus:border-primary focus:outline-none font-ui"
              />
            </div>

            <div>
              <label className="block text-sm font-ui uppercase tracking-wider text-muted-foreground mb-2">
                Drama <span className="text-destructive">(o que te complica)</span>
              </label>
              <input
                type="text"
                value={character.aspects.drama}
                onChange={(e) => updateAspect('drama', e.target.value)}
                placeholder="Ex: Dívidas com o tipo errado de gente"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border 
                         focus:border-primary focus:outline-none font-ui"
              />
            </div>

            <div>
              <label className="block text-sm font-ui uppercase tracking-wider text-muted-foreground mb-2">
                Emprego <span className="text-secondary">(seu bico de dia)</span>
              </label>
              <input
                type="text"
                value={character.aspects.job}
                onChange={(e) => updateAspect('job', e.target.value)}
                placeholder="Ex: Motorista de app, entregador, freelancer de TI"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border 
                         focus:border-primary focus:outline-none font-ui"
              />
            </div>

            <div>
              <label className="block text-sm font-ui uppercase tracking-wider text-muted-foreground mb-2">
                Quadro dos Sonhos <span className="text-accent">(o que você quer da vida)</span>
              </label>
              <input
                type="text"
                value={character.aspects.dreamBoard}
                onChange={(e) => updateAspect('dreamBoard', e.target.value)}
                placeholder="Ex: Juntar grana pra sair do país"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border 
                         focus:border-primary focus:outline-none font-ui"
              />
            </div>

            <div>
              <label className="block text-sm font-ui uppercase tracking-wider text-muted-foreground mb-2">
                Aspectos Livres
              </label>
              <div className="space-y-2">
                {character.aspects.free.map((aspect, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={aspect}
                      onChange={(e) => {
                        const newFree = [...character.aspects.free];
                        newFree[index] = e.target.value;
                        updateAspect('free', newFree);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-input border border-border 
                               focus:border-primary focus:outline-none font-ui"
                    />
                    <button
                      onClick={() => removeFreeAspect(index)}
                      className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFreeAspect}
                    onChange={(e) => setNewFreeAspect(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFreeAspect()}
                    placeholder="Adicionar aspecto livre..."
                    className="flex-1 px-4 py-2 rounded-lg bg-input border border-dashed border-border 
                             focus:border-primary focus:outline-none font-ui"
                  />
                  <button
                    onClick={addFreeAspect}
                    disabled={!newFreeAspect.trim()}
                    className="p-2 rounded-lg bg-primary text-primary-foreground 
                             disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Distribua suas habilidades em pirâmide: 1 em +4, 2 em +3, 3 em +2 e 4 em +1.
            </p>
            <SkillPyramid
              skills={character.skills}
              onChange={(skills) => updateField('skills', skills)}
            />
          </div>
        );

      case 'maneuvers':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Manobras são truques especiais que seu personagem aprendeu. Geralmente você começa com 3 manobras.
            </p>
            
            <div className="space-y-2">
              {character.maneuvers.map((maneuver, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted"
                >
                  <Zap className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="flex-1 font-ui">{maneuver}</span>
                  <button
                    onClick={() => removeManeuver(index)}
                    className="p-1.5 rounded hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newManeuver}
                onChange={(e) => setNewManeuver(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addManeuver()}
                placeholder="Nome da manobra..."
                className="flex-1 px-4 py-3 rounded-lg bg-input border border-border 
                         focus:border-primary focus:outline-none font-ui"
              />
              <button
                onClick={addManeuver}
                disabled={!newManeuver.trim()}
                className="px-4 py-3 rounded-lg bg-secondary text-secondary-foreground font-ui
                         hover:bg-secondary/90 disabled:opacity-50 transition-colors"
              >
                Adicionar
              </button>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-ui uppercase tracking-wider text-muted-foreground mb-3">
                Sugestões de Manobras
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Golpe Rasteiro', 'Tiro Certeiro', 'Corrida Rápida',
                  'Contatos no Submundo', 'Eu Conheço Um Cara', 'Instinto de Sobrevivência',
                  'Rastreador Urbano', 'Primeiros Socorros', 'Mecânico de Ocasião'
                ].filter(s => !character.maneuvers.includes(s)).map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setCharacter(prev => ({
                        ...prev,
                        maneuvers: [...prev.maneuvers, suggestion],
                      }));
                    }}
                    className="px-3 py-1.5 rounded-md bg-muted text-sm font-ui
                             hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-primary">
                {character.avatar ? (
                  <img src={character.avatar} alt={character.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-display text-2xl text-primary">{character.name || 'Sem nome'}</h3>
                <p className="text-muted-foreground">{character.aspects.highConcept || 'Sem alto conceito'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-4">
                <h4 className="font-ui text-sm uppercase tracking-wider text-muted-foreground mb-2">Aspectos</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-primary">Alto Conceito:</span> {character.aspects.highConcept || '-'}</p>
                  <p><span className="text-destructive">Drama:</span> {character.aspects.drama || '-'}</p>
                  <p><span className="text-secondary">Emprego:</span> {character.aspects.job || '-'}</p>
                  <p><span className="text-accent">Sonhos:</span> {character.aspects.dreamBoard || '-'}</p>
                  {character.aspects.free.map((a, i) => (
                    <p key={i}><span className="text-muted-foreground">Livre:</span> {a}</p>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-4">
                <h4 className="font-ui text-sm uppercase tracking-wider text-muted-foreground mb-2">Habilidades</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(character.skills)
                    .sort(([, a], [, b]) => b - a)
                    .map(([skill, value]) => (
                      <p key={skill}>
                        <span className="text-primary">+{value}</span> {skill}
                      </p>
                    ))}
                  {Object.keys(character.skills).length === 0 && (
                    <p className="text-muted-foreground">Nenhuma habilidade</p>
                  )}
                </div>
              </div>

              <div className="glass-panel p-4 col-span-2">
                <h4 className="font-ui text-sm uppercase tracking-wider text-muted-foreground mb-2">Manobras</h4>
                <div className="flex flex-wrap gap-2">
                  {character.maneuvers.map((m, i) => (
                    <span key={i} className="px-2 py-1 rounded-md bg-muted text-sm">{m}</span>
                  ))}
                  {character.maneuvers.length === 0 && (
                    <p className="text-muted-foreground text-sm">Nenhuma manobra</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/30">
              <span className="font-ui text-accent">Pontos de Destino Iniciais</span>
              <span className="font-display text-3xl text-accent">{character.refresh}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={handleClose} />
          
          <motion.div
            className="relative glass-panel w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="font-display text-2xl text-primary">
                  {editingCharacter ? 'Editar Personagem' : 'Criar Personagem'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Passo {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
                </p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-1 p-4 border-b border-border">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
                      index === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : index < currentStep
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-ui">{step.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={STEPS[currentStep].id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted
                         hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>

              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground
                           hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-accent text-accent-foreground
                           hover:bg-accent/90 transition-colors font-ui"
                >
                  <Check className="w-4 h-4" />
                  {editingCharacter ? 'Salvar Alterações' : 'Criar Personagem'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
