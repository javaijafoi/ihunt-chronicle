import { useState } from 'react';
import { Camera, Search, SlidersHorizontal, Trash2, Maximize2, X, Plus } from 'lucide-react';
import { Selfie } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface SelfieMuralProps {
    selfies: Selfie[];
    onAddSelfie?: () => void;
    onDeleteSelfie?: (id: string) => void;
    onViewSelfie?: (selfie: Selfie) => void;
    readOnly?: boolean;
}

export function SelfieMural({ selfies, onAddSelfie, onDeleteSelfie, onViewSelfie, readOnly }: SelfieMuralProps) {
    const [filter, setFilter] = useState<'all' | 'mood' | 'auge' | 'mudanca'>('all');
    const [selectedSelfie, setSelectedSelfie] = useState<Selfie | null>(null);

    const filteredSelfies = selfies.filter(s => {
        if (filter === 'all') return true;
        return s.type === filter;
    });

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header / Controls */}
            <div className="flex items-center justify-between gap-4 p-2 bg-muted/20 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {(['all', 'mood', 'auge', 'mudanca'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap capitalize ${filter === type
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {type === 'all' ? 'Todas' : type}
                        </button>
                    ))}
                </div>

                {!readOnly && onAddSelfie && (
                    <button
                        onClick={onAddSelfie}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold"
                    >
                        <Camera className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Nova Selfie</span>
                    </button>
                )}
            </div>

            {/* Grid */}
            {filteredSelfies.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
                    <Camera className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Nenhuma selfie encontrada</p>
                    <p className="text-xs opacity-60">
                        {filter !== 'all' ? `Tente mudar o filtro de "${filter}"` : "Capture momentos importantes para ganhar XP"}
                    </p>
                    {!readOnly && onAddSelfie && filter === 'all' && (
                        <button
                            onClick={onAddSelfie}
                            className="mt-4 text-xs underline hover:text-primary transition-colors"
                        >
                            Tirar primeira selfie
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1 pb-2 min-h-0">
                    {!readOnly && onAddSelfie && (
                        <button
                            onClick={onAddSelfie}
                            className="aspect-[3/4] rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">Adicionar</span>
                        </button>
                    )}
                    <AnimatePresence mode="popLayout">
                        {filteredSelfies.map((selfie) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={selfie.id}
                                className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-black border border-white/10 shadow-sm hover:shadow-md transition-all"
                            >
                                <img
                                    src={selfie.url}
                                    alt={selfie.description}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                                {/* Badge Type */}
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                                    {selfie.type}
                                </div>

                                {/* Actions Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                                    <button
                                        onClick={() => setSelectedSelfie(selfie)}
                                        className="p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors"
                                        title="Ver detalhes"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                    {!readOnly && onDeleteSelfie && (
                                        <button
                                            onClick={() => onDeleteSelfie(selfie.id)}
                                            className="p-2 rounded-full bg-black/50 text-white hover:bg-destructive hover:text-white transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Footer Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                                        {selfie.description}
                                    </p>
                                    <p className="text-white/50 text-[10px] mt-1">
                                        {new Date(selfie.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Lightbox Modal */}
            <Dialog open={!!selectedSelfie} onOpenChange={(open) => !open && setSelectedSelfie(null)}>
                <DialogContent className="max-w-3xl bg-black/95 border-white/10 p-0 overflow-hidden">
                    {selectedSelfie && (
                        <div className="relative flex flex-col md:flex-row h-[80vh]">
                            {/* Image Container */}
                            <div className="flex-1 relative bg-black flex items-center justify-center">
                                <img
                                    src={selectedSelfie.url}
                                    alt={selectedSelfie.description}
                                    className="max-h-full max-w-full object-contain"
                                />
                                <button
                                    onClick={() => setSelectedSelfie(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white md:hidden"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Sidebar Details */}
                            <div className="w-full md:w-80 bg-background/5 p-6 flex flex-col border-l border-white/10 overflow-y-auto">
                                <div className="mb-4">
                                    <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                                        {selectedSelfie.type}
                                    </span>
                                </div>

                                <h3 className="text-xl font-display text-white mb-4">
                                    {selectedSelfie.description}
                                </h3>

                                <div className="space-y-4 text-sm text-muted-foreground">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-white/50 mb-1">Data</h4>
                                        <p>{new Date(selectedSelfie.createdAt).toLocaleString()}</p>
                                    </div>


                                </div>

                                <div className="mt-auto pt-6">
                                    {!readOnly && onDeleteSelfie && (
                                        <button
                                            onClick={() => {
                                                onDeleteSelfie(selectedSelfie.id);
                                                setSelectedSelfie(null);
                                            }}
                                            className="w-full py-2 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" /> Excluir Selfie
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
