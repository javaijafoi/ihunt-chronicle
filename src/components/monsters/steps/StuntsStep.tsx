import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Zap } from "lucide-react";
import { MonsterData } from "./IdentityStep";

interface StuntsStepProps {
    data: MonsterData;
    updateData: (updates: Partial<MonsterData>) => void;
}

export const StuntsStep = ({ data, updateData }: StuntsStepProps) => {
    const addStunt = () => {
        updateData({
            stunts: [...data.stunts, { name: "", description: "" }],
        });
    };

    const removeStunt = (index: number) => {
        const newStunts = [...data.stunts];
        newStunts.splice(index, 1);
        updateData({ stunts: newStunts });
    };

    const updateStunt = (index: number, field: "name" | "description", value: string) => {
        const newStunts = [...data.stunts];
        newStunts[index] = { ...newStunts[index], [field]: value };
        updateData({ stunts: newStunts });
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="space-y-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Proezas & Poderes
                </h3>
                <p className="text-neutral-400 text-sm">
                    Habilidades especiais que quebram as regras. Geralmente 3 a 5 proezas.
                </p>
            </div>

            <div className="space-y-6">
                {data.stunts.map((stunt, idx) => (
                    <div
                        key={idx}
                        className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-4 relative group"
                    >
                        <div className="absolute top-4 right-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStunt(idx)}
                                className="text-neutral-500 hover:text-red-500"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-red-400">
                                <Zap className="w-4 h-4" /> Proeza {idx + 1}
                            </Label>
                            <Input
                                placeholder="Nome da Proeza (ex: Velocidade Sobrenatural)"
                                value={stunt.name}
                                onChange={(e) => updateStunt(idx, "name", e.target.value)}
                                className="bg-neutral-950 border-neutral-700 font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Textarea
                                placeholder="Descrição do efeito..."
                                value={stunt.description}
                                onChange={(e) => updateStunt(idx, "description", e.target.value)}
                                className="bg-neutral-950 border-neutral-700 min-h-[80px]"
                            />
                        </div>
                    </div>
                ))}

                <Button
                    onClick={addStunt}
                    variant="outline"
                    className="w-full h-12 border-dashed border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Nova Proeza
                </Button>
            </div>
        </div>
    );
};
