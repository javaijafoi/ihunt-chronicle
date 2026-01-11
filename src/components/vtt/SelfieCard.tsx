import { motion } from 'framer-motion';
import { Camera, CheckCircle2, Heart, Lock, MoreVertical, Sparkles, Trash2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Selfie, SelfieType } from '@/types/game';
import { cn } from '@/lib/utils';

interface SelfieCardProps {
    selfie: Selfie;
    onUse?: (selfie: Selfie) => void;
    onDelete?: (selfieId: string) => void;
    readOnly?: boolean;
}

export function SelfieCard({ selfie, onUse, onDelete, readOnly }: SelfieCardProps) {
    const getTypeIcon = (type: SelfieType) => {
        switch (type) {
            case 'mood': return <Sparkles className="w-3 h-3" />;
            case 'auge': return <Trophy className="w-3 h-3" />;
            case 'mudanca': return <Heart className="w-3 h-3" />;
        }
    };

    const getTypeColor = (type: SelfieType) => {
        switch (type) {
            case 'mood': return 'border-blue-500/50 shadow-blue-500/20';
            case 'auge': return 'border-amber-500/50 shadow-amber-500/20';
            case 'mudanca': return 'border-red-500/50 shadow-red-500/20';
        }
    };

    const getTypeLabel = (type: SelfieType) => {
        switch (type) {
            case 'mood': return 'Mood';
            case 'auge': return 'Auge';
            case 'mudanca': return 'Mudança';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "group relative bg-card rounded-xl border-2 overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:rotate-1",
                getTypeColor(selfie.type),
                !selfie.isAvailable && "opacity-60 grayscale-[0.5]"
            )}
        >
            {/* Polaroid Image Area */}
            <div className="aspect-[4/5] relative p-3 pb-12 bg-white dark:bg-zinc-900">
                <div className="relative w-full h-full rounded overflow-hidden border border-black/10 dark:border-white/10">
                    <img
                        src={selfie.url}
                        alt={selfie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Unavailable Overlay */}
                    {!selfie.isAvailable && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            <Lock className="w-8 h-8 text-white/80" />
                        </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-black/50 text-white backdrop-blur-md border-none flex gap-1">
                            {getTypeIcon(selfie.type)}
                            {getTypeLabel(selfie.type)}
                        </Badge>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                        {selfie.isAvailable ? (
                            <Badge className="h-5 px-1.5 bg-green-500/90 text-[10px] border-none">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Ativa
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="h-5 px-1.5 bg-black/50 text-white border-white/20 text-[10px]">
                                Usada
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Polaroid Caption Area */}
                <div className="absolute bottom-0 left-0 right-0 h-12 px-3 flex items-center justify-center">
                    <p className="font-handwriting text-center text-sm truncate w-full text-black dark:text-white">
                        {selfie.title}
                    </p>
                </div>
            </div>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2 backdrop-blur-[2px]">
                <p className="text-white text-xs text-center line-clamp-3 mb-2 px-2">
                    {selfie.description}
                </p>

                {selfie.isAvailable ? (
                    <Button
                        size="sm"
                        variant="default"
                        className="w-full rounded-full bg-white text-black hover:bg-zinc-200 font-medium"
                        onClick={() => onUse?.(selfie)}
                    >
                        Lembrar (+Bonus)
                    </Button>
                ) : (
                    <span className="text-white/60 text-xs italic">
                        Disponível no próximo episódio
                    </span>
                )}

                {!readOnly && onDelete && (
                    <div className="absolute top-2 right-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={() => onDelete(selfie.id)}
                                    className="text-destructive focus:text-destructive gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Apagar Memória
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
