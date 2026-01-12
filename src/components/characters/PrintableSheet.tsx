import { Character } from '@/types/game';
import { DRIVES, GENERAL_MANEUVERS, getDriveById } from '@/data/drives';

interface PrintableSheetProps {
    character: Omit<Character, 'id' | 'campaignId' | 'sessionId' | 'createdBy' | 'userId'>;
    maneuvers: string[];
}

export function PrintableSheet({ character, maneuvers }: PrintableSheetProps) {
    const currentDrive = character.drive ? getDriveById(character.drive) : undefined;

    // Need to recalculate selected maneuvers/refresh locally or pass props if we want perfect sync.
    // For simplicity, we assume we want to print what is currently "saved" or passed.
    // But wait, the standard PrintableSheet usually doesn't take 'selectedManeuvers' as a prop in the user request description?
    // Ah, the user request B5 description didn't specify props, but B5 example content implies calculating/showing them.
    // Re-reading user request B5.4: "Criar componente PrintableSheet.tsx otimizado.. Manobras... +4, +3... Estresse...".
    // It needs the data. Let's assume we pass character object which contains everything interesting? 
    // Wait, the character object in PublicCharacterWizard state *includes* skills and aspects, but DOES NOT include 'maneuvers' (ids) directly in the typed 'character' state object until export/save time?
    // Actually, 'character' state in Wizard does NOT have 'maneuvers' array populated with IDs, that is kept in 'selectedManeuverIds'!
    // So we MUST pass selectedManeuverIds to this component too, or merge them.
    // Let's update props to accept maneuvers.

    const getManeuverName = (id: string) => {
        // Check drive first
        if (currentDrive) {
            if (currentDrive.freeManeuver.id === id) return currentDrive.freeManeuver.name;
            const exclusive = currentDrive.exclusiveManeuvers.find(m => m.id === id);
            if (exclusive) return exclusive.name;
        }
        const general = GENERAL_MANEUVERS.find(m => m.id === id);
        if (general) return general.name;
        return id;
    };

    return (
        <div className="printable-sheet hidden print:block print:absolute print:inset-0 print:bg-white print:text-black print:overflow-visible">
            <div className="p-8 max-w-[210mm] mx-auto h-[297mm]">
                {/* Header */}
                <div className="border-b-2 border-black pb-4 mb-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold uppercase">{character.name || " _______________ "}</h1>
                            <p className="text-lg">
                                <span className="font-bold">TARA:</span> {currentDrive?.name || " _______________ "}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Aspects */}
                <div className="mb-6 border-2 border-black p-4 rounded-lg">
                    <h2 className="text-xl font-bold border-b border-black mb-2">ASPECTOS</h2>
                    <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="font-bold uppercase">Alto Conceito:</span>
                            <div className="border-b border-dotted border-gray-400">{character.aspects.highConcept}</div>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="font-bold uppercase text-red-700 print:text-black">Drama:</span>
                            <div className="border-b border-dotted border-gray-400">{character.aspects.drama}</div>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="font-bold uppercase">Emprego:</span>
                            <div className="border-b border-dotted border-gray-400">{character.aspects.job}</div>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="font-bold uppercase">Sonhos:</span>
                            <div className="border-b border-dotted border-gray-400">{character.aspects.dreamBoard}</div>
                        </div>
                        {character.aspects.free.map((free, i) => (
                            <div key={i} className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="font-bold uppercase">Livre:</span>
                                <div className="border-b border-dotted border-gray-400">{free}</div>
                            </div>
                        ))}
                        {/* Extra lines if needed */}
                        {character.aspects.free.length < 3 && (
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="font-bold uppercase">Livre:</span>
                                <div className="border-b border-dotted border-gray-400">&nbsp;</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* Skills */}
                    <div>
                        <h2 className="text-xl font-bold border-b-2 border-black mb-2">PERÍCIAS</h2>
                        <div className="space-y-4">
                            {[4, 3, 2, 1].map(level => {
                                const skills = Object.entries(character.skills)
                                    .filter(([, val]) => val === level)
                                    .map(([key]) => key);
                                return (
                                    <div key={level} className="flex gap-2 text-sm">
                                        <span className="font-bold text-lg min-w-[24px]">+{level}</span>
                                        <div className="flex-1 flex flex-col gap-1">
                                            {skills.length > 0 ? (
                                                skills.map(skill => <div key={skill} className="border-b border-gray-300">{skill}</div>)
                                            ) : (
                                                <>
                                                    <div className="border-b border-gray-300 h-5 w-full"></div>
                                                    {/* Add more lines for lower levels base on pyramid limits? */}
                                                </>
                                            )}
                                            {/* Ensure enough lines for the level capacity */}
                                            {Array.from({ length: Math.max(0, (level === 1 ? 4 : level === 2 ? 3 : level === 3 ? 2 : 1) - skills.length) }).map((_, i) => (
                                                <div key={`empty-${level}-${i}`} className="border-b border-gray-300 h-5 w-full"></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Maneuvers */}
                    <div>
                        <h2 className="text-xl font-bold border-b-2 border-black mb-2">MANOBRAS</h2>
                        <div className="space-y-2">
                            {maneuvers.map(id => (
                                <div key={id} className="text-sm border-b border-gray-300 pb-1">
                                    <span className="font-bold mr-1">◆</span>
                                    {getManeuverName(id)}
                                </div>
                            ))}
                            {/* Empty lines */}
                            {Array.from({ length: Math.max(0, 5 - maneuvers.length) }).map((_, i) => (
                                <div key={i} className="border-b border-gray-300 h-6 w-full flex items-end">
                                    <span className="text-gray-300 mr-1">◆</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stress & Consequences */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold border-b-2 border-black mb-4">ESTRESSE & CONSEQUÊNCIAS</h2>
                    <div className="flex gap-8">
                        <div className="flex-1">
                            <h3 className="font-bold text-sm mb-2">ESTRESSE FÍSICO (VIGOR)</h3>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="w-10 h-10 border-2 border-black flex items-center justify-center font-bold text-gray-300">
                                        {n}
                                    </div>
                                ))}
                                <div className="w-10 h-10 border-2 border-black flex items-center justify-center"></div>
                                <div className="w-10 h-10 border-2 border-black flex items-center justify-center"></div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm mb-2">ESTRESSE MENTAL (VONTADE)</h3>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="w-10 h-10 border-2 border-black flex items-center justify-center font-bold text-gray-300">
                                        {n}
                                    </div>
                                ))}
                                <div className="w-10 h-10 border-2 border-black flex items-center justify-center"></div>
                                <div className="w-10 h-10 border-2 border-black flex items-center justify-center"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex gap-4">
                            <span className="font-bold w-32">LEVE (2)</span>
                            <div className="flex-1 border-b border-black h-6"></div>
                        </div>
                        <div className="flex gap-4">
                            <span className="font-bold w-32">MODERADA (4)</span>
                            <div className="flex-1 border-b border-black h-6"></div>
                        </div>
                        <div className="flex gap-4">
                            <span className="font-bold w-32">SEVERA (6)</span>
                            <div className="flex-1 border-b border-black h-6"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
