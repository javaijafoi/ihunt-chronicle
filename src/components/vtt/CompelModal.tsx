import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ThumbsUp, ThumbsDown, Coins } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useGameActions } from '@/hooks/useGameActions';
import { usePartyCharacters } from '@/hooks/usePartyCharacters';

interface CompelRequest {
    id: string;
    targetCharacterId: string;
    aspectName: string;
    complication: string;
    source: 'gm';
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Timestamp;
}

export function CompelModal({ campaignId, myCharacterId }: { campaignId: string; myCharacterId?: string }) {
    const [request, setRequest] = useState<CompelRequest | null>(null);
    const { updateFate, addLog } = useGameActions('', campaignId, false); // EpisodeId might be needed?
    // We'll fetch episodeId dynamically if needed or just pass empty if log doesn't strictly require it (GameLog usually does)
    // Ideally passed as prop, but let's assume loose coupling for now.

    useEffect(() => {
        if (!campaignId || !myCharacterId) return;

        const q = query(
            collection(db, 'campaigns', campaignId, 'pendingCompels'),
            where('targetCharacterId', '==', myCharacterId),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                // Show the most recent one
                const data = snapshot.docs[0].data() as CompelRequest;
                setRequest({ ...data, id: snapshot.docs[0].id });
            } else {
                setRequest(null);
            }
        });

        return () => unsubscribe();
    }, [campaignId, myCharacterId]);

    const handleResponse = async (accept: boolean) => {
        if (!request) return;

        try {
            if (accept) {
                await updateFate(request.targetCharacterId, 1, true);
                await addLog(`Aceitou a forçada em "${request.aspectName}". (+1 FP)`, 'fate');
                await updateDoc(doc(db, 'campaigns', campaignId, 'pendingCompels', request.id), { status: 'accepted' });
            } else {
                await updateFate(request.targetCharacterId, -1, true);
                await addLog(`Recusou a forçada em "${request.aspectName}". (-1 FP)`, 'fate');
                await updateDoc(doc(db, 'campaigns', campaignId, 'pendingCompels', request.id), { status: 'rejected' });
            }
            // Cleanup happens via status change -> useEffect will see empty or filtered out
            // Ideally delete the doc after a while or immediately
            await deleteDoc(doc(db, 'campaigns', campaignId, 'pendingCompels', request.id));

            setRequest(null);
        } catch (e) {
            console.error(e);
        }
    };

    if (!request) return null;

    return (
        <AnimatePresence>
            <Dialog open={!!request} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-md border-amber-500/50 bg-amber-950/90 text-amber-50 p-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center text-center space-y-4"
                    >
                        <div className="p-3 bg-amber-500/20 rounded-full">
                            <Coins className="w-8 h-8 text-amber-400" />
                        </div>

                        <h2 className="font-display text-2xl text-amber-200">Forçar Aspecto</h2>

                        <div className="w-full space-y-2 bg-black/20 p-4 rounded-lg border border-amber-500/20">
                            <p className="text-xs font-bold uppercase text-amber-400 tracking-wider">Aspecto</p>
                            <p className="text-lg font-bold">{request.aspectName}</p>
                        </div>

                        <div className="w-full space-y-2">
                            <p className="text-xs font-bold uppercase text-amber-400 tracking-wider">Complicação</p>
                            <p className="text-sm leading-relaxed italic opacity-90">"{request.complication}"</p>
                        </div>

                        <div className="flex gap-4 w-full pt-4">
                            <Button
                                variant="outline"
                                className="flex-1 border-red-500/50 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                                onClick={() => handleResponse(false)}
                            >
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                Recusar (-1 FP)
                            </Button>
                            <Button
                                className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-bold"
                                onClick={() => handleResponse(true)}
                            >
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                Aceitar (+1 FP)
                            </Button>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </AnimatePresence>
    );
}
