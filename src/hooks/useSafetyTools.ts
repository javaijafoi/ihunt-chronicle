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

export function useSafetyTools(campaignId: string | undefined, isGM: boolean) {
    const { user } = useAuth();
    const [safetyState, setSafetyState] = useState<SafetyState>({
        isPaused: false,
        xCardTriggeredBy: null,
        lastUpdated: 0
    });

    const [playerSettings, setPlayerSettings] = useState<PlayerSafetySetting[]>([]);
    const [mySettings, setMySettings] = useState<Record<string, SafetyLevel>>({});
    const [loading, setLoading] = useState(true);

    // 1. Listen to Safety State (Campaign Level for simplicity or session)
    // Since Episodes are gone, we store safety state on the Campaign doc or a subcollection.
    // Let's use 'safety_state' doc in 'safety_settings' collection or similar, or just a doc in 'session'.
    // For now, let's look at a fixed doc 'safety/state' in campaign? Or just 'campaigns/{id}/safety_state/current'.
    // To match previous 'episodes/{id}/safety/state', let's use 'campaigns/{id}/safety/state'.

    useEffect(() => {
        if (!campaignId) return;
        const stateRef = doc(db, 'campaigns', campaignId, 'safety', 'state');

        const unsubscribe = onSnapshot(stateRef, (snap) => {
            if (snap.exists()) {
                setSafetyState(snap.data() as SafetyState);
            } else {
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
    }, [campaignId, isGM]);

    // 2. Listen to All Player Settings (Campaign Level)
    useEffect(() => {
        if (!campaignId) return;
        const settingsCol = collection(db, 'campaigns', campaignId, 'safety_settings');

        const unsubscribe = onSnapshot(settingsCol, (snapshot) => {
            const allSettings: PlayerSafetySetting[] = [];
            const newMySettings: Record<string, SafetyLevel> = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.settings) {
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
    }, [campaignId, user]);

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
        if (!user || !campaignId) return;

        const userSettingsRef = doc(db, 'campaigns', campaignId, 'safety_settings', user.uid);
        await setDoc(userSettingsRef, {
            settings: {
                [topicId]: level
            },
            updatedAt: serverTimestamp()
        }, { merge: true });
    }, [user, campaignId]);

    const triggerXCard = useCallback(async () => {
        if (!user || !campaignId) return;
        const stateRef = doc(db, 'campaigns', campaignId, 'safety', 'state');
        await setDoc(stateRef, {
            isPaused: true,
            xCardTriggeredBy: user.uid,
            lastUpdated: serverTimestamp()
        }, { merge: true });
    }, [user, campaignId]);

    const resolveXCard = useCallback(async () => {
        if (!user || !campaignId) return;
        const stateRef = doc(db, 'campaigns', campaignId, 'safety', 'state');
        await updateDoc(stateRef, {
            isPaused: false,
            xCardTriggeredBy: null,
            lastUpdated: serverTimestamp()
        });
    }, [user, campaignId]);

    const togglePause = useCallback(async () => {
        if (!campaignId) return;
        if (safetyState.xCardTriggeredBy) return;

        const stateRef = doc(db, 'campaigns', campaignId, 'safety', 'state');
        await updateDoc(stateRef, {
            isPaused: !safetyState.isPaused,
            lastUpdated: serverTimestamp()
        });
    }, [campaignId, safetyState]);

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
