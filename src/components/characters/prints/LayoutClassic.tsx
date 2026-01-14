import { PrintData } from './printUtils';
import { SectionTitle, AspectItem, SkillRow, StressBox, Card } from './PrintComponents';

export const LayoutClassic = ({ data }: { data: PrintData }) => (
    <div className="max-w-[210mm] mx-auto bg-white p-8 min-h-[297mm] shadow-lg print:shadow-none print:w-full print:mx-0">
        {/* Header */}
        <div className="flex justify-between items-end border-b-4 border-black pb-4 mb-8">
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-black">{data.name}</h1>
                <p className="text-lg font-serif italic text-gray-900">{data.archetype}</p>
            </div>
            <div className="text-right text-sm max-w-xs text-gray-800">
                Recarga: <span className="font-bold text-black text-xl ml-1">{data.refresh}</span> |
                PD: <span className="font-bold text-black text-xl ml-1">{data.fatePoints}</span>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
            {/* Coluna Esquerda: Core Stats */}
            <div className="col-span-5 flex flex-col gap-8">
                <section>
                    <SectionTitle>Aspectos</SectionTitle>
                    <AspectItem label="Alto Conceito" value={data.aspects.highConcept} />
                    <AspectItem label="Drama" value={data.aspects.drama} />
                    <AspectItem label="Emprego" value={data.aspects.job} />
                    <AspectItem label="Sonhos" value={data.aspects.dreamBoard} />
                    {data.aspects.free.map((f, i) => <AspectItem key={i} label="Livre" value={f} />)}
                </section>

                <section>
                    <SectionTitle>Perícias</SectionTitle>
                    <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg">
                        <SkillRow label="+4" skills={data.skills.superb} />
                        <SkillRow label="+3" skills={data.skills.great} />
                        <SkillRow label="+2" skills={data.skills.fair} />
                        <SkillRow label="+1" skills={data.skills.average} />
                    </div>
                </section>

                <section>
                    <SectionTitle>Estresse & Consequências</SectionTitle>
                    <div className="flex justify-around bg-white border border-gray-400 p-4 rounded">
                        <StressBox type="Físico" count={data.stress.physical} />
                        <StressBox type="Mental" count={data.stress.mental} />
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex gap-2 items-center"><span className="w-6 h-6 border border-gray-400 rounded-full text-center text-xs pt-1">2</span> <div className="border-b border-gray-300 w-full h-6 flex items-center px-1 text-xs text-gray-400 font-bold">SUAVE</div></div>
                        <div className="flex gap-2 items-center"><span className="w-6 h-6 border border-gray-400 rounded-full text-center text-xs pt-1">4</span> <div className="border-b border-gray-300 w-full h-6 flex items-center px-1 text-xs text-gray-400 font-bold">MODERADA</div></div>
                        <div className="flex gap-2 items-center"><span className="w-6 h-6 border border-gray-400 rounded-full text-center text-xs pt-1">6</span> <div className="border-b border-gray-300 w-full h-6 flex items-center px-1 text-xs text-gray-400 font-bold">SEVERA</div></div>
                    </div>
                </section>
            </div>

            {/* Coluna Direita: Detalhes & Poderes */}
            <div className="col-span-7 flex flex-col gap-6">
                <div className="bg-gray-100 p-4 rounded text-sm italic text-gray-900 border-l-4 border-gray-800 text-justify">
                    <span className="font-bold not-italic block mb-1 text-black">Descrição/Conceito</span>
                    "{data.description}"
                </div>

                <section>
                    <SectionTitle>Manobras</SectionTitle>
                    <div className="grid grid-cols-1 gap-2">
                        {data.maneuvers.map((m, i) => <Card key={i} title={m.name} desc={m.desc} />)}
                        {data.maneuvers.length === 0 && <div className="text-gray-400 text-sm italic">Nenhuma manobra selecionada.</div>}
                    </div>
                </section>

                {data.gifts.length > 0 && (
                    <section>
                        <SectionTitle>Dons Sobrenaturais</SectionTitle>
                        <div className="grid grid-cols-1 gap-2">
                            {data.gifts.map((g, i) => (
                                <Card
                                    key={i}
                                    title={g.level ? `${g.name} (Nível ${g.level})` : g.name}
                                    desc={g.desc}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <section className="mt-auto pt-8">
                    <SectionTitle>Anotações</SectionTitle>
                    <div className="h-32 border border-gray-400 rounded p-2 text-black text-sm whitespace-pre-wrap font-mono">
                        {data.notes}
                    </div>
                </section>
            </div>
        </div>
    </div>
);
