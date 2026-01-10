import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, PlayCircle, AlertTriangle } from 'lucide-react';
import { SafetyState } from '@/types/safety';

interface XCardOverlayProps {
    safetyState: SafetyState;
    currentUserId?: string;
    isGM: boolean;
    onResolve: () => void;
}

export function XCardOverlay({
    safetyState,
    currentUserId,
    isGM,
    onResolve
}: XCardOverlayProps) {
    if (!safetyState.isPaused) return null;

    const isXCard = !!safetyState.xCardTriggeredBy;
    const canResolve = isGM || (isXCard && safetyState.xCardTriggeredBy === currentUserId) || (!isXCard); // If simple pause, anyone can resolve

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-8"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-2xl w-full text-center space-y-8"
                >
                    {isXCard ? (
                        <>
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse" />
                                <XCircle className="w-32 h-32 text-red-600 mx-auto relative z-10 drop-shadow-[0_0_25px_rgba(220,38,38,0.5)]" />
                            </div>
                            <h1 className="font-display text-6xl text-red-500 uppercase tracking-widest text-shadow-lg">
                                Cartão X
                            </h1>
                            <p className="text-2xl text-muted-foreground font-ui max-w-xl mx-auto">
                                O jogo foi interrompido.
                                <br />
                                <span className="text-sm opacity-70 mt-4 block">
                                    Aguarde até que o solicitante ou o Mestre retomem a sessão.
                                    Não é necessário justificar ou explicar o motivo.
                                </span>
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 animate-pulse" />
                                <AlertTriangle className="w-32 h-32 text-yellow-500 mx-auto relative z-10 drop-shadow-[0_0_25px_rgba(234,179,8,0.5)]" />
                            </div>
                            <h1 className="font-display text-5xl text-yellow-500 uppercase tracking-widest">
                                Intervalo Comercial
                            </h1>
                            <p className="text-xl text-muted-foreground font-ui">
                                Pausa solicitada. Respirem, bebam água.
                            </p>
                        </>
                    )}

                    {canResolve && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onResolve}
                            className="mt-12 px-8 py-4 bg-primary text-primary-foreground rounded-xl flex items-center gap-3 mx-auto font-display text-xl shadow-lg hover:shadow-primary/25 transition-all"
                        >
                            <PlayCircle className="w-6 h-6" />
                            RETOMAR SESSÃO
                        </motion.button>
                    )}

                    {!canResolve && isXCard && (
                        <p className="text-sm text-muted-foreground animate-pulse">
                            Aguardando resolução...
                        </p>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
