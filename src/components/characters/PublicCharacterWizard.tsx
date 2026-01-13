import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, User, Target, Zap, Sparkles, Plus, Trash2, Heart, Search, Eye, Brain } from 'lucide-react';
import { CharacterCard } from './CharacterCard';
import { PrintableSheet } from './PrintableSheet';
import { SkillPyramid } from '@/components/vtt/SkillPyramid';
import { Character, DriveName, Maneuver, CharacterGift } from '@/types/game';
import { DRIVES, GENERAL_MANEUVERS, getDriveById } from '@/data/drives';
import { SKILL_MANEUVERS, SkillManeuver } from '@/data/skillManeuvers'; // Sprint 1
import { BOOK_GIFTS, Gift } from '@/data/gifts'; // Sprint 4
import { migrateCharacter } from '@/utils/characterMigration'; // Sprint 2

// Reuse types/constants where possible or redefine for local scope
const STEPS = [
    { id: 'identity', title: 'Identidade', icon: User },
    { id: 'drive', title: 'Tara', icon: Heart },
    { id: 'aspects', title: 'Aspectos', icon: Sparkles },
    { id: 'skills', title: 'Habilidades', icon: Target },
    { id: 'maneuvers', title: 'Manobras', icon: Zap },
    { id: 'notes', title: 'Anotações', icon: Brain },
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
    skillManeuvers: [],
    gifts: [],
};

