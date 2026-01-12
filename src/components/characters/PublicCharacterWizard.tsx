import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';
import { CharacterCard } from './CharacterCard';
import { PrintableSheet } from './PrintableSheet';
import { SkillPyramid } from '@/components/vtt/SkillPyramid';
import { User, Heart, Sparkles, Target, Zap, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Character, DriveName, Maneuver } from '@/types/game';
import { DRIVES, GENERAL_MANEUVERS, getDriveById } from '@/data/drives';

// Reuse types/constants where possible or redefine for local scope
const STEPS = [
    { id: 'identity', title: 'Identidade', icon: User },
    { id: 'drive', title: 'Tara', icon: Heart },
    { id: 'aspects', title: 'Aspectos', icon: Sparkles },
    { id: 'skills', title: 'Habilidades', icon: Target },
    { id: 'maneuvers', title: 'Manobras', icon: Zap },
    { id: 'review', title: 'Revisão', icon: Check },
];

const BASE_REFRESH = 5;

// Initial empty character state
const INITIAL_CHARACTER: Omit<Character, 'id' | 'campaignId' | 'sessionId' | 'createdBy' | 'userId'> = {
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
    selfies: [],
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

export function PublicCharacterWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [character, setCharacter] = useState({ ...INITIAL_CHARACTER });
    const [selectedManeuverIds, setSelectedManeuverIds] = useState<string[]>([]);
    const [newFreeAspect, setNewFreeAspect] = useState('');

    // --- Derived State ---
    // Get current drive info
    const currentDrive = useMemo(() => {
        return character.drive ? getDriveById(character.drive) : undefined;
    }, [character.drive]);

    const purchasedManeuversCount = useMemo(() => {
        let count = selectedManeuverIds.length;
        if (currentDrive && selectedManeuverIds.includes(currentDrive.freeManeuver.id)) {
            count -= 1;
        }
        count -= 2;
        return Math.max(0, count);
    }, [selectedManeuverIds, currentDrive]);

    // Calculate available refresh
    const availableRefresh = BASE_REFRESH - purchasedManeuversCount;


    // --- Actions ---
    const updateField = <K extends keyof typeof character>(
        field: K,
        value: typeof character[K]
    ) => {
        setCharacter(prev => ({ ...prev, [field]: value }));
    };

    const currentStepData = STEPS[currentStep];

    // Navigation checks
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
            case 'maneuvers':
                return true;
            // Review step is always valid to enter, but finishing might need checks?
            default:
                return true;
        }
    };

    const handleImportValues = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                // Basic validation: check for name and aspects
                if (json.name !== undefined && json.aspects) {
                    // Check if maneuvers are stored differently, but assume standard structure
                    setCharacter(prev => ({ ...prev, ...json }));
                    // Restore maneuvers if present in json (assuming we export them separately or embedded)
                    // If export structure matches character Omit<...>, maneuvers is string[] already
                    if (json.maneuvers) {
                        setSelectedManeuverIds(json.maneuvers);
                    }
                }
            } catch (err) {
                console.error("Failed to parse character JSON", err);
                alert("Erro ao ler arquivo. Verifique se é um JSON válido de personagem.");
            }
        };
        reader.readAsText(file);
    };

    const handleExportJson = () => {
        const finalCharacter: Omit<Character, 'id'> = {
            ...character,
            maneuvers: selectedManeuverIds,
            refresh: availableRefresh,
            fatePoints: availableRefresh,
            campaignId: 'offline',
            createdBy: 'anonymous',
            userId: 'anonymous'
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finalCharacter, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${character.name || 'character'}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleExportPdf = async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const element = document.getElementById('character-card-export');
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${character.name || 'hunter'}-sheet.pdf`);
        } catch (err) {
            console.error("PDF Export failed", err);
            alert("Erro ao gerar PDF. Tente novamente.");
        }
    };

    const handleSave = () => {
        // For now, save just triggers export
        handleExportJson();
    };

    const renderStepContent = () => {
        switch (STEPS[currentStep].id) {
            case 'identity':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-sm font-medium">
                                <span className="sr-only">Carregar JSON</span>
                                <span>📂 Carregar JSON</span>
                                <input type="file" accept=".json" onChange={handleImportValues} className="hidden" />
                            </label>
                        </div>
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
                const selectDrive = (driveId: DriveName) => {
                    const drive = getDriveById(driveId);
                    if (!drive) return;

                    updateField('drive', driveId);
                    // Auto-select the free maneuver from the drive
                    setSelectedManeuverIds(prev => {
                        // Remove any previous drive's free maneuver if exists? 
                        // Actually the logic is: reset maneuvers or keep? 
                        // Original logic: "Auto-select the free maneuver". 
                        // We should probably wipe previous drive maneuvers to be safe or just add this one.
                        // Let's simpler: Just set this one as the start of the list if we want strictness, 
                        // but for now let's just ensure it's added.
                        return [drive.freeManeuver.id];
                    });
                };

                return (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Sua Tara define seu estilo de caçar. Cada uma traz uma manobra grátis e acesso a manobras exclusivas.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {DRIVES.map(drive => (
                                <button
                                    key={drive.id}
                                    onClick={() => selectDrive(drive.id)}
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
                                </button>
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
                const updateAspect = (key: keyof typeof character.aspects, value: string | string[]) => {
                    setCharacter(prev => ({
                        ...prev,
                        aspects: { ...prev.aspects, [key]: value },
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
                const toggleManeuver = (maneuver: Maneuver) => {
                    // Can't remove free maneuver from drive
                    if (currentDrive && maneuver.id === currentDrive.freeManeuver.id) return;

                    setSelectedManeuverIds(prev => {
                        const isSelected = prev.includes(maneuver.id);

                        if (isSelected) {
                            return prev.filter(id => id !== maneuver.id);
                        } else {
                            let newCount = prev.length + 1;
                            // If we have drive free maneuver account for it
                            if (currentDrive && (prev.includes(currentDrive.freeManeuver.id) || maneuver.id === currentDrive.freeManeuver.id)) {
                                if (currentDrive.freeManeuver.id === maneuver.id || prev.includes(currentDrive.freeManeuver.id)) {
                                    newCount -= 1;
                                }
                            }
                            newCount -= 2; // 2 base free
                            const newPurchased = Math.max(0, newCount);

                            if (BASE_REFRESH - newPurchased < 0) return prev;

                            return [...prev, maneuver.id];
                        }
                    });
                };

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
                        <div className="bg-muted/50 p-4 rounded-lg text-center mb-6 flex flex-col items-center gap-4">
                            <p className="text-muted-foreground">
                                Revise seu personagem. Quando estiver pronto, você poderá exportar a ficha.
                            </p>
                            <button onClick={handleExportJson} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors">
                                <span>💾 Exportar JSON</span>
                            </button>
                            <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                                <span>📄 Exportar PDF</span>
                            </button>
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border hover:bg-muted transition-colors text-foreground">
                                <span>🖨️ Imprimir</span>
                            </button>
                        </div>
                        <CharacterCard
                            character={character}
                            selectedManeuvers={selectedManeuverIds}
                            refresh={availableRefresh}
                        />
                        <PrintableSheet character={character} maneuvers={selectedManeuverIds} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border shadow-sm overflow-x-auto">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(index)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all whitespace-nowrap ${index === currentStep
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : index < currentStep
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-ui font-medium">{step.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-card glass-panel border border-border rounded-xl shadow-lg min-h-[500px] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <h2 className="font-display text-2xl text-foreground">
                        {currentStepData.title}
                    </h2>
                    <p className="text-muted-foreground">
                        Configure os detalhes do seu personagem
                    </p>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6">
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

                {/* Footer Navigation */}
                <div className="p-6 border-t border-border flex justify-between items-center bg-muted/30">
                    <button
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-background border border-border
                         hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Voltar
                    </button>

                    {currentStep < STEPS.length - 1 ? (
                        <button
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground
                           hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
                        >
                            Próximo
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-accent text-accent-foreground
                           hover:bg-accent/90 transition-all font-ui font-bold shadow-sm"
                        >
                            <Check className="w-4 h-4" />
                            Concluir
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
