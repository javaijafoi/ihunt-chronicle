import { MonsterData } from "./steps/IdentityStep";
import { forwardRef } from "react";
import { Zap } from "lucide-react";

interface MonsterCardProps {
    data: MonsterData;
    className?: string;
    id?: string;
}

export const MonsterCard = forwardRef<HTMLDivElement, MonsterCardProps>(
    ({ data, className = "", id }, ref) => {
        // Sort skills by value descending
        const sortedSkills = Object.entries(data.skills)
            .filter(([_, val]) => val > 0)
            .sort((a, b) => b[1] - a[1]);

        return (
            <div
                ref={ref}
                id={id}
                className={`w-[400px] bg-neutral-950 border-4 border-neutral-800 rounded-xl overflow-hidden shadow-2xl ${className}`}
                style={{ fontFamily: "Inter, sans-serif" }}
            >
                {/* Header / Avatar */}
                <div className="relative h-48 bg-neutral-900">
                    {data.avatar ? (
                        <img
                            src={data.avatar}
                            alt={data.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous" // Important for html2canvas
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-700">
                            <span className="text-4xl">?</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider leading-none">
                            {data.name || "Desconhecido"}
                        </h2>
                        <div className="text-red-500 font-bold uppercase text-sm tracking-widest mt-1">
                            {data.clado || "Morto"} {data.subtipo && `• ${data.subtipo}`}
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Aspects */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-1">
                            Aspectos
                        </h3>
                        <ul className="text-sm space-y-1">
                            <li className="font-semibold text-white">“{data.highConcept || "..."}”</li>
                            <li className="italic text-red-400">⚠️ {data.trouble || "..."}</li>
                            {data.otherAspects.map((aspect, i) => (
                                <li key={i} className="text-neutral-300">• {aspect}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Skills Grid */}
                    <div>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-1 mb-2">
                            Perícias
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            {sortedSkills.length > 0 ? (
                                sortedSkills.map(([name, val]) => (
                                    <div key={name} className="flex justify-between">
                                        <span className="text-neutral-300">{name}</span>
                                        <span className="font-bold text-white">+{val}</span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-neutral-600 italic">Nenhuma perícia treinada</span>
                            )}
                        </div>
                    </div>

                    {/* Stunts */}
                    {data.stunts.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-1 mb-2">
                                Proezas
                            </h3>
                            <div className="space-y-2">
                                {data.stunts.map((stunt, i) => (
                                    <div key={i} className="text-xs">
                                        <div className="font-bold text-white flex items-center gap-1">
                                            <Zap className="w-3 h-3 text-red-500" />
                                            {stunt.name}
                                        </div>
                                        <div className="text-neutral-400 leading-tight">
                                            {stunt.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stress & Consequences */}
                    <div className="pt-2 border-t border-neutral-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Estresse</span>
                            <div className="flex gap-1">
                                {Array.from({ length: data.stressTotal }).map((_, i) => (
                                    <div key={i} className="w-4 h-4 rounded-sm border border-neutral-600"></div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-green-500 w-4 font-bold">2</span>
                                <div className="flex-1 border-b border-neutral-800 text-neutral-500">{data.consequences.mild || "Suave"}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-500 w-4 font-bold">4</span>
                                <div className="flex-1 border-b border-neutral-800 text-neutral-500">{data.consequences.moderate || "Moderada"}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-red-500 w-4 font-bold">6</span>
                                <div className="flex-1 border-b border-neutral-800 text-neutral-500">{data.consequences.severe || "Severa"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

MonsterCard.displayName = "MonsterCard";
