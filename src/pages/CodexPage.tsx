import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Skull, Shield, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CodexPage() {
    return (
        <div className="h-full flex flex-col bg-background text-foreground overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="icon" className="hover:bg-secondary/20">
                                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-black tracking-tighter text-primary font-mono lowercase">#iHunt</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border uppercase">Beta v2.0</span>
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground hidden sm:block font-display">Matando Monstros na Gig Economy</div>
                </div>
            </header>

            <ScrollArea className="flex-1">
                <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-20">

                    {/* Intro / Rule 0 */}
                    <section className="bg-gradient-to-r from-secondary/10 to-background rounded-xl border-l-4 border-primary p-6 shadow-md">
                        <h2 className="text-xl font-bold text-primary mb-2 flex items-center font-display">
                            <Zap className="w-6 h-6 mr-2" />
                            Regra-Mãe (O Fluxo)
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4 text-sm font-mono mt-4">
                            <div className="bg-card/50 p-3 rounded border border-border">
                                <span className="text-primary font-bold block mb-1">1. FICÇÃO</span>
                                Descreva o que você quer fazer.
                            </div>
                            <div className="bg-card/50 p-3 rounded border border-border">
                                <span className="text-blue-400 font-bold block mb-1">2. REGRAS</span>
                                Enquadre (Ação & Oposição).
                            </div>
                            <div className="bg-card/50 p-3 rounded border border-border">
                                <span className="text-rose-400 font-bold block mb-1">3. RESOLUÇÃO</span>
                                Role, ajuste e narre.
                            </div>
                        </div>
                    </section>

                    {/* Grid Layout for Core Mechanics */}
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* As 4 Ações */}
                        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                            <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2 font-display">1. As Quatro Ações</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <span className="bg-blue-900/20 text-blue-400 p-1.5 rounded mr-3 mt-0.5"><Target className="w-4 h-4" /></span>
                                    <div>
                                        <strong className="text-blue-400 block font-display">SUPERAR</strong>
                                        <span className="text-muted-foreground text-sm">Lidar com obstáculos, abrir portas, hackear.</span>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-primary/20 text-primary p-1.5 rounded mr-3 mt-0.5"><Zap className="w-4 h-4" /></span>
                                    <div>
                                        <strong className="text-primary block font-display">CRIAR VANTAGEM</strong>
                                        <span className="text-muted-foreground text-sm">Criar aspectos, mirar, pesquisar fraqueza.</span>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-rose-900/20 text-rose-400 p-1.5 rounded mr-3 mt-0.5"><Skull className="w-4 h-4" /></span>
                                    <div>
                                        <strong className="text-rose-400 block font-display">ATACAR</strong>
                                        <span className="text-muted-foreground text-sm">Causar dano (físico, mental, social).</span>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-indigo-900/20 text-indigo-400 p-1.5 rounded mr-3 mt-0.5"><Shield className="w-4 h-4" /></span>
                                    <div>
                                        <strong className="text-indigo-400 block font-display">DEFENDER</strong>
                                        <span className="text-muted-foreground text-sm">Evitar dano ou impedir vantagem inimiga.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Rolagens */}
                        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                            <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2 font-display">2. Matemática dos Dados</h3>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-muted-foreground uppercase">NORMAL</span>
                                    <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded text-secondary-foreground">-4 a +4</span>
                                </div>
                                <div className="bg-muted/50 p-2 rounded border border-border font-mono text-sm text-center">
                                    4dF + Habilidade
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-yellow-500 flex items-center uppercase">
                                        COM VANTAGEM
                                        <span className="ml-2 text-[10px] bg-yellow-900/20 text-yellow-500 border border-yellow-700/50 px-1 rounded">OP</span>
                                    </span>
                                    <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded text-secondary-foreground">-2 a +9</span>
                                </div>
                                <div className="bg-muted/50 p-2 rounded border border-yellow-500/30 font-mono text-sm text-center text-yellow-500/90">
                                    3dF + <span className="text-yellow-500 font-bold">1d6</span> + Habilidade
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 italic">
                                    * Monstros começam com a vantagem. Roube-a ou morra.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Section: Difficulty & Fate Points */}
                    <div className="grid md:grid-cols-12 gap-6">

                        {/* Progressão Ladder */}
                        <div className="md:col-span-5 bg-card rounded-xl p-6 border border-border h-full">
                            <h3 className="text-lg font-bold text-foreground mb-4 font-display">4. A Escada (Dificuldade)</h3>
                            <div className="space-y-1 text-sm font-mono">
                                <div className="flex justify-between text-purple-400 font-bold border-b border-border pb-1"><span>+8</span> <span>Lendária</span></div>
                                <div className="flex justify-between text-purple-300"><span>+6</span> <span>Incrível</span></div>
                                <div className="flex justify-between text-blue-300"><span>+4</span> <span>Grande</span></div>
                                <div className="flex justify-between text-primary"><span>+2</span> <span>Razoável (Padrão)</span></div>
                                <div className="flex justify-between text-muted-foreground"><span>0</span> <span>Medíocre</span></div>
                                <div className="flex justify-between text-rose-400"><span>-2</span> <span>Terrível</span></div>
                            </div>
                            <div className="mt-4 p-3 bg-muted/50 rounded border border-border text-xs text-muted-foreground font-mono">
                                <strong className="text-foreground">Resultados:</strong><br />
                                • Falha (&lt;)<br />
                                • Empate (=)<br />
                                • Sucesso (&gt;)<br />
                                • Estilo (&ge; +3 viradas)
                            </div>
                        </div>

                        {/* Fate Points Economy */}
                        <div className="md:col-span-7 bg-card rounded-xl p-6 border border-border h-full">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center font-display">
                                <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                                5. Economia (Pontos de Destino)
                            </h3>

                            <div className="grid gap-6">
                                {/* Gasto */}
                                <div className="border-l-2 border-rose-500 pl-4">
                                    <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wide mb-2">Gastar 1 PD</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                                        <li><strong className="text-foreground">Invocar:</strong> +2 ou Rolar de novo (pós-rolagem).</li>
                                        <li><strong className="text-foreground">Declarar:</strong> Inventar um fato útil na cena.</li>
                                        <li><strong className="text-foreground">Recusar Chamado:</strong> Evitar um problema óbvio.</li>
                                        <li><strong className="text-foreground">Apostar (Dilema):</strong> Forçar escolha ruim no inimigo.</li>
                                    </ul>
                                </div>

                                {/* Ganho */}
                                <div className="border-l-2 border-primary pl-4">
                                    <h4 className="text-sm font-bold text-primary uppercase tracking-wide mb-2">Ganhar 1 PD</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                                        <li><strong className="text-foreground">Chamado (Compel):</strong> Aceitar que seu aspecto complique sua vida.</li>
                                        <li><strong className="text-foreground">Sofrer Aposta:</strong> Ser colocado num dilema sem saída.</li>
                                        <li><strong className="text-foreground">Concessão:</strong> Perder a luta nos seus termos (sai vivo).</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Damage & Health */}
                    <section className="bg-card rounded-xl p-6 border border-rose-900/30 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Skull className="w-32 h-32 text-rose-500" />
                        </div>

                        <h3 className="text-lg font-bold text-foreground mb-6 font-display">6. Dano & Consequências</h3>

                        <div className="grid md:grid-cols-2 gap-8 relative z-10">
                            <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Cálculo de Dano</h4>
                                <div className="bg-muted p-3 rounded font-mono text-sm mb-6 border border-border">
                                    Dano = Viradas do Atacante (Ataque - Defesa)
                                </div>

                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Estresse (Zera na Cena)</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between bg-secondary/30 p-2 rounded border border-border/50">
                                        <span>Físico (Atleta)</span>
                                        <div className="flex space-x-1">
                                            <div className="w-4 h-4 border border-muted-foreground/30 rounded bg-background"></div>
                                            <div className="w-4 h-4 border border-muted-foreground/30 rounded bg-background"></div>
                                            <div className="w-4 h-4 border border-muted-foreground/30 rounded bg-background"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-secondary/30 p-2 rounded border border-border/50">
                                        <span>Mental (Sobrevivente)</span>
                                        <div className="flex space-x-1">
                                            <div className="w-4 h-4 border border-muted-foreground/30 rounded bg-background"></div>
                                            <div className="w-4 h-4 border border-muted-foreground/30 rounded bg-background"></div>
                                            <div className="w-4 h-4 border border-muted-foreground/30 rounded bg-background"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Consequências (Ficam na Ficha)</h4>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex justify-between items-center bg-yellow-900/10 border border-yellow-900/30 p-2 rounded">
                                        <span className="text-yellow-600 dark:text-yellow-400 font-bold">Leve (-2)</span>
                                        <span className="text-xs text-muted-foreground">Recuperação rápida</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-orange-900/10 border border-orange-900/30 p-2 rounded">
                                        <span className="text-orange-600 dark:text-orange-400 font-bold">Moderada (-4)</span>
                                        <span className="text-xs text-muted-foreground">Sessão inteira</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-rose-900/10 border border-rose-900/30 p-2 rounded">
                                        <span className="text-rose-600 dark:text-rose-400 font-bold">Grave (-6)</span>
                                        <span className="text-xs text-muted-foreground">Arco inteiro</span>
                                    </li>
                                </ul>
                                <div className="mt-4 text-xs text-rose-500 font-bold text-center border-t border-rose-900/10 pt-2">
                                    Se não absorver o dano = FORA DE CENA.
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Safety Tools */}
                    <section className="bg-card rounded-xl p-4 border border-border flex items-center justify-between shadow-sm">
                        <div>
                            <h3 className="font-bold text-foreground font-display">Segurança na Mesa</h3>
                            <p className="text-xs text-muted-foreground">O jogo lida com temas pesados. Respeite os limites.</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs border border-border">Tudo OK</span>
                            <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs border border-border">Fora de Cena</span>
                            <span className="px-2 py-1 rounded bg-rose-900/20 text-rose-500 text-xs border border-rose-500/30 font-bold">LIMITE (X)</span>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-border bg-muted/20 py-8">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <p className="text-muted-foreground text-xs font-mono">
                            Desenvolvido para uso interno da guilda no VTT. Baseado no sistema Fate Core.
                            <br />
                            <span className="text-primary mt-2 block">"Pague o aluguel ou morra tentando."</span>
                        </p>
                    </div>
                </footer>
            </ScrollArea>
        </div>
    );
}
