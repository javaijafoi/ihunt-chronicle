import { Character } from '@/types/game';
import { DRIVES, GENERAL_MANEUVERS, getDriveById } from '@/data/drives';
import { User, Zap, Circle } from 'lucide-react';

interface CharacterCardProps {
    character: Omit<Character, 'id' | 'campaignId' | 'sessionId' | 'createdBy' | 'userId'>;
    selectedManeuvers: string[];
    refresh: number;
}

export function CharacterCard({ character, selectedManeuvers, refresh }: CharacterCardProps) {
    const currentDrive = character.drive ? getDriveById(character.drive) : undefined;

    const getManeuverName = (id: string) => {
        // Check drive first
        if (currentDrive) {
            if (currentDrive.freeManeuver.id === id) return currentDrive.freeManeuver.name;
            const exclusive = currentDrive.exclusiveManeuvers.find(m => m.id === id);
            if (exclusive) return exclusive.name;
        }
        // Check general
        const general = GENERAL_MANEUVERS.find(m => m.id === id);
        if (general) return general.name;
        return id;
    };

    const getManeuverDesc = (id: string) => {
        if (currentDrive) {
            if (currentDrive.freeManeuver.id === id) return currentDrive.freeManeuver.description;
            const exclusive = currentDrive.exclusiveManeuvers.find(m => m.id === id);
            if (exclusive) return exclusive.description;
        }
        const general = GENERAL_MANEUVERS.find(m => m.id === id);
        if (general) return general.description;
        return "";
    };

    return (
        <div id="character-card-export" className="bg-white text-black p-8 rounded-xl shadow-2xl max-w-2xl mx-auto border border-gray-200">
            {/* Header */}
            <div className="flex gap-6 mb-8 border-b-2 border-black pb-6">
                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0 flex items-center justify-center">
                    {character.avatar ? (
                        <img src={character.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-12 h-12 text-gray-400" />
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="font-display text-4xl mb-2 uppercase tracking-wide">{character.name || "Sem Nome"}</h1>
                    {currentDrive && (
                        <div className="flex items-center gap-2 text-xl font-ui">
                            <span>{currentDrive.icon}</span>
                            <span className="font-bold">{currentDrive.name}</span>
                            <span className="text-gray-500 text-base italic ml-2">- {currentDrive.summary}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Left Column: Aspects & Skills */}
                <div className="space-y-8">
                    {/* Aspects */}
                    <section>
                        <h3 className="font-display text-xl border-b border-black mb-3 uppercase">Aspectos</h3>
                        <div className="space-y-3 font-ui">
                            <div className="p-2 bg-gray-50 border-l-4 border-black">
                                <span className="text-xs uppercase font-bold text-gray-500 block">Alto Conceito</span>
                                <p className="font-medium">{character.aspects.highConcept || "-"}</p>
                            </div>
                            <div className="p-2 bg-gray-50 border-l-4 border-gray-400">
                                <span className="text-xs uppercase font-bold text-gray-500 block">Drama</span>
                                <p className="font-medium">{character.aspects.drama || "-"}</p>
                            </div>
                            <div>
                                <span className="font-bold mr-2">Emprego:</span>
                                <span>{character.aspects.job || "-"}</span>
                            </div>
                            <div>
                                <span className="font-bold mr-2">Sonhos:</span>
                                <span>{character.aspects.dreamBoard || "-"}</span>
                            </div>
                            {character.aspects.free.map((free, i) => (
                                <div key={i}>
                                    <span className="font-bold mr-2">Livre:</span>
                                    <span>{free}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Skills */}
                    <section>
                        <h3 className="font-display text-xl border-b border-black mb-3 uppercase">Perícias</h3>
                        <div className="space-y-1 font-ui">
                            {[4, 3, 2, 1].map(level => {
                                const skills = Object.entries(character.skills)
                                    .filter(([, val]) => val === level)
                                    .map(([key]) => key);

                                if (skills.length === 0) return null;

                                return (
                                    <div key={level} className="flex items-baseline">
                                        <span className="font-bold w-8 text-lg">+{level}</span>
                                        <span className="text-gray-700">{skills.join(", ")}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </div>

                {/* Right Column: Maneuvers & Stress */}
                <div className="space-y-8">
                    {/* Maneuvers */}
                    <section>
                        <h3 className="font-display text-xl border-b border-black mb-3 uppercase">Manobras</h3>
                        <div className="space-y-3">
                            {selectedManeuvers.map(id => (
                                <div key={id} className="text-sm">
                                    <div className="flex items-center gap-1 font-bold">
                                        <Zap className="w-3 h-3 text-black" />
                                        {getManeuverName(id)}
                                    </div>
                                    <p className="text-gray-600 leading-tight pl-4">
                                        {getManeuverDesc(id)}
                                    </p>
                                </div>
                            ))}
                            {selectedManeuvers.length === 0 && <p className="text-gray-400 italic">Nenhuma manobra selecionada</p>}
                        </div>
                    </section>

                    {/* Stress & Consequences */}
                    <section>
                        <h3 className="font-display text-xl border-b border-black mb-3 uppercase">Estresse</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm">FÍSICO</span>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(box => (
                                        <div key={box} className="w-8 h-8 border-2 border-black flex items-center justify-center font-bold text-gray-300">
                                            {box}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm">MENTAL</span>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(box => (
                                        <div key={box} className="w-8 h-8 border-2 border-black flex items-center justify-center font-bold text-gray-300">
                                            {box}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer Refresh */}
                    <div className="pt-4 border-t-2 border-black flex justify-between items-end">
                        <div>
                            <span className="block text-xs uppercase font-bold text-gray-500">Fate Points</span>
                            <span className="font-display text-3xl">{refresh}</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase font-bold text-gray-500 text-right">Refresh</span>
                            <span className="font-display text-3xl">{refresh}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
