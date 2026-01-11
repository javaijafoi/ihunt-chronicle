import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface MonsterData {
    name: string;
    clado: string;
    subtipo: string;
    description: string;
    avatar: string;
    highConcept: string;
    trouble: string;
    otherAspects: string[];
    skills: Record<string, number>;
    stunts: { name: string; description: string }[];
    stressTotal: number;
    consequences: {
        mild: string | null;
        moderate: string | null;
        severe: string | null;
    };
}

interface IdentityStepProps {
    data: MonsterData;
    updateData: (updates: Partial<MonsterData>) => void;
}

const CLADOS = [
    "Vampiro",
    "Lobisomem",
    "Demônio",
    "Morto Faminto",
    "Feiticeiro",
    "Caçador",
    "Assombração",
    "Outro"
];

export const IdentityStep = ({ data, updateData }: IdentityStepProps) => {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Quem é o seu monstro?
                </h3>
                <p className="text-neutral-400 text-sm">
                    Defina a identidade básica e a aparência da criatura.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome do Monstro *</Label>
                    <Input
                        id="name"
                        placeholder="Ex: Vlad, o Empalador"
                        value={data.name}
                        onChange={(e) => updateData({ name: e.target.value })}
                        className="bg-neutral-950 border-neutral-700"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="clado">Clado / Tipo</Label>
                    <Select
                        value={data.clado}
                        onValueChange={(value) => updateData({ clado: value })}
                    >
                        <SelectTrigger className="bg-neutral-950 border-neutral-700">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-700">
                            {CLADOS.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="subtipo">Subtipo / Família (Opcional)</Label>
                <Input
                    id="subtipo"
                    placeholder="Ex: Morcego Gigante, Familiar Sombrio, Viral"
                    value={data.subtipo}
                    onChange={(e) => updateData({ subtipo: e.target.value })}
                    className="bg-neutral-950 border-neutral-700"
                />
                <p className="text-xs text-neutral-500">
                    Especificidade dentro do clado (ex: Clã Ventrue, Tribo dos Ossos, etc.)
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                    id="description"
                    placeholder="Descreva a aparência e o comportamento..."
                    value={data.description}
                    onChange={(e) => updateData({ description: e.target.value })}
                    className="bg-neutral-950 border-neutral-700 h-32 resize-none"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="avatar">URL do Avatar / Imagem</Label>
                <Input
                    id="avatar"
                    placeholder="https://..."
                    value={data.avatar}
                    onChange={(e) => updateData({ avatar: e.target.value })}
                    className="bg-neutral-950 border-neutral-700"
                />
                {data.avatar && (
                    <div className="mt-2 text-xs text-neutral-500 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700">
                            <img src={data.avatar} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                        <span>Preview</span>
                    </div>
                )}
            </div>
        </div>
    );
};
