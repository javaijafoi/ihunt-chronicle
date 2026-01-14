
import { PrintData } from './printUtils';
import { StressBox } from './PrintComponents';

export const LayoutStandard = ({ data }: { data: PrintData }) => {
    // Reconstruct flat arrays for standard view compatibility if needed, 
    // but the Standard layout is quite custom, so we'll just adapt the JSX to use data.*

    return (
        <div className="printable-sheet bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] print:w-full print:mx-0">
            {/* Header */}
            <div className="border-b-2 border-black pb-4 mb-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold uppercase">{data.name || " _______________ "}</h1>
                        <p className="text-lg">
                            <span className="font-bold">TARA:</span> {data.archetype || " _______________ "}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm">REFRESH: <strong>{data.refresh}</strong></div>
                        <div className="text-sm">FATE POINTS: <strong>{data.fatePoints}</strong></div>
                    </div>
                </div>
            </div>

            {/* Aspects */}
            <div className="mb-6 border-2 border-black p-4 rounded-lg">
                <h2 className="text-xl font-bold border-b border-black mb-2">ASPECTOS</h2>
                <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="font-bold uppercase">Alto Conceito:</span>
                        <div className="border-b border-dotted border-gray-400">{data.aspects.highConcept}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="font-bold uppercase text-red-700 print:text-black">Drama:</span>
                        <div className="border-b border-dotted border-gray-400">{data.aspects.drama}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="font-bold uppercase">Emprego:</span>
                        <div className="border-b border-dotted border-gray-400">{data.aspects.job}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="font-bold uppercase">Sonhos:</span>
                        <div className="border-b border-dotted border-gray-400">{data.aspects.dreamBoard}</div>
                    </div>
                    {data.aspects.free.map((free, i) => (
                        <div key={i} className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="font-bold uppercase">Livre:</span>
                            <div className="border-b border-dotted border-gray-400">{free}</div>
                        </div>
                    ))}
                    {data.aspects.free.length < 3 && (
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
                        {[
                            { level: 4, label: '+4', list: data.skills.superb },
                            { level: 3, label: '+3', list: data.skills.great },
                            { level: 2, label: '+2', list: data.skills.fair },
                            { level: 1, label: '+1', list: data.skills.average },
                        ].map(({ level, label, list }) => (
                            <div key={level} className="flex gap-2 text-sm">
                                <span className="font-bold text-lg min-w-[24px]">{label}</span>
                                <div className="flex-1 flex flex-col gap-1">
                                    {list.length > 0 ? (
                                        list.map(skill => <div key={skill} className="border-b border-gray-300">{skill}</div>)
                                    ) : (
                                        <div className="border-b border-gray-300 h-5 w-full"></div>
                                    )}
                                    {/* Fill empty slots logic roughly */}
                                    {Array.from({ length: Math.max(0, (level === 1 ? 4 : level === 2 ? 3 : level === 3 ? 2 : 1) - list.length) }).map((_, i) => (
                                        <div key={`empty-${level}-${i}`} className="border-b border-gray-300 h-5 w-full"></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Gifts */}
                    {data.gifts && data.gifts.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold border-b-2 border-black mb-2 text-purple-900 print:text-black">DONS SOBRENATURAIS</h2>
                            <div className="space-y-2">
                                {data.gifts.map((gift, i) => (
                                    <div key={i} className="text-sm border-b border-gray-300 pb-1 flex justify-between">
                                        <div>
                                            <span className="font-bold mr-1">★</span>
                                            {gift.name}
                                        </div>
                                        {gift.level && gift.level > 1 && (
                                            <span className="font-bold text-xs">[NV {gift.level}]</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Maneuvers */}
                <div>
                    <h2 className="text-xl font-bold border-b-2 border-black mb-2">MANOBRAS</h2>
                    <div className="space-y-2">
                        {data.maneuvers.map((m, i) => (
                            <div key={i} className="text-sm border-b border-gray-300 pb-1">
                                <span className="font-bold mr-1">◆</span>
                                {m.name}
                            </div>
                        ))}
                        {/* Empty lines */}
                        {Array.from({ length: Math.max(0, 10 - data.maneuvers.length) }).map((_, i) => (
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
                            <StressBox type="" count={data.stress.physical} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-sm mb-2">ESTRESSE MENTAL (VONTADE)</h3>
                        <div className="flex gap-2">
                            <StressBox type="" count={data.stress.mental} />
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

            {/* Notes Section */}
            <div className="mt-8 border-2 border-black p-4 rounded-lg h-[150px]">
                <h2 className="text-xl font-bold border-b border-black mb-2 uppercase">ANOTAÇÕES</h2>
                <div className="text-sm whitespace-pre-wrap">
                    {data.notes}
                </div>
            </div>
        </div>
    );
};
