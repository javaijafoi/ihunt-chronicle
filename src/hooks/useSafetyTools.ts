import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    collection,
    doc,
    onSnapshot,
    setDoc,
    updateDoc,
    serverTimestamp,
    deleteDoc,
    query,
    getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import {
    SafetyLevel,
    SafetyState,
    PlayerSafetySetting,
    DEFAULT_SAFETY_TOPICS,
    SAFETY_LEVELS
} from '@/types/safety';

export function useSafetyTools(sessionId: string, isGM: boolean) {
    const { user } = useAuth();
    const [safetyState, setSafetyState] = useState<SafetyState>({
        isPaused: false,
        xCardTriggeredBy: null,
        lastUpdated: 0
    });

    const [playerSettings, setPlayerSettings] = useState<PlayerSafetySetting[]>([]);
    const [mySettings, setMySettings] = useState<Record<string, SafetyLevel>>({});
    const [loading, setLoading] = useState(true);

    // 1. Listen to Safety State (Global for Session)
    useEffect(() => {
        if (!sessionId) return;
        const stateRef = doc(db, 'sessions', sessionId, 'safety', 'state');

        const unsubscribe = onSnapshot(stateRef, (snap) => {
            if (snap.exists()) {
                setSafetyState(snap.data() as SafetyState);
            } else {
                // Initialize if doesn't exist (only GM ideally, but safe to allow race)
                if (isGM) {
                    setDoc(stateRef, {
                        isPaused: false,
                        xCardTriggeredBy: null,
                        lastUpdated: serverTimestamp()
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [sessionId, isGM]);

    // 2. Listen to All Player Settings (for Aggregation)
    useEffect(() => {
        if (!sessionId) return;
        const settingsCol = collection(db, 'sessions', sessionId, 'safety_settings');

        const unsubscribe = onSnapshot(settingsCol, (snapshot) => {
            const allSettings: PlayerSafetySetting[] = [];
            const newMySettings: Record<string, SafetyLevel> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.settings) {
                    // data.settings is Record<topicId, level>
                    Object.entries(data.settings as Record<string, SafetyLevel>).forEach(([topicId, level]) => {
                        allSettings.push({
                            userId: doc.id,
                            topicId,
                            level
                        });

                        if (user && doc.id === user.uid) {
                            newMySettings[topicId] = level;
                        }
                    });
                }
            });

            setPlayerSettings(allSettings);
            setMySettings(newMySettings);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [sessionId, user]);

    // 3. Computed Aggregated Level
    const aggregatedLevels = useMemo(() => {
        const aggregation: Record<string, SafetyLevel> = {};

        DEFAULT_SAFETY_TOPICS.forEach(topic => {
            let maxSeverity = -1;
            let maxLevel: SafetyLevel = 'ok';

            playerSettings.filter(s => s.topicId === topic.id).forEach(setting => {
                const levelConfig = SAFETY_LEVELS.find(l => l.id === setting.level);
                const severity = levelConfig?.severity ?? 0;

                if (severity > maxSeverity) {
                    maxSeverity = severity;
                    maxLevel = setting.level;
                }
            });

            if (maxSeverity === -1) maxLevel = 'ok';
            aggregation[topic.id] = maxLevel;
        });

        return aggregation;
    }, [playerSettings]);

    // Actions

    const updateMySetting = useCallback(async (topicId: string, level: SafetyLevel) => {
        if (!user || !sessionId) return;

        const userSettingsRef = doc(db, 'sessions', sessionId, 'safety_settings', user.uid);
        // Use merge to update single topic without wiping others
        await setDoc(userSettingsRef, {
            settings: {
                [topicId]: level
            },
            updatedAt: serverTimestamp()
        }, { merge: true });
    }, [user, sessionId]);

    const triggerXCard = useCallback(async () => {
        if (!user || !sessionId) return;
        const stateRef = doc(db, 'sessions', sessionId, 'safety', 'state');
        await setDoc(stateRef, {
            isPaused: true, // X-Card implies immediate stop
            xCardTriggeredBy: user.uid,
            lastUpdated: serverTimestamp()
        }, { merge: true });
    }, [user, sessionId]);

    const resolveXCard = useCallback(async () => {
        // Only Triggerer or GM should call this (checked in UI, enforce in Rules ideally)
        if (!user || !sessionId) return;
        const stateRef = doc(db, 'sessions', sessionId, 'safety', 'state');
        await updateDoc(stateRef, {
            isPaused: false,
            xCardTriggeredBy: null,
            lastUpdated: serverTimestamp()
        });
    }, [user, sessionId]);

    const togglePause = useCallback(async () => {
        if (!sessionId) return;
        if (safetyState.xCardTriggeredBy) return; // Cannot unpause X-Card via normal pause

        const stateRef = doc(db, 'sessions', sessionId, 'safety', 'state');
        await updateDoc(stateRef, {
            isPaused: !safetyState.isPaused,
            lastUpdated: serverTimestamp()
        });
    }, [sessionId, safetyState]);

    return {
        safetyState,
        mySettings,
        aggregatedLevels,
        loading,
        updateMySetting,
        triggerXCard,
        resolveXCard,
        togglePause
    };
}
