import { PrintData } from './printUtils';

export const LayoutMinimal = ({ data }: { data: PrintData }) => (
    <div className="max-w-[210mm] mx-auto bg-white p-8 min-h-[297mm] shadow-lg print:shadow-none print:w-full font-mono text-sm print:mx-0">
        <div className="mb-8 border-b border-black pb-4">
            <div className="flex justify-between items-baseline">
                <h1 className="text-2xl font-bold">{data.name.toUpperCase()}</h1>
                <span>{data.archetype}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-12">
            <div>
                <div className="mb-8">
                    <h2 className="font-bold underline mb-4 text-black">ASPECTOS</h2>
                    <ul className="space-y-3">
                        <li><span className="text-gray-700 mr-2 font-bold">[CONCEITO]</span><span className="text-black">{data.aspects.highConcept}</span></li>
                        <li><span className="text-gray-700 mr-2 font-bold">[DRAMA]</span><span className="text-black">{data.aspects.drama}</span></li>
                        <li><span className="text-gray-700 mr-2 font-bold">[EMPREGO]</span><span className="text-black">{data.aspects.job}</span></li>
                        <li><span className="text-gray-700 mr-2 font-bold">[SONHOS]</span><span className="text-black">{data.aspects.dreamBoard}</span></li>
                    </ul>
                </div>

                <div className="mb-8">
                    <h2 className="font-bold underline mb-4">PERÍCIAS</h2>
                    <div className="grid grid-cols-[30px_1fr] gap-y-2">
                        <span className="font-bold">+4</span> <span>{data.skills.superb.join(", ")}</span>
                        <span className="font-bold">+3</span> <span>{data.skills.great.join(", ")}</span>
                        <span className="font-bold">+2</span> <span>{data.skills.fair.join(", ")}</span>
                        <span className="font-bold">+1</span> <span>{data.skills.average.join(", ")}</span>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="font-bold underline mb-4">ESTADO</h2>
                    <div className="flex justify-between w-2/3">
                        <div>
                            <div className="mb-1">FÍSICO: [ ] [ ] [ ]</div>
                            <div>MENTAL: [ ] [ ] [ ]</div>
                        </div>
                        <div>
                            <div>PD: {data.fatePoints}</div>
                            <div>REC: {data.refresh}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="mb-8">
                    <h2 className="font-bold underline mb-4">MANOBRAS & DONS</h2>
                    <ul className="space-y-4">
                        {[...data.maneuvers, ...data.gifts].map((m, i) => (
                            <li key={i}>
                                <div className="font-bold uppercase mb-1 text-black">{m.name}</div>
                                <div className="text-gray-900 text-xs">{m.desc}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto pt-8 border-t border-dotted border-black">
                    <p className="text-gray-600 text-xs font-bold">NOTAS:</p>
                    <div className="whitespace-pre-wrap text-black">{data.notes}</div>
                </div>
            </div>
        </div>
    </div>
);
