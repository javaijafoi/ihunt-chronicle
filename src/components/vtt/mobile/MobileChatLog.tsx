import { LogEntry } from '@/types/game';
import { useRef, useEffect, useState } from 'react';
import { Send, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MobileChatLogProps {
    logs: LogEntry[];
    currentUserId?: string;
    onSendMessage: (msg: string) => void;
}

export function MobileChatLog({ logs, currentUserId, onSendMessage }: MobileChatLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState("");

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const handleSend = () => {
        if (!message.trim()) return;
        onSendMessage(message);
        setMessage("");
    };

    const LogItem = ({ log }: { log: LogEntry }) => {
        // simplified formatting
        const isRoll = log.type === 'roll';
        const isSystem = log.type === 'system' || log.type === 'fate' || log.type === 'aspect';

        if (isRoll && log.details?.kind === 'roll') {
            const d = log.details as any;
            return (
                <div className="mb-3 p-3 bg-secondary/30 rounded-lg border border-border/50 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-primary">{log.character}</span>
                        <span className="text-muted-foreground text-xs">rolou os dados</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="font-display font-bold text-xl">{d.total > 0 ? `+${d.total}` : d.total}</div>
                        <div className="flex flex-col text-xs text-muted-foreground">
                            <span>{d.skill} ({d.skillBonus && d.skillBonus > 0 ? '+' : ''}{d.skillBonus})</span>
                            <span>vs {d.opposition}</span>
                        </div>
                        <div className="ml-auto font-bold text-xs uppercase tracking-wider">
                            {d.outcome}
                        </div>
                    </div>
                </div>
            );
        }

        if (isSystem) {
            return (
                <div className="mb-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded italic text-center">
                    {log.message}
                </div>
            );
        }

        // Timestamp handling
        let timeString = '';
        if (log.timestamp) {
            // @ts-ignore
            if (typeof log.timestamp.toDate === 'function') {
                // @ts-ignore
                timeString = log.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (log.timestamp instanceof Date) {
                timeString = log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        }

        return (
            <div className="mb-3 flex items-start gap-2">
                <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={log.details?.avatar as string} />
                    <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-sm">{log.character || 'Sistema'}</span>
                        <span className="text-[10px] text-muted-foreground opacity-50">
                            {timeString}
                        </span>
                    </div>
                    <p className="text-sm leading-snug">{log.message}</p>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
                {logs.map((log) => (
                    <LogItem key={log.id} log={log} />
                ))}
            </div>

            <div className="p-3 bg-background border-t border-border flex items-center gap-2 shrink-0 pb-safe">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-muted/50 border-none rounded-full px-4 h-10 focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </>
    );
}
