import { useState } from 'react';
import { Character, Campaign, Scene, LogEntry, UnifiedAspect, ResultType, DiceResult, ActionType } from '@/types/game';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav, MobileTab } from './MobileBottomNav';
import { MobileCharacterCard } from './MobileCharacterCard';
import { MobileDiceRoller } from './MobileDiceRoller';
import { MobileAspectList } from './MobileAspectList';
import { MobileChatLog } from './MobileChatLog';

interface MobilePlayerViewProps {
    // Data
    character: Character;
    campaign: Campaign;
    activeScene: Scene | null;
    logs: LogEntry[];
    allAspects: UnifiedAspect[];
    currentUserId?: string;

    // Actions
    onRollDice: (modifier: number, skill?: string, action?: ActionType, type?: 'normal' | 'advantage', opposition?: number, isHidden?: boolean, characterNameOverride?: string) => Promise<DiceResult>;
    onSpendFate: (characterId: string) => void;
    onToggleStress: (characterId: string, track: 'physical' | 'mental', index: number) => Promise<void>;
    onInvokeAspect: (aspectName: string, source: string, useFree: boolean) => void;
    onSendMessage: (message: string) => void;
    onTriggerXCard: () => void;
}

export function MobilePlayerView({
    character,
    campaign,
    activeScene,
    logs,
    allAspects,
    currentUserId,
    onRollDice,
    onSpendFate,
    onToggleStress,
    onInvokeAspect,
    onSendMessage,
    onTriggerXCard
}: MobilePlayerViewProps) {
    const [activeTab, setActiveTab] = useState<MobileTab>('sheet');
    const [presetSkill, setPresetSkill] = useState<string | null>(null);

    // Computed
    const unreadCount = 0; // TODO: Implement unread tracking

    // Handlers
    const handleRollSkill = (skillName: string) => {
        setPresetSkill(skillName);
        setActiveTab('dice');
    };

    const handleInvokeWrapped = (aspect: UnifiedAspect) => {
        // Determine if we should use a free invoke
        const useFree = aspect.freeInvokes > 0;
        onInvokeAspect(aspect.name, aspect.ownerName || 'Cena', useFree);
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden">
            <MobileHeader
                campaign={campaign}
                onTriggerXCard={onTriggerXCard}
            />

            <main className="flex-1 overflow-hidden relative bg-muted/10">
                {activeTab === 'sheet' && (
                    <div className="h-full overflow-y-auto pb-4">
                        <MobileCharacterCard
                            character={character}
                            onRollSkill={handleRollSkill}
                            onToggleStress={(track, index) => onToggleStress(character.id, track, index)}
                            onSpendFate={() => onSpendFate(character.id)}
                        />
                    </div>
                )}

                {activeTab === 'dice' && (
                    <div className="h-full overflow-y-auto">
                        <MobileDiceRoller
                            activeCharacter={character}
                            presetSkill={presetSkill}
                            onRoll={async (mod, skill, action, type, opp) => {
                                const res = await onRollDice(mod, skill, action, type, opp);
                                setPresetSkill(null); // Clear preset after roll
                                return res;
                            }}
                            onInvokeAspect={onInvokeAspect}
                            allAspects={allAspects}
                        />
                    </div>
                )}

                {activeTab === 'aspects' && (
                    <div className="h-full overflow-y-auto pb-4">
                        <MobileAspectList
                            allAspects={allAspects}
                            myCharacter={character}
                            onInvoke={handleInvokeWrapped}
                        />
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="h-full flex flex-col">
                        <MobileChatLog
                            logs={logs}
                            currentUserId={currentUserId}
                            onSendMessage={onSendMessage}
                        />
                    </div>
                )}
            </main>

            <MobileBottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                unreadCount={unreadCount}
            />
        </div>
    );
}
