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

            // Sort by timestamp descending
            newLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            // Optional: Client-side limit if needed, but let's show all for context
            setLogs(newLogs);
        });

        return () => unsubscribe();
    }, [episodeId]);

    const addLog = useCallback(async (message: string, type: LogEntry['type'] = 'system', details?: any) => {
        if (!episodeId) return;
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
        if (!episodeId) return;

        // Convert the result details to a plain object and remove undefined values
        const details = JSON.parse(JSON.stringify({
            ...result,
            kind: 'roll',
            timestamp: result.timestamp instanceof Date ? result.timestamp.toISOString() : result.timestamp
        }));

        // Firestore doesn't accept undefined, but JSON.stringify/parse cleans them.
        // We need to restore timestamp to serverTimestamp() or Date if needed, 
        // but here we are sending a separate top-level timestamp.
        // Let's manually clean just to be safe and efficient without JSON overhead if preferred,
        // but JSON stringify is the easiest way to strip undefineds recursively.

        // However, result.timestamp might be a complex object.
        // Let's just manually construct the safe object.

        const safeDetails: any = {
            ...result,
            kind: 'roll'
        };

        // Remove undefined keys
        Object.keys(safeDetails).forEach(key => {
            if (safeDetails[key] === undefined) {
                delete safeDetails[key];
            }
        });

        const logEntry = {
            type: 'roll',
            message: `${result.character} rolou ${result.action || 'dados'}`,
            character: result.character,
            details: safeDetails,
            timestamp: serverTimestamp()
        };
        await addDoc(collection(db, 'episodes', episodeId, 'logs'), logEntry);
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
