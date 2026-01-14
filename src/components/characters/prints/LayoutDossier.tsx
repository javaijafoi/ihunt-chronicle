import { PrintData } from './printUtils';
import { StressBox } from './PrintComponents';

export const LayoutDossier = ({ data }: { data: PrintData }) => (
    <div className="max-w-[210mm] mx-auto bg-gray-100 p-8 min-h-[297mm] shadow-lg print:shadow-none print:w-full print:bg-white print:mx-0">
        <div className="grid grid-cols-3 gap-4 border-4 border-gray-800 p-1 bg-white h-full">

            {/* Header Block */}
            <div className="col-span-3 border border-gray-800 p-4 flex justify-between items-center bg-gray-100">
                <div>
                    <h1 className="font-mono text-3xl font-bold uppercase tracking-widest text-black">{data.name}</h1>
                    <p className="font-mono text-xs uppercase text-gray-700">ID: {data.archetype}</p>
                </div>
                <div className="text-right font-mono text-xs text-black">
                    <div>REF: {data.refresh} // FATE: {data.fatePoints}</div>
                    <div>CLASSIFIED</div>
                </div>
            </div>

            {/* Aspects Block */}
            <div className="col-span-2 border border-gray-800 p-4">
                <h3 className="font-mono font-bold border-b border-black mb-2 uppercase text-sm">Perfil Psicológico (Aspectos)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-2 border border-gray-400 bg-gray-100">
                        <span className="font-mono text-[10px] block text-gray-600">ALTO CONCEITO</span>
                        <span className="font-bold text-black">{data.aspects.highConcept}</span>
                    </div>
                    <div className="p-2 border border-gray-400 bg-gray-100">
                        <span className="font-mono text-[10px] block text-gray-600">DRAMA</span>
                        <span className="font-bold text-black">{data.aspects.drama}</span>
                    </div>
                    <div className="col-span-2 p-2 border border-gray-400">
                        <span className="font-mono text-[10px] block text-gray-600">OUTROS</span>
                        <span className="text-sm text-black">{[data.aspects.job, data.aspects.dreamBoard, ...data.aspects.free].filter(Boolean).join(", ")}</span>
                    </div>
                </div>
            </div>

            {/* Stats Block */}
            <div className="col-span-1 border border-gray-800 p-4 bg-gray-50">
                <h3 className="font-mono font-bold border-b border-black mb-2 uppercase text-sm">Status</h3>
                <StressBox type="Físico" count={data.stress.physical} />
                <div className="h-4"></div>
                <StressBox type="Mental" count={data.stress.mental} />
            </div>

            {/* Skills Block */}
            <div className="col-span-1 border border-gray-800 p-4">
                <h3 className="font-mono font-bold border-b border-black mb-2 uppercase text-sm">Capacidades</h3>
                <ul className="text-sm space-y-2 font-mono">
                    <li className="font-bold text-black border-b border-dashed border-gray-400 pb-1">{data.skills.superb[0] || '-'}</li>
                    <li className="pl-2 border-b border-dashed border-gray-400 pb-1 text-black">{data.skills.great.join(", ") || '-'}</li>
                    <li className="pl-4 border-b border-dashed border-gray-400 pb-1 text-xs text-black">{data.skills.fair.join(", ") || '-'}</li>
                    <li className="pl-6 text-[10px] text-gray-800">{data.skills.average.join(", ") || '-'}</li>
                </ul>
            </div>

            {/* Stunts Block */}
            <div className="col-span-2 border border-gray-800 p-4">
                <h3 className="font-mono font-bold border-b border-black mb-2 uppercase text-sm">Operações Especiais</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[...data.maneuvers, ...data.gifts].map((m, i) => (
                        <div key={i} className="border border-gray-400 p-2 text-xs">
                            <strong className="font-mono block border-b border-gray-300 mb-1 text-black">{m.name}</strong>
                            <span className="text-gray-900">{m.desc}</span>
                        </div>
                    ))}
                    {data.maneuvers.length === 0 && data.gifts.length === 0 && <div className="text-gray-500 text-xs italic">Nenhuma operação especial.</div>}
                </div>
            </div>

            {/* Footer / Notes */}
            <div className="col-span-3 border border-gray-800 p-4 min-h-[100px] bg-grid-pattern">
                <h3 className="font-mono text-xs text-gray-600 mb-2">NOTAS DE CAMPO</h3>
                <div className="font-mono text-xs whitespace-pre-wrap text-black">{data.notes}</div>
            </div>
        </div>
    </div>
);