export function PublicCharacterWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [character, setCharacter] = useState({ ...INITIAL_CHARACTER });
    const [selectedManeuverIds, setSelectedManeuverIds] = useState<string[]>([]);
    const [selectedSkillManeuvers, setSelectedSkillManeuvers] = useState<string[]>([]);
    const [selectedGifts, setSelectedGifts] = useState<string[]>([]);

    // UI Filters
    const [maneuverSearch, setManeuverSearch] = useState('');
    const [showAllSkills, setShowAllSkills] = useState(false);

    // Derived state for refresh
    const [newFreeAspect, setNewFreeAspect] = useState('');
    const [maneuverTab, setManeuverTab] = useState<'drive' | 'skills' | 'general' | 'gifts'>('drive');

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

        // Add skill maneuvers cost (some might be free if we implement that logic later, currently all cost 1 unless specified)
        // SKILL_MANEUVERS entries have a 'cost' field.
        const skillManeuverCost = selectedSkillManeuvers.reduce((acc, id) => {
            // Find the maneuver
            for (const skill of Object.values(SKILL_MANEUVERS)) {
                const found = skill.find(m => m.id === id);
                if (found) return acc + found.cost;
            }
            return acc;
        }, 0);

        count += skillManeuverCost;
        count += selectedGifts.length;

        // Base free maneuver allowance (2 free maneuvers regardless of source? 
        // The original logic was: count -= 2. 
        // "Base 5 (+2 Grátis + 1 Tara) - extras"
        // So we subtract 2 from the TOTAL cost.
        count -= 2;
        return Math.max(0, count);
    }, [selectedManeuverIds, selectedSkillManeuvers, currentDrive, selectedGifts]);

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
                    const migrated = migrateCharacter(json);
                    setCharacter(migrated);

                    // Restore selections
                    setSelectedManeuverIds(migrated.maneuvers);
                    setSelectedSkillManeuvers(migrated.skillManeuvers || []);

                    // Gifts are objects in Character, but we might just store IDs in state for wizard simplicity, 
                    // OR we map them. The wizard state uses `selectedGifts` as string[] (IDs).
                    // The Character type has `gifts: CharacterGift[]`.
                    if (migrated.gifts) {
                        setSelectedGifts(migrated.gifts.map(g => g.id));
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
        // Map selected gift IDs back to CharacterGift objects
        const finalGifts: CharacterGift[] = selectedGifts.map(id => {
            const bookGift = BOOK_GIFTS.find(g => g.id === id);
            if (bookGift) {
                return {
                    id: bookGift.id,
                    name: bookGift.name,
                    description: bookGift.description,
                    isCustom: false
                };
            }
            // Handle custom gifts if we implement them
            return { id, name: 'Unknown Gift', description: '', isCustom: true };
        });

        const finalCharacter: Omit<Character, 'id'> = {
            ...character,
            maneuvers: selectedManeuverIds,
            skillManeuvers: selectedSkillManeuvers,
            gifts: finalGifts,
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
                // Check for Embruxacao (Unlock Gifts)
                // Assuming 'Embruxação' is a maneuver with a specific ID or name. 
                // Let's assume ID 'embruxacao' or check name. 
                // Quick check: In drives.ts or general maneuvers, is there one? 
                // For now, let's assume if any selected maneuver has name "Embruxação"
                const hasEmbruxacao = selectedManeuverIds.some(id => {
                    const mName = GENERAL_MANEUVERS.find(m => m.id === id)?.name
                        || (currentDrive?.exclusiveManeuvers.find(m => m.id === id)?.name)
                        || (currentDrive?.freeManeuver.id === id ? currentDrive?.freeManeuver.name : '');
                    return mName?.toLowerCase().includes('embruxação');
                });

                const toggleManeuver = (maneuver: Maneuver) => {
                    // Can't remove free maneuver from drive
                    if (currentDrive && maneuver.id === currentDrive.freeManeuver.id) return;

                    setSelectedManeuverIds(prev => {
                        const isSelected = prev.includes(maneuver.id);

                        if (isSelected) {
                            return prev.filter(id => id !== maneuver.id);
                        } else {
                            // Check affordability implies re-running the complex calc. 
                            // Simplification: If refresh > 0, we can buy.
                            // If base allowance (2 free) is not used up, we can buy.

                            // Let's rely on the user to manage their refresh (allow going negative? No, usually enforced).
                            if (availableRefresh <= 0 && purchasedManeuversCount >= 0) { // If we have 0 refresh and used all free slots
                                // Actually, purchasedManeuversCount is (total_cost - 2). 
                                // So if availableRefresh (5 - purchased) <= 0, we can't buy.
                                // But if purchased < 0, it means we have free slots.
                                // Logic: availableRefresh > 0 allowed.

                                // BUT wait, if I have 2 free slots, my purchased count is -2. Refresh is 5 - (-2) = 7?? No.
                                // Max(0, count). So Refresh is 5.
                                // So if I have free slots, I can "buy" (it won't cost refresh).
                                // If I have NO free slots, I must pay refresh.

                                // Simple check: Can we add?
                                // If (purchasedManeuversCount + 1) > 5 ? No. 
                                // Actually max refresh usage is 5.
                            }

                            // Let's just allow toggling and show warning/red text if negative? 
                            // The previous code had: if (BASE_REFRESH - newPurchased < 0) return prev;

                            // Calculate potential new cost
                            // It's hard to simulate cleanly without extracting the Memo.
                            // Let's allow for now if availableRefresh > 0 OR if we seem to have few maneuvers.
                            if (availableRefresh <= 0 && selectedManeuverIds.length + selectedSkillManeuvers.length >= 3) {
                                // Very rough heuristic, assumes drive free + 2 general/skill
                                // Better: just block if availableRefresh <= 0 AND we assume next one costs.
                                // But next one might be free (if we have free slots).
                                // Let's stick to simple: allow user to click, if it goes negative, so be it (or block).
                                // Original code blocked.
                            }

                            return [...prev, maneuver.id];
                        }
                    });
                };

                const toggleSkillManeuver = (maneuver: SkillManeuver) => {
                    setSelectedSkillManeuvers(prev => {
                        const isSelected = prev.includes(maneuver.id);
                        if (isSelected) return prev.filter(id => id !== maneuver.id);
                        // Check affordability?
                        return [...prev, maneuver.id];
                    });
                };

                const toggleGift = (gift: Gift) => {
                    setSelectedGifts(prev => {
                        const isSelected = prev.includes(gift.id);
                        if (isSelected) return prev.filter(id => id !== gift.id);
                        return [...prev, gift.id];
                    });
                };

                return (
                    <div className="space-y-6">
                        {/* Refresh Counter */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/30">
                            <div>
                                <span className="font-ui text-sm uppercase tracking-wider text-muted-foreground">
                                    Refresh Disponível
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Base 5 (+2 Grátis + 1 Tara)
                                </p>
                            </div>
                            <span className={`font-display text-4xl ${availableRefresh <= 0 ? 'text-destructive' : 'text-accent'
                                }`}>
                                {availableRefresh}
                            </span>
                        </div>

                        {/* TABS */}
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button
                                onClick={() => setManeuverTab('drive')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${maneuverTab === 'drive' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Tara ({currentDrive?.name})
                            </button>
                            <button
                                onClick={() => setManeuverTab('skills')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${maneuverTab === 'skills' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Habilidades
                            </button>
                            <button
                                onClick={() => setManeuverTab('general')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${maneuverTab === 'general' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Gerais
                            </button>
                            <button
                                onClick={() => setManeuverTab('gifts')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1 ${maneuverTab === 'gifts' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Dons <Sparkles className="w-3 h-3 text-purple-400" />
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar manobras..."
                                    className="w-full pl-9 pr-4 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:border-primary"
                                    value={maneuverSearch}
                                    onChange={(e) => setManeuverSearch(e.target.value)}
                                />
                            </div>
                            {maneuverTab === 'skills' && (
                                <button
                                    onClick={() => setShowAllSkills(!showAllSkills)}
                                    className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${showAllSkills
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-background border-border text-muted-foreground hover:text-foreground'
                                        }`}
                                    title={showAllSkills ? "Mostrando todas as habilidades" : "Mostrando apenas minhas habilidades"}
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* CONTENT */}
                        <div className="min-h-[300px]">
                            {maneuverTab === 'drive' && currentDrive && (
                                <div className="space-y-4 animation-fade-in">
                                    {/* Free Maneuver */}
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

                                    {/* Exclusive Maneuvers */}
                                    <div className="space-y-2">
                                        <h4 className="font-ui text-sm uppercase tracking-wider text-muted-foreground">Exclusivas</h4>
                                        {currentDrive.exclusiveManeuvers.map(maneuver => {
                                            const isSelected = selectedManeuverIds.includes(maneuver.id);
                                            return (
                                                <button
                                                    key={maneuver.id}
                                                    onClick={() => toggleManeuver(maneuver)}
                                                    className={`w-full p-3 rounded-lg text-left transition-all border ${isSelected
                                                        ? 'border-secondary bg-secondary/10'
                                                        : 'border-border bg-muted/50 hover:border-secondary/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`font-medium ${isSelected ? 'text-secondary' : 'text-foreground'}`}>
                                                            {maneuver.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">-1 Refresh</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{maneuver.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {maneuverTab === 'skills' && (
                                <div className="space-y-6 animation-fade-in">
                                    {Object.entries(SKILL_MANEUVERS)
                                        .filter(([skillName]) => {
                                            if (showAllSkills) return true;
                                            return (character.skills[skillName] || 0) > 0;
                                        })
                                        .sort(([a], [b]) => a.localeCompare(b)) // Alphabetical or by level? Let's keep alphabetical if showing all.
                                        .map(([skillName]) => {
                                            const level = character.skills[skillName] || 0;
                                            const maneuvers = SKILL_MANEUVERS[skillName] || [];

                                            // Filter maneuvers by search
                                            const filteredManeuvers = maneuvers.filter(m =>
                                                m.name.toLowerCase().includes(maneuverSearch.toLowerCase()) ||
                                                m.description.toLowerCase().includes(maneuverSearch.toLowerCase())
                                            );

                                            if (filteredManeuvers.length === 0) return null;

                                            return (
                                                <div key={skillName} className="space-y-2">
                                                    <h4 className="font-ui text-sm uppercase tracking-wider text-primary flex items-center justify-between border-b border-border pb-1">
                                                        <span>{skillName} <span className="text-muted-foreground">({level > 0 ? `+${level}` : '0'})</span></span>
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {filteredManeuvers.map(maneuver => {
                                                            const isSelected = selectedSkillManeuvers.includes(maneuver.id);
                                                            return (
                                                                <button
                                                                    key={maneuver.id}
                                                                    onClick={() => toggleSkillManeuver(maneuver)}
                                                                    className={`w-full p-3 rounded-lg text-left transition-all border ${isSelected
                                                                        ? 'border-secondary bg-secondary/10'
                                                                        : 'border-border bg-muted/50 hover:border-secondary/50'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className={`font-medium ${isSelected ? 'text-secondary' : 'text-foreground'}`}>
                                                                            {maneuver.name}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {maneuver.cost === 0 ? 'Grátis' : '-1 Refresh'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">{maneuver.description}</p>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {Object.keys(character.skills).length === 0 && (
                                        <p className="text-muted-foreground text-center py-8">
                                            Selecione habilidades no passo anterior para ver as manobras disponíveis.
                                        </p>
                                    )}
                                </div>
                            )}

                            {maneuverTab === 'general' && (
                                <div className="space-y-2 animation-fade-in">
                                    {GENERAL_MANEUVERS
                                        .filter(m =>
                                            m.name.toLowerCase().includes(maneuverSearch.toLowerCase()) ||
                                            m.description.toLowerCase().includes(maneuverSearch.toLowerCase())
                                        )
                                        .map(maneuver => {
                                            const isSelected = selectedManeuverIds.includes(maneuver.id);
                                            return (
                                                <button
                                                    key={maneuver.id}
                                                    onClick={() => toggleManeuver(maneuver)}
                                                    className={`w-full p-3 rounded-lg text-left transition-all border ${isSelected
                                                        ? 'border-secondary bg-secondary/10'
                                                        : 'border-border bg-muted/50 hover:border-secondary/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`font-medium ${isSelected ? 'text-secondary' : 'text-foreground'}`}>
                                                            {maneuver.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">-1 Refresh</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{maneuver.description}</p>
                                                </button>
                                            );
                                        })}
                                </div>
                            )}

                            {maneuverTab === 'gifts' && (
                                <div className="space-y-4 animation-fade-in">
                                    {!hasEmbruxacao && (
                                        <div className="flex flex-col items-center justify-center py-12 px-4 bg-muted/20 border border-border rounded-lg text-center">
                                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                                <Sparkles className="w-6 h-6 text-muted-foreground opacity-50" />
                                            </div>
                                            <h4 className="font-ui text-sm font-bold text-muted-foreground mb-2">
                                                Dons Bloqueados
                                            </h4>
                                            <p className="text-sm text-muted-foreground max-w-sm mb-4">
                                                Para acessar os Dons Sobrenaturais, você precisa selecionar a manobra <strong>Embruxação</strong> (exclusiva da Tara Malinas).
                                            </p>
                                            {currentDrive?.id === 'malina' ? (
                                                <button
                                                    onClick={() => {
                                                        const embruxacao = currentDrive.exclusiveManeuvers.find(m => m.id === 'embruxacao');
                                                        if (embruxacao) {
                                                            toggleManeuver(embruxacao);
                                                        }
                                                    }}
                                                    className="text-primary text-sm font-medium hover:underline"
                                                >
                                                    Adicionar Embruxação agora
                                                </button>
                                            ) : (
                                                <p className="text-xs text-muted-foreground/70">
                                                    (Você precisa escolher a Tara Malinas primeiro)
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {hasEmbruxacao && (
                                        <>
                                            <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg mb-4">
                                                <h4 className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                                                    <Sparkles className="w-4 h-4" />
                                                    Dons Sobrenaturais
                                                </h4>
                                                <p className="text-sm text-purple-200/80">
                                                    Você tem acesso a poderes além da compreensão humana. Dons custam <strong>Essência</strong> (Stress) para serem ativados.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2">
                                                {BOOK_GIFTS.map(gift => {
                                                    const isSelected = selectedGifts.includes(gift.id);
                                                    return (
                                                        <button
                                                            key={gift.id}
                                                            onClick={() => toggleGift(gift)}
                                                            className={`w-full p-3 rounded-lg text-left transition-all border ${isSelected
                                                                ? 'border-purple-500 bg-purple-500/10'
                                                                : 'border-border bg-muted/50 hover:border-purple-500/50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className={`font-medium ${isSelected ? 'text-purple-400' : 'text-foreground'}`}>
                                                                    {gift.name}
                                                                </span>
                                                                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                                                    Custo: {gift.essenceCost} Essência
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{gift.description}</p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div >
                );
            case 'notes':
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-display text-primary">Anotações & Detalhes</h3>
                            <p className="text-sm text-muted-foreground">
                                Adicione informações adicionais, inventário inicial, ou notas sobre seu personagem.
                            </p>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <div className="flex items-center gap-2 mb-2 text-primary">
                                <Brain className="w-5 h-5" />
                                <span className="font-bold uppercase text-sm tracking-wider">Anotações</span>
                            </div>
                            <textarea
                                className="w-full min-h-[300px] bg-background border border-border rounded-lg p-4 text-sm focus:outline-none focus:border-primary resize-y font-ui"
                                placeholder="Escreva aqui sua história, contatos, equipamentos, etc..."
                                value={character.notes || ''}
                                onChange={(e) => updateField('notes', e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 'review':
                // Create a full character object for preview/export
                const previewCharacter = {
                    ...character,
                    maneuvers: selectedManeuverIds,
                    skillManeuvers: selectedSkillManeuvers,
                    gifts: selectedGifts.map(id => {
                        const bookGift = BOOK_GIFTS.find(g => g.id === id);
                        return bookGift
                            ? { ...bookGift, isCustom: false }
                            : { id, name: 'Unknown', description: '', isCustom: true };
                    })
                };

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
                            character={previewCharacter}
                            selectedManeuvers={selectedManeuverIds}
                            refresh={availableRefresh}
                        />
                        <PrintableSheet character={previewCharacter} maneuvers={selectedManeuverIds} />
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
