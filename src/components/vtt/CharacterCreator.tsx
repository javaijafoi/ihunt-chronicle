import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, User, Sparkles, Target, Zap, Check, Plus, Trash2, Heart } from 'lucide-react';
import { Character, DriveName, Maneuver } from '@/types/game';
import { SkillPyramid } from './SkillPyramid';
import { DRIVES, GENERAL_MANEUVERS, getDriveById } from '@/data/drives';
import { useAuth } from '@/hooks/useAuth';
import { GLOBAL_SESSION_ID, useSession } from '@/hooks/useSession';

interface CharacterCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Omit<Character, 'id'>) => void;
  editingCharacter?: Character;
}

const STEPS = [
  { id: 'identity', title: 'Identidade', icon: User },
  { id: 'drive', title: 'Tara', icon: Heart },
  { id: 'aspects', title: 'Aspectos', icon: Sparkles },
  { id: 'skills', title: 'Habilidades', icon: Target },
  { id: 'maneuvers', title: 'Manobras', icon: Zap },
  { id: 'review', title: 'Revisão', icon: Check },
];

const BASE_REFRESH = 5;

const BASE_CHARACTER: Omit<Character, 'id' | 'sessionId' | 'createdBy'> = {
  name: '',
  avatar: '',
  drive: undefined,
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

const buildDefaultCharacter = (sessionId: string, createdBy: string): Omit<Character, 'id'> => ({
  ...BASE_CHARACTER,
  sessionId,
  createdBy,
});

export function CharacterCreator({ isOpen, onClose, onSave, editingCharacter }: CharacterCreatorProps) {
  const { user } = useAuth();
  const { currentSession } = useSession();

  const defaultCharacter = useMemo(
    () => buildDefaultCharacter(currentSession?.id || GLOBAL_SESSION_ID, user?.uid || 'anonymous'),
    [currentSession?.id, user?.uid]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [character, setCharacter] = useState<Omit<Character, 'id'>>(
    editingCharacter ? { ...editingCharacter } : { ...defaultCharacter }
  );
  const [selectedManeuverIds, setSelectedManeuverIds] = useState<string[]>(
    editingCharacter?.maneuvers || [...defaultCharacter.maneuvers]
  );
  const [newFreeAspect, setNewFreeAspect] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (editingCharacter) {
      setCharacter({ ...editingCharacter });
      setSelectedManeuverIds(editingCharacter.maneuvers);
      return;
    }

    setCharacter({ ...defaultCharacter });
    setSelectedManeuverIds([...defaultCharacter.maneuvers]);
  }, [editingCharacter, defaultCharacter, isOpen]);

  // Get current drive info
  const currentDrive = useMemo(() => {
    return character.drive ? getDriveById(character.drive) : undefined;
  }, [character.drive]);

  // Calculate available refresh
  const purchasedManeuversCount = useMemo(() => {
    let count = selectedManeuverIds.length;

    // Deduct drive free maneuver if selected
    if (currentDrive && selectedManeuverIds.includes(currentDrive.freeManeuver.id)) {
      count -= 1;
    }

    // Deduct 2 base free maneuvers (General or Exclusive)
    count -= 2;

    return Math.max(0, count);
  }, [selectedManeuverIds, currentDrive]);

  const availableRefresh = BASE_REFRESH - purchasedManeuversCount;

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

  const selectDrive = (driveId: DriveName) => {
    const drive = getDriveById(driveId);
    if (!drive) return;

    setCharacter(prev => ({ ...prev, drive: driveId }));
    // Auto-select the free maneuver
    setSelectedManeuverIds([drive.freeManeuver.id]);
  };

  const toggleManeuver = (maneuver: Maneuver) => {
    // Can't remove free maneuver from drive
    if (currentDrive && maneuver.id === currentDrive.freeManeuver.id) return;

    setSelectedManeuverIds(prev => {
      const isSelected = prev.includes(maneuver.id);

      if (isSelected) {
        return prev.filter(id => id !== maneuver.id);
      } else {
        // Check if we have refresh available
        // If we have "free slots" (purchased < 0 effectively in the calculation logic before max(0)), 
        // we can still add despite availableRefresh being 5.
        // Actually, if availableRefresh > 0 we can always add.
        // If availableRefresh === 0, we can ONLY add if we still have free slots.
        // My purchasedManeuversCount logic floors at 0.
        // Let's recalculate hypothetical cost.

        let newCount = prev.length + 1;
        if (currentDrive && (prev.includes(currentDrive.freeManeuver.id) || maneuver.id === currentDrive.freeManeuver.id)) {
          // careful here, simplified check
          if (currentDrive.freeManeuver.id === maneuver.id || prev.includes(currentDrive.freeManeuver.id)) {
            newCount -= 1;
          }
        }
        newCount -= 2;
        const newPurchased = Math.max(0, newCount);

        if (BASE_REFRESH - newPurchased < 0) return prev;

        return [...prev, maneuver.id];
      }
    });
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
      case 'drive':
        return character.drive !== undefined;
      case 'aspects':
        return character.aspects.highConcept.trim().length > 0;
      case 'skills':
        return Object.keys(character.skills).length >= 4;
      default:
        return true;
    }
  };

  const handleSave = () => {
    const finalCharacter: Omit<Character, 'id'> = {
      ...character,
      maneuvers: selectedManeuverIds,
      refresh: availableRefresh,
      fatePoints: availableRefresh,
    };
    onSave(finalCharacter);
    setCharacter({ ...defaultCharacter });
    setSelectedManeuverIds([...defaultCharacter.maneuvers]);
    setCurrentStep(0);
    onClose();
  };

  const handleClose = () => {
    setCharacter(editingCharacter ? { ...editingCharacter } : { ...defaultCharacter });
    setSelectedManeuverIds(editingCharacter?.maneuvers || [...defaultCharacter.maneuvers]);
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
          </div>
        );

      case 'drive':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Sua Tara define seu estilo de caçar. Cada uma traz uma manobra grátis e acesso a manobras exclusivas.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {DRIVES.map(drive => (
                <motion.button
                  key={drive.id}
                  onClick={() => selectDrive(drive.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl text-left transition-all border-2 ${character.drive === drive.id
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : 'border-border bg-muted/50 hover:border-muted-foreground/50'
                    }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{drive.icon}</span>
                    <h3 className="font-display text-lg text-primary">{drive.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {drive.summary}
                  </p>
                  <div className="p-2 rounded-lg bg-accent/10 border border-accent/30">
                    <p className="text-xs text-accent font-ui uppercase tracking-wider mb-1">
                      Manobra Grátis
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {drive.freeManeuver.name}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {currentDrive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl bg-muted border border-border"
              >
                <h4 className="font-ui text-sm uppercase tracking-wider text-muted-foreground mb-2">
                  {currentDrive.freeManeuver.name}
                </h4>
                <p className="text-sm text-foreground">
                  {currentDrive.freeManeuver.description}
                </p>
              </motion.div>
            )}
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
            {/* Refresh Counter */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/30">
              <div>
                <span className="font-ui text-sm uppercase tracking-wider text-muted-foreground">
                  Refresh Disponível
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  Base 5 (+2 Grátis + 1 Tara) - {Math.max(0, Boolean(currentDrive) ? selectedManeuverIds.length - 3 : selectedManeuverIds.length - 2)} extras
                </p>
              </div>
              <span className={`font-display text-4xl ${availableRefresh <= 1 ? 'text-destructive' : 'text-accent'
                }`}>
                {availableRefresh}
              </span>
            </div>

            {/* Free Maneuver from Drive */}
            {currentDrive && (
              <div>
                <h4 className="font-ui text-sm uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <span className="text-lg">{currentDrive.icon}</span>
                  Manobra Grátis ({currentDrive.name})
                </h4>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary">{currentDrive.freeManeuver.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      Grátis
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentDrive.freeManeuver.description}
                  </p>
                </div>
              </div>
            )}

            {/* Exclusive Drive Maneuvers */}
            {currentDrive && currentDrive.exclusiveManeuvers.length > 0 && (
              <div>
                <h4 className="font-ui text-sm uppercase tracking-wider text-muted-foreground mb-2">
                  Manobras Exclusivas ({currentDrive.name})
                </h4>
                <div className="space-y-2">
                  {currentDrive.exclusiveManeuvers.map(maneuver => {
                    const isSelected = selectedManeuverIds.includes(maneuver.id);
                    const canAfford = availableRefresh > 0 || isSelected;

                    return (
                      <button
                        key={maneuver.id}
                        onClick={() => toggleManeuver(maneuver)}
                        disabled={!canAfford && !isSelected}
                        className={`w-full p-3 rounded-lg text-left transition-all border ${isSelected
                            ? 'border-secondary bg-secondary/10'
                            : canAfford
                              ? 'border-border bg-muted/50 hover:border-secondary/50'
                              : 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Zap className={`w-4 h-4 ${isSelected ? 'text-secondary' : 'text-muted-foreground'}`} />
                            <span className={`font-medium ${isSelected ? 'text-secondary' : 'text-foreground'}`}>
                              {maneuver.name}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'
                            }`}>
                            -1 Refresh
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{maneuver.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* General Maneuvers */}
            <div>
              <h4 className="font-ui text-sm uppercase tracking-wider text-muted-foreground mb-2">
                Manobras Gerais
              </h4>
              <div className="space-y-2">
                {GENERAL_MANEUVERS.map(maneuver => {
                  const isSelected = selectedManeuverIds.includes(maneuver.id);
                  const canAfford = availableRefresh > 0 || isSelected;

                  return (
                    <button
                      key={maneuver.id}
                      onClick={() => toggleManeuver(maneuver)}
                      disabled={!canAfford && !isSelected}
                      className={`w-full p-3 rounded-lg text-left transition-all border ${isSelected
                          ? 'border-secondary bg-secondary/10'
                          : canAfford
                            ? 'border-border bg-muted/50 hover:border-secondary/50'
                            : 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Zap className={`w-4 h-4 ${isSelected ? 'text-secondary' : 'text-muted-foreground'}`} />
                          <span className={`font-medium ${isSelected ? 'text-secondary' : 'text-foreground'}`}>
                            {maneuver.name}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'
                          }`}>
                          -1 Refresh
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{maneuver.description}</p>
                    </button>
                  );
                })}
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
                {currentDrive && (
                  <p className="text-sm text-secondary flex items-center gap-1">
                    <span>{currentDrive.icon}</span> {currentDrive.name}
                  </p>
                )}
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
                  {selectedManeuverIds.map(id => {
                    // Find maneuver name
                    let maneuverName = id;
                    if (currentDrive) {
                      if (currentDrive.freeManeuver.id === id) {
                        maneuverName = currentDrive.freeManeuver.name;
                      } else {
                        const exclusive = currentDrive.exclusiveManeuvers.find(m => m.id === id);
                        if (exclusive) maneuverName = exclusive.name;
                      }
                    }
                    const general = GENERAL_MANEUVERS.find(m => m.id === id);
                    if (general) maneuverName = general.name;

                    const isFree = currentDrive?.freeManeuver.id === id;

                    return (
                      <span
                        key={id}
                        className={`px-2 py-1 rounded-md text-sm ${isFree ? 'bg-primary/20 text-primary' : 'bg-muted'
                          }`}
                      >
                        {maneuverName}
                        {isFree && <span className="ml-1 text-xs opacity-70">(grátis)</span>}
                      </span>
                    );
                  })}
                  {selectedManeuverIds.length === 0 && (
                    <p className="text-muted-foreground text-sm">Nenhuma manobra</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/30">
              <span className="font-ui text-accent">Refresh Final</span>
              <span className="font-display text-3xl text-accent">{availableRefresh}</span>
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
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${index === currentStep
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
