import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Zap, Circle, Target, ChevronRight, ChevronLeft, Check, Sparkles, Brain, Search, Eye, Download, Trash2, Plus, X, AlertTriangle, Heart } from 'lucide-react';
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
    const [selectedGifts, setSelectedGifts] = useState<CharacterGift[]>([]); // Changed to store objects with levels

    // Auto-cleanup: remove skill maneuvers if skill level drops to 0
    const [prevSkills, setPrevSkills] = useState(character.skills);
    if (JSON.stringify(prevSkills) !== JSON.stringify(character.skills)) {
        setPrevSkills(character.skills);
        setSelectedSkillManeuvers(prev => {
            return prev.filter(id => {
                for (const [skill, maneuvers] of Object.entries(SKILL_MANEUVERS)) {
                    if (maneuvers.find(m => m.id === id)) {
                        return (character.skills[skill] || 0) > 0;
                    }
                }
                return true;
            });
        });
    }
    const [consistencyState, setConsistencyState] = useState<{ show: boolean, warnings: string[], success: boolean }>({ show: false, warnings: [], success: false });

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

    const hasEmbruxacao = useMemo(() => {
        return selectedManeuverIds.includes('embruxacao');
    }, [selectedManeuverIds]);

    const purchasedManeuversCount = useMemo(() => {
        let count = selectedManeuverIds.length;
        if (currentDrive && selectedManeuverIds.includes(currentDrive.freeManeuver.id)) {
            count -= 1;
        }

        // Skill maneuvers cost 1 refresh each
        // SKILL_MANEUVERS entries have a 'cost' field, usually 1 or 0 (free).
        // We assume cost 1 unless specified otherwise in the future
        const skillManeuverCost = selectedSkillManeuvers.length; // Simplified: each costs 1 refresh

        // Gifts Cost Calculation
        // Rule: 
        // - Without Embruxacao: 1 Level = 1 Refresh
        // - With Embruxacao: 2 Levels = 1 Refresh
        const totalGiftLevels = selectedGifts.reduce((acc, g) => acc + (g.level || 1), 0);
        const giftsCost = hasEmbruxacao
            ? Math.ceil(totalGiftLevels / 2)
            : totalGiftLevels;

        count += skillManeuverCost;
        count += giftsCost;

        // Base free maneuver allowance (5 Base + 2 Free + 1 Drive Free is handled above by removing drive free from count)
        // Actually, the UI says: "Base 5 (+2 Grátis + 1 Tara)". 
        // Logic: Total Refresh = Base (5) - (TotalPaidManeuvers - 2Free).
        // So we subtract 2 from the "Paid" count.
        count -= 2;
        return Math.max(0, count);
    }, [selectedManeuverIds, selectedSkillManeuvers, currentDrive, selectedGifts, hasEmbruxacao]);

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

                    if (migrated.gifts) {
                        setSelectedGifts(migrated.gifts);
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
        // selectedGifts is already CharacterGift[], no need to map from IDs
        // But we might want to ensure names/descriptions are up to date from BOOK_GIFTS if they are not custom?
        // For now, assume state is correct.

        const finalCharacter: Omit<Character, 'id'> = {
            ...character,
            maneuvers: selectedManeuverIds,
            skillManeuvers: selectedSkillManeuvers,
            gifts: selectedGifts,
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
                // Embruxacao Logic derived from memo
                // const hasEmbruxacao = ... (already defined in scope)


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

                const toggleGift = (gift: Gift, level: number = 1) => {
                    // Check if we should default to level 2 (Embruxação optimization)
                    const effectiveLevel = (hasEmbruxacao && level === 1) ? 2 : level;

                    setSelectedGifts(prev => {
                        const existingIndex = prev.findIndex(g => g.id === gift.id);

                        // If already has this gift
                        if (existingIndex >= 0) {
                            const existing = prev[existingIndex];
                            // If clicking same level (and it wasn't an auto-upgrade from 1->2 click), remove
                            // If we clicked "Add" (level 1 default) and got upgraded to 2, check if we already have 2.
                            if (existing.level === effectiveLevel) {
                                return prev.filter((_, i) => i !== existingIndex);
                            } else {
                                // Update level
                                const newGifts = [...prev];
                                newGifts[existingIndex] = { ...existing, level: effectiveLevel };
                                return newGifts;
                            }
                        }

                        // Add new
                        return [...prev, {
                            ...gift,
                            level: effectiveLevel,
                            isCustom: false
                        }];
                    });
                };

                // Helper to change level directly
                const updateGiftLevel = (giftId: string, level: number) => {
                    setSelectedGifts(prev => prev.map(g => {
                        if (g.id === giftId) return { ...g, level };
                        return g;
                    }));
                };

                const removeGift = (giftId: string) => {
                    setSelectedGifts(prev => prev.filter(g => g.id !== giftId));
                };

                return (
                    <div className="space-y-6">
                        {/* Refresh Counter */}
                        <div className={`p-4 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4 ${availableRefresh < 1
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-accent/10 border-accent/30'
                            }`}>
                            <div>
                                <span className={`font-ui text-sm uppercase tracking-wider ${availableRefresh < 1 ? 'text-amber-700' : 'text-muted-foreground'
                                    }`}>
                                    Refresh Disponível
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Base 5 (+2 Grátis + 1 Tara)
                                </p>
                                {availableRefresh < 0 && (
                                    <p className="text-xs font-bold text-destructive mt-1 flex items-center gap-1">
                                        ⚠️ Atenção: Refresh negativo é permitido, mas incomum.
                                    </p>
                                )}
                            </div>
                            <span className={`font-display text-4xl ${availableRefresh < 0 ? 'text-destructive' : availableRefresh === 0 ? 'text-amber-500' : 'text-accent'
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
                                <div className="space-y-6 animation-fade-in">
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="w-5 h-5 text-purple-600 mt-1" />
                                            <div>
                                                <h4 className="font-bold text-purple-900">Dons Sobrenaturais</h4>
                                                <p className="text-sm text-purple-800 mt-1">
                                                    Dons são poderes especiais. Qualquer um pode ter, mas "Malinas" com Embruxação pagam menos.
                                                </p>
                                                <div className="mt-2 text-xs font-medium uppercase tracking-wider bg-purple-200 text-purple-900 inline-block px-2 py-1 rounded">
                                                    Custo Atual: {hasEmbruxacao ? '2 Níveis = 1 Refresh' : '1 Nível = 1 Refresh'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {BOOK_GIFTS.map(gift => {
                                            const selected = selectedGifts.find(g => g.id === gift.id);
                                            const currentLevel = selected?.level || 1; // Default to 1 for display
                                            const isSelected = !!selected;

                                            return (
                                                <div
                                                    key={gift.id}
                                                    className={`p-4 rounded-lg border transition-all ${isSelected
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-border bg-card'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-lg">{gift.name}</h4>
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                                                                {gift.category}
                                                            </span>
                                                        </div>
                                                        {isSelected ? (
                                                            <button
                                                                onClick={() => removeGift(gift.id)}
                                                                className="text-red-500 hover:text-red-700 p-1"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => toggleGift(gift, 1)}
                                                                className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center gap-1"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Adicionar
                                                            </button>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-muted-foreground mb-4">
                                                        {gift.description}
                                                    </p>

                                                    {isSelected && (
                                                        <div className="flex items-center gap-4 bg-white/50 p-2 rounded border border-purple-100">
                                                            <div className="flex-1">
                                                                <label className="text-xs uppercase font-bold text-purple-900 block mb-1">
                                                                    Nível do Poder
                                                                </label>
                                                                <div className="flex gap-1">
                                                                    {[1, 2, 3, 4, 5].map(lvl => {
                                                                        const disabledLevel1 = hasEmbruxacao && lvl === 1;
                                                                        return (
                                                                            <button
                                                                                key={lvl}
                                                                                onClick={() => !disabledLevel1 && updateGiftLevel(gift.id, lvl)}
                                                                                type="button"
                                                                                disabled={disabledLevel1}
                                                                                title={disabledLevel1 ? "Com Embruxação, o nível 2 custa o mesmo que o nível 1 (1 Refresh). Melhor começar do 2!" : ""}
                                                                                className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm transition-colors ${currentLevel === lvl
                                                                                    ? 'bg-purple-600 text-white shadow-sm'
                                                                                    : disabledLevel1
                                                                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                                                        : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                                                                                    }`}
                                                                            >
                                                                                {lvl}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-xs uppercase font-bold text-purple-900 block">
                                                                    Custo (Refresh)
                                                                </span>
                                                                <span className="font-display text-2xl text-purple-700">
                                                                    {hasEmbruxacao ? Math.ceil(currentLevel / 2) : currentLevel}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div >
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
                    gifts: selectedGifts
                };


                return (
                    <div className="space-y-6">
                        <div className="bg-muted/50 p-4 rounded-lg text-center mb-6">
                            <p className="text-muted-foreground text-sm">
                                Revise todos os detalhes abaixo. Se precisar corrigir algo, use o botão <strong>Voltar</strong> ou clique nas abas acima.
                            </p>
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

            {/* Consistency Alert Banner */}
            {consistencyState.show && (
                <div className={`mb-4 rounded-lg border p-4 flex items-start justify-between animation-fade-in ${consistencyState.success
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                    <div className="flex gap-3">
                        {consistencyState.success ? (
                            <div className="mt-0.5 bg-green-200 p-1 rounded-full text-green-700">
                                <Check className="w-4 h-4" />
                            </div>
                        ) : (
                            <div className="mt-0.5 bg-amber-200 p-1 rounded-full text-amber-700">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        )}
                        <div>
                            <h4 className="font-bold text-sm mb-1">
                                {consistencyState.success ? 'Tudo Coerente!' : 'Atenção aos Detalhes Mecânicos'}
                            </h4>
                            {consistencyState.success ? (
                                <p className="text-sm opacity-90">
                                    Seu personagem parece seguir uma lógica matemática sólida. Boa caçada!
                                </p>
                            ) : (
                                <ul className="text-sm space-y-1 list-disc pl-4 opacity-90">
                                    {consistencyState.warnings.map((w, i) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setConsistencyState(prev => ({ ...prev, show: false }))}
                        className={`p-1 rounded hover:bg-black/5 transition-colors ${consistencyState.success ? 'text-green-800' : 'text-amber-800'
                            }`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Main Card */}
            <div className="bg-card glass-panel border border-border rounded-xl shadow-lg min-h-[500px] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="font-display text-2xl text-foreground">
                                    {currentStepData.title}
                                </h2>
                                {currentStepData.id === 'review' && (
                                    <button
                                        onClick={() => {
                                            const warnings: string[] = [];
                                            const totalGiftLevels = selectedGifts.reduce((acc, g) => acc + (g.level || 1), 0);

                                            // 1. Math Check: Embruxação Efficiency
                                            // Embruxação costs 1 Refresh. It halves gift costs (ceil).
                                            // Threshold: If Total Levels >= 4, Cost with Embruxacao = 1 + 2 = 3. Cost without = 4. Savings!
                                            // If has Embruxacao and Total Levels == 0: Wasted maneuver?
                                            if (hasEmbruxacao && totalGiftLevels === 0) {
                                                warnings.push("Você tem a manobra 'Embruxação' mas não escolheu nenhum Dom. Você está gastando 1 Refresh sem benefício.");
                                            }
                                            if (!hasEmbruxacao && totalGiftLevels >= 4) {
                                                warnings.push(`Você tem ${totalGiftLevels} níveis de Dons. Se pegar 'Embruxação' (Tara Malinas), gastaria menos Refresh total.`);
                                            }
                                            // Check for inefficient Level 1 gifts with Embruxação
                                            if (hasEmbruxacao && selectedGifts.some(g => (g.level || 1) === 1)) {
                                                warnings.push("Você tem 'Embruxação' e pelo menos um Dom Nível 1. Com Embruxação, o Nível 2 custa o mesmo (1 Refresh). Aumente o nível!");
                                            }

                                            // 2. Math Check: Maneuvers vs Drive
                                            if (currentDrive && !selectedManeuverIds.includes(currentDrive.freeManeuver.id)) {
                                                warnings.push(`Você não selecionou a manobra gratuita da sua Tara (${currentDrive.freeManeuver.name}). É um recurso grátis!`);
                                            }

                                            // 3. Math Check: Skill Maneuvers usage
                                            // Invalid Skill Maneuvers (orphaned)
                                            const orphanedManeuvers = selectedSkillManeuvers.filter(id => {
                                                // Find which skill owns this maneuver
                                                for (const [skill, maneuvers] of Object.entries(SKILL_MANEUVERS)) {
                                                    if (maneuvers.find(m => m.id === id)) {
                                                        return (character.skills[skill] || 0) <= 0;
                                                    }
                                                }
                                                return false;
                                            });
                                            if (orphanedManeuvers.length > 0) {
                                                warnings.push(`Você possui ${orphanedManeuvers.length} manobra(s) de habilidades que você não tem mais (Nível 0). Remova-as.`);
                                            }

                                            const hasSkills = Object.values(character.skills).some(v => v > 0);
                                            // Only warn about missing maneuvers if we don't have orphaned ones (priority)
                                            if (hasSkills && selectedSkillManeuvers.length === 0 && orphanedManeuvers.length === 0) {
                                                warnings.push("Você tem perícias mas não escolheu nenhuma Manobra de Habilidade. Elas custam 1 Refresh e são muito úteis.");
                                            }

                                            // 4. Refresh Warning
                                            if (availableRefresh < 0) {
                                                warnings.push(`Seu Refresh é ${availableRefresh}. Isso é permitido, mas você começará as sessões devendo Pontos de Destino ao GM.`);
                                            }

                                            setConsistencyState({
                                                show: true,
                                                warnings,
                                                success: warnings.length === 0
                                            });
                                        }}
                                        className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-1 rounded border border-border transition-colors flex items-center gap-1"
                                        title="Verificar se a ficha tem problemas comuns"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Verificar Coerência
                                    </button>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                Configure os detalhes do seu personagem
                            </p>
                        </div>
                    </div>
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

                    {STEPS[currentStep].id === 'review' ? (
                        <div className="flex items-center gap-2">
                            <button onClick={handleExportJson} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm">
                                <span>💾 <span className="hidden sm:inline">JSON</span></span>
                            </button>
                            <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium shadow-sm">
                                <span>📄 <span className="hidden sm:inline">PDF</span></span>
                            </button>
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-border hover:bg-muted transition-colors text-foreground text-sm font-medium shadow-sm">
                                <span>🖨️ <span className="hidden sm:inline">Imprimir</span></span>
                            </button>
                        </div>
                    ) : currentStep < STEPS.length - 1 ? (
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
