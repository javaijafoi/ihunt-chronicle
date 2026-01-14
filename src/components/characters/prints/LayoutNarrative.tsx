import { PrintData } from './printUtils';

export const LayoutNarrative = ({ data }: { data: PrintData }) => (
    <div className="max-w-[210mm] mx-auto bg-white p-12 min-h-[297mm] shadow-lg print:shadow-none print:w-full print:mx-0">
        <div className="text-center mb-12">
            <h1 className="font-serif text-5xl italic text-gray-900 mb-2">{data.name}</h1>
            <p className="font-sans text-sm tracking-widest uppercase text-gray-700">{data.archetype}</p>
        </div>

        <div className="space-y-12">
            {/* Aspectos como Frases */}
            <div className="text-center space-y-6">
                <div>
                    <span className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">Eu sou...</span>
                    <p className="text-3xl font-serif leading-tight text-black">{data.aspects.highConcept || '...'}</p>
                </div>
                <div>
                    <span className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">Mas meu problema é...</span>
                    <p className="text-2xl font-serif text-black">{data.aspects.drama || '...'}</p>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-300">
                    <div>
                        <span className="block text-xs font-bold text-gray-600 uppercase mb-1">O que faço</span>
                        <p className="text-lg font-serif text-black">{data.aspects.job || '...'}</p>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-gray-600 uppercase mb-1">O que desejo</span>
                        <p className="text-lg font-serif text-black">{data.aspects.dreamBoard || '...'}</p>
                    </div>
                </div>
            </div>

            {/* Colunas de Dados Secundários */}
            <div className="grid grid-cols-2 gap-12 border-t-2 border-gray-900 pt-8">
                <div>
                    <h3 className="font-sans font-bold text-lg mb-4">O que sei fazer</h3>
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between border-b border-gray-300 pb-1">
                            <span className="text-lg font-bold text-black">{data.skills.superb[0] || '-'}</span>
                            <span className="text-sm font-mono text-gray-600">+4</span>
                        </div>
                        {data.skills.great.map(s => (
                            <div key={s} className="flex items-baseline justify-between border-b border-gray-300 pb-1">
                                <span className="text-md text-black">{s}</span>
                                <span className="text-sm font-mono text-gray-600">+3</span>
                            </div>
                        ))}
                        <div className="text-sm text-gray-800 pt-2">
                            Também bom em: {data.skills.fair.map(s => s.split(' ')[0]).join(", ")}.
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-sans font-bold text-lg mb-4">Truques & Dons</h3>
                    <ul className="space-y-4">
                        {[...data.maneuvers, ...data.gifts].slice(0, 4).map((m, i) => (
                            <li key={i}>
                                <strong className="block font-serif text-lg text-black">{m.name}</strong>
                                <span className="text-sm text-gray-800 leading-relaxed">{m.desc}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex justify-center gap-12 pt-8">
                <div className="text-center">
                    <div className="font-bold uppercase tracking-widest text-sm mb-2 text-black">Físico</div>
                    <div className="flex gap-3">
                        {[1, 2, 3].map(n => <div key={n} className="w-6 h-6 rounded-full border border-black"></div>)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="font-bold uppercase tracking-widest text-sm mb-2 text-black">Mental</div>
                    <div className="flex gap-3">
                        {[1, 2, 3].map(n => <div key={n} className="w-6 h-6 rounded-full border border-black"></div>)}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
