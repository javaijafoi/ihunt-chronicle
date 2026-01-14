import { PrintData } from './printUtils';
import { SectionTitle, StressBox } from './PrintComponents';

export const LayoutLandscape = ({ data }: { data: PrintData }) => (
    <div className="max-w-[297mm] mx-auto bg-white p-8 min-h-[210mm] shadow-lg print:shadow-none print:w-full print:landscape print:mx-0">
        {/* Header Compacto */}
        <div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-2">
            <h1 className="text-2xl font-black uppercase text-black">{data.name}</h1>
            <span className="text-gray-600">|</span>
            <span className="font-serif italic text-black">{data.archetype}</span>
            <div className="ml-auto flex gap-4 text-sm">
                <div className="border border-black px-3 py-1 rounded">PD: <strong>{data.fatePoints}</strong></div>
                <div className="border border-black px-3 py-1 rounded">Recarga: <strong>{data.refresh}</strong></div>
            </div>
        </div>

        <div className="grid grid-cols-4 gap-6 h-full">
            {/* Coluna 1: Identidade e Estresse */}
            <div className="col-span-1 flex flex-col gap-6 border-r border-dashed border-gray-300 pr-4">
                <section>
                    <SectionTitle>Estresse</SectionTitle>
                    <div className="space-y-4">
                        <StressBox type="Físico" count={data.stress.physical} />
                        <StressBox type="Mental" count={data.stress.mental} />
                    </div>
                </section>
                <section>
                    <SectionTitle>Consequências</SectionTitle>
                    <div className="space-y-3 text-sm">
                        <div className="border border-gray-400 p-2 rounded h-8 bg-gray-100 flex items-center justify-between"><span className="text-xs font-bold text-gray-600">SUAVE (2)</span></div>
                        <div className="border border-gray-400 p-2 rounded h-8 bg-gray-100 flex items-center justify-between"><span className="text-xs font-bold text-gray-600">MODERADA (4)</span></div>
                        <div className="border border-gray-400 p-2 rounded h-8 bg-gray-100 flex items-center justify-between"><span className="text-xs font-bold text-gray-600">GRAVE (6)</span></div>
                    </div>
                </section>
            </div>

            {/* Coluna 2: Aspectos (Central Narrativo) */}
            <div className="col-span-1 flex flex-col gap-4">
                <SectionTitle>Aspectos</SectionTitle>
                <div className="space-y-4">
                    <div className="bg-black text-white p-3 rounded shadow-md">
                        <div className="text-[10px] uppercase opacity-70">Alto Conceito</div>
                        <div className="font-bold leading-tight">{data.aspects.highConcept || '...'}</div>
                    </div>
                    <div className="bg-gray-800 text-white p-3 rounded shadow-md">
                        <div className="text-[10px] uppercase opacity-70">Drama</div>
                        <div className="font-bold leading-tight">{data.aspects.drama || '...'}</div>
                    </div>
                    <div className="p-2 border-l-2 border-gray-400">
                        <div className="text-[10px] uppercase text-gray-600">Emprego</div>
                        <div className="font-medium text-black">{data.aspects.job || '...'}</div>
                    </div>
                    {data.aspects.free.map((f, i) => (
                        <div key={i} className="p-2 border-l-2 border-gray-400">
                            <div className="text-[10px] uppercase text-gray-600">Livre</div>
                            <div className="font-medium text-black">{f}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coluna 3: Perícias (Referência Rápida) */}
            <div className="col-span-1">
                <SectionTitle>Pirâmide de Perícias</SectionTitle>
                <div className="flex flex-col items-center gap-2 mt-4">
                    <div className="w-full bg-gray-200 p-2 text-center rounded border border-gray-400 font-bold text-black">{data.skills.superb[0] || '-'}</div>
                    <div className="w-full grid grid-cols-2 gap-2">
                        {Array.from({ length: 2 }).map((_, i) => <div key={i} className="bg-white p-2 text-center rounded border border-gray-300 text-sm text-black">{data.skills.great[i] || '-'}</div>)}
                    </div>
                    <div className="w-full grid grid-cols-3 gap-1">
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white p-1 text-center rounded border border-gray-300 text-xs text-black">{data.skills.fair[i] || '-'}</div>)}
                    </div>
                    <div className="w-full grid grid-cols-4 gap-1">
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white p-1 text-center rounded border border-gray-300 text-[10px] text-black">{data.skills.average[i] || '-'}</div>)}
                    </div>
                </div>
            </div>

            {/* Coluna 4: Poderes (Texto Denso) */}
            <div className="col-span-1 overflow-hidden">
                <SectionTitle>Habilidades</SectionTitle>
                <div className="text-xs space-y-3">
                    {[...data.maneuvers, ...data.gifts].map((item, i) => (
                        <div key={i}>
                            <span className="font-bold block text-black">{item.name}</span>
                            <span className="text-gray-800 leading-tight">{item.desc}</span>
                        </div>
                    ))}
                    {data.maneuvers.length === 0 && data.gifts.length === 0 && <div className="text-gray-500 italic">Nenhuma habilidade.</div>}
                </div>
            </div>
        </div>
    </div>
);
