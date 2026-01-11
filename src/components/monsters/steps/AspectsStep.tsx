import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Info } from "lucide-react";
import { MonsterData } from "./IdentityStep";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AspectsStepProps {
    data: MonsterData;
    updateData: (updates: Partial<MonsterData>) => void;
}

export const AspectsStep = ({ data, updateData }: AspectsStepProps) => {
    const addAspect = () => {
        if (data.otherAspects.length < 5) {
            updateData({ otherAspects: [...data.otherAspects, ""] });
        }
    };

    const removeAspect = (index: number) => {
        const newAspects = [...data.otherAspects];
        newAspects.splice(index, 1);
        updateData({ otherAspects: newAspects });
    };

    const updateAspect = (index: number, value: string) => {
        const newAspects = [...data.otherAspects];
        newAspects[index] = value;
        updateData({ otherAspects: newAspects });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Aspectos & Natureza
                </h3>
                <p className="text-neutral-400 text-sm">
                    Aspectos definem o que é verdade sobre o monstro e podem ser invocados.
                </p>
            </div>

            <div className="space-y-4">
                {/* Auto-filled kinda aspect based on Clado */}
                <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Label className="text-red-400">Conceito de Clado</Label>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-3 h-3 text-neutral-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Baseado no Clado e Subtipo escolhidos. Edite se quiser algo mais único.
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <Input
                        value={`${data.clado}${data.subtipo ? ` (${data.subtipo})` : ''}`}
                        readOnly
                        className="bg-neutral-950 border-neutral-700 opacity-75 cursor-not-allowed"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="highConcept">Alto Conceito *</Label>
                        <Tooltip>
                            <TooltipTrigger><Info className="w-3 h-3 text-neutral-500" /></TooltipTrigger>
                            <TooltipContent>A frase principal que resume quem esse monstro é.</TooltipContent>
                        </Tooltip>
                    </div>
                    <Input
                        id="highConcept"
                        placeholder="Ex: O Último Vampiro da Transilvânia"
                        value={data.highConcept}
                        onChange={(e) => updateData({ highConcept: e.target.value })}
                        className="bg-neutral-950 border-neutral-700"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="trouble">Dificuldade / Fraqueza *</Label>
                        <Tooltip>
                            <TooltipTrigger><Info className="w-3 h-3 text-neutral-500" /></TooltipTrigger>
                            <TooltipContent>O que causa problemas para ele? O que o caçador pode explorar?</TooltipContent>
                        </Tooltip>
                    </div>
                    <Input
                        id="trouble"
                        placeholder="Ex: Arrogância Nobre; Queima no Sol; Viciado em Sangue"
                        value={data.trouble}
                        onChange={(e) => updateData({ trouble: e.target.value })}
                        className="bg-neutral-950 border-neutral-700"
                    />
                </div>

                <div className="space-y-3 pt-4 border-t border-neutral-800">
                    <Label>Aspectos Adicionais</Label>
                    {data.otherAspects.map((aspect, idx) => (
                        <div key={idx} className="flex gap-2">
                            <Input
                                placeholder={`Aspecto ${idx + 1}`}
                                value={aspect}
                                onChange={(e) => updateAspect(idx, e.target.value)}
                                className="bg-neutral-950 border-neutral-700"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAspect(idx)}
                                className="text-neutral-500 hover:text-red-400"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}

                    {data.otherAspects.length < 5 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addAspect}
                            className="w-full border-dashed border-neutral-700 text-neutral-400 hover:text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Aspecto
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
