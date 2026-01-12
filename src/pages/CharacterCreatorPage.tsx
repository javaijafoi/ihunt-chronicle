import { ArrowLeft, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicCharacterWizard } from '@/components/characters/PublicCharacterWizard';

export function CharacterCreatorPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/lobby"
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <UserPlus className="w-6 h-6 text-primary" />
                            <h1 className="font-display text-xl text-foreground">Criador de Caçadores</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <PublicCharacterWizard />
            </main>
        </div>
    );
}
