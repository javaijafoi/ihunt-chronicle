import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Crown, Skull } from "lucide-react";
import { motion } from "framer-motion";

export const HomePage = () => {
    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-900/20 to-transparent" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="relative z-10 max-w-4xl w-full space-y-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-block px-3 py-1 bg-red-950/30 border border-red-900/50 rounded-full text-red-500 text-xs font-bold uppercase tracking-widest mb-4">
                        Virtual Tabletop System
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                        <span className="text-red-600">#i</span>HUNT <span className="text-neutral-800">CHRONICLE</span>
                    </h1>
                    <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto">
                        A plataforma definitiva para gerenciar suas caçadas. Crie monstros, organize suas crônicas e role os dados.
                    </p>
                </motion.div>

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: Lobby/Login */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link to="/lobby" className="group block h-full">
                            <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-2xl h-full transition-all group-hover:bg-neutral-900 group-hover:border-red-900/50 group-hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Crown className="w-32 h-32" />
                                </div>

                                <div className="relative z-10 space-y-4">
                                    <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-red-900/20 group-hover:text-red-500 transition-colors">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Acessar Crônicas</h3>
                                        <p className="text-neutral-400">
                                            Entrar no sistema para mestrar jogos, gerenciar personagens e acessar suas mesas.
                                        </p>
                                    </div>
                                    <div className="flex items-center text-sm font-bold text-neutral-500 group-hover:text-red-500 transition-colors pt-4">
                                        ENTRAR NA PLATAFORMA <ArrowRight className="w-4 h-4 ml-2" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Card 2: Monsters */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link to="/monsters" className="group block h-full">
                            <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-2xl h-full transition-all group-hover:bg-neutral-900 group-hover:border-orange-900/50 group-hover:shadow-[0_0_30px_rgba(234,88,12,0.1)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Skull className="w-32 h-32" />
                                </div>

                                <div className="relative z-10 space-y-4">
                                    <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-orange-900/20 group-hover:text-orange-500 transition-colors">
                                        <Skull className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Criador de Monstros</h3>
                                        <p className="text-neutral-400">
                                            Ferramenta pública para criar fichas de ameaças com visual moderno e exportação em PDF.
                                        </p>
                                    </div>
                                    <div className="flex items-center text-sm font-bold text-neutral-500 group-hover:text-orange-500 transition-colors pt-4">
                                        CRIAR MONSTRO AGORA <ArrowRight className="w-4 h-4 ml-2" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="text-center pt-12 border-t border-neutral-900">
                    <p className="text-xs text-neutral-600">
                        &copy; {new Date().getFullYear()} iHunt Chronicle. Fan-made tool for iHunt RPG.
                    </p>
                </div>
            </div>
        </div>
    );
};
