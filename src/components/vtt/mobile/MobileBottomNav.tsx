import { BookUser, Dices, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MobileTab = 'sheet' | 'dice' | 'aspects' | 'chat';

interface MobileBottomNavProps {
    activeTab: MobileTab;
    onTabChange: (tab: MobileTab) => void;
    unreadCount?: number;
}

export function MobileBottomNav({ activeTab, onTabChange, unreadCount = 0 }: MobileBottomNavProps) {
    const tabs: { id: MobileTab; icon: any; label: string }[] = [
        { id: 'sheet', icon: BookUser, label: 'Ficha' },
        { id: 'dice', icon: Dices, label: 'Dados' },
        { id: 'aspects', icon: Sparkles, label: 'Aspectos' },
        { id: 'chat', icon: MessageSquare, label: 'Chat' },
    ];

    return (
        <nav className="h-16 bg-background border-t border-border flex items-center justify-around px-2 pb-safe shrink-0 z-50">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className="relative">
                            <Icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
                            {tab.id === 'chat' && unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
