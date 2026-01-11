import { MonsterWizard } from "@/components/monsters/MonsterWizard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const MonsterCreatorPage = () => {
    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
            <header className="border-b border-white/10 p-4 bg-neutral-900/50 backdrop-blur sticky top-0 z-10">
                <div className="container max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild className="text-neutral-400 hover:text-white">
                            <Link to="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar ao Lobby
                            </Link>
                        </Button>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                            Criador de Monstros
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 container max-w-5xl mx-auto p-4 md:p-8">
                <MonsterWizard />
            </main>
        </div>
    );
};
