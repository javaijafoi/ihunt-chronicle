import { Link } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";

export function AboutPage() {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-muted rounded-full">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="font-display text-3xl text-primary">Sobre o #iHunt</h1>
                </div>

                <div className="glass-panel p-6 space-y-4 text-foreground/80 leading-relaxed">
                    <p>
                        <strong>#iHunt: Chronicle</strong> é uma plataforma VTT (Virtual Tabletop) dedicada ao sistema de RPG <strong>#iHunt</strong>, focado em caçar monstros na economia gig.
                    </p>
                    <p>
                        Este projeto visa facilitar a gestão de crônicas, personagens e cenas, automatizando regras complexas e permitindo que o grupo foque na narrativa.
                    </p>
                    <div className="p-4 bg-muted/30 rounded border border-border">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4" />
                            Versão Alpha
                        </h3>
                        <p className="text-sm">
                            Esta aplicação está em constante desenvolvimento. Feedback é sempre bem-vindo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
