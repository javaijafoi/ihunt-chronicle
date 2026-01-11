import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MonsterData } from "./IdentityStep";

interface StressStepProps {
    data: MonsterData;
    updateData: (updates: Partial<MonsterData>) => void;
}

export const StressStep = ({ data, updateData }: StressStepProps) => {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="space-y-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Estresse & Consequências
                </h3>
                <p className="text-neutral-400 text-sm">
                    Quanto dano o monstro aguenta antes de cair?
                </p>
            </div>

            <div className="space-y-6 p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-lg">Capacidade de Estresse</Label>
                        <span className="text-2xl font-bold text-red-500">{data.stressTotal}</span>
                    </div>

                    <Slider
                        value={[data.stressTotal]}
                        onValueChange={(val) => updateData({ stressTotal: val[0] })}
                        min={2}
                        max={10}
                        step={1}
                        className="py-4"
                    />

                    <div className="flex gap-1 justify-center pt-2">
                        {Array.from({ length: data.stressTotal }).map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded border border-neutral-600 bg-neutral-950 flex items-center justify-center text-xs text-neutral-500">
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-500 text-center">
                        Caixas de estresse visualizadas na ficha
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <Label>Consequências Pré-definidas (Opcional)</Label>
                <p className="text-xs text-neutral-400 mb-4">
                    Você pode deixar em branco para preencher durante o jogo, ou definir consequências padrão que o monstro já possui (ferimentos antigos, maldições).
                </p>

                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="mild" className="text-green-400">Suave (2)</Label>
                        <Input
                            id="mild"
                            placeholder="Vazio"
                            value={data.consequences.mild || ""}
                            onChange={(e) => updateData({ consequences: { ...data.consequences, mild: e.target.value || null } })}
                            className="bg-neutral-950 border-neutral-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="moderate" className="text-yellow-400">Moderada (4)</Label>
                        <Input
                            id="moderate"
                            placeholder="Vazio"
                            value={data.consequences.moderate || ""}
                            onChange={(e) => updateData({ consequences: { ...data.consequences, moderate: e.target.value || null } })}
                            className="bg-neutral-950 border-neutral-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="severe" className="text-red-400">Severa (6)</Label>
                        <Input
                            id="severe"
                            placeholder="Vazio"
                            value={data.consequences.severe || ""}
                            onChange={(e) => updateData({ consequences: { ...data.consequences, severe: e.target.value || null } })}
                            className="bg-neutral-950 border-neutral-800"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
