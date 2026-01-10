import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Character, SelfieType } from '@/types/game';
import { validateSkillPyramid } from '@/utils/gameRules';
import { toast } from '@/hooks/use-toast';
import { Check, AlertTriangle, ArrowRightLeft, Sparkles, Trophy, Heart } from 'lucide-react';

interface SelfieAdvancementModalProps {
    character: Character;
    selfieType: SelfieType;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: Partial<Character>) => Promise<void>;
}

export function SelfieAdvancementModal({
    character,
    selfieType,
    isOpen,
    onClose,
    onSave
}: SelfieAdvancementModalProps) {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<string>('default');

    // States for Mood (Swap Skills, Rename Aspect)
    const [skill1, setSkill1] = useState<string>('');
    const [skill2, setSkill2] = useState<string>('');
    const [aspectToRename, setAspectToRename] = useState<string>('');
    const [newAspectName, setNewAspectName] = useState<string>('');

    // States for Peak (Skill Point, Rename Consequence)
    const [skillToIncrease, setSkillToIncrease] = useState<string>('');
    const [newSevereConsequence, setNewSevereConsequence] = useState<string>('');

    // States for Life Change (Clear Severe, Refresh)
    const [selectedChange, setSelectedChange] = useState<string>('clear_severe'); // clear_severe, refresh

    useEffect(() => {
        // Reset states when type changes or modal opens
        setMode('default');
        setSkill1('');
        setSkill2('');
        setAspectToRename('');
        setNewAspectName('');
        setSkillToIncrease('');
        setNewSevereConsequence(character.consequences.severe || '');
        setSelectedChange('clear_severe');
    }, [selfieType, isOpen, character]);

    const handleSave = async () => {
        setLoading(true);
        try {
            let updates: Partial<Character> = {};
            let successMessage = '';

            if (selfieType === 'mood') {
                if (mode === 'swap_skills') {
                    if (!skill1 || !skill2 || skill1 === skill2) {
                        toast({ title: 'Erro', description: 'Selecione duas perícias diferentes.', variant: 'destructive' });
                        setLoading(false);
                        return;
                    }
                    const val1 = character.skills[skill1];
                    const val2 = character.skills[skill2] || 0;
                    updates = {
                        skills: {
                            ...character.skills,
                            [skill1]: val2,
                            [skill2]: val1
                        }
                    };
                    // Validate pyramid for swap? Usually swap maintains pyramid if it's 1-to-1 swap of values?
                    // If I swap a 4 and a 3, counts remain same. So Pyramid is safe.
                    // BUT if I swap a skill that is 0 (not in object) with a 4...
                    // { A: 4 } -> swap A with B (0). -> { A: 0, B: 4 }. Still safe.
                    successMessage = `Perícias ${skill1} e ${skill2} trocadas.`;

                } else if (mode === 'rename_aspect') {
                    if (!aspectToRename || !newAspectName) {
                        toast({ title: 'Erro', description: 'Preencha os campos.', variant: 'destructive' });
                        setLoading(false);
                        return;
                    }
                    // Handle known aspect keys or free aspects
                    if (['highConcept', 'drama', 'job', 'dreamBoard'].includes(aspectToRename)) {
                        updates = {
                            aspects: { ...character.aspects, [aspectToRename]: newAspectName }
                        };
                    } else {
                        // It's a free aspect? Need to find index.
                        const index = character.aspects.free.indexOf(aspectToRename);
                        if (index >= 0) {
                            const newFree = [...character.aspects.free];
                            newFree[index] = newAspectName;
                            updates = {
                                aspects: { ...character.aspects, free: newFree }
                            };
                        } else {
                            // Fallback if selecting by label "Aspecto Livre 1"
                            // Simplified for now: Dropdown should act correctly.
                            toast({ title: 'Erro', description: 'Aspecto não encontrado.', variant: 'destructive' });
                            setLoading(false);
                            return;
                        }
                    }
                    successMessage = 'Aspecto renomeado.';
                }
            } else if (selfieType === 'auge') {
                if (mode === 'skill_point') {
                    if (!skillToIncrease) {
                        toast({ title: 'Erro', description: 'Selecione uma perícia.', variant: 'destructive' });
                        setLoading(false);
                        return;
                    }
                    const currentVal = character.skills[skillToIncrease] || 0;
                    const nextVal = currentVal + 1;
                    const newSkills = { ...character.skills, [skillToIncrease]: nextVal };

                    const validation = validateSkillPyramid(newSkills);
                    if (!validation.valid) {
                        toast({ title: 'Movimento Inválido', description: validation.error, variant: 'destructive' });
                        setLoading(false);
                        return;
                    }
                    updates = { skills: newSkills };
                    successMessage = `Perícia ${skillToIncrease} aumentada para +${nextVal}.`;
                } else if (mode === 'rename_severe') {
                    updates = {
                        consequences: { ...character.consequences, severe: newSevereConsequence }
                    };
                    successMessage = 'Consequência grave renomeada.';
                }
            } else if (selfieType === 'mudanca') {
                if (selectedChange === 'clear_severe') {
                    updates = {
                        consequences: { ...character.consequences, severe: null }
                    };
                    successMessage = 'Consequência grave removida.';
                } else if (selectedChange === 'refresh') {
                    updates = {
                        refresh: character.refresh + 1
                    };
                    successMessage = 'Recarga aumentada em +1.';
                }
            }

            if (Object.keys(updates).length > 0) {
                await onSave(updates);
                toast({ title: 'Evolução Confirmada', description: successMessage });
                onClose();
            } else {
                toast({ title: 'Nenhuma alteração', description: 'Selecione uma opção de evolução.', variant: 'default' });
            }

        } catch (error) {
            console.error(error);
            toast({ title: 'Erro', description: 'Falha ao salvar evolução.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // Render logic...
    const renderMoodContent = () => (
        <Tabs defaultValue="rename_aspect" onValueChange={setMode} className="w-full">
            <TabsList className="grid grid-cols-2">
                <TabsTrigger value="rename_aspect">Renomear Aspecto</TabsTrigger>
                <TabsTrigger value="swap_skills">Trocar Perícias</TabsTrigger>
            </TabsList>

            <TabsContent value="rename_aspect" className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Qual aspecto mudou?</Label>
                    <Select onValueChange={setAspectToRename}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="highConcept">Alto Conceito: {character.aspects.highConcept}</SelectItem>
                            <SelectItem value="drama">Drama: {character.aspects.drama}</SelectItem>
                            <SelectItem value="job">Emprego: {character.aspects.job}</SelectItem>
                            <SelectItem value="dreamBoard">Quadro dos Sonhos: {character.aspects.dreamBoard}</SelectItem>
                            {character.aspects.free.map((asp, i) => (
                                <SelectItem key={i} value={asp}>Livre: {asp}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Novo nome do aspecto</Label>
                    <Input
                        value={newAspectName}
                        onChange={(e) => setNewAspectName(e.target.value)}
                        placeholder="Nova verdade sobre você..."
                    />
                </div>
            </TabsContent>

            <TabsContent value="swap_skills" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Perícia 1</Label>
                        <Select onValueChange={setSkill1}>
                            <SelectTrigger><SelectValue placeholder="Perícia..." /></SelectTrigger>
                            <SelectContent>
                                {Object.keys(character.skills).sort().map(s => (
                                    <SelectItem key={s} value={s}>{s} (+{character.skills[s]})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-center pt-6">
                        <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <Label>Perícia 2 (Troca)</Label>
                        <Select onValueChange={setSkill2}>
                            <SelectTrigger><SelectValue placeholder="Perícia..." /></SelectTrigger>
                            <SelectContent>
                                {/* Include skills not in list? For now just swap existing implies reallocation. 
                     Ideally should allow picking from ALL skills, even those at 0. 
                     Let's list existing + a placeholder for "Nova"? 
                     For MVP: Just existing skills to avoid complex UI of listing all 18 skills. */}
                                {Object.keys(character.skills).sort().map(s => (
                                    <SelectItem key={s} value={s}>{s} (+{character.skills[s]})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Para aprender uma nova perícia do zero (0 para +1), use uma Mudança "Auge".
                        </p>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );

    const renderAugeContent = () => (
        <Tabs defaultValue="skill_point" onValueChange={setMode} className="w-full">
            <TabsList className="grid grid-cols-2">
                <TabsTrigger value="skill_point">+1 Ponto de Perícia</TabsTrigger>
                <TabsTrigger value="rename_severe">Renomear Grave</TabsTrigger>
            </TabsList>

            <TabsContent value="skill_point" className="space-y-4 py-4">
                <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground mb-2">
                    <p>Você pode aumentar uma perícia existente ou aprender uma nova (0 → +1), desde que respeite a pirâmide.</p>
                </div>
                <div className="space-y-2">
                    <Label>Qual perícia aumentar?</Label>
                    <Input
                        list="skill-suggestions"
                        placeholder="Digite o nome da perícia..."
                        value={skillToIncrease}
                        onChange={(e) => setSkillToIncrease(e.target.value)}
                    />
                    <datalist id="skill-suggestions">
                        {Object.keys(character.skills).map(s => <option key={s} value={s} />)}
                        <option value="Atletismo" />
                        <option value="Atleta" />
                        <option value="Luta" />
                        <option value="Tiro" />
                        <option value="Furtividade" />
                        <option value="Investigação" />
                    </datalist>
                    <p className="text-xs">Atual: +{character.skills[skillToIncrease] || 0} → Novo: +{(character.skills[skillToIncrease] || 0) + 1}</p>
                </div>
            </TabsContent>

            <TabsContent value="rename_severe" className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Consequência Grave Atual</Label>
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
                        {character.consequences.severe || "Nenhuma consequência grave ativa."}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Nova interpretação da Consequência</Label>
                    <Input
                        value={newSevereConsequence}
                        onChange={(e) => setNewSevereConsequence(e.target.value)}
                        placeholder="Descreva a sequela permanente..."
                    />
                </div>
            </TabsContent>
        </Tabs>
    );

    const renderMudancaContent = () => (
        <div className="space-y-4 py-2">
            <RadioGroup value={selectedChange} onValueChange={setSelectedChange}>
                <div className="flex items-start space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50">
                    <RadioGroupItem value="clear_severe" id="opt1" />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="opt1">Recuperar Consequência Grave</Label>
                        <p className="text-sm text-muted-foreground">
                            Remove imediatamente sua consequência grave/extrema, permitindo que o slot cure.
                        </p>
                    </div>
                </div>
                <div className="flex items-start space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50">
                    <RadioGroupItem value="refresh" id="opt2" />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="opt2">+1 de Recarga</Label>
                        <p className="text-sm text-muted-foreground">
                            Aumenta sua Recarga permanentemente em 1.
                        </p>
                    </div>
                </div>
            </RadioGroup>
        </div>
    );

    const getTitle = () => {
        switch (selfieType) {
            case 'mood': return 'Evolução: Mood do Dia';
            case 'auge': return 'Evolução: Auge';
            case 'mudanca': return 'Evolução: Mudança de Vida';
            default: return 'Evolução';
        }
    };

    const getIcon = () => {
        switch (selfieType) {
            case 'mood': return <Sparkles className="w-5 h-5 text-blue-400" />;
            case 'auge': return <Trophy className="w-5 h-5 text-amber-400" />;
            case 'mudanca': return <Heart className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getIcon()}
                        {getTitle()}
                    </DialogTitle>
                    <DialogDescription>
                        Esta selfie marcou um momento importante. Como seu personagem mudou?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    {selfieType === 'mood' && renderMoodContent()}
                    {selfieType === 'auge' && renderAugeContent()}
                    {selfieType === 'mudanca' && renderMudancaContent()}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading}>Confirmar Evolução</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
