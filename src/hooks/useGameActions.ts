import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    increment,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ActionType, DiceResult, LogEntry } from '@/types/game';
import { toast } from 'sonner';

export function useGameActions(episodeId: string | undefined, campaignId: string | undefined, isGM: boolean) {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Subscribe to Logs
    useEffect(() => {
        if (!episodeId) {
            setLogs([]);
            return;
        }

        const logsRef = collection(db, 'episodes', episodeId, 'logs');
        // Removing orderBy/limit to avoid index requirement for now. 
        // Client-side sorting ensures we see data even if index is missing.
        const q = query(logsRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date()
            })) as LogEntry[];

            // Sort by timestamp ascending (Oldest first, Newest last)
            newLogs.sort((a, b) => {
                const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp as any).toDate().getTime();
                const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp as any).toDate().getTime();
                return timeA - timeB;
            });

            // Optional: Client-side limit if needed, but let's show all for context
            setLogs(newLogs);
        });

        return () => unsubscribe();
    }, [episodeId]);

    const addLog = useCallback(async (message: string, type: LogEntry['type'] = 'system', details?: any) => {
        if (!episodeId) {
            console.warn("No episodeId, cannot add log");
            return;
        }
        try {
            await addDoc(collection(db, 'episodes', episodeId, 'logs'), {
                message,
                type,
                details: details || null,
                timestamp: serverTimestamp(),
                character: 'Sistema' // TODO: pass actor name
            });
        } catch (e) {
            console.error(e);
        }
    }, [episodeId]);

    const createRollLog = useCallback(async (result: DiceResult) => {
        if (!episodeId) {
            console.warn("No episodeId, cannot log roll");
            toast.error("Nenhum episódio ativo. A rolagem não foi salva no histórico.");
            return;
        }

        try {
            // Sanitize undefined values using JSON serialization
            // This is safer than manual object manipulation for Firestore
            const safeDetails = JSON.parse(JSON.stringify({
                ...result,
                kind: 'roll',
                // Ensure timestamps are strings or handled correctly before saving
                timestamp: result.timestamp instanceof Date
                    ? result.timestamp.toISOString()
                    : (result.timestamp as any)?.toDate?.().toISOString() || new Date().toISOString()
            }));

            const logEntry = {
                type: 'roll',
                message: `${result.character} rolou ${result.action || 'dados'}`,
                character: result.character,
                details: safeDetails,
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, 'episodes', episodeId, 'logs'), logEntry);
        } catch (e) {
            console.error("Error creating roll log:", e);
            toast.error("Erro ao registrar rolagem");
        }
    }, [episodeId]);

    // Fate Points Logic
    const updateFate = useCallback(async (targetId: string, delta: number, isCharacter: boolean) => {
        try {
            if (isCharacter) {
                const charRef = doc(db, 'characters', targetId);
                await updateDoc(charRef, {
                    fatePoints: increment(delta)
                });
            } else if (isGM && episodeId) {
                const epRef = doc(db, 'episodes', episodeId);
                await updateDoc(epRef, {
                    gmFatePool: increment(delta)
                });
            }
        } catch (e) {
            console.error("Error updating fate", e);
            toast.error("Erro ao atualizar pontos de destino");
        }
    }, [episodeId, isGM]);

    // Dice Logic (Pure calculation)
    const rollDice = (
        modifier: number = 0,
        skill: string | undefined,
        action: ActionType | undefined,
        type: 'normal' | 'advantage' = 'normal',
        opposition?: number
    ): DiceResult => {
        const faces: ('plus' | 'minus' | 'blank')[] = ['plus', 'minus', 'blank'];

        let fateDice: ('plus' | 'minus' | 'blank')[];
        let diceTotal: number;
        let d6: number | undefined;

        if (type === 'advantage') {
            // 3dF + d6 for advantage (d6 value used directly, range 1-6)
            fateDice = Array.from({ length: 3 }, () => faces[Math.floor(Math.random() * 3)]);
            d6 = Math.floor(Math.random() * 6) + 1;
            const fateSum = fateDice.reduce((sum, die) => {
                if (die === 'plus') return sum + 1;
                if (die === 'minus') return sum - 1;
                return sum;
            }, 0);
            diceTotal = fateSum + d6; // Range: -3 to +9
        } else {
            // Standard 4dF
            fateDice = Array.from({ length: 4 }, () => faces[Math.floor(Math.random() * 3)]);
            diceTotal = fateDice.reduce((sum, die) => {
                if (die === 'plus') return sum + 1;
                if (die === 'minus') return sum - 1;
                return sum;
            }, 0);
        }

        const total = diceTotal + modifier;
        let shifts: number | undefined;
        let outcome: DiceResult['outcome'];

        if (opposition !== undefined) {
            shifts = total - opposition;
            if (shifts < 0) {
                outcome = 'failure';
            } else if (shifts === 0) {
                outcome = 'tie';
            } else if (shifts >= 3) {
                outcome = 'style';
            } else {
                outcome = 'success';
            }
        }

        const result: DiceResult = {
            id: crypto.randomUUID(),
            fateDice,
            d6,
            modifier,
            diceTotal,
            total,
            opposition,
            shifts,
            outcome,
            character: '...', // Callers must fill this
            skill,
            action,
            timestamp: new Date(),
            type,
            invocations: 0,
        };

        return result;
    };

    return {
        logs,
        addLog,
        createRollLog,
        updateFate,
        rollDice
    };
}
